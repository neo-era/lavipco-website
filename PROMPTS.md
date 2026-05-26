# BỘ PROMPT MẪU CHO CLAUDE CODE — DỰ ÁN LAVIPCO

> Hướng dẫn sử dụng: Mỗi prompt được thiết kế để chạy độc lập trong một phiên Claude Code.
> Trước khi sang prompt mới của giai đoạn khác, gõ `/clear` để xóa context cũ.
> Sau mỗi prompt hoàn thành: review code → test thủ công → commit Git → mới sang prompt tiếp theo.
>
> **Mẹo:** Đọc file `CLAUDE.md` ở thư mục gốc đã giúp Claude Code nắm phần lớn ngữ cảnh,
> nên các prompt dưới đây có thể ngắn gọn và tập trung vào yêu cầu cụ thể.

---

## MỤC LỤC

- [Giai đoạn 0 — Chuẩn bị](#giai-đoạn-0--chuẩn-bị)
- [Giai đoạn 1 — Khởi tạo project](#giai-đoạn-1--khởi-tạo-project)
- [Giai đoạn 2 — Layout và trang giới thiệu](#giai-đoạn-2--layout-và-trang-giới-thiệu)
- [Giai đoạn 3 — Catalog sản phẩm](#giai-đoạn-3--catalog-sản-phẩm)
- [Giai đoạn 4 — Giỏ hàng, Checkout, Thanh toán](#giai-đoạn-4--giỏ-hàng-checkout-thanh-toán)
- [Giai đoạn 5 — Admin Panel](#giai-đoạn-5--admin-panel)
- [Giai đoạn 6 — SEO, tối ưu, deploy](#giai-đoạn-6--seo-tối-ưu-deploy)
- [Prompt tiện ích dùng chung](#prompt-tiện-ích-dùng-chung)
- [Mẹo viết prompt hiệu quả](#mẹo-viết-prompt-hiệu-quả)

---

# GIAI ĐOẠN 0 — CHUẨN BỊ

## Prompt 0.1 — Kiểm tra môi trường

```
Hãy kiểm tra môi trường máy của tôi đã sẵn sàng cho dự án LAVIPCO chưa.
Yêu cầu kiểm tra và báo cáo:
1. Phiên bản Node.js (cần >= 20)
2. Phiên bản npm
3. Git đã cài và config user.name, user.email chưa
4. PostgreSQL có cài cục bộ không (chạy `psql --version`)
5. Docker có chạy không (chạy `docker --version` và `docker ps`)

Nếu thiếu cái gì, đưa lệnh cài đặt cụ thể cho Ubuntu/Windows.
KHÔNG tự cài, chỉ liệt kê và chờ tôi xác nhận.
```

---

# GIAI ĐOẠN 1 — KHỞI TẠO PROJECT

## Prompt 1.1 — Tạo Next.js project

```
Hãy lên kế hoạch khởi tạo project Next.js cho LAVIPCO theo đúng tech stack
trong CLAUDE.md. Trước khi chạy lệnh, liệt kê toàn bộ các bước:

1. Tạo project với `create-next-app` (TypeScript, Tailwind, App Router, src/, ESLint, alias @/)
2. Cài các dependency chính: prisma, @prisma/client, next-auth@beta, zod,
   react-hook-form, @hookform/resolvers, zustand, date-fns, bcryptjs, lucide-react
3. Cài dev dependency: @types/bcryptjs, prisma, tsx
4. Khởi tạo shadcn/ui (chọn theme Neutral, base color slate)
5. Cài các component shadcn/ui phổ biến: button, input, label, card, dialog,
   sheet, dropdown-menu, form, toast, table, badge, tabs, select, textarea, separator
6. Tạo cấu trúc thư mục theo CLAUDE.md mục 3
7. Khởi tạo Prisma với provider postgresql
8. Tạo file .env.example đầy đủ và .env.local trống
9. Cấu hình tailwind.config.ts với màu thương hiệu LAVIPCO (đề xuất palette)
10. Khởi tạo Git repo, commit đầu tiên

Tôi xác nhận xong sẽ chạy. Bắt đầu với việc liệt kê kế hoạch chi tiết.
```

## Prompt 1.2 — Cấu hình lib và utils nền tảng

```
Tạo các file nền tảng trong thư mục src/lib/:

1. db.ts — Prisma client singleton (xử lý hot reload trong dev)
2. utils.ts — chứa:
   - cn() từ clsx + tailwind-merge
   - formatCurrency(value: number) — định dạng VND không thập phân
   - formatDate(date: Date | string) — dạng dd/MM/yyyy
   - formatDateTime(date) — dạng dd/MM/yyyy HH:mm
   - slugify(text: string) — chuyển tiếng Việt có dấu thành slug
   - generateOrderCode() — sinh mã đơn dạng DH<yyyymmdd><4-digit>
   - generateQuoteCode(seq: number) — sinh mã báo giá <seq>/<year>/LVC-BG

3. constants.ts — chứa:
   - SITE_CONFIG (name, hotline, email, address, MST — để rỗng tôi điền sau)
   - VAT_RATE = 0.1
   - SHIPPING_DEFAULT_FEE
   - ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS enum const

4. validations/index.ts — barrel export cho các Zod schema sau này

Code chạy được ngay, có comment tiếng Việt cho phần nghiệp vụ.
Sau khi tạo xong, gợi ý commit message.
```

## Prompt 1.3 — Schema Prisma đầy đủ

```
Viết schema.prisma đầy đủ cho toàn bộ 12 model trong CLAUDE.md mục 8.
Yêu cầu cụ thể:

- Dùng PostgreSQL provider
- Tất cả model có id dạng cuid()
- Tất cả model có createdAt, updatedAt mặc định
- User có role enum (USER, ADMIN, STAFF)
- Product:
  + slug unique
  + có trường priceOnRequest Boolean
  + specs kiểu Json
  + images là String[] (mảng URL Cloudinary)
  + relation tới Category, ProductVariant
- Order:
  + code unique, định dạng DH<yyyymmdd><seq>
  + orderStatus, paymentStatus, shippingStatus là enum riêng
  + shippingAddress kiểu Json (lưu snapshot khi đặt hàng)
- Category cho phép phân cấp (parentId tự tham chiếu)
- Project có enum ProjectCategory: TRAFFIC_LIGHT, URBAN_LIGHTING,
  LANDSCAPE_LIGHTING, POWER_INFRASTRUCTURE, SMART_CITY, OTHER
- Tất cả slug cần index
- Thêm @@map snake_case cho tên bảng SQL nếu cần

Sau khi viết xong:
1. Hướng dẫn tôi tạo database PostgreSQL local (tên: lavipco_dev)
2. Hướng dẫn cập nhật DATABASE_URL trong .env.local
3. Đưa lệnh chạy migration đầu tiên với tên có ý nghĩa
4. Tạo file prisma/seed.ts mẫu với ít nhất:
   - 1 admin user (email: admin@lavipco.com.vn, password: hash của "Admin@123")
   - 3 category sản phẩm
   - 5 sản phẩm mẫu
   - 3 dịch vụ
   - 3 dự án portfolio
   - 5 cấu hình settings cơ bản
```

## Prompt 1.4 — Cấu hình Auth.js v5

```
Cấu hình Auth.js v5 (NextAuth) cho dự án. Yêu cầu:

1. File src/lib/auth.ts — config chính, export auth, signIn, signOut, handlers
2. Provider Credentials (email + password) — verify bằng bcrypt từ User table
3. Provider Google OAuth (đọc client id/secret từ env, không hard-code)
4. Session strategy: jwt
5. Callback session để gắn role và id của user
6. Callback jwt để encode role vào token
7. Trang signIn custom: /sign-in
8. File src/app/api/auth/[...nextauth]/route.ts — export handlers
9. File src/middleware.ts — bảo vệ /admin/* (chỉ ADMIN), /account/* (cần login)
10. Type augmentation src/types/next-auth.d.ts để TypeScript hiểu role trong session

Tạo cả:
- src/app/sign-in/page.tsx — trang đăng nhập với form (email + password + Google button)
- src/app/sign-up/page.tsx — trang đăng ký
- src/app/api/auth/register/route.ts — endpoint POST đăng ký, validate Zod, hash password

Lưu ý: dùng Server Action cho form đăng nhập/đăng ký nếu được, đỡ phải viết API route thủ công.
Validate bằng Zod (lib/validations/auth.ts).
Sau khi xong, hướng dẫn cách test login với admin user đã seed.
```

---

# GIAI ĐOẠN 2 — LAYOUT VÀ TRANG GIỚI THIỆU

## Prompt 2.1 — Layout chung (Header + Footer)

```
Tạo layout chung cho phần public của website LAVIPCO.

Yêu cầu:

1. src/components/layout/Header.tsx (Client Component):
   - Logo bên trái (text "LAVIPCO" tạm thời, có TODO chèn ảnh logo sau)
   - Navigation giữa: Trang chủ, Giới thiệu, Dịch vụ, Dự án, Sản phẩm, Tin tức, Liên hệ
   - Bên phải: ô tìm kiếm (icon Search mở dialog), icon giỏ hàng (có badge số lượng),
     menu user (chưa đăng nhập: nút "Đăng nhập"; đã đăng nhập: dropdown với Tài khoản, Đơn hàng, Đăng xuất)
   - Sticky top, có shadow nhẹ khi scroll
   - Responsive: mobile dùng Sheet bên trái cho menu, ẩn search bar (chỉ giữ icon)

2. src/components/layout/Footer.tsx (Server Component):
   - 4 cột: Về LAVIPCO, Liên kết nhanh, Hỗ trợ, Liên hệ
   - Cột Liên hệ: hotline, email, địa chỉ, MST (lấy từ SITE_CONFIG)
   - Logo Bộ Công Thương (placeholder với TODO)
   - Social: Facebook, Zalo, YouTube
   - Copyright cuối: "© {năm hiện tại} LAVIPCO. All rights reserved."
   - Responsive

3. src/app/(public)/layout.tsx — bọc Header + main + Footer
4. src/components/layout/CartIcon.tsx — icon giỏ hàng kết nối Zustand store (làm placeholder trước, store thật ở giai đoạn 4)
5. src/components/layout/UserMenu.tsx — dropdown user, đọc session từ Auth.js

Dùng shadcn/ui components có sẵn (Sheet, DropdownMenu, Button, Badge).
Màu sắc theo brand-primary trong tailwind config.
Code chạy được ngay, kèm placeholder logic cho phần chưa có (cart count = 0).
```

## Prompt 2.2 — Trang chủ

```
Tạo trang chủ src/app/(public)/page.tsx với các section sau (theo thứ tự):

1. Hero section:
   - Slider/carousel với 3 slide (dùng embla-carousel-react)
   - Mỗi slide: ảnh nền + heading + sub-heading + CTA button
   - Auto-play 5s, có dots indicator

2. About summary section:
   - 2 cột: bên trái text giới thiệu ngắn về LAVIPCO + nút "Tìm hiểu thêm" → /about
   - Bên phải: ảnh hoặc grid 4 con số nổi bật (số năm kinh nghiệm, dự án đã làm, khách hàng, nhân sự) — dùng placeholder

3. Services section:
   - Tiêu đề "Dịch vụ của chúng tôi" + mô tả ngắn
   - Grid 3 cột (responsive 1/2/3): card cho 6 dịch vụ chính
   - Mỗi card: icon (lucide-react), tên dịch vụ, mô tả ngắn, link "Xem chi tiết"
   - Đọc từ database (Service table), nếu chưa có thì dùng mock data

4. Featured products section:
   - Tiêu đề "Sản phẩm nổi bật"
   - Carousel ngang hoặc grid 4 cột với 8 sản phẩm
   - Mỗi product card: ảnh, tên, giá (hoặc "Liên hệ"), nút "Xem chi tiết"
   - Đọc từ DB (Product table, lấy isFeatured=true hoặc top 8 mới nhất)

5. Projects section:
   - Tiêu đề "Dự án tiêu biểu"
   - Grid 3 cột với 6 dự án
   - Mỗi card: ảnh + overlay khi hover hiện tên dự án + địa điểm + năm
   - Đọc từ DB (Project table, isFeatured=true)
   - Nút "Xem tất cả dự án" cuối section

6. Why choose us section:
   - 4 lý do với icon + heading + mô tả ngắn
   - Layout: grid 2x2 trên desktop, stack trên mobile

7. Latest news section:
   - 3 bài blog mới nhất
   - Card: ảnh cover, ngày đăng, tiêu đề, excerpt, link "Đọc tiếp"

8. CTA section cuối:
   - Background đậm màu brand
   - Heading "Cần tư vấn cho dự án của bạn?"
   - 2 nút: "Liên hệ ngay" và "Yêu cầu báo giá"

Yêu cầu kỹ thuật:
- Tất cả là Server Component, fetch data trực tiếp từ Prisma
- Components con tách ra trong src/components/home/
- Mỗi section là một component riêng để dễ maintain
- Dùng next/image cho mọi ảnh, có placeholder blur
- Animation nhẹ nhàng khi scroll (dùng tailwindcss-animate hoặc framer-motion nếu cần)
- Mobile-first responsive
```

## Prompt 2.3 — Trang Giới thiệu (About)

```
Tạo trang src/app/(public)/about/page.tsx — Giới thiệu công ty LAVIPCO.

Các section cần có:
1. Hero banner với tiêu đề và breadcrumb
2. Câu chuyện công ty — 2 cột text + ảnh
3. Tầm nhìn — Sứ mệnh — Giá trị cốt lõi (3 card)
4. Lịch sử phát triển — timeline dạng dọc các cột mốc
5. Đội ngũ lãnh đạo — grid 4 cột, mỗi người có ảnh + tên + chức vụ + giới thiệu ngắn
6. Năng lực và chứng nhận — grid logo/ảnh các chứng chỉ
7. Đối tác — grid logo khách hàng đã hợp tác
8. CTA cuối: "Liên hệ với chúng tôi"

Yêu cầu:
- Server Component
- Nội dung text dùng placeholder bằng tiếng Việt, có comment TODO để Lam thay sau
- SEO metadata đầy đủ (title, description, openGraph)
- Tạo các component con trong src/components/about/
```

## Prompt 2.4 — Trang Dịch vụ

```
Tạo:

1. src/app/(public)/services/page.tsx — danh sách dịch vụ
   - Hero banner
   - Grid card các dịch vụ (đọc từ Service table)
   - Mỗi card: icon, tên, mô tả ngắn, link sang chi tiết

2. src/app/(public)/services/[slug]/page.tsx — chi tiết dịch vụ
   - Banner với tên dịch vụ
   - Mô tả chi tiết (rich content)
   - Quy trình thực hiện (timeline ngang hoặc các bước numbered)
   - Lợi ích / điểm mạnh
   - Hình ảnh minh họa
   - Các dự án liên quan đến dịch vụ này
   - Form "Yêu cầu báo giá" inline + nút "Liên hệ ngay"

Yêu cầu:
- Server Component, data fetch từ Prisma theo slug
- generateStaticParams nếu phù hợp (ISR)
- generateMetadata động theo slug
- 404 với notFound() khi không tìm thấy slug

Form yêu cầu báo giá:
- Tạo Server Action /lib/actions/quote.ts với hàm requestQuote
- Validate Zod (name, email, phone bắt buộc; subject auto-fill tên dịch vụ; message)
- Lưu vào bảng ContactMessage với subject = "Báo giá: <tên dịch vụ>"
- Gửi email thông báo cho admin (làm placeholder trước, chưa tích hợp Resend)
- Trả về toast thành công/lỗi
```

## Prompt 2.5 — Trang Dự án (Portfolio)

```
Tạo:

1. src/app/(public)/projects/page.tsx — danh sách dự án
   - Hero banner
   - Bộ lọc theo loại dự án (ProjectCategory enum), filter bằng URL searchParams
   - Grid 3 cột (responsive)
   - Mỗi project card: ảnh cover + tên + địa điểm + năm + chip loại dự án
   - Pagination

2. src/app/(public)/projects/[slug]/page.tsx — chi tiết dự án
   - Banner ảnh full-width
   - Thông tin: chủ đầu tư, địa điểm, năm thực hiện, quy mô, loại dự án
   - Mô tả chi tiết
   - Gallery ảnh (lightbox khi click — dùng yet-another-react-lightbox hoặc tự code đơn giản)
   - Video nếu có (embed YouTube/Vimeo)
   - Sản phẩm/dịch vụ liên quan
   - Dự án khác cùng category (4 dự án)

3. Lưu ý nghiệp vụ: Khi seed/render mẫu, dự án Phường Ninh Thạnh thuộc category URBAN_LIGHTING,
   scope hiện tại là điều khiển cấp tủ, độc lập với Gói thầu XL-05.

Yêu cầu kỹ thuật: Server Component, generateMetadata, ISR phù hợp.
```

## Prompt 2.6 — Trang Liên hệ

```
Tạo src/app/(public)/contact/page.tsx — Liên hệ.

Layout 2 cột:

Cột trái — Thông tin liên hệ:
- Tên công ty đầy đủ
- Địa chỉ trụ sở (lấy từ SITE_CONFIG)
- Hotline (click-to-call)
- Email (click-to-mail)
- Giờ làm việc
- Mã số thuế
- Social icons (Facebook, Zalo, YouTube)

Cột phải — Form liên hệ:
- Họ và tên *
- Email *
- Số điện thoại *
- Tiêu đề (select: Tư vấn sản phẩm, Yêu cầu báo giá, Hợp tác, Khác)
- Nội dung *
- Nút Gửi

Bên dưới: Google Maps Embed iframe (responsive, tỷ lệ 16:9)

Yêu cầu:
- Form dùng React Hook Form + Zod
- Server Action lưu vào ContactMessage
- Thông báo toast thành công, clear form sau khi gửi
- Anti-spam đơn giản: rate limit 3 lần/giờ/IP (tạm log warning, chưa cần Redis)
```

---

# GIAI ĐOẠN 3 — CATALOG SẢN PHẨM

## Prompt 3.1 — Trang danh sách sản phẩm

```
Tạo src/app/(public)/products/page.tsx với đầy đủ tính năng catalog:

Layout:
- Breadcrumb đầu trang
- Sidebar trái (responsive: collapse trên mobile thành drawer Sheet):
  + Filter danh mục (cây phân cấp Category)
  + Filter thương hiệu (checkbox multi-select)
  + Filter khoảng giá (range slider hoặc 2 input min/max)
  + Filter thông số kỹ thuật phổ biến (công suất, IP rating) — dynamic theo data
  + Nút Reset filter
- Khu vực chính bên phải:
  + Thanh trên cùng: tổng số sản phẩm + dropdown sort (mới nhất, giá tăng, giá giảm, bán chạy)
  + Toggle view grid/list
  + Grid sản phẩm (4 cột desktop, 2 cột tablet, 1-2 cột mobile)
  + Pagination dưới cùng

Mỗi ProductCard hiển thị:
- Ảnh chính (16:9 hoặc 1:1 tùy thiết kế)
- Badge "Mới", "Nổi bật", "Hết hàng" nếu có
- Tên sản phẩm (truncate 2 dòng)
- Thương hiệu
- Giá VND hoặc text "Liên hệ" nếu priceOnRequest
- Nút "Thêm vào giỏ" (disabled nếu hết hàng hoặc priceOnRequest → đổi thành "Liên hệ")

Yêu cầu kỹ thuật:
- Server Component cho data fetch
- Filter state qua URL searchParams (dùng nuqs hoặc tự parse)
- Filter và sort thực hiện qua Prisma query, không filter client-side
- Loading.tsx với skeleton
- Pagination URL: ?page=2&category=...&brand=...
- Số sản phẩm/trang: 12

Tạo thêm:
- src/components/product/ProductCard.tsx
- src/components/product/ProductFilters.tsx (Client Component)
- src/components/product/ProductSort.tsx
- src/components/product/Pagination.tsx (tái sử dụng)
```

## Prompt 3.2 — Trang chi tiết sản phẩm

```
Tạo src/app/(public)/products/[slug]/page.tsx — chi tiết sản phẩm.

Layout:
- Breadcrumb: Trang chủ > Sản phẩm > [Danh mục] > [Tên sản phẩm]

Phần trên (2 cột):
Cột trái — Gallery ảnh:
- Ảnh chính lớn
- Thumbnails phía dưới hoặc bên trái
- Click ảnh chính mở lightbox
- Zoom khi hover (dùng react-medium-image-zoom hoặc đơn giản hơn)

Cột phải — Thông tin mua hàng:
- Tên sản phẩm (h1)
- Thương hiệu, mã SKU
- Đánh giá (sao + số review) — placeholder nếu chưa có
- Giá lớn (hoặc khối "Liên hệ báo giá" nếu priceOnRequest)
- Mô tả ngắn (description)
- Chọn variant (nếu có): màu, công suất...
- Số lượng (input number với + -)
- Nút "Thêm vào giỏ" (lớn, màu primary) — disabled khi hết hàng
- Nút "Mua ngay" (đi thẳng vào checkout) — nhỏ hơn
- Nút "Yêu cầu báo giá" — luôn hiện
- Box thông tin: vận chuyển toàn quốc, bảo hành, đổi trả 7 ngày, hỗ trợ kỹ thuật

Phần dưới — Tabs:
- Tab "Mô tả chi tiết" (rich content HTML/MDX)
- Tab "Thông số kỹ thuật" — bảng từ field specs (Json) — render 2 cột tên/giá trị
- Tab "Đánh giá" — list review + form gửi đánh giá (chỉ khách đã mua, làm placeholder)
- Tab "Catalogue" — link tải PDF nếu có

Phần cuối:
- Sản phẩm liên quan (cùng category, 4 sản phẩm)
- Sản phẩm đã xem (lưu trong localStorage)

Yêu cầu kỹ thuật:
- Server Component cho data chính
- generateMetadata động (title, description, openGraph image)
- generateStaticParams cho top sản phẩm phổ biến (ISR)
- 404 với notFound()
- Action thêm giỏ hàng dùng Server Action hoặc client Zustand (làm Zustand cho responsive ngay)
- Action yêu cầu báo giá: mở Dialog form, gửi Server Action lưu ContactMessage
- Component con: src/components/product/ProductGallery.tsx, ProductInfo.tsx,
  ProductTabs.tsx, RelatedProducts.tsx, RequestQuoteDialog.tsx
```

## Prompt 3.3 — Tìm kiếm sản phẩm

```
Triển khai tính năng tìm kiếm sản phẩm:

1. Click icon search ở Header → mở Command Dialog (shadcn/ui Command):
   - Input tìm kiếm với debounce 300ms
   - Hiển thị tối đa 8 kết quả sản phẩm với ảnh nhỏ + tên + giá
   - Có link "Xem tất cả kết quả" → /products?q=<keyword>

2. src/app/(public)/products/search/page.tsx hoặc tích hợp vào products/page.tsx với param q:
   - Hiển thị tất cả kết quả với filter và pagination như trang danh sách

3. Server Action src/lib/actions/search.ts:
   - searchProducts(query: string, limit: number)
   - Tìm theo name, slug, description, brand (case-insensitive, hỗ trợ tiếng Việt)
   - Dùng Prisma `contains` mode insensitive
   - Trả về tối đa N kết quả với fields tối giản

Lưu ý: Tìm kiếm tiếng Việt có dấu/không dấu — cân nhắc lưu thêm field nameNoAccent
(tạo bằng slugify khi insert/update) để search không dấu chính xác hơn.
Nếu thêm field này, sinh migration tương ứng.
```

---

# GIAI ĐOẠN 4 — GIỎ HÀNG, CHECKOUT, THANH TOÁN

## Prompt 4.1 — Giỏ hàng với Zustand

```
Triển khai giỏ hàng dùng Zustand + persist localStorage.

1. src/store/cart-store.ts:
   - State: items: CartItem[]
   - CartItem: productId, variantId?, name, image, unitPrice, quantity, slug, maxStock
   - Actions: addItem, removeItem, updateQuantity, clearCart
   - Computed (selector): subtotal, totalItems, vatAmount, totalAmount
   - persist với key 'lavipco-cart', storage localStorage
   - Xử lý hydration mismatch (skipHydration true, gọi rehydrate trong component)

2. src/app/(public)/cart/page.tsx — trang giỏ hàng:
   Layout 2 cột (mobile: 1 cột):
   Cột trái — Danh sách item:
   - Table hoặc card cho mỗi item
   - Ảnh, tên (link sang sản phẩm), variant, đơn giá, số lượng (+/-), thành tiền, nút xóa
   - Empty state khi giỏ trống: ảnh + text "Giỏ hàng trống" + nút "Tiếp tục mua sắm"

   Cột phải — Tóm tắt đơn hàng:
   - Tạm tính
   - VAT 10%
   - Phí vận chuyển (tạm để "Tính ở bước tiếp theo")
   - Tổng cộng
   - Nút "Tiến hành thanh toán" → /checkout
   - Nút "Tiếp tục mua sắm" link về /products

3. Header CartIcon: hiển thị badge totalItems realtime từ store.

4. Khi addItem: hiện toast "Đã thêm vào giỏ hàng" với nút "Xem giỏ".

5. Khi quantity vượt maxStock: cảnh báo và set về max.

Component con:
- src/components/cart/CartItemRow.tsx
- src/components/cart/CartSummary.tsx
- src/components/cart/EmptyCart.tsx
```

## Prompt 4.2 — Trang Checkout

```
Tạo flow thanh toán đầy đủ:

1. src/app/(public)/checkout/page.tsx — Bước 1: Thông tin giao hàng
   Layout 2 cột:
   Cột trái — Form (React Hook Form + Zod):
   - Họ tên người nhận *
   - Số điện thoại *
   - Email *
   - Tỉnh/Thành (select)
   - Quận/Huyện (select, populate theo tỉnh)
   - Phường/Xã (select, populate theo huyện)
   - Địa chỉ cụ thể *
   - Ghi chú đơn hàng (optional)
   - Phương thức thanh toán (radio): COD, VNPay, MoMo, Chuyển khoản
   - Phương thức vận chuyển (radio): GHN, GHTK (populate khi đã chọn địa chỉ)
   - Mã giảm giá (input + nút áp dụng)
   - Checkbox "Đồng ý với điều khoản"
   - Nút "Đặt hàng" lớn

   Cột phải — Tóm tắt đơn hàng:
   - List item (ảnh nhỏ + tên + qty + giá)
   - Subtotal, VAT, Phí ship, Giảm giá, Tổng cộng
   - Sticky khi scroll

2. Data tỉnh/huyện/xã:
   - Dùng API GHN để lấy danh sách provinces, districts, wards (free)
   - Hoặc dataset offline JSON (đề xuất file để tải về)
   - Hỏi tôi muốn dùng cách nào trước khi viết code

3. Tính phí vận chuyển:
   - Khi có địa chỉ + có lựa chọn shipping provider → call API tính phí
   - Hiển thị phí trong summary
   - Tạm thời mock fee = 30,000 VND nếu chưa có API token, ghi comment TODO

4. Mã giảm giá:
   - Server Action validateCoupon(code, subtotal): check tồn tại, còn hạn, đủ minOrderValue, còn usage limit
   - Áp dụng và hiển thị giảm trong summary

5. Đặt hàng (Server Action createOrder):
   - Validate toàn bộ payload bằng Zod
   - Transaction Prisma:
     + Trừ kho variant
     + Tạo Order, OrderItems
     + Tăng usage coupon nếu có
     + Sinh order code DH<yyyymmdd><seq>
   - Snapshot địa chỉ vào shippingAddress (Json)
   - Trả về { orderId, redirectUrl }
   - Nếu method = COD/CK: redirect /checkout/success?code=<code>
   - Nếu method = VNPay/MoMo: redirect URL thanh toán

6. src/app/(public)/checkout/success/page.tsx — Bước 2: Đặt hàng thành công
   - Icon check lớn
   - "Đặt hàng thành công"
   - Mã đơn hàng + nút copy
   - Tóm tắt đơn hàng
   - Hướng dẫn nếu là CK (số TK ngân hàng + nội dung CK chuẩn)
   - 2 nút: "Xem đơn hàng" + "Tiếp tục mua sắm"
   - Sau khi load: clear cart store

Yêu cầu chung: validate kỹ, error handling tốt, loading state rõ ràng.
```

## Prompt 4.3 — Tích hợp VNPay (sandbox)

```
Tích hợp cổng thanh toán VNPay theo tài liệu sandbox.

Tham khảo: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html

Yêu cầu:

1. src/lib/payment/vnpay.ts:
   - createPaymentUrl(params: { orderId, amount, orderInfo, ipAddr, returnUrl?, bankCode? }): string
   - verifyReturnUrl(query: Record<string, string>): { isValid: boolean, isSuccess: boolean, orderInfo: any }
   - verifyIpn(query: Record<string, string>): tương tự
   - Đọc TMN_CODE, SECRET_KEY, URL, RETURN_URL từ env
   - Hash HMAC SHA512 đúng chuẩn VNPay
   - Sort tham số theo alphabet trước khi hash
   - Encode URL đúng (chú ý dấu cách → +, không phải %20)

2. Sửa createOrder action:
   - Khi paymentMethod = VNPAY:
     + Tạo Order với paymentStatus = PENDING
     + Sinh paymentUrl từ vnpay.createPaymentUrl
     + Trả về { orderId, redirectUrl: paymentUrl }

3. src/app/(public)/checkout/vnpay-return/page.tsx (Server Component):
   - Đọc searchParams
   - Gọi verifyReturnUrl
   - Nếu success: update Order paymentStatus = PAID, redirect /checkout/success
   - Nếu fail: hiển thị lỗi + link thử lại / liên hệ hỗ trợ

4. src/app/api/payment/vnpay-ipn/route.ts (POST):
   - Endpoint IPN nhận callback từ VNPay
   - verifyIpn → update DB → trả JSON { RspCode, Message } đúng spec

5. Hướng dẫn tôi:
   - Đăng ký tài khoản sandbox VNPay
   - Lấy TMN_CODE và Hash Secret
   - Test bằng thẻ ngân hàng giả lập NCB

Lưu ý bảo mật: Hash bằng Hash Secret server-side, KHÔNG để lộ ra client. Log đủ để debug
nhưng KHÔNG log secret.
```

## Prompt 4.4 — Trang tài khoản người dùng

```
Tạo phần tài khoản người dùng /account:

1. src/app/(public)/account/layout.tsx — layout với sidebar:
   - Avatar + tên user
   - Menu: Tổng quan, Đơn hàng, Địa chỉ, Yêu thích, Đổi mật khẩu, Đăng xuất

2. src/app/(public)/account/page.tsx — tổng quan:
   - Welcome user
   - 4 stat: tổng đơn hàng, đơn đang xử lý, tổng chi tiêu, điểm tích lũy (placeholder)
   - 3 đơn hàng gần nhất

3. src/app/(public)/account/orders/page.tsx:
   - Table: mã đơn, ngày đặt, tổng tiền, trạng thái, hành động (Xem chi tiết)
   - Filter theo trạng thái, search theo mã đơn
   - Pagination

4. src/app/(public)/account/orders/[code]/page.tsx:
   - Thông tin đơn: mã, ngày, trạng thái (timeline: Đặt hàng → Xác nhận → Đóng gói → Vận chuyển → Hoàn thành)
   - Thông tin giao hàng (snapshot)
   - Phương thức thanh toán
   - Danh sách items
   - Tổng tiền chi tiết
   - Nút: In hóa đơn, Liên hệ hỗ trợ, Đặt lại

5. src/app/(public)/account/addresses/page.tsx:
   - List địa chỉ đã lưu
   - Thêm/sửa/xóa địa chỉ
   - Đánh dấu địa chỉ mặc định

6. src/app/(public)/account/wishlist/page.tsx:
   - Grid sản phẩm đã yêu thích
   - Nút xóa khỏi yêu thích, nút thêm giỏ

7. src/app/(public)/account/security/page.tsx:
   - Form đổi mật khẩu (mật khẩu cũ + mật khẩu mới + xác nhận)
   - Server Action validate + hash + update

Yêu cầu:
- Middleware đã bảo vệ /account (đã làm ở Prompt 1.4)
- Tất cả query lọc theo session.user.id
- UI gọn gàng, responsive
```

---

# GIAI ĐOẠN 5 — ADMIN PANEL

## Prompt 5.1 — Layout Admin và Dashboard

```
Tạo phần Admin Panel cho LAVIPCO:

1. src/app/(admin)/admin/layout.tsx:
   - Sidebar trái cố định (responsive: collapse thành icon-only hoặc drawer trên mobile):
     + Logo LAVIPCO Admin
     + Menu: Tổng quan, Đơn hàng, Sản phẩm, Danh mục, Khách hàng,
       Dự án, Dịch vụ, Tin tức, Khuyến mãi, Tin nhắn liên hệ, Cấu hình, Người dùng
     + Mỗi item có icon (lucide-react)
   - Topbar: breadcrumb, search nhanh, notification bell (placeholder), user menu
   - Main content area với padding
   - Middleware đã chặn non-admin (làm ở 1.4)

2. src/app/(admin)/admin/dashboard/page.tsx — Dashboard tổng quan:
   - 4 stat card đầu trang:
     + Doanh thu tháng (so sánh % với tháng trước)
     + Số đơn hàng tháng
     + Số khách hàng mới
     + Số sản phẩm đang bán
   - Biểu đồ doanh thu 12 tháng gần nhất (dùng recharts LineChart)
   - Biểu đồ đơn hàng theo trạng thái (PieChart)
   - Top 5 sản phẩm bán chạy tháng (bảng)
   - Top 5 khách hàng chi tiêu cao nhất (bảng)
   - Đơn hàng mới nhất (10 đơn, table)
   - Tin nhắn liên hệ mới chưa đọc (5 dòng)

Yêu cầu:
- Tất cả query qua Prisma aggregate
- Server Component, fetch song song với Promise.all
- Cache với revalidate 60s
- Responsive
- Component con trong src/components/admin/
```

## Prompt 5.2 — Quản lý Sản phẩm (CRUD)

```
Tạo phần quản lý sản phẩm cho admin:

1. src/app/(admin)/admin/products/page.tsx — danh sách:
   - DataTable với cột: Ảnh, Tên, SKU, Danh mục, Thương hiệu, Giá, Tồn kho, Trạng thái, Hành động
   - Filter: danh mục, thương hiệu, trạng thái, có hàng/hết hàng
   - Search theo tên/SKU
   - Sort theo cột
   - Pagination
   - Nút "Thêm sản phẩm" góc phải
   - Bulk action: xóa, đổi trạng thái, đổi danh mục
   - Nút Import/Export Excel (đặt placeholder TODO, làm sau)

2. src/app/(admin)/admin/products/new/page.tsx — thêm mới:
   Form chia thành các Card/Section:

   Card 1 - Thông tin cơ bản:
   - Tên sản phẩm *
   - Slug (auto-generate từ tên, có thể edit)
   - Thương hiệu (combobox với suggest)
   - Danh mục * (select với cây phân cấp)
   - Mô tả ngắn (textarea)
   - Mô tả chi tiết (rich text editor — dùng Tiptap hoặc placeholder textarea trước)

   Card 2 - Giá và kho:
   - priceOnRequest (switch) — nếu bật thì ẩn input giá
   - Giá cơ bản (basePrice) — input số có format VND
   - Đã bao gồm VAT (checkbox)
   - Tồn kho (nếu không có variant) — input số

   Card 3 - Hình ảnh:
   - Upload nhiều ảnh (drag-drop)
   - Tạm thời lưu base64 hoặc upload qua Cloudinary
   - Thumbnail preview, kéo thả đổi thứ tự, xóa
   - Ảnh đầu tiên = ảnh đại diện

   Card 4 - Thông số kỹ thuật:
   - Repeater field: tên thông số + giá trị + đơn vị
   - Ví dụ: "Công suất" - "100" - "W"
   - Lưu vào field specs Json

   Card 5 - Variants (optional):
   - Switch "Có biến thể"
   - Nếu bật: định nghĩa thuộc tính (Màu sắc, Công suất...) → sinh các variant tổ hợp
   - Mỗi variant: SKU, giá, tồn kho, ảnh riêng

   Card 6 - SEO:
   - Meta title
   - Meta description
   - Meta keywords

   Card 7 - Cấu hình:
   - Trạng thái (Draft/Published)
   - isFeatured (switch)
   - Cho phép đánh giá (switch)
   - File catalogue PDF (upload)

   Sticky bar dưới: nút "Hủy", "Lưu nháp", "Xuất bản"

3. src/app/(admin)/admin/products/[id]/page.tsx — chỉnh sửa:
   - Form giống như new nhưng pre-fill data
   - Thêm nút "Xóa" (xác nhận Dialog)
   - Hiển thị "Đã sửa lần cuối: ..."

4. Server Actions:
   - createProduct, updateProduct, deleteProduct
   - Validate Zod đầy đủ
   - Slug unique check
   - Upload ảnh qua Cloudinary (helper trong lib/cloudinary.ts) — nếu chưa có env thì lưu base64 và TODO

Yêu cầu kỹ thuật:
- Component form lớn nên tách thành nhiều sub-component
- Auto-save draft mỗi 30s (optional, nice-to-have)
- Loading state khi submit
- Toast feedback
- Confirm khi rời trang chưa save
```

## Prompt 5.3 — Quản lý Đơn hàng

```
Tạo phần quản lý đơn hàng:

1. src/app/(admin)/admin/orders/page.tsx — danh sách:
   - DataTable: Mã đơn, Khách hàng, SĐT, Tổng tiền, Thanh toán, Vận chuyển,
     Trạng thái đơn, Ngày đặt, Hành động (Xem)
   - Filter: trạng thái đơn, trạng thái thanh toán, trạng thái vận chuyển,
     khoảng thời gian (date range picker), phương thức thanh toán
   - Search: mã đơn, SĐT, email khách hàng
   - Sort theo ngày đặt (mặc định mới nhất)
   - Pagination
   - Stats nhanh đầu trang: tổng đơn, doanh thu, đơn chờ xử lý, đơn đã giao

2. src/app/(admin)/admin/orders/[code]/page.tsx — chi tiết đơn:
   Layout 3 cột:

   Cột chính giữa (2/3 độ rộng):
   - Header: Mã đơn + ngày đặt + nút In hóa đơn
   - Timeline trạng thái với các bước rõ ràng
   - Danh sách items (ảnh, tên, sku, qty, giá, thành tiền)
   - Tổng tiền chi tiết
   - Ghi chú nội bộ (textarea + nút lưu — riêng cho admin, không gửi cho khách)

   Cột phải (1/3 độ rộng):
   - Card Thông tin khách hàng (tên, email, SĐT, link xem profile)
   - Card Địa chỉ giao hàng
   - Card Thanh toán (method, status, mã giao dịch nếu VNPay)
   - Card Vận chuyển (provider, mã vận đơn, status)
   - Card Hành động:
     + Đổi trạng thái đơn (select + nút lưu)
     + Đổi trạng thái thanh toán
     + Cập nhật mã vận đơn
     + Nút "Hủy đơn" (yêu cầu lý do)
     + Nút "Hoàn tiền" (chỉ hiện nếu đã thanh toán)

3. Server Actions:
   - updateOrderStatus(orderId, status, note?)
   - updatePaymentStatus(orderId, status, transactionId?)
   - updateShippingInfo(orderId, provider, trackingCode)
   - cancelOrder(orderId, reason) — refund tồn kho
   - addInternalNote(orderId, note)

4. Khi đổi trạng thái:
   - Gửi email thông báo cho khách (template Resend)
   - Log activity (tạo bảng OrderActivity nếu cần audit trail)

Yêu cầu chung: confirm dialog cho action quan trọng (hủy đơn, hoàn tiền).
```

## Prompt 5.4 — Quản lý Khách hàng, Dự án, Dịch vụ, Tin tức, Khuyến mãi

```
Tạo các trang quản lý còn lại với pattern tương tự:

1. /admin/customers — Quản lý khách hàng:
   - Table list + search + filter
   - Detail: thông tin + lịch sử đơn hàng + tổng chi tiêu + ghi chú admin
   - Action: gắn tag (VIP, B2B...), tạm khóa tài khoản

2. /admin/projects — Quản lý dự án (CRUD):
   - List + Create/Edit form
   - Form: tiêu đề, slug, mô tả, client, location, year, category (enum),
     scale, images (upload nhiều), video URL, isFeatured, status
   - Rich content cho mô tả chi tiết

3. /admin/services — Quản lý dịch vụ (CRUD):
   - List + Create/Edit form
   - Form: tiêu đề, slug, icon (chọn từ lucide hoặc upload SVG),
     mô tả ngắn, mô tả chi tiết, quy trình (repeater), order

4. /admin/blog — Quản lý tin tức:
   - List + Create/Edit form
   - Form: title, slug, excerpt, content (rich editor), coverImage, tags, publishedAt, status
   - Preview button mở tab mới xem bài viết

5. /admin/coupons — Quản lý mã giảm giá (CRUD):
   - List với cột: code, type, value, đã dùng/giới hạn, hiệu lực, trạng thái
   - Form: code (uppercase auto), type (PERCENT/FIXED), value, minOrderValue,
     validFrom, validTo, usageLimit, isActive
   - Nút "Generate code" tự sinh code ngẫu nhiên 8 ký tự

6. /admin/contact-messages — Quản lý tin nhắn liên hệ:
   - List với cột: tên, email, phone, subject, ngày, status (NEW/READ/REPLIED/CLOSED)
   - Detail: nội dung + form reply (gửi email + lưu reply history)
   - Bulk action: đánh dấu đã đọc, xóa

7. /admin/settings — Cấu hình hệ thống:
   - Tabs: General, Contact, Social, Payment, Shipping, Email, SEO
   - Form lưu vào bảng Setting (key-value)
   - General: logo, favicon, site name, tagline
   - Contact: hotline, email, address, MST, giờ làm việc
   - Social: facebook, zalo, youtube URLs
   - Các tab khác: thông số config tương ứng

Mỗi module yêu cầu:
- Sử dụng pattern chung (DataTable component dùng chung)
- Server Action cho CRUD
- Validate Zod
- Toast feedback
- Confirm Dialog cho action xóa

Khi bắt đầu, hỏi tôi muốn làm module nào trước.
```

---

# GIAI ĐOẠN 6 — SEO, TỐI ƯU, DEPLOY

## Prompt 6.1 — SEO toàn diện

```
Tối ưu SEO cho toàn site:

1. Metadata động cho mọi trang:
   - generateMetadata cho /products/[slug], /projects/[slug], /services/[slug], /blog/[slug]
   - Title pattern: "<Tên trang> | LAVIPCO"
   - Meta description từ excerpt hoặc auto-generate
   - openGraph: type, title, description, images, locale: vi_VN
   - twitter: card, title, description, images

2. Schema.org JSON-LD:
   - Organization schema ở layout root (đầy đủ name, url, logo, address, contactPoint, sameAs)
   - Product schema cho trang chi tiết sản phẩm
   - BreadcrumbList schema
   - Article schema cho blog post
   - LocalBusiness schema (nếu phù hợp)

3. Sitemap động:
   - src/app/sitemap.ts — generate sitemap.xml
   - Include: trang tĩnh, sản phẩm, dự án, dịch vụ, blog
   - lastModified từ updatedAt
   - changeFrequency và priority phù hợp

4. Robots.txt:
   - src/app/robots.ts
   - Cho phép crawl public pages
   - Disallow /admin, /api, /account
   - Sitemap URL

5. URL canonical: thêm trong metadata các trang có pagination/filter

6. Hreflang nếu sau này có đa ngôn ngữ

7. Tối ưu hình ảnh:
   - next/image với sizes phù hợp
   - Alt text bắt buộc (từ trường altText của ảnh hoặc fallback tên sản phẩm)
   - priority cho ảnh hero
   - placeholder blur cho ảnh content

8. Performance:
   - Đảm bảo Core Web Vitals tốt
   - Lazy load section dưới fold
   - Suspense cho data fetch chậm
   - Font: dùng next/font local cho Inter và Times New Roman (cho document)

Sau khi xong, hướng dẫn:
- Đăng ký Google Search Console, submit sitemap
- Cài Google Analytics 4 (qua next/script trong root layout)
- Test với Lighthouse, PageSpeed Insights, Rich Results Test
```

## Prompt 6.2 — Bảo mật và rate limit

```
Tăng cường bảo mật trước khi deploy:

1. Security Headers:
   - next.config.mjs thêm headers: CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff,
     Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy
   - HSTS (chỉ bật khi đã có HTTPS)

2. Rate limiting:
   - Cài @upstash/ratelimit @upstash/redis (free tier)
   - Tạo lib/rate-limit.ts với các limiter:
     + auth: 5 lần / 15 phút / IP (login, register, reset password)
     + contact: 3 lần / 1 giờ / IP (gửi tin nhắn liên hệ)
     + search: 30 lần / 1 phút / IP
   - Áp dụng vào các Server Action / API route tương ứng

3. Validation chặt chẽ:
   - Review lại tất cả Server Actions: input đều có Zod validate
   - File upload: check mime type, size, sanitize tên file
   - HTML content (blog, product description): sanitize bằng isomorphic-dompurify
   - SQL injection: Prisma đã chống nhưng review các query raw nếu có

4. Auth security:
   - Password policy: 8+ ký tự, có chữ và số (validate cả client lẫn server)
   - Lock account sau 5 lần đăng nhập sai trong 15 phút
   - Verify email cho user mới (gửi link verify, đến khi click mới enable)
   - 2FA cho admin (optional, nice-to-have)

5. Environment:
   - Đảm bảo .env.local trong .gitignore
   - Production env qua Vercel/VPS environment variables
   - Rotate AUTH_SECRET trước deploy

6. Logging:
   - Log lỗi server qua console (Vercel tự lưu) hoặc tích hợp Sentry
   - KHÔNG log password, token, secret
   - Log audit cho admin actions (ai sửa gì, khi nào)

7. Backup:
   - Setup auto-backup database (Supabase/Neon có sẵn, hoặc cron script)
   - Hướng dẫn restore

Kiểm tra checklist OWASP Top 10 và báo cáo những gì đã làm / chưa làm.
```

## Prompt 6.3 — Deploy lên Vercel

```
Hướng dẫn deploy dự án LAVIPCO lên Vercel + database trên Supabase/Neon.

Yêu cầu chi tiết các bước:

1. Chuẩn bị database production:
   - Tạo project trên Supabase (hoặc Neon)
   - Lấy connection string (DATABASE_URL)
   - Test kết nối local

2. Migrate production database:
   - npx prisma migrate deploy với DATABASE_URL production
   - Seed admin user và dữ liệu cơ bản (categories, settings)

3. Chuẩn bị Vercel:
   - Push code lên GitHub
   - Import project vào Vercel từ GitHub
   - Cấu hình environment variables (toàn bộ env trong .env.example)
   - Build command: prisma generate && next build
   - Output directory: .next
   - Region: Singapore (sin1) — gần Việt Nam nhất

4. Custom domain:
   - Trỏ DNS từ Cloudflare/registrar về Vercel
   - SSL tự động

5. Cấu hình post-deploy:
   - VNPay return URL trỏ về domain production
   - Google OAuth redirect URI cập nhật
   - Cloudinary CORS nếu cần
   - Cập nhật NEXT_PUBLIC_SITE_URL

6. Monitoring:
   - Enable Vercel Analytics
   - Setup Sentry (optional)
   - Uptime monitor: UptimeRobot (free)

7. CI/CD:
   - Vercel tự deploy khi push lên main
   - Preview deploy cho mỗi PR
   - Branch protection trên GitHub

8. Test smoke sau deploy:
   - Trang chủ load
   - Đăng ký/đăng nhập
   - Thêm sản phẩm vào giỏ
   - Checkout với COD
   - Admin login
   - VNPay sandbox

Đưa checklist từng bước, mỗi bước có lệnh cụ thể (nếu có) và screenshot points.
```

---

# PROMPT TIỆN ÍCH DÙNG CHUNG

## Prompt T.1 — Review code

```
Hãy review file [đường dẫn] hoặc thư mục [đường dẫn] theo các tiêu chí:

1. Tuân thủ quy ước trong CLAUDE.md (đặt tên, cấu trúc, comment)
2. TypeScript: có bị any không, type chính xác chưa
3. Bảo mật: validate input, xử lý error, không lộ secret
4. Performance: có query N+1 không, có memo cần thiết không, có loading state không
5. Accessibility: aria-label, alt, semantic HTML
6. Bug tiềm ẩn: edge case chưa xử lý

Báo cáo theo định dạng:
- Vấn đề nghiêm trọng (must fix)
- Cải tiến đề xuất (nice to have)
- Điểm tốt đã làm

KHÔNG tự sửa code, chỉ báo cáo. Tôi sẽ chỉ định cái nào cần sửa.
```

## Prompt T.2 — Debug lỗi

```
Tôi đang gặp lỗi sau:

[Paste error message / stack trace ở đây]

Khi thực hiện: [mô tả hành động dẫn đến lỗi]

File liên quan: [đường dẫn file nếu biết]

Hãy:
1. Phân tích nguyên nhân có thể
2. Đề xuất 2-3 cách sửa, ưu nhược điểm
3. Chờ tôi chọn rồi mới sửa code
```

## Prompt T.3 — Refactor một module

```
Tôi muốn refactor [tên module / file].

Vấn đề hiện tại: [mô tả nếu có]
Mục tiêu refactor: [VD: tách logic ra hook, giảm prop drilling, dùng pattern mới...]

Hãy:
1. Đọc file hiện tại
2. Đề xuất phương án refactor (cấu trúc mới, các file cần tạo/xóa/sửa)
3. Liệt kê rủi ro (breaking change, cần test gì)
4. Chờ tôi duyệt rồi mới thực hiện
```

## Prompt T.4 — Thêm test cho một tính năng

```
Viết test cho [tên hàm / component].

Yêu cầu:
- Test framework: Vitest + React Testing Library
- File test đặt cạnh file gốc với đuôi .test.ts(x)
- Test các case:
  + Happy path
  + Edge case (input rỗng, null, undefined, sai type)
  + Error case
  + (Component) interaction quan trọng

Đảm bảo test chạy được với `npm run test`.
```

## Prompt T.5 — Tạo seed data thêm

```
Tạo thêm seed data realistic cho [module: products / projects / orders...].

Yêu cầu:
- Số lượng: [N]
- Dữ liệu tiếng Việt phù hợp ngành chiếu sáng / đèn tín hiệu
- Đa dạng category, brand, giá
- Một số sản phẩm priceOnRequest = true
- Ảnh: dùng URL placeholder hợp lý (picsum hoặc unsplash với keyword phù hợp)

Cập nhật prisma/seed.ts hoặc tạo file seed riêng.
Đưa lệnh chạy seed.
```

## Prompt T.6 — Migration schema an toàn

```
Tôi muốn thay đổi schema: [mô tả thay đổi]

Hãy:
1. Đề xuất cách sửa schema.prisma (đưa diff)
2. Đánh giá rủi ro: có làm mất dữ liệu không, có cần data migration custom không
3. Đưa lệnh migrate với tên có ý nghĩa
4. Nếu cần data migration custom (di chuyển dữ liệu cũ sang cấu trúc mới):
   viết script TS trong prisma/migrations/<...>/data-migration.ts

Cảnh báo nếu thay đổi này không tương thích ngược.
```

## Prompt T.7 — Tối ưu hiệu năng

```
Trang [đường dẫn / URL] đang chậm.

Triệu chứng: [VD: load 5s, LCP cao, scroll lag...]

Hãy:
1. Phân tích các nguyên nhân có thể (query DB, bundle size, ảnh, re-render...)
2. Đề xuất các tối ưu theo thứ tự ưu tiên (impact cao → thấp)
3. Đo lường: dùng Chrome DevTools / Lighthouse / next bundle analyzer
4. Áp dụng tối ưu theo từng bước, có đo lường trước/sau
```

---

# MẸO VIẾT PROMPT HIỆU QUẢ

Khi tự viết prompt cho Claude Code (ngoài bộ mẫu này), Lam tham khảo các nguyên tắc sau:

**Đưa ngữ cảnh đầy đủ.** Đề cập tên dự án, công nghệ, file liên quan, mục tiêu nghiệp vụ. Vì đã có CLAUDE.md nên không cần lặp lại, chỉ nhắc đến phần đặc thù cho yêu cầu này.

**Yêu cầu lập kế hoạch trước khi code khi tác vụ lớn.** Câu thần chú: "Hãy lên kế hoạch chi tiết trước, liệt kê các bước, tôi xác nhận xong mới thực hiện."

**Chia nhỏ tác vụ.** Một prompt = một module hoặc một tính năng rõ ràng. Tránh prompt kiểu "code toàn bộ phần admin" — Claude sẽ làm vội, dễ thiếu sót.

**Chỉ định rõ output.** Liệt kê các file cần tạo, cấu trúc, hành vi mong muốn. Càng cụ thể, kết quả càng đúng.

**Ràng buộc rõ ràng.** Ví dụ: "Server Component", "không dùng any", "validate Zod", "responsive mobile-first". Đây là những điều dễ bị bỏ qua nếu không nhắc.

**Yêu cầu test thủ công.** Sau khi code xong, nhờ Claude đưa các bước test thủ công cụ thể để Lam xác nhận tính năng hoạt động đúng.

**Dùng `/clear` khi chuyển chủ đề.** Mỗi giai đoạn lớn nên bắt đầu context sạch để Claude không bị nhiễu bởi code cũ.

**Commit Git ngay sau mỗi prompt thành công.** Nhờ Claude đề xuất commit message theo Conventional Commits đã định trong CLAUDE.md.

**Khi không hài lòng kết quả.** Đừng chỉ nói "sai rồi, làm lại". Mô tả cụ thể: cái gì sai, mong muốn thế nào. Ví dụ: "Layout cột bên phải bị tràn trên màn 1024px, mong muốn collapse thành cột dưới cùng từ breakpoint md trở xuống."

**Lưu lại prompt hữu ích.** Khi viết được prompt hay, copy vào file riêng (`my-prompts.md`) để tái sử dụng cho dự án sau.

---

*File này được duy trì bởi Lam Mai. Cập nhật và bổ sung prompt mới khi cần thiết.*
