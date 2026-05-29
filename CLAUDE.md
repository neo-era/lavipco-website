# CLAUDE.md — Dự án Website LAVIPCO

> File này cung cấp ngữ cảnh cho Claude Code khi làm việc với mã nguồn dự án.
> **QUAN TRỌNG:** Luôn đọc kỹ file này trước khi sinh code hoặc đề xuất thay đổi.

---

## 1. Tổng quan dự án

**Tên dự án:** Website LAVIPCO — `lavipco-web`
**Đơn vị sở hữu:** Công ty TNHH Kỹ Nghệ Lâm Việt Phát (LAVIPCO)
**Loại website:** Thương mại điện tử kết hợp giới thiệu doanh nghiệp
**Người phát triển chính:** Lam Mai (kiêm quản trị)
**Ngôn ngữ giao diện chính:** Tiếng Việt (có thể mở rộng tiếng Anh ở giai đoạn 2)

### Mục tiêu kinh doanh
- Giới thiệu năng lực công ty, các dịch vụ kỹ thuật (đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, hạ tầng điện…).
- Trưng bày các dự án đã thực hiện dạng portfolio.
- Bán hàng online các sản phẩm liên quan: thiết bị chiếu sáng, đèn tín hiệu, phụ kiện, hệ thống điều khiển.
- Hỗ trợ xuất báo giá (báo giá – BG), tra cứu đơn hàng, liên hệ tư vấn.

### Đối tượng người dùng
- **Khách hàng B2C:** mua lẻ sản phẩm chiếu sáng, phụ kiện.
- **Khách hàng B2B:** chủ đầu tư, nhà thầu, ban quản lý đô thị — cần báo giá, tư vấn dự án.
- **Quản trị viên:** Lam và nhân viên LAVIPCO quản lý nội dung, đơn hàng, sản phẩm.

---

## 2. Tech Stack

### Frontend & Backend (Full-stack)
- **Framework:** Next.js 14+ (App Router, Server Components ưu tiên)
- **Ngôn ngữ:** TypeScript (strict mode bật)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icon:** lucide-react
- **Form:** React Hook Form + Zod (validation)
- **State (client):** Zustand cho giỏ hàng, React Context cho user session
- **Data fetching:** Server Components + Server Actions (Next.js native), TanStack Query khi cần caching phía client

### Database & ORM
- **Database:** PostgreSQL 15+ (production), SQLite (chỉ dùng cho prototype nếu cần nhanh)
- **ORM:** Prisma
- **Migration:** `prisma migrate dev` cho local, `prisma migrate deploy` cho production
- **Seed:** `prisma/seed.ts`

### Auth & Bảo mật
- **Xác thực:** Auth.js (NextAuth v5) — hỗ trợ email/password, Google, Zalo (nếu có)
- **Mã hóa mật khẩu:** bcrypt (saltRounds = 12)
- **Session:** JWT + database session (chiến lược hybrid)
- **CSRF:** tích hợp sẵn trong Next.js Server Actions
- **Rate limiting:** upstash/ratelimit hoặc middleware tự viết

### Tích hợp bên thứ ba (theo giai đoạn)
- **Thanh toán:** VNPay (ưu tiên), MoMo, ZaloPay, COD
- **Vận chuyển:** GHN API, GHTK API
- **Email:** Resend hoặc SendGrid (transactional email)
- **SMS/OTP:** eSMS hoặc Stringee
- **Lưu trữ ảnh:** Cloudinary (ưu tiên) hoặc UploadThing
- **Analytics:** Google Analytics 4, Google Tag Manager
- **Bản đồ:** Google Maps Embed cho trang liên hệ
- **Hóa đơn điện tử:** Viettel Invoice hoặc Misa (giai đoạn 2)
- **AI Admin Copilot:** Claude API (Anthropic) — sinh nội dung trong admin

