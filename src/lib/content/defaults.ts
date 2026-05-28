/**
 * Nội dung mặc định cho trang chủ + giới thiệu.
 * Đây là FALLBACK khi admin chưa cấu hình (hoặc dữ liệu DB hỏng) — copy y nguyên
 * text đang hardcode trong các component home/about để trang không bao giờ trống.
 */
import type { ContentKey, ContentValue } from "./schema";

export const CONTENT_DEFAULTS: { [K in ContentKey]: ContentValue<K> } = {
  home_hero: {
    slides: [
      {
        image: "",
        badge: "Smart City",
        heading: "Chiếu sáng đô thị thông minh",
        subHeading:
          "Giải pháp điều khiển từ cấp tủ tới điểm sáng, tích hợp camera, IoT và nền tảng điều hành đô thị.",
        ctaLabel: "Khám phá giải pháp",
        ctaHref: "/services#smart-lighting",
      },
      {
        image: "",
        badge: "ITS · QCVN 41:2019",
        heading: "Đèn tín hiệu giao thông",
        subHeading:
          "Thiết kế, cung cấp và lắp đặt cho nút giao đô thị — tuân thủ QCVN và tiêu chuẩn ITS Việt Nam.",
        ctaLabel: "Xem sản phẩm",
        ctaHref: "/services#traffic-light",
      },
      {
        image: "",
        badge: "Hạ tầng điện",
        heading: "Đối tác kỹ thuật tin cậy",
        subHeading:
          "Đường dây trung/hạ thế, trạm biến áp, tủ điều khiển — phục vụ chủ đầu tư, ban quản lý đô thị và nhà thầu trên toàn quốc.",
        ctaLabel: "Yêu cầu báo giá",
        ctaHref: "/contact",
      },
    ],
  },

  home_about: {
    badge: "Về LAVIPCO",
    heading:
      "Đối tác kỹ thuật trong lĩnh vực chiếu sáng & hạ tầng đô thị",
    paragraph1:
      "Công ty TNHH Kỹ Nghệ Lâm Việt Phát là đơn vị chuyên cung cấp thiết bị và giải pháp đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, hạ tầng điện và Smart City. Chúng tôi đồng hành cùng chủ đầu tư, ban quản lý đô thị và nhà thầu từ khâu thiết kế, cung cấp đến triển khai và vận hành.",
    paragraph2:
      "Đội ngũ kỹ sư điện, tự động hóa và viễn thông của LAVIPCO sẵn sàng tư vấn giải pháp phù hợp với từng quy mô dự án — từ một nút giao đơn lẻ đến cả tuyến phố và khu đô thị thông minh.",
    ctaLabel: "Tìm hiểu thêm",
    ctaHref: "/about",
    stats: [
      { value: "10+", label: "Năm kinh nghiệm" },
      { value: "50+", label: "Dự án đã thực hiện" },
      { value: "100+", label: "Khách hàng tin cậy" },
      { value: "30+", label: "Kỹ sư & nhân sự" },
    ],
  },

  home_services_header: {
    badge: "Dịch vụ",
    heading: "Dịch vụ của chúng tôi",
    subHeading:
      "Giải pháp toàn diện từ thiết bị tới phần mềm điều khiển cho hạ tầng đô thị.",
  },

  home_why: {
    badge: "Vì sao chọn chúng tôi",
    heading: "Đối tác kỹ thuật tin cậy cho đô thị thông minh",
    reasons: [
      {
        title: "Tuân thủ tiêu chuẩn",
        description:
          "Thiết kế và thi công đáp ứng QCVN, TCVN và tiêu chuẩn ITS cho hạ tầng đô thị Việt Nam.",
      },
      {
        title: "Đội kỹ thuật giàu kinh nghiệm",
        description:
          "Kỹ sư điện, tự động hoá và viễn thông triển khai trọn gói từ thiết kế tới vận hành.",
      },
      {
        title: "Sẵn sàng cho Smart City",
        description:
          "Kiến trúc mở, tích hợp camera, IoT, đèn tín hiệu và nền tảng điều hành đô thị.",
      },
      {
        title: "Hỗ trợ dài hạn",
        description:
          "Bảo hành dài hạn, dịch vụ vận hành & bảo trì 24/7 cho các dự án trọng điểm.",
      },
    ],
  },

  home_cta: {
    heading: "Cần tư vấn cho dự án của bạn?",
    paragraph:
      "Để lại thông tin, đội ngũ kỹ thuật LAVIPCO sẽ liên hệ tư vấn và gửi báo giá phù hợp trong vòng 24 giờ.",
    items: [
      "Khảo sát hiện trạng miễn phí",
      "Thiết kế kỹ thuật chi tiết",
      "Báo giá minh bạch, có VAT",
      "Bảo hành dài hạn, hỗ trợ vận hành",
    ],
    button1Label: "Liên hệ ngay",
    button1Href: "/contact",
    button2Label: "Yêu cầu báo giá",
    button2Href: "/contact?type=quotation",
  },

  about_hero: {
    badge: "Về LAVIPCO",
    heading: "Đối tác kỹ thuật cho đô thị thông minh Việt Nam",
    paragraph:
      "Công ty TNHH Kỹ Nghệ Lâm Việt Phát — đơn vị chuyên cung cấp giải pháp đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, hạ tầng điện và Smart City.",
  },

  about_story: {
    badge: "Câu chuyện",
    heading: "Hành trình xây dựng năng lực kỹ thuật",
    paragraph1:
      "Công ty TNHH Kỹ Nghệ Lâm Việt Phát được thành lập bởi nhóm kỹ sư điện, tự động hoá và viễn thông với mong muốn đưa các giải pháp chiếu sáng và điều khiển hiện đại tới các đô thị Việt Nam. Từ những dự án nhỏ ở địa phương, LAVIPCO dần khẳng định năng lực trong lĩnh vực hạ tầng điện và đèn tín hiệu giao thông.",
    paragraph2:
      "Đến nay, công ty đã đồng hành cùng nhiều chủ đầu tư, ban quản lý đô thị và nhà thầu trên cả nước — từ thiết kế kỹ thuật, cung cấp thiết bị, đến triển khai, vận hành và bảo trì. Định hướng của LAVIPCO là tiếp tục mở rộng sang các giải pháp Smart City: điều khiển từng điểm sáng, tích hợp camera giao thông, IoT và nền tảng điều hành tập trung.",
    image: "",
    overlayBadge: "Hơn 10 năm kinh nghiệm",
    overlayCaption: "Kỹ thuật bền vững · An toàn · Tuân thủ tiêu chuẩn",
  },

  about_vmv: {
    badge: "Tầm nhìn · Sứ mệnh · Giá trị",
    heading: "Ba trụ cột định hướng LAVIPCO",
    pillars: [
      {
        label: "Tầm nhìn",
        title: "Trở thành đối tác tin cậy hàng đầu Việt Nam",
        description:
          "trong lĩnh vực chiếu sáng đô thị thông minh và hệ thống tín hiệu giao thông — đồng hành cùng các thành phố trên hành trình chuyển đổi sang Smart City.",
      },
      {
        label: "Sứ mệnh",
        title: "Mang lại giải pháp kỹ thuật chất lượng cao",
        description:
          "an toàn, bền vững và phù hợp với điều kiện thực tế Việt Nam — từ thiết kế, cung cấp thiết bị đến triển khai và vận hành.",
      },
      {
        label: "Giá trị cốt lõi",
        title: "Tận tâm · Kỹ thuật · Bền vững",
        description:
          "Đặt khách hàng và sự an toàn của cộng đồng lên hàng đầu; coi chất lượng kỹ thuật là nền tảng; phát triển có trách nhiệm với môi trường và xã hội.",
      },
    ],
  },

  about_timeline: {
    badge: "Lịch sử phát triển",
    heading: "Những cột mốc đáng nhớ",
    milestones: [
      {
        year: "2014",
        title: "Thành lập công ty",
        description:
          "Nhóm kỹ sư điện và viễn thông sáng lập LAVIPCO, định hướng vào chiếu sáng đô thị và hạ tầng điện.",
      },
      {
        year: "2017",
        title: "Mở rộng năng lực ITS",
        description:
          "Triển khai các dự án đèn tín hiệu giao thông đầu tiên, đạt chứng nhận QCVN 41 và tiêu chuẩn TCVN.",
      },
      {
        year: "2020",
        title: "Bước vào chiếu sáng thông minh",
        description:
          "Hoàn thành các dự án LED đường phố quy mô lớn, ứng dụng điều khiển cấp tủ và đo điện năng từ xa.",
      },
      {
        year: "2023",
        title: "Ra mắt nền tảng điều khiển",
        description:
          "Phát triển hệ điều khiển trung tâm LAVIPCO Cloud — giám sát, lập lịch và phân tích điện năng theo từng điểm sáng.",
      },
      {
        year: "2026",
        title: "Triển khai Smart City Ninh Thạnh",
        description:
          "Dự án độc lập điều khiển chiếu sáng cấp tủ, lộ trình mở rộng đến điểm sáng, tích hợp camera và thiết bị IoT.",
      },
    ],
  },

  about_leadership: {
    badge: "Đội ngũ lãnh đạo",
    heading: "Những người định hình LAVIPCO",
    leaders: [
      {
        name: "",
        role: "Tổng Giám đốc",
        bio: "Hơn 15 năm kinh nghiệm điều hành các dự án hạ tầng điện và chiếu sáng đô thị tại Việt Nam.",
        photo: "",
      },
      {
        name: "",
        role: "Giám đốc Kỹ thuật",
        bio: "Kỹ sư tự động hoá, chuyên gia về điều khiển chiếu sáng và hệ thống ITS.",
        photo: "",
      },
      {
        name: "",
        role: "Trưởng phòng Dự án",
        bio: "Quản lý triển khai các dự án Smart City và đèn tín hiệu giao thông đô thị.",
        photo: "",
      },
      {
        name: "",
        role: "Trưởng phòng Kinh doanh",
        bio: "Phụ trách phát triển khách hàng và đối tác chiến lược trong lĩnh vực hạ tầng đô thị.",
        photo: "",
      },
    ],
  },

  about_certs: {
    badge: "Năng lực",
    heading: "Chứng nhận và tiêu chuẩn áp dụng",
    paragraph:
      "LAVIPCO triển khai dự án tuân thủ các tiêu chuẩn kỹ thuật và quản lý chất lượng hàng đầu.",
    certs: [
      { name: "ISO 9001:2015", issuer: "Quản lý chất lượng", logo: "" },
      { name: "ISO 14001:2015", issuer: "Quản lý môi trường", logo: "" },
      { name: "QCVN 41:2019/BGTVT", issuer: "Báo hiệu đường bộ", logo: "" },
      {
        name: "TCVN 7722-2-3:2013",
        issuer: "Đèn LED chiếu sáng đường phố",
        logo: "",
      },
      { name: "ISO 45001:2018", issuer: "An toàn & sức khoẻ nghề nghiệp", logo: "" },
      { name: "Chứng nhận hợp chuẩn LED", issuer: "Bộ KH&CN", logo: "" },
    ],
  },

  about_partners: {
    badge: "Đối tác",
    heading: "Đối tác và khách hàng tiêu biểu",
    paragraph:
      "Niềm tin của khách hàng là động lực để chúng tôi không ngừng nâng cao chất lượng dịch vụ.",
    partners: [
      { name: "Sở GTVT TP.HCM", logo: "" },
      { name: "UBND Phường Ninh Thạnh", logo: "" },
      { name: "Công ty Chiếu sáng ĐT", logo: "" },
      { name: "Tổng công ty Điện lực", logo: "" },
      { name: "Ban QLDA Đô thị", logo: "" },
      { name: "Tập đoàn xây dựng X", logo: "" },
      { name: "Khu công nghiệp Y", logo: "" },
      { name: "Đối tác chiến lược Z", logo: "" },
    ],
  },

  about_cta: {
    heading: "Liên hệ với chúng tôi",
    paragraph:
      "Đội ngũ LAVIPCO sẵn sàng tư vấn giải pháp kỹ thuật phù hợp với dự án của bạn. Liên hệ ngay để được hỗ trợ nhanh chóng.",
    button1Label: "Liên hệ ngay",
    button1Href: "/contact",
    button2Label: "Xem dự án đã thực hiện",
    button2Href: "/projects",
  },
};
