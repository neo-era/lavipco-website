/**
 * Dữ liệu mẫu cho môi trường dev/demo.
 * Chạy: npm run db:seed
 *
 * Trước khi chạy, cần:
 *  1. PostgreSQL đã chạy và DATABASE_URL trỏ đúng database.
 *  2. Đã áp dụng migration: `npm run db:migrate`.
 *
 * File này idempotent: chạy nhiều lần không sinh trùng dữ liệu (dùng upsert).
 */
import { PrismaClient, ProductStatus, ProjectCategory, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

// Inline để tránh import từ src/ (seed chạy bằng tsx ngoài Next.js context)
function removeVietnameseAccents(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const db = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu LAVIPCO…");

  // ------------------------------------------------------------------
  // Admin user mặc định
  // ------------------------------------------------------------------
  const adminEmail = "admin@lavipco.com.vn";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
  const hashed = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { hashedPassword: hashed, role: UserRole.ADMIN },
    create: {
      email: adminEmail,
      name: "Quản trị LAVIPCO",
      hashedPassword: hashed,
      role: UserRole.ADMIN,
    },
  });
  console.log(
    `  ✅ Admin: ${admin.email} (mật khẩu mặc định: ${adminPassword} — đổi ngay sau khi đăng nhập)`,
  );

  // ------------------------------------------------------------------
  // Dịch vụ (services)
  // ------------------------------------------------------------------
  const services = [
    {
      slug: "den-tin-hieu-giao-thong",
      title: "Đèn tín hiệu giao thông",
      description:
        "Thiết kế, cung cấp và lắp đặt hệ thống đèn tín hiệu giao thông tại các nút giao đô thị, đáp ứng QCVN và tiêu chuẩn ITS.",
      icon: "TrafficCone",
      sortOrder: 1,
    },
    {
      slug: "chieu-sang-do-thi-thong-minh",
      title: "Chiếu sáng đô thị thông minh",
      description:
        "Giải pháp chiếu sáng LED đường phố tích hợp điều khiển cấp tủ, mở rộng đến từng điểm sáng, kết nối nền tảng Smart City.",
      icon: "Lightbulb",
      sortOrder: 2,
    },
    {
      slug: "chieu-sang-canh-quan",
      title: "Chiếu sáng cảnh quan",
      description:
        "Tư vấn và thi công chiếu sáng kiến trúc, công viên, quảng trường, tạo điểm nhấn đô thị.",
      icon: "Sparkles",
      sortOrder: 3,
    },
    {
      slug: "ha-tang-dien",
      title: "Hạ tầng điện",
      description:
        "Thi công đường dây trung/hạ thế, trạm biến áp, tủ điều khiển và hệ thống điện hạ tầng đô thị.",
      icon: "Zap",
      sortOrder: 4,
    },
  ];
  for (const s of services) {
    await db.service.upsert({ where: { slug: s.slug }, update: s, create: s });
  }
  console.log(`  ✅ Đã seed ${services.length} dịch vụ`);

  // ------------------------------------------------------------------
  // Dự án (portfolio)
  // ------------------------------------------------------------------
  const projects = [
    {
      slug: "chieu-sang-do-thi-thong-minh-phuong-ninh-thanh",
      title: "Chiếu sáng đô thị thông minh - Phường Ninh Thạnh",
      summary:
        "Hệ thống điều khiển chiếu sáng cấp tủ, lộ trình mở rộng đến điểm sáng, tích hợp camera & Smart City.",
      description:
        "Dự án độc lập do LAVIPCO triển khai cho phường Ninh Thạnh: điều khiển trung tâm các tủ chiếu sáng, dashboard giám sát thời gian thực, sẵn sàng mở rộng tới mỗi đèn đường, tích hợp camera giám sát giao thông và thiết bị IoT đô thị.",
      client: "UBND Phường Ninh Thạnh",
      location: "Tây Ninh",
      year: 2026,
      scale: "Điều khiển cấp tủ - mở rộng đến điểm sáng + tích hợp Smart City",
      category: ProjectCategory.URBAN_LIGHTING,
      images: [],
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: "den-tin-hieu-giao-thong-nga-tu-quoc-lo-22",
      title: "Đèn tín hiệu giao thông nút giao QL22",
      summary:
        "Lắp đặt đèn tín hiệu LED tại nút giao Quốc lộ 22 — Tỉnh lộ 7, tích hợp đồng bộ thời gian thực.",
      description:
        "Hệ thống đèn tín hiệu giao thông 4 pha, sử dụng đèn LED tiết kiệm điện, tủ điều khiển có timer & remote, đếm lùi đồng bộ. Đáp ứng QCVN 41:2019/BGTVT.",
      client: "Sở GTVT TP.HCM",
      location: "Củ Chi, TP.HCM",
      year: 2025,
      scale: "1 nút giao 4 pha, 16 đèn LED, 1 tủ điều khiển",
      category: ProjectCategory.TRAFFIC_LIGHT,
      images: [],
      isFeatured: true,
      sortOrder: 2,
    },
    {
      slug: "chieu-sang-canh-quan-cong-vien-le-van-tam",
      title: "Chiếu sáng cảnh quan Công viên Lê Văn Tám",
      summary:
        "Thiết kế và thi công chiếu sáng kiến trúc, đèn lối đi và đèn trang trí cho công viên trung tâm.",
      description:
        "Giải pháp đèn pha LED RGB cho cây xanh, đèn cột thấp dọc lối đi, đèn nhúng nước cho hồ phun. Hệ điều khiển DMX cho phép đổi màu theo sự kiện.",
      client: "UBND Quận 1, TP.HCM",
      location: "Quận 1, TP.HCM",
      year: 2024,
      scale: "2 ha công viên, 120 đèn cột + 60 đèn pha + 30 đèn nhúng nước",
      category: ProjectCategory.LANDSCAPE_LIGHTING,
      images: [],
      isFeatured: false,
      sortOrder: 3,
    },
  ];
  for (const p of projects) {
    await db.project.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  console.log(`  ✅ Đã seed ${projects.length} dự án`);

  // ------------------------------------------------------------------
  // Category sản phẩm (5 danh mục)
  // ------------------------------------------------------------------
  const categories = [
    { slug: "den-tin-hieu", name: "Đèn tín hiệu", sortOrder: 1 },
    { slug: "den-led-duong-pho", name: "Đèn LED đường phố", sortOrder: 2 },
    { slug: "den-pha-canh-quan", name: "Đèn pha cảnh quan", sortOrder: 3 },
    { slug: "tu-dieu-khien", name: "Tủ điều khiển", sortOrder: 4 },
    { slug: "phu-kien", name: "Phụ kiện", sortOrder: 5 },
  ];
  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log(`  ✅ Đã seed ${categories.length} danh mục`);

  // Map slug → id để gán categoryId cho product
  const categoryMap = Object.fromEntries(
    (await db.category.findMany({ select: { slug: true, id: true } })).map((c) => [c.slug, c.id]),
  );

  // ------------------------------------------------------------------
  // Sản phẩm mẫu (5 sản phẩm với variants)
  // ------------------------------------------------------------------
  const products = [
    {
      slug: "den-tin-hieu-led-300mm-3-pha",
      name: "Đèn tín hiệu LED 300mm 3 pha (R/Y/G)",
      shortDescription: "Bộ đèn tín hiệu LED 300mm 3 pha, vỏ nhôm sơn tĩnh điện, IP65.",
      description:
        "Đèn tín hiệu giao thông LED đường kính 300mm, gồm 3 pha Đỏ–Vàng–Xanh, sử dụng chip LED 5050, ánh sáng đều, tuổi thọ 50.000 giờ. Vỏ nhôm đúc, sơn tĩnh điện chống ăn mòn, IP65 chống nước.",
      basePrice: 4_500_000,
      brand: "LAVIPCO",
      images: [],
      categorySlug: "den-tin-hieu",
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      specs: {
        size: "300mm",
        power: "25W",
        voltage: "220VAC",
        ipRating: "IP65",
        material: "Nhôm đúc",
        warranty: "24 tháng",
        standards: ["QCVN 41:2019/BGTVT"],
      },
      variants: [
        { sku: "TL-300-3P", name: "300mm - 3 pha tròn", price: 4_500_000, stock: 50, isDefault: true },
      ],
    },
    {
      slug: "den-led-duong-pho-150w-smart",
      name: "Đèn LED đường phố 150W Smart Control",
      shortDescription: "Đèn LED 150W, 21.000 lumen, tích hợp NEMA socket cho điều khiển từ xa.",
      description:
        "Đèn đường LED 150W tích hợp NEMA 7-pin socket, cho phép gắn controller điều khiển cấp điểm sáng. Hiệu suất 140 lm/W, chip Bridgelux/Lumileds.",
      basePrice: 6_800_000,
      brand: "LAVIPCO",
      images: [],
      categorySlug: "den-led-duong-pho",
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      specs: {
        power: "150W",
        voltage: "220VAC",
        ipRating: "IP66",
        cct: "5000K",
        lumen: "21000 lm",
        beamAngle: "Type II / III",
        warranty: "60 tháng",
        standards: ["TCVN 7722-2-3:2013"],
      },
      variants: [
        { sku: "SL-150-50K", name: "150W - 5000K", price: 6_800_000, stock: 30, isDefault: true },
        { sku: "SL-150-40K", name: "150W - 4000K", price: 6_800_000, stock: 20 },
      ],
    },
    {
      slug: "den-pha-led-200w-rgb-dmx",
      name: "Đèn pha LED 200W RGB điều khiển DMX",
      shortDescription: "Đèn pha 200W RGB+W, hỗ trợ DMX-512, IP66 cho ngoài trời.",
      description:
        "Đèn pha LED RGB+W 200W, điều khiển DMX-512 cho phép đổi màu theo kịch bản. Phù hợp cho chiếu sáng kiến trúc, công viên, mặt tiền toà nhà.",
      basePrice: 8_900_000,
      brand: "LAVIPCO",
      images: [],
      categorySlug: "den-pha-canh-quan",
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      specs: {
        power: "200W",
        voltage: "220VAC",
        ipRating: "IP66",
        beamAngle: "30° / 60°",
        warranty: "36 tháng",
      },
      variants: [
        { sku: "FL-200-30", name: "200W - Beam 30°", price: 8_900_000, stock: 15, isDefault: true },
        { sku: "FL-200-60", name: "200W - Beam 60°", price: 8_900_000, stock: 12 },
      ],
    },
    {
      slug: "tu-dieu-khien-chieu-sang-thong-minh",
      name: "Tủ điều khiển chiếu sáng thông minh",
      shortDescription:
        "Tủ điều khiển cấp tủ tích hợp PLC + 4G, đo điện năng và lập lịch bật/tắt từ xa.",
      description:
        "Tủ điều khiển trung tâm cho hệ chiếu sáng đường phố: bộ PLC, modem 4G/Ethernet, đồng hồ đo điện năng đa năng, contactor 100A, ATS dự phòng. Phần mềm SCADA giám sát trên cloud LAVIPCO.",
      basePrice: 0,
      priceOnRequest: true,
      brand: "LAVIPCO",
      images: [],
      categorySlug: "tu-dieu-khien",
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      specs: {
        voltage: "3 phase 380VAC",
        ipRating: "IP54",
        material: "Tôn sơn tĩnh điện",
        warranty: "36 tháng",
      },
      variants: [
        { sku: "CC-100A", name: "Output 100A", price: 0, stock: 5, isDefault: true },
      ],
    },
    {
      slug: "controller-nema-7pin-zigbee",
      name: "Controller NEMA 7-pin Zigbee",
      shortDescription: "Controller cắm vào socket NEMA của đèn đường, kết nối Zigbee về gateway.",
      description:
        "Bộ điều khiển từng đèn (per-light controller) sử dụng socket NEMA 7-pin, giao tiếp Zigbee 3.0 về gateway. Hỗ trợ dimming 0-10V và đo điện năng theo đèn.",
      basePrice: 1_650_000,
      brand: "LAVIPCO",
      images: [],
      categorySlug: "phu-kien",
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      specs: {
        voltage: "100-277VAC",
        ipRating: "IP66",
        warranty: "24 tháng",
      },
      variants: [
        { sku: "CTR-NEMA-ZB", name: "Zigbee 7-pin", price: 1_650_000, stock: 100, isDefault: true },
      ],
    },
  ];

  let productCount = 0;
  let variantCount = 0;
  for (const p of products) {
    const { variants, categorySlug, ...rest } = p;
    const categoryId = categoryMap[categorySlug];
    if (!categoryId) throw new Error(`Không tìm thấy category slug ${categorySlug}`);

    const nameNoAccent = removeVietnameseAccents(rest.name);
    const data = { ...rest, categoryId, nameNoAccent };

    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
    productCount++;

    for (const v of variants) {
      await db.productVariant.upsert({
        where: { sku: v.sku },
        update: { ...v, productId: product.id },
        create: { ...v, productId: product.id },
      });
      variantCount++;
    }
  }
  console.log(`  ✅ Đã seed ${productCount} sản phẩm với ${variantCount} variants`);

  // ------------------------------------------------------------------
  // Cấu hình hệ thống (5 settings cơ bản)
  // ------------------------------------------------------------------
  const settings = [
    { key: "site.hotline", value: "1900 0000" },
    { key: "site.email", value: "info@lavipco.com.vn" },
    { key: "site.address", value: "TP. Hồ Chí Minh, Việt Nam" },
    { key: "site.taxCode", value: "" }, // Lam điền MST sau
    { key: "site.workingHours", value: "T2 - T7: 08:00 - 17:30" },
  ];
  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`  ✅ Đã seed ${settings.length} setting`);

  console.log("🌱 Hoàn tất seed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