### AI Admin Copilot (Claude API)
Tính năng nội bộ giúp admin sinh nội dung bằng Claude. Kiến trúc:
- **`src/lib/ai/index.ts`** — `callClaude()` gọi REST Messages API qua `fetch`
  (KHÔNG dùng SDK để tránh thêm dependency). `AI_ENABLED` check env.
- **`src/lib/ai/prompts.ts`** — `buildPrompt(ctx)` theo từng `AIContentType`.
  Mọi system prompt có ràng buộc CHỐNG HALLUCINATION: không bịa thông số kỹ thuật.
- **`src/lib/actions/ai-content.ts`** — Server Action `generateContent()` require
  ADMIN + rate limit. `isAIEnabled()` cho Server Component check để ẩn/hiện nút.
- **`src/components/admin/shared/AIGenerateButton.tsx`** — nút ✨ + preview modal
  (admin DUYỆT/sửa trước khi áp dụng — không bao giờ tự ghi đè field).
- **Defensive:** thiếu `ANTHROPIC_API_KEY` → nút tự ẩn (`aiEnabled` prop từ page).
- **Model:** mặc định Haiku 4.5 (env `ANTHROPIC_MODEL`), đổi Sonnet nếu cần.
- Tích hợp ở các form: Product (mô tả/mô tả ngắn/meta SEO), Blog (nội dung/
  tóm tắt), Service (mô tả/mô tả ngắn), Project (tóm tắt/mô tả).
- **Quy tắc:** AI chỉ HỖ TRỢ — admin chịu trách nhiệm kiểm duyệt nội dung cuối.

### Triển khai
- **Hosting:** Vercel (giai đoạn đầu) hoặc VPS Ubuntu + PM2 + Nginx (khi cần kiểm soát chi phí)
- **Database hosting:** Supabase, Neon, hoặc Railway
- **CDN:** Cloudflare (DNS + cache + WAF)
- **Tên miền:** `lavipco.com.vn` (hoặc tên đã đăng ký)

---

## 3. Cấu trúc thư mục

