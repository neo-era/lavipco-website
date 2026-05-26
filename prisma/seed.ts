/**
 * Dữ liệu mẫu cho môi trường dev/demo.
 * Chạy: npx prisma db seed
 *
 * Trước khi chạy, cần:
 *  1. PostgreSQL đã chạy và DATABASE_URL trỏ đúng database.
 *  2. Đã áp dụng migration: `npx prisma migrate dev`.
 *
 * File này idempotent: chạy nhiều lần không sinh trùng dữ liệu (dùng upsert).
 */
import { PrismaClient, ProjectCategory, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu LAVIPCO…");

  // ------ Admin user mặc định ------
  const adminEmail = "admin@lavipco.com.vn";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const hashed = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Quản trị LAVIPCO",
      hashedPassword: hashed,
      role: UserRole.ADMIN,
    },
  });
  console.log(`  ✅ Admin: ${admin.email} (mật khẩu mặc định: ${adminPassword} — đổi ngay sau khi đăng nhập)`);

  // ------ Service ------
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
    await db.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`  ✅ Đã seed ${services.length} dịch vụ`);

  // ------ Project mẫu ------
  const projects = [
    {
      slug: "chieu-sang-do-thi-thong-minh-phuong-ninh-thanh",
      title: "Chiếu sáng đô thị thông minh - Phường Ninh Thạnh",
      summary:
        "Hệ thống điều khiển chiếu sáng cấp tủ, lộ trình mở rộng đến điểm sáng, tích hợp camera, đèn tín hiệu và thiết bị Smart City.",
      description:
        "Dự án độc lập do LAVIPCO triển khai cho phường Ninh Thạnh: điều khiển trung tâm các tủ chiếu sáng, dashboard giám sát thời gian thực, sẵn sàng mở rộng tới mỗi đèn đường, tích hợp camera giám sát giao thông và thiết bị IoT đô thị.",
      client: "UBND Phường Ninh Thạnh",
      location: "Tây Ninh",
      year: 2026,
      scale: "Điều khiển cấp tủ - mở rộng đến điểm sáng + tích hợp Smart City",
      category: ProjectCategory.SMART_LIGHTING,
      images: [],
      isFeatured: true,
      sortOrder: 1,
    },
  ];
  for (const p of projects) {
    await db.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`  ✅ Đã seed ${projects.length} dự án`);

  // ------ Category sản phẩm ------
  const categories = [
    { slug: "den-tin-hieu", name: "Đèn tín hiệu", sortOrder: 1 },
    { slug: "den-led-duong-pho", name: "Đèn LED đường phố", sortOrder: 2 },
    { slug: "den-pha-canh-quan", name: "Đèn pha cảnh quan", sortOrder: 3 },
    { slug: "tu-dieu-khien", name: "Tủ điều khiển", sortOrder: 4 },
    { slug: "phu-kien", name: "Phụ kiện", sortOrder: 5 },
  ];
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`  ✅ Đã seed ${categories.length} danh mục`);

  // ------ Setting mặc định ------
  const settings = [
    { key: "site.hotline", value: "1900 0000" },
    { key: "site.email", value: "info@lavipco.com.vn" },
    { key: "site.address", value: "TP. Hồ Chí Minh, Việt Nam" },
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
