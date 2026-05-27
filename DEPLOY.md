# 🚀 LAVIPCO — Hướng dẫn Deploy Production

> Stack production: **Vercel** (frontend + Server Actions) + **Supabase** hoặc **Neon** (PostgreSQL) + **Cloudflare** (DNS + CDN cache).

---

## 📋 Pre-flight checklist

Trước khi bắt đầu, đảm bảo đã có:

- [ ] Tài khoản GitHub (free) — để push code
- [ ] Tài khoản Vercel (free Hobby) — https://vercel.com/signup
- [ ] Tài khoản Supabase hoặc Neon (free) — chọn 1
- [ ] Tài khoản Cloudinary (free 25GB bandwidth/tháng) — https://cloudinary.com
- [ ] Tài khoản Resend (free 3000 email/tháng) — https://resend.com
- [ ] Domain `lavipco.com.vn` đã đăng ký (PA Vietnam / Mắt Bão / GoDaddy)
- [ ] Tài khoản Cloudflare (free) — quản lý DNS
- [ ] Tài khoản Upstash (free 10k Redis cmd/day) — https://upstash.com
- [ ] VNPay sandbox đã đăng ký — https://sandbox.vnpayment.vn/devreg

---

## 1️⃣ Chuẩn bị database production

### Option A: Supabase (recommended cho VN)

1. Vào https://supabase.com/dashboard → **New Project**
2. Điền:
   - **Name:** `lavipco-prod`
   - **Database Password:** dùng password manager sinh 20+ ký tự, lưu kỹ
   - **Region:** `Southeast Asia (Singapore)` — gần VN nhất
   - **Pricing Plan:** Free (sau scale sang Pro $25/mo khi traffic tăng)
3. Đợi 2 phút Supabase provision xong.
4. Vào **Project Settings** → **Database** → **Connection string** → tab **URI**
5. Có 2 chuỗi:
   - **Direct connection** (port 5432) — dùng cho `prisma migrate deploy`
   - **Pooling connection** (port 6543) — dùng cho `DATABASE_URL` runtime của Next.js
6. Copy chuỗi **Pooling** + thay `[YOUR-PASSWORD]` bằng password thật:
   ```
   postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

📸 **Screenshot điểm:** Project Settings → Database → Connection string

### Option B: Neon (alternative)

1. Vào https://console.neon.tech → **Create Project**
2. Điền:
   - **Project name:** `lavipco-prod`
   - **PostgreSQL version:** 16
   - **Region:** `Asia Pacific (Singapore)`
3. Copy connection string từ Dashboard (đã có sẵn pooler):
   ```
   postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Test kết nối local

Tạm thời ghi đè DATABASE_URL trong `.env.local`:
```bash
DATABASE_URL="<chuỗi vừa copy>"
npm run db:generate
npx prisma migrate status
```

Nếu output là `Database is up to date` hoặc `No migration found` → ✅ kết nối OK.

> ⚠️ Sau khi test, **rollback** `.env.local` về connection local để không lỡ tay migrate prod khi dev.

---

## 2️⃣ Migrate production database

```bash
# Set DATABASE_URL prod tạm thời cho shell hiện tại (Bash/zsh)
export DATABASE_URL="postgresql://...prod"
# Hoặc Windows PowerShell:
# $env:DATABASE_URL = "postgresql://...prod"

# Apply tất cả migrations đã commit
npx prisma migrate deploy

# Seed admin user + categories + settings
SEED_ADMIN_PASSWORD="<password-mạnh-cho-admin>" npm run db:seed:prod
```

**Kết quả mong đợi:**
```
Applying migration `20260526123548_init_schema`
Applying migration `20260526130000_rename_project_category_and_audit_fields`
... (8 migrations)
All migrations have been successfully applied.
```

**Admin login mặc định** (nếu seed thành công):
- Email: `admin@lavipco.com.vn`
- Password: giá trị `SEED_ADMIN_PASSWORD` bạn vừa set

> 🔒 **Đổi password admin ngay sau lần login đầu** qua trang `/account/security`.

