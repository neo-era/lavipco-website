/**
 * VNPay payment gateway integration (sandbox + production).
 *
 * Tài liệu: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 *
 * Env cần có:
 *  - VNPAY_TMN_CODE: mã merchant
 *  - VNPAY_SECRET_KEY: Hash Secret (KHÔNG để lộ client)
 *  - VNPAY_URL: endpoint thanh toán (sandbox vs production)
 *  - VNPAY_RETURN_URL: URL VNPay redirect user về sau thanh toán
 *
 * Lưu ý URL encoding:
 *   VNPay dùng FORM-URLENCODED (space → '+'), KHÔNG phải RFC 3986 (%20).
 *   Phải tự encode để hash khớp với server VNPay.
 *
 * Hash flow:
 *   1. Sort tất cả param (trừ vnp_SecureHash, vnp_SecureHashType) theo alphabet
 *   2. Build query string `key=value&key=value` với form-urlencoded
 *   3. HMAC-SHA512 với SECRET_KEY → hex
 *   4. Append vnp_SecureHash=<hex>
 */
import crypto from "crypto";

const VNPAY_VERSION = "2.1.0";
const VNPAY_COMMAND_PAY = "pay";
const VNPAY_CURRENCY = "VND";
const VNPAY_LOCALE = "vn";
const VNPAY_ORDER_TYPE = "other";

// VNPay response codes - thành công
const SUCCESS_CODE = "00";

export const VNPAY_ENABLED = Boolean(
  process.env.VNPAY_TMN_CODE &&
    process.env.VNPAY_SECRET_KEY &&
    process.env.VNPAY_URL,
);

type VnpayConfig = {
  tmnCode: string;
  secretKey: string;
  url: string;
  defaultReturnUrl: string;
};

function getConfig(): VnpayConfig {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_SECRET_KEY;
  const url = process.env.VNPAY_URL;
  const defaultReturnUrl = process.env.VNPAY_RETURN_URL;
  if (!tmnCode || !secretKey || !url || !defaultReturnUrl) {
    throw new Error(
      "VNPay chưa cấu hình (VNPAY_TMN_CODE / SECRET_KEY / URL / RETURN_URL trong .env.local).",
    );
  }
  return { tmnCode, secretKey, url, defaultReturnUrl };
}

// ====================================================================
// Helpers
// ====================================================================

/** Format Date → "yyyyMMddHHmmss" theo timezone Asia/Ho_Chi_Minh. */
function formatVnpayDate(date: Date): string {
  // Tính tay vì Intl.DateTimeFormat sẽ không cho ra format compact
  const tzOffset = 7 * 60; // UTC+7 Hà Nội
  const local = new Date(date.getTime() + (tzOffset + date.getTimezoneOffset()) * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    local.getFullYear() +
    pad(local.getMonth() + 1) +
    pad(local.getDate()) +
    pad(local.getHours()) +
    pad(local.getMinutes()) +
    pad(local.getSeconds())
  );
}

/** Encode form-urlencoded: space → '+' (không phải %20). */
function vnpayEncode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

/** Build sorted query string. */
function buildSortedQuery(params: Record<string, string>): string {
  const keys = Object.keys(params).sort();
  return keys
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .map((k) => `${vnpayEncode(k)}=${vnpayEncode(params[k])}`)
    .join("&");
}

/** Hash HMAC-SHA512 với SECRET_KEY → hex lowercase. */
function hmacSha512(data: string, secret: string): string {
  return crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");
}

// ====================================================================
// createPaymentUrl
// ====================================================================

export type CreatePaymentUrlInput = {
  /** Mã đơn duy nhất - sẽ là vnp_TxnRef (caller dùng order.code). */
  orderId: string;
  /** Tổng tiền VND (số nguyên). VNPay sẽ × 100. */
  amount: number;
  /** Mô tả đơn hàng - sẽ encode vào vnp_OrderInfo. */
  orderInfo: string;
  /** IP client - thường lấy từ x-forwarded-for. */
  ipAddr: string;
  /** Override default returnUrl từ env. */
  returnUrl?: string;
  /** Cho phép chỉ định ngân hàng (ATM/VISA/...). Để rỗng cho user chọn ở VNPay. */
  bankCode?: string;
  /** Locale, mặc định 'vn'. */
  locale?: "vn" | "en";
};

