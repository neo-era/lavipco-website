/**
 * Cloudinary upload helper - defensive.
 *
 * Env cần có:
 *   - CLOUDINARY_CLOUD_NAME
 *   - CLOUDINARY_API_KEY
 *   - CLOUDINARY_API_SECRET
 *
 * Khi env đầy đủ → signed upload qua REST API → trả URL Cloudinary.
 * Khi env thiếu → trả null. Caller fallback: lưu base64 (data URL) vào DB.
 *
 * TODO: thay base64 fallback bằng local file storage (UploadThing hoặc
 * /public/uploads) khi Lam confirm.
 */
import crypto from "crypto";

export const CLOUDINARY_ENABLED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

/**
 * Upload 1 file (Buffer/Blob/base64 string) lên Cloudinary với signed upload.
 * Trả null nếu env thiếu hoặc fail.
 *
 * @param file - File để upload. Có thể là Buffer, Blob, hoặc data: URL string.
 * @param folder - Cloudinary folder, vd "lavipco/products"
 */
export async function uploadToCloudinary(
  file: Buffer | Blob | string,
  folder = "lavipco/products",
): Promise<CloudinaryUploadResult | null> {
  if (!CLOUDINARY_ENABLED) {
    console.warn("[cloudinary] Env thiếu, skip upload (caller fallback base64)");
    return null;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000);

  // Signature: SHA1 của "folder=X&timestamp=Y" + apiSecret
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const formData = new FormData();
  // Convert input to Blob nếu cần
  let blob: Blob;
  if (typeof file === "string") {
    // data URL: "data:image/png;base64,..."
    const match = file.match(/^data:(.+?);base64,(.+)$/);
    if (!match) {
      console.warn("[cloudinary] Invalid data URL");
      return null;
    }
    const mime = match[1];
    const base64 = match[2];
    const buf = Buffer.from(base64, "base64");
    blob = new Blob([new Uint8Array(buf)], { type: mime });
  } else if (file instanceof Blob) {
    blob = file;
  } else {
    // Buffer
    blob = new Blob([new Uint8Array(file)]);
  }
  formData.append("file", blob);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!res.ok) {
      console.warn("[cloudinary] Upload fail status", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { secure_url: string; public_id: string };
    return { url: data.secure_url, publicId: data.public_id };
  } catch (error) {
    console.error("[cloudinary] Upload exception", error);
    return null;
  }
}

/**
 * Smart upload: thử Cloudinary, fallback trả nguyên data URL nếu fail/env thiếu.
 * Caller dùng để store vào DB Product.images.
 */
export async function uploadImage(dataUrl: string): Promise<string> {
  const result = await uploadToCloudinary(dataUrl);
  if (result) return result.url;
  // Fallback: trả nguyên data URL (lưu base64 vào DB - không scale, dev OK)
  return dataUrl;
}

/**
 * Upload file catalogue (PDF) lên Cloudinary, folder lavipco/catalogues.
 * Dùng chung endpoint /auto/upload nên nhận mọi loại file (kể cả PDF).
 *
 * Trả URL Cloudinary, hoặc null nếu env thiếu / upload fail — caller tự quyết
 * fallback (admin-products.ts giữ nguyên data URL khi null).
 *
 * ⚠️ Cloudinary MẶC ĐỊNH chặn phân phối PDF (trả 401). Phải bật
 * Settings → Security → "Allow delivery of PDF and ZIP files" trên dashboard.
 */
export async function uploadCatalogue(dataUrl: string): Promise<string | null> {
  const result = await uploadToCloudinary(dataUrl, "lavipco/catalogues");
  return result?.url ?? null;
}