📸 **Screenshot điểm:** Terminal output migrate deploy + seed thành công

---

## 3️⃣ Chuẩn bị Vercel

### 3.1. Push code lên GitHub

```bash
# Nếu chưa có remote
git remote add origin https://github.com/lavipco/lavipco-website.git

# Verify branch hiện tại
git branch -v

# Push lên (chọn 1)
git push -u origin sub1  # nếu chưa merge vào main
# HOẶC merge sub1 → main rồi push:
git checkout main && git merge sub1 && git push -u origin main
```

### 3.2. Import project vào Vercel

1. Vào https://vercel.com/new
2. **Import Git Repository** → chọn `lavipco-website`
3. **Configure Project:**
   - **Framework Preset:** Next.js (Vercel tự detect)
   - **Root Directory:** `./` (mặc định)
   - **Build Command:** *để trống* — `vercel.json` đã pin `prisma generate && next build`
   - **Output Directory:** `.next` (mặc định)
   - **Install Command:** `npm install` (mặc định)
   - **Node.js Version:** 20.x (Settings → General sau khi import)

### 3.3. Cấu hình Environment Variables

Trong bước Configure (hoặc Settings → Environment Variables sau khi import), thêm từng env:

| Key | Value | Environment |
|---|---|---|
| `DATABASE_URL` | Pooling URL từ Supabase | Production, Preview |
| `AUTH_SECRET` | `openssl rand -base64 32` (32 bytes random) | Production, Preview |
| `AUTH_URL` | `https://lavipco.com.vn` (sau khi có custom domain; tạm `https://<project>.vercel.app`) | Production, Preview |
| `GOOGLE_CLIENT_ID` | Từ Google Cloud Console | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | Từ Google Cloud Console | Production, Preview |
| `CLOUDINARY_CLOUD_NAME` | Dashboard Cloudinary | Production, Preview |
| `CLOUDINARY_API_KEY` | Dashboard Cloudinary | Production, Preview |
| `CLOUDINARY_API_SECRET` | Dashboard Cloudinary | Production, Preview |
| `RESEND_API_KEY` | Dashboard Resend (API Keys) | Production, Preview |
| `EMAIL_FROM` | `no-reply@lavipco.com.vn` | Production, Preview |
| `VNPAY_TMN_CODE` | Sandbox / Production VNPay | Production, Preview |
| `VNPAY_SECRET_KEY` | Hash Secret VNPay | Production, Preview |
| `VNPAY_URL` | Sandbox: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` | Production, Preview |
| `VNPAY_RETURN_URL` | `https://lavipco.com.vn/checkout/vnpay-return` | Production |
| `GHN_API_TOKEN` | Dashboard GHN | Production, Preview |
| `GHN_SHOP_ID` | Dashboard GHN | Production, Preview |
| `UPSTASH_REDIS_REST_URL` | Dashboard Upstash | Production, Preview |
| `UPSTASH_REDIS_REST_TOKEN` | Dashboard Upstash | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://lavipco.com.vn` | Production |
| `NEXT_PUBLIC_GA_ID` | GA4 Measurement ID (G-XXX) | Production |

> 💡 **Tip:** Vercel có nút **Import .env** — copy nội dung `.env.local` → paste → Vercel tự parse.

### 3.4. Region

Vercel mặc định deploy multi-region. Để pin Singapore (gần VN):
- File `vercel.json` đã set `"regions": ["sin1"]` ✓
- Hoặc UI: Settings → Functions → Function Region → `Singapore (sin1)`

### 3.5. Deploy

Bấm **Deploy** → đợi 3-5 phút build hoàn tất.

📸 **Screenshot điểm:** Vercel dashboard hiển thị "Ready" + URL `https://<project>.vercel.app`

---

## 4️⃣ Custom domain

### 4.1. Thêm domain vào Vercel

1. Vercel project → **Settings** → **Domains** → **Add**
2. Nhập `lavipco.com.vn` → **Add**
3. Vercel hiển thị 2 cách verify (chọn 1):
   - **Nameservers Vercel** (recommended nếu chỉ dùng Vercel): trỏ NS về Vercel
   - **A/CNAME records** (recommended nếu giữ Cloudflare): copy IP + CNAME target