export function createPaymentUrl(input: CreatePaymentUrlInput): string {
  const cfg = getConfig();
  const now = new Date();

  const params: Record<string, string> = {
    vnp_Version: VNPAY_VERSION,
    vnp_Command: VNPAY_COMMAND_PAY,
    vnp_TmnCode: cfg.tmnCode,
    vnp_Amount: String(Math.round(input.amount * 100)),
    vnp_CurrCode: VNPAY_CURRENCY,
    vnp_TxnRef: input.orderId,
    vnp_OrderInfo: input.orderInfo,
    vnp_OrderType: VNPAY_ORDER_TYPE,
    vnp_Locale: input.locale ?? VNPAY_LOCALE,
    vnp_ReturnUrl: input.returnUrl ?? cfg.defaultReturnUrl,
    vnp_IpAddr: input.ipAddr || "127.0.0.1",
    vnp_CreateDate: formatVnpayDate(now),
  };
  if (input.bankCode) params.vnp_BankCode = input.bankCode;

  const queryWithoutHash = buildSortedQuery(params);
  const signature = hmacSha512(queryWithoutHash, cfg.secretKey);

  return `${cfg.url}?${queryWithoutHash}&vnp_SecureHash=${signature}`;
}

// ====================================================================
// Verify return / IPN
// ====================================================================

export type VnpayVerifyResult = {
  isValid: boolean; // hash khớp
  isSuccess: boolean; // vnp_ResponseCode === "00"
  /** order code (TxnRef). */
  orderId: string | null;
  /** Số tiền đã chuyển (VND, đã chia 100). */
  amount: number | null;
  /** Response code thô để debug / map message. */
  responseCode: string | null;
  /** Transaction code GHN-side. */
  transactionNo: string | null;
  /** Trạng thái transaction. */
  transactionStatus: string | null;
  /** Bank code dùng thanh toán. */
  bankCode: string | null;
  /** Raw params - log debug. */
  raw: Record<string, string>;
};

/**
 * Verify dữ liệu VNPay trả về (cả return URL từ browser và IPN từ server).
 * Logic verify giống nhau, chỉ khác response.
 */
export function verifyVnpaySignature(
  query: Record<string, string>,
): VnpayVerifyResult {
  const cfg = getConfig();

  // Extract + remove signature trước khi sort
  const { vnp_SecureHash, vnp_SecureHashType: _ignored, ...rest } = query;
  void _ignored;
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (typeof v === "string") cleaned[k] = v;
  }

  const sortedQuery = buildSortedQuery(cleaned);
  const expectedHash = hmacSha512(sortedQuery, cfg.secretKey);

  const isValid =
    typeof vnp_SecureHash === "string" &&
    expectedHash.toLowerCase() === vnp_SecureHash.toLowerCase();

  const responseCode = cleaned.vnp_ResponseCode ?? null;
  const isSuccess = isValid && responseCode === SUCCESS_CODE;

  const amountRaw = cleaned.vnp_Amount;
  const amount = amountRaw ? Math.round(Number(amountRaw) / 100) : null;

  return {
    isValid,
    isSuccess,
    orderId: cleaned.vnp_TxnRef ?? null,
    amount,
    responseCode,
    transactionNo: cleaned.vnp_TransactionNo ?? null,
    transactionStatus: cleaned.vnp_TransactionStatus ?? null,
    bankCode: cleaned.vnp_BankCode ?? null,
    raw: cleaned,
  };
}

// Alias cho rõ semantics — return URL và IPN dùng cùng logic verify
export const verifyReturnUrl = verifyVnpaySignature;
export const verifyIpn = verifyVnpaySignature;

// ====================================================================
// Response code → message tiếng Việt (subset thường gặp)
// ====================================================================

export const VNPAY_RESPONSE_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Giao dịch bị nghi ngờ gian lận",
  "09": "Thẻ chưa đăng ký Internet Banking",
  "10": "Xác thực thông tin thẻ không đúng quá 3 lần",
  "11": "Quá hạn chờ thanh toán",
  "12": "Thẻ/Tài khoản bị khoá",
  "13": "Sai OTP",
  "24": "Khách hàng huỷ giao dịch",
  "51": "Số dư không đủ",
  "65": "Vượt hạn mức giao dịch trong ngày",
  "75": "Ngân hàng đang bảo trì",
  "79": "Sai mật khẩu thanh toán",
  "99": "Lỗi khác (chưa xác định)",
};

export function getResponseMessage(code: string | null): string {
  if (!code) return "Không nhận được phản hồi từ cổng thanh toán";
  return VNPAY_RESPONSE_MESSAGES[code] ?? `Mã lỗi ${code} - liên hệ hỗ trợ để được giúp`;
}

// ====================================================================
// Refund API (Merchant API v2 - sandbox)
// ====================================================================

const VNPAY_API_URL =
  "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
// Production: "https://merchant.vnpay.vn/merchant_webapi/api/transaction"