```
lavipco-web/
├── .claude/                     # Cấu hình Claude Code cho dự án
├── prisma/
│   ├── schema.prisma            # Schema database
│   ├── migrations/              # Lịch sử migration
│   └── seed.ts                  # Dữ liệu mẫu
├── public/
│   ├── images/                  # Ảnh tĩnh
│   ├── fonts/                   # Font Times New Roman (cho PDF/document nội bộ)
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (public)/            # Layout công khai
│   │   │   ├── page.tsx         # Trang chủ
│   │   │   ├── about/           # Giới thiệu công ty
│   │   │   ├── services/        # Dịch vụ
│   │   │   ├── projects/        # Dự án (portfolio)
│   │   │   ├── products/        # Sản phẩm + chi tiết
│   │   │   ├── blog/            # Tin tức
│   │   │   ├── contact/         # Liên hệ
│   │   │   ├── cart/            # Giỏ hàng
│   │   │   ├── checkout/        # Thanh toán
│   │   │   └── account/         # Tài khoản người dùng
│   │   ├── (admin)/             # Layout quản trị (yêu cầu auth admin)
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       ├── customers/
│   │   │       ├── projects/
│   │   │       ├── services/
│   │   │       ├── blog/
│   │   │       └── settings/
│   │   ├── api/                 # API routes (webhook, callback thanh toán…)
│   │   │   ├── webhooks/
│   │   │   └── payment/
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # Component shadcn/ui
│   │   ├── layout/              # Header, Footer, Sidebar
│   │   ├── product/             # ProductCard, ProductGallery…
│   │   ├── cart/                # CartItem, CartSummary…
│   │   └── common/              # Component dùng chung
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── auth.ts              # Cấu hình Auth.js
│   │   ├── utils.ts             # cn(), formatCurrency()…
│   │   ├── validations/         # Zod schemas
│   │   ├── payment/             # VNPay, MoMo helpers
│   │   ├── shipping/            # GHN, GHTK helpers
│   │   └── email/               # Email templates + sender
│   ├── hooks/                   # Custom React hooks
│   ├── store/                   # Zustand stores
│   ├── types/                   # TypeScript types dùng chung
│   └── middleware.ts            # Middleware Next.js (auth, redirect…)
├── .env.local                   # Biến môi trường (KHÔNG commit)
├── .env.example                 # Mẫu env để tham khảo
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Quy ước code (Coding Conventions)

### Đặt tên
- **File component:** PascalCase — `ProductCard.tsx`, `CartItem.tsx`
- **File util/hook:** camelCase — `formatCurrency.ts`, `useCart.ts`
- **Hằng số:** UPPER_SNAKE_CASE — `MAX_CART_ITEMS = 99`
- **Biến/hàm:** camelCase — `getUserOrders`, `totalPrice`
- **Type/Interface:** PascalCase — `type Product`, `interface OrderDetail`
- **Tên route folder:** lowercase, dùng `-` cho từ ghép — `product-detail`, không `productDetail`
- **Tên bảng database:** PascalCase ở Prisma schema, snake_case ở SQL nếu cần map (`@@map`)

### TypeScript
- Bật `strict: true` trong `tsconfig.json`.
- Không dùng `any`. Khi bắt buộc, dùng `unknown` và narrow type.
- Type cho props component luôn export ra để tái sử dụng.
- Dùng Zod để validate dữ liệu vào (form, API), suy ra type bằng `z.infer<typeof schema>`.

### React / Next.js
- **Ưu tiên Server Components.** Chỉ thêm `"use client"` khi cần state, effect, event handler.
- **Data mutation:** dùng Server Actions thay vì viết API route, trừ webhook/callback.
- **Image:** luôn dùng `next/image`, không dùng thẻ `<img>`.
- **Link:** luôn dùng `next/link`, không dùng thẻ `<a>` cho internal navigation.
- **Async component:** chỉ áp dụng cho Server Component.

### Styling
- Dùng Tailwind utility class, ưu tiên responsive mobile-first (`sm:`, `md:`, `lg:`).
- Không viết CSS module hay styled-components trừ khi thật cần thiết.
- Dùng `cn()` helper từ `lib/utils.ts` để gộp class có điều kiện.
- Màu sắc thương hiệu LAVIPCO định nghĩa trong `tailwind.config.ts` dưới `theme.extend.colors` (ví dụ `brand-primary`, `brand-accent`).

### Tiền tệ và định dạng
- Tiền tệ: VND, không có chữ số thập phân (ví dụ `95.628.000 ₫`).
- Helper chuẩn: `formatCurrency(value: number): string` trong `lib/utils.ts` dùng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Ngày tháng: `dd/MM/yyyy` cho hiển thị, ISO 8601 cho lưu trữ. Dùng `date-fns` với `locale: vi`.
- Số điện thoại Việt Nam: chuẩn hóa về dạng `0xxxxxxxxx` khi lưu.

### Comment
- Comment bằng **tiếng Việt** cho logic nghiệp vụ, **tiếng Anh** cho code thuần kỹ thuật.
- JSDoc cho hàm public/util quan trọng.

---

## 5. Quy ước Git

### Branch
- `main` — code production, được bảo vệ.
- `develop` — code đang phát triển, merge từ feature branch.
- `feature/<ten-tinh-nang>` — ví dụ `feature/cart-page`, `feature/vnpay-integration`.
- `fix/<mo-ta-loi>` — ví dụ `fix/checkout-validation`.
- `hotfix/<mo-ta>` — sửa lỗi khẩn cấp trực tiếp từ `main`.

### Commit message (Conventional Commits)
Định dạng: `<type>(<scope>): <mô tả ngắn bằng tiếng Việt>`

Các type:
- `feat`: thêm tính năng mới
- `fix`: sửa lỗi
- `docs`: tài liệu
- `style`: format, không đổi logic
- `refactor`: tái cấu trúc code
- `perf`: tối ưu hiệu năng
- `test`: thêm/sửa test
- `chore`: cấu hình, build, dependency

Ví dụ:
```
feat(product): thêm bộ lọc theo thương hiệu ở trang danh sách sản phẩm
fix(cart): sửa lỗi tính sai tổng tiền khi xóa item cuối cùng
chore(deps): cập nhật Next.js lên 14.2.3
```

### Khi Claude Code đề xuất commit
- Luôn commit theo từng module/tính năng nhỏ.
- Không commit `node_modules`, `.next`, `.env.local`, file build.
- Không commit secret/API key dưới bất kỳ hình thức nào.

---

## 6. Lệnh thường dùng (Scripts)

```bash
# Phát triển
npm run dev                  # Chạy dev server tại localhost:3000
npm run build                # Build production
npm run start                # Chạy bản build
npm run lint                 # ESLint
npm run type-check           # tsc --noEmit