### 4.2. Cấu hình DNS qua Cloudflare (khuyến nghị)

1. Đăng ký domain ở Cloudflare (Free plan)
2. Vào Cloudflare → DNS → Records:
   - **A record:** `lavipco.com.vn` → `76.76.21.21` (IP Vercel) — Proxy status **DNS only** (☁️ xám, KHÔNG bật proxy cam, vì Vercel tự handle TLS)
   - **CNAME record:** `www` → `cname.vercel-dns.com` — DNS only
3. Đợi DNS propagate (1-15 phút). Kiểm tra:
   ```bash
   nslookup lavipco.com.vn
   ```
4. Trong Vercel **Domains** → bấm **Refresh** → trạng thái chuyển sang **Valid Configuration ✓**

### 4.3. SSL

- Vercel tự issue Let's Encrypt SSL ngay sau khi DNS valid (1-2 phút).
- Force HTTPS: Vercel mặc định bật (redirect HTTP → HTTPS).
- Test: `curl -I https://lavipco.com.vn` phải trả `200 OK` + header `Strict-Transport-Security`.

📸 **Screenshot điểm:** Vercel Domains hiển thị `lavipco.com.vn ✓ Valid` + SSL Active

---

## 5️⃣ Cấu hình post-deploy

### 5.1. VNPay Return URL

1. Vào VNPay Merchant Admin → Cấu hình Terminal
2. **Return URL:** `https://lavipco.com.vn/checkout/vnpay-return`
3. **IPN URL** (Server-to-server): `https://lavipco.com.vn/api/payment/vnpay-ipn`
4. Cập nhật env `VNPAY_RETURN_URL` ở Vercel cho khớp.

### 5.2. Google OAuth Redirect URI

1. https://console.cloud.google.com → APIs & Services → Credentials
2. OAuth 2.0 Client → **Authorized redirect URIs** → Add:
   - `https://lavipco.com.vn/api/auth/callback/google`
3. Save.

> ⚠️ Khi dev local: thêm cả `http://localhost:3000/api/auth/callback/google`.

### 5.3. Cloudinary CORS (nếu cần direct upload từ client)

LAVIPCO upload qua Server Action → KHÔNG cần CORS. Skip.

### 5.4. Resend domain verification

1. https://resend.com/domains → **Add Domain** → `lavipco.com.vn`
2. Resend cho 3 DNS record (DKIM, SPF, MX) → thêm vào Cloudflare DNS
3. Đợi verify (5-30 phút). Trạng thái → ✓ Verified
4. Cập nhật `EMAIL_FROM=no-reply@lavipco.com.vn` ở Vercel env

### 5.5. Update NEXT_PUBLIC_SITE_URL

Trong Vercel env: đảm bảo `NEXT_PUBLIC_SITE_URL=https://lavipco.com.vn` (không có trailing slash).
Sau khi đổi, **Redeploy** để rebuild với env mới:
- Vercel → Deployments → bấm `…` → **Redeploy**

### 5.6. Cài đặt Settings qua Admin Panel

Login `/admin/settings`:
- **Contact tab:** hotline, email, address, MST, giờ làm việc
- **Social tab:** Facebook, Zalo, YouTube URLs
- **General tab:** logo URL, favicon URL
- **SEO tab:** GA4 ID, GTM ID

---

## 6️⃣ Monitoring

### 6.1. Vercel Analytics (free)

1. Vercel project → **Analytics** → **Enable**
2. Cài package (nếu Vercel yêu cầu):
   ```bash
   npm install @vercel/analytics
   ```
3. Thêm `<Analytics />` vào `src/app/layout.tsx`:
   ```tsx
   import { Analytics } from "@vercel/analytics/next";
   // ... trong <body>:
   <Analytics />
   ```
4. Sau 24h → có biểu đồ traffic + Core Web Vitals.

### 6.2. Sentry (optional)

```bash
npx @sentry/wizard@latest -i nextjs
```