export type VnpayRefundInput = {
  /** Mã đơn (vnp_TxnRef gốc khi tạo payment). */
  orderId: string;
  /** Số tiền hoàn (VND nguyên). VNPay sẽ × 100. */
  amount: number;
  /** Mô tả ngắn lý do hoàn. */
  orderInfo: string;
  /** Loại refund: "02" = full, "03" = partial. */
  transactionType: "02" | "03";
  /** Username admin thực hiện - log audit phía VNPay. */
  createBy: string;
  /** Thời gian thanh toán gốc (vnp_PayDate từ response cũ, format yyyyMMddHHmmss).
   *  Bắt buộc với refund API. */
  transactionDate: string;
  /** Transaction No từ VNPay khi thanh toán gốc (vnp_TransactionNo). */
  transactionNo?: string;
  /** IP server gọi API. */
  ipAddr: string;
};

export type VnpayRefundResult = {
  ok: boolean;
  responseCode: string | null;
  message: string;
  /** Mã giao dịch refund từ VNPay nếu thành công. */
  refundTransactionNo: string | null;
  /** Raw response để debug. */
  raw: Record<string, unknown>;
};

/**
 * Gọi VNPay refund API.
 *
 * Tài liệu: https://sandbox.vnpayment.vn/apis/docs/hoan-tien/refund.html
 *
 * Flow:
 *   1. Sinh vnp_RequestId (UUID-like) + vnp_CreateDate
 *   2. Build payload với required fields
 *   3. Sign: HMAC-SHA512 của chuỗi `vnp_RequestId|vnp_Version|vnp_Command|...`
 *      (theo thứ tự đặc thù của refund, KHÔNG sort alphabet)
 *   4. POST JSON tới VNPAY_API_URL
 *   5. Verify response signature
 *
 * LƯU Ý: refund sandbox đôi khi từ chối vì transaction đã quá hạn. Test với
 * giao dịch mới trong vòng 24h.
 */
export async function refundVnpayTransaction(
  input: VnpayRefundInput,
): Promise<VnpayRefundResult> {
  const cfg = getConfig();
  const now = new Date();

  const requestId = `${formatVnpayDate(now)}${Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0")}`;
  const createDate = formatVnpayDate(now);
  const amountStr = String(Math.round(input.amount * 100));

  // Theo doc VNPay: dữ liệu sign nối bằng '|' theo thứ tự cố định
  // vnp_RequestId|vnp_Version|vnp_Command|vnp_TmnCode|vnp_TransactionType|
  // vnp_TxnRef|vnp_Amount|vnp_TransactionNo|vnp_TransactionDate|
  // vnp_CreateBy|vnp_CreateDate|vnp_IpAddr|vnp_OrderInfo
  const dataToSign = [
    requestId,
    VNPAY_VERSION,
    "refund",
    cfg.tmnCode,
    input.transactionType,
    input.orderId,
    amountStr,
    input.transactionNo ?? "",
    input.transactionDate,
    input.createBy,
    createDate,
    input.ipAddr,
    input.orderInfo,
  ].join("|");

  const signature = hmacSha512(dataToSign, cfg.secretKey);

  const payload = {
    vnp_RequestId: requestId,
    vnp_Version: VNPAY_VERSION,
    vnp_Command: "refund",
    vnp_TmnCode: cfg.tmnCode,
    vnp_TransactionType: input.transactionType,
    vnp_TxnRef: input.orderId,
    vnp_Amount: amountStr,
    vnp_TransactionNo: input.transactionNo ?? "",
    vnp_TransactionDate: input.transactionDate,
    vnp_CreateBy: input.createBy,
    vnp_CreateDate: createDate,
    vnp_IpAddr: input.ipAddr,
    vnp_OrderInfo: input.orderInfo,
    vnp_SecureHash: signature,
  };

  try {
    const res = await fetch(VNPAY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return {
        ok: false,
        responseCode: null,
        message: `VNPay API HTTP ${res.status}`,
        refundTransactionNo: null,
        raw: { status: res.status },
      };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const responseCode = typeof data.vnp_ResponseCode === "string" ? data.vnp_ResponseCode : null;
    const message =
      typeof data.vnp_Message === "string"
        ? data.vnp_Message
        : getResponseMessage(responseCode);
    const refundTransactionNo =
      typeof data.vnp_TransactionNo === "string" ? data.vnp_TransactionNo : null;

    return {
      ok: responseCode === SUCCESS_CODE,
      responseCode,
      message,
      refundTransactionNo,
      raw: data,
    };
  } catch (error) {
    console.error("[vnpay refund] exception", error);
    return {
      ok: false,
      responseCode: null,
      message: error instanceof Error ? error.message : "Lỗi không xác định",
      refundTransactionNo: null,
      raw: {},
    };
  }
}