# Database (Prisma)
npx prisma generate          # Sinh Prisma Client sau khi đổi schema
npx prisma migrate dev       # Tạo migration mới (môi trường dev)
npx prisma migrate deploy    # Áp dụng migration (production)
npx prisma studio            # Mở GUI quản lý database
npx prisma db seed           # Chạy seed data

# Test (sẽ thêm khi cần)
npm run test                 # Vitest
npm run test:e2e             # Playwright
```

---

## 7. Biến môi trường (.env.local)

File `.env.local` **không bao giờ commit**. Luôn cập nhật `.env.example` kèm theo khi thêm biến mới.

Các biến hiện có:
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/lavipco"

# Auth.js
AUTH_SECRET="<random-32-bytes>"
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email (Resend)
RESEND_API_KEY=""
EMAIL_FROM="no-reply@lavipco.com.vn"

# Thanh toán VNPay
VNPAY_TMN_CODE=""
VNPAY_SECRET_KEY=""
VNPAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNPAY_RETURN_URL="http://localhost:3000/checkout/vnpay-return"

# Vận chuyển GHN
GHN_API_TOKEN=""
GHN_SHOP_ID=""

# Khác
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_GA_ID=""
```

> **Lưu ý Prisma + Supabase pooler (production):** `DATABASE_URL` qua connection pooler (port `6543`) PHẢI có `?pgbouncer=true` (tắt prepared statements) + `connection_limit` đủ cao (vd `10`) + `pool_timeout` (vd `20`). Thiếu `connection_limit` cao → `next build` prerender nhiều trang bị lỗi *"Timed out fetching a connection from the pool"*; thiếu `pgbouncer=true` → lỗi *"prepared statement already exists"* lúc runtime. Migration dùng `DIRECT_URL` (port `5432`).

---

## 8. Mô hình dữ liệu (tóm lược)

Schema chi tiết ở `prisma/schema.prisma`. Các model chính:

- **User** — id, email, name, phone, hashedPassword, role (USER | ADMIN | STAFF), addresses, orders…
- **Category** — danh mục sản phẩm phân cấp (parentId)
- **Product** — id, slug, name, description, basePrice, brand, images, categoryId, variants, specs (JSON), status
- **ProductVariant** — id, productId, sku, price, stock, attributes (JSON: màu, công suất…)
- **Order** — id, code (ví dụ `DH202605260001`), userId, items, total, shippingAddress, paymentMethod, paymentStatus, shippingStatus, orderStatus
- **OrderItem** — id, orderId, productVariantId, quantity, unitPrice
- **Project** — id, slug, title, description, client, location, year, category, images, isFeatured
- **Service** — id, slug, title, description, icon, price (nullable), order
- **BlogPost** — id, slug, title, content (MDX/HTML), excerpt, coverImage, authorId, publishedAt, tags
- **Coupon** — id, code, type (PERCENT | FIXED), value, minOrderValue, validFrom, validTo, usageLimit
- **ContactMessage** — id, name, email, phone, subject, message, status, createdAt
- **Setting** — key-value cho cấu hình toàn site (logo, hotline, địa chỉ, MST…)

> Khi cần đổi schema, Claude Code phải đề xuất migration tên có ý nghĩa, ví dụ `npx prisma migrate dev --name add_product_variants`.