Wizard sẽ tự thêm config + init code. Theo prompt wizard, chọn:
- ✅ Performance monitoring
- ✅ Session replay (chỉ cần khi debug UX)
- ✅ Tracing
- DSN từ Sentry project → tự lưu vào `.env.local` + Vercel env

### 6.3. UptimeRobot (free, alert qua email)

1. Đăng ký https://uptimerobot.com
2. **+ New Monitor:**
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** LAVIPCO Production
   - **URL:** `https://lavipco.com.vn`
   - **Monitoring Interval:** 5 minutes
3. **Alert Contacts:** thêm email của Lam
4. Sau 5 phút → có status indicator ở dashboard

📸 **Screenshot điểm:** UptimeRobot dashboard hiển thị monitor "Up" với latency < 500ms

---

## 7️⃣ CI/CD

### 7.1. Auto deploy

Vercel mặc định:
- Push lên `main` → **Production deploy** → cập nhật `lavipco.com.vn`
- Push lên branch khác → **Preview deploy** → URL tạm `https://lavipco-website-<hash>-<team>.vercel.app`
- Mở PR → Vercel comment URL preview vào PR

### 7.2. Branch protection rules (GitHub)

1. GitHub repo → **Settings** → **Branches** → **Add rule**
2. **Branch name pattern:** `main`
3. Bật:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 reviewer)
   - ✅ Require status checks to pass before merging
     - Pick check: `Vercel — Preview` (xuất hiện sau lần deploy đầu tiên)
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings (kể cả admin)
4. **Save changes**

### 7.3. GitHub Actions (optional — backup check)

Tạo `.github/workflows/ci.yml` nếu muốn check type-check + lint trước khi Vercel build:

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
```

> Vercel build cũng chạy type-check + lint nên đây là duplicate. Bỏ qua nếu không cần.

---

## 8️⃣ Smoke test sau deploy

Test theo thứ tự, đánh dấu mỗi step:

### Public flow
- [ ] Mở `https://lavipco.com.vn` → trang chủ load < 3s, hero hiển thị
- [ ] Navigate đến `/products` → danh sách sản phẩm hiển thị
- [ ] Click 1 sản phẩm → trang chi tiết load, Product schema xuất hiện trong DOM (View Source, tìm `application/ld+json`)
- [ ] Bấm "Thêm vào giỏ" → toast xác nhận, giỏ hiển thị số 1 ở header
- [ ] `/cart` → item đúng, tổng tiền đúng

### Auth flow
- [ ] `/sign-up` → đăng ký user mới với email tạm
- [ ] Sau register → tự động login về `/`
- [ ] Logout → quay về public
- [ ] `/sign-in` → login lại với user vừa tạo
- [ ] Sai password 5 lần liên tiếp → **rate limit** kích hoạt: "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 15 phút."

### Checkout COD
- [ ] Login → thêm 1 sản phẩm vào giỏ
- [ ] `/checkout` → fill form: tên, SĐT, địa chỉ (chọn cascade tỉnh/quận/phường)
- [ ] Chọn **COD** → bấm "Đặt hàng"
- [ ] Redirect `/checkout/success?code=DH...` → có mã đơn DH<yyyymmdd><4-digit>
- [ ] Vào DB hoặc `/account/orders` → thấy đơn vừa tạo, status PENDING

### VNPay sandbox
- [ ] Checkout chọn **VNPay** → redirect sang `sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- [ ] Nhập thẻ test: `9704198526191432198` / `NGUYEN VAN A` / `07/15` / OTP `123456`
- [ ] Redirect về `/checkout/vnpay-return` → status "✓ Thanh toán thành công"
- [ ] `/account/orders/<code>` → paymentStatus PAID, paymentTransactionId có giá trị

### Admin flow
- [ ] `/sign-in` với admin@lavipco.com.vn
- [ ] Redirect `/admin/dashboard` → 4 stat card + biểu đồ doanh thu
- [ ] `/admin/orders` → đơn vừa tạo hiển thị
- [ ] Click vào đơn → đổi trạng thái → "CONFIRMED" → toast OK
- [ ] User nhận email "Đơn hàng đã được cập nhật" (kiểm tra inbox)

### SEO
- [ ] `https://lavipco.com.vn/sitemap.xml` → XML hiển thị, có URL các trang
- [ ] `https://lavipco.com.vn/robots.txt` → có Allow / Disallow + Sitemap URL
- [ ] https://search.google.com/test/rich-results → paste URL trang chủ → có Organization schema valid
- [ ] https://pagespeed.web.dev → test trang chủ → Performance ≥ 80, SEO ≥ 95

### Security
- [ ] https://securityheaders.com/?q=lavipco.com.vn → grade A hoặc A+
- [ ] DevTools Console — không có CSP violation khi browse các trang
- [ ] `curl -I https://lavipco.com.vn` → check có header `Strict-Transport-Security`, `X-Frame-Options: DENY`, `Content-Security-Policy: ...`

📸 **Screenshot điểm:** Tổng hợp các test pass cho Lam lưu trữ + report stakeholders

---

## 🔄 Quy trình cập nhật code sau deploy

```bash
# 1. Tạo feature branch
git checkout -b feat/add-foo

# 2. Code + commit theo Conventional Commits
git commit -m "feat(foo): bar baz"

# 3. Push + tạo PR
git push -u origin feat/add-foo
gh pr create  # hoặc qua UI GitHub

# 4. Vercel auto-deploy preview → review URL trong PR comment

# 5. Approve + Merge → Vercel auto-deploy production

# 6. Nếu có schema change:
#    - Migration phải được test trên Preview Database trước (Supabase branching)
#    - Hoặc backup prod DB trước khi merge:
#      Supabase Dashboard → Database → Backups → Create backup
```

---

## 🆘 Troubleshooting

| Vấn đề | Nguyên nhân thường gặp | Fix |
|---|---|---|
| Build fail "Cannot find module '@prisma/client'" | postinstall không chạy | Verify `package.json` có `"postinstall": "prisma generate"` |
| Build fail "Too many connections" | DATABASE_URL dùng direct connection thay vì pooler | Đổi sang URL pooler (port 6543 Supabase) |
| `/admin` redirect loop | AUTH_URL không khớp domain hiện tại | Update AUTH_URL trong Vercel env + redeploy |
| Login Google fail "redirect_uri_mismatch" | Chưa add prod URL vào Google Console | Add `https://lavipco.com.vn/api/auth/callback/google` |
| Email không gửi | Resend domain chưa verify | Check Resend dashboard, đợi DNS propagate |
| CSP block script GA | NEXT_PUBLIC_GA_ID rỗng nhưng có inline script khác | Inspect Console — fix CSP whitelist trong `next.config.mjs` |
| `/sitemap.xml` 500 | DB connection sai từ build context | Check DATABASE_URL + redeploy |
| Cart không persist sau reload | Zustand persist hoạt động, nhưng có thể bị middleware chặn cookie | Verify middleware matcher không match `/cart` |

---

## 💾 Backup & Restore

### Supabase (auto)
- Free tier: 7 ngày point-in-time recovery
- Pro tier: 30 ngày + backup tải về

### Backup thủ công (cron job ngoài Supabase)
```bash
# Trên VPS với pg_dump
pg_dump "$DATABASE_URL" --no-owner --no-acl > backup-$(date +%Y%m%d).sql

# Hoặc qua Docker
docker run --rm -e PGPASSWORD="$DB_PASS" postgres:16 \
  pg_dump -h <host> -U postgres -d postgres > backup.sql
```

### Restore
```bash
psql "$DATABASE_URL_TARGET" < backup-20260530.sql
```

> ⚠️ Test restore trên môi trường staging trước, KHÔNG restore trực tiếp vào prod.

---

## 📞 Liên hệ khi sự cố

- **Vercel status:** https://www.vercel-status.com/
- **Supabase status:** https://status.supabase.com/
- **VNPay support:** https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
- **Cloudflare status:** https://www.cloudflarestatus.com/

---

*Cập nhật lần cuối: phase 6.3. Khi có thay đổi quy trình deploy, cập nhật file này.*