---

## 9. Quy tắc bảo mật (BẮT BUỘC)

- **Không hard-code secret** trong code dưới bất kỳ hình thức nào.
- **Validate mọi input** từ user bằng Zod trước khi xử lý hoặc lưu DB.
- **Sanitize HTML** khi lưu/render nội dung blog/sản phẩm — dùng `sanitizeHtml()` ở `src/lib/sanitize.ts` (backend bằng `sanitize-html`, thuần Node, KHÔNG dùng jsdom/isomorphic-dompurify vì gây `ERR_REQUIRE_ESM` trên runtime serverless Vercel).
- **Phân quyền:** Mọi action trong `/admin/*` phải check `session.user.role === 'ADMIN'` ở cả middleware lẫn server action.
- **CSRF:** Server Actions của Next.js đã có protection sẵn, không tắt.
- **Rate limit:** Bắt buộc cho các endpoint nhạy cảm: login, register, contact form, password reset.
- **Mật khẩu:** Tối thiểu 8 ký tự, bao gồm chữ và số. Hash bằng bcrypt saltRounds = 12.
- **Phiên đăng nhập:** Hết hạn sau 30 ngày, có thể đăng xuất từ xa.
- **HTTPS bắt buộc** ở production. Tự động redirect HTTP → HTTPS.
- **Tuân thủ Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân: có chính sách bảo mật, cho phép user xem/xóa dữ liệu của mình.

---

## 10. Đặc thù nghiệp vụ LAVIPCO

### Sản phẩm
- Có nhiều thông số kỹ thuật quan trọng (công suất W, điện áp V, IP rating, nhiệt độ màu K, lumen, chuẩn kết nối…) — lưu trong trường `specs` kiểu JSON, hiển thị dạng bảng ở trang chi tiết.
- Một số sản phẩm chỉ "liên hệ báo giá", không có giá công khai — thêm flag `priceOnRequest: boolean` trong model Product.
- Cho phép tải catalogue PDF của từng sản phẩm.

### Dự án (Portfolio)
- Chia theo loại: **Đèn tín hiệu giao thông**, **Chiếu sáng đô thị**, **Chiếu sáng cảnh quan**, **Hạ tầng điện**, **Smart City**, **Khác**.
- Mỗi dự án có gallery ảnh, video (optional), thông tin chủ đầu tư, địa điểm, năm thực hiện, quy mô.
- **Lưu ý:** Dự án Phường Ninh Thạnh (chiếu sáng đô thị thông minh) là dự án **độc lập**, không liên quan Gói thầu XL-05. Hiện scope là điều khiển cấp tủ, lộ trình mở rộng đến điểm sáng, tích hợp camera, đèn tín hiệu giao thông và thiết bị smart city.

### Báo giá (BG)
- Có nút "Yêu cầu báo giá" trên trang sản phẩm và trang dịch vụ → form gửi yêu cầu → admin nhận và xử lý.
- Mã báo giá theo định dạng `<số>/<năm>/LVC-BG`, ví dụ `0425/2026/LVC-BG`.
- Khi sinh PDF báo giá nội bộ, dùng font **Times New Roman** (regular: `TIMES.TTF`, bold: `TIMESBD.TTF`, italic: `TIMESI.TTF`, bold italic: `TIMESBI.TTF`). Nếu môi trường không có font, hỏi Lam upload lại.

### Hiển thị giá
- Luôn hiển thị giá đã bao gồm VAT 10% (theo quy định), kèm dòng nhỏ "Đã bao gồm VAT".
- Nếu sản phẩm chưa bao gồm VAT thì ghi rõ.

### Liên hệ
- Hotline, email, địa chỉ công ty hiển thị ở footer và trang Liên hệ.
- Hiển thị MST (Mã số thuế) ở footer theo yêu cầu pháp lý.
- Logo đăng ký Bộ Công Thương đặt ở footer khi đã có.

### Địa chỉ giao hàng & Vận chuyển
- **Địa chỉ 2 cấp** (theo sáp nhập 2025): Tỉnh/Thành → Phường/Xã, KHÔNG còn Quận/Huyện. Dữ liệu ở `src/lib/regions/`. Trường `Address.district` vẫn còn nhưng đã chuyển nullable (legacy, không ghi mới).
- **Phí vận chuyển:** hiện dùng **phí đồng giá toàn quốc** (`calculateShippingFee` trả flat fee — `src/lib/shipping/`). GHN tính phí realtime tạm tắt vì GHN còn dùng địa chỉ 3 cấp (cần `district_id`); sẽ bật lại khi GHN hỗ trợ cấu trúc 2 cấp.

---

## 11. Quy tắc làm việc với Claude Code

### Trước khi viết code
1. Đọc file này và các file liên quan trong dự án.
2. **Lập kế hoạch trước**: liệt kê các bước, hỏi xác nhận trước khi sửa code quy mô lớn (>3 file).
3. Nếu yêu cầu mơ hồ, hỏi lại để làm rõ thay vì đoán.

### Khi viết code
1. Code phải **chạy được ngay** — kèm import, type, không để placeholder.
2. Tuân thủ tuyệt đối quy ước ở mục 4.
3. Khi thêm dependency mới, thông báo lý do và lệnh cài.
4. Khi đổi schema Prisma, luôn nhắc chạy `npx prisma migrate dev`.

### Sau khi viết code
1. Tóm tắt ngắn gọn những gì đã thay đổi.
2. Đề xuất commit message theo quy ước ở mục 5.
3. Gợi ý cách test thủ công hoặc viết test tự động.

### Cấm
- **Không tự ý chạy lệnh phá hủy** (`rm -rf`, `DROP TABLE`, `prisma migrate reset`) mà không được Lam xác nhận rõ ràng trong terminal.
- **Không commit lên Git tự động** trừ khi Lam yêu cầu.
- **Không deploy** lên production mà không có lệnh rõ ràng.
- **Không thêm dependency** nặng/đáng ngờ — ưu tiên thư viện phổ biến, được maintain tốt.
- **Không sinh nội dung mẫu** chứa thông tin nhạy cảm (số CCCD, tài khoản ngân hàng thật…).

### Khuyến khích
- Đề xuất tối ưu performance khi thấy hợp lý (memoization, lazy load, ISR…).
- Cảnh báo khi phát hiện lỗ hổng bảo mật tiềm ẩn.
- Đưa ra 2–3 phương án khi có lựa chọn kỹ thuật quan trọng, kèm ưu/nhược điểm.

---

## 12. Trạng thái dự án hiện tại

> **Cập nhật:** Lam tự điền/cập nhật mục này theo tiến độ. Claude Code đọc để biết đang ở giai đoạn nào.

- [ ] Giai đoạn 1: Khởi tạo project, layout chung
- [ ] Giai đoạn 2: Trang giới thiệu (Home, About, Service, Project, Contact)
- [ ] Giai đoạn 3: Catalog sản phẩm + Admin CRUD sản phẩm
- [ ] Giai đoạn 4: Giỏ hàng, Checkout, Thanh toán
- [ ] Giai đoạn 5: Admin Panel hoàn chỉnh
- [ ] Giai đoạn 6: SEO, tối ưu, deploy production

**Đang làm:** _(chưa bắt đầu)_
**Vướng mắc:** _(không có)_

---

## 13. Tài liệu tham khảo nhanh

- Next.js App Router: https://nextjs.org/docs/app
- Prisma: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Auth.js v5: https://authjs.dev
- VNPay tích hợp: https://sandbox.vnpayment.vn/apis/
- GHN API: https://api.ghn.vn/home/docs
- Resend: https://resend.com/docs

---

*File này được duy trì bởi Lam Mai. Khi có thay đổi lớn về tech stack, quy ước, hoặc nghiệp vụ — cập nhật ngay vào đây để Claude Code luôn nắm đúng bối cảnh.*
