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

  policy_shopping_guide: {
    title: "Hướng dẫn mua hàng",
    intro:
      "Quy trình đặt hàng tại LAVIPCO chỉ qua vài bước đơn giản. Bạn có thể đặt online 24/7 hoặc liên hệ hotline để được tư vấn trực tiếp.",
    steps: [
      {
        title: "Chọn sản phẩm",
        body: "Duyệt danh mục hoặc dùng thanh tìm kiếm để tìm sản phẩm phù hợp. Vào trang chi tiết để xem thông số kỹ thuật, ảnh và tài liệu PDF (nếu có).",
      },
      {
        title: "Thêm vào giỏ",
        body: "Chọn biến thể (màu, công suất...) và số lượng, sau đó bấm 'Thêm vào giỏ'. Giỏ hàng tự lưu trên trình duyệt của bạn.",
      },
      {
        title: "Tiến hành thanh toán",
        body: "Vào giỏ hàng, kiểm tra lại đơn rồi bấm 'Thanh toán'. Bạn có thể đặt với tư cách khách hoặc đăng ký tài khoản để lưu lịch sử đơn.",
      },
      {
        title: "Điền địa chỉ giao hàng",
        body: "Nhập họ tên, số điện thoại, email và địa chỉ (Tỉnh/Thành → Phường/Xã → địa chỉ chi tiết). Có thể thêm ghi chú cho người giao.",
      },
      {
        title: "Chọn phương thức thanh toán",
        body: "Hỗ trợ COD (thu hộ khi nhận hàng), chuyển khoản ngân hàng và VNPay (thẻ ATM/Visa/Master/QR). Phí ship đồng giá toàn quốc.",
      },
      {
        title: "Xác nhận đơn hàng",
        body: "Sau khi đặt thành công, bạn nhận email xác nhận kèm mã đơn (vd DH202605260001). LAVIPCO liên hệ xác nhận trong vòng 24h làm việc.",
      },
      {
        title: "Nhận hàng",
        body: "Đơn được đóng gói và giao qua đơn vị vận chuyển. Bạn nhận email kèm mã vận đơn để tracking. Theo dõi trạng thái ở mục 'Tài khoản → Đơn hàng'.",
      },
    ],
    note:
      "Đối với dự án quy mô lớn hoặc đơn B2B, vui lòng dùng tính năng 'Yêu cầu báo giá' ở trang chi tiết sản phẩm hoặc liên hệ trực tiếp hotline để được tư vấn riêng.",
  },

  policy_faq: {
    title: "Câu hỏi thường gặp",
    intro:
      "Tổng hợp các câu hỏi phổ biến của khách hàng về sản phẩm, đơn hàng, thanh toán và bảo hành tại LAVIPCO.",
    groups: [
      {
        name: "Đơn hàng & Giao nhận",
        items: [
          {
            q: "Tôi có thể đặt hàng mà không cần đăng ký tài khoản không?",
            a: "Có. Bạn có thể đặt hàng với tư cách khách. Tuy nhiên, đăng ký tài khoản giúp bạn theo dõi đơn, lưu địa chỉ và nhận khuyến mãi.",
          },
          {
            q: "Thời gian giao hàng bao lâu?",
            a: "Nội thành TP.HCM: 1-2 ngày. Các tỉnh thành khác: 3-5 ngày tuỳ khu vực. Đơn dự án quy mô lớn có lịch giao riêng theo thoả thuận.",
          },
          {
            q: "Tôi có thể đổi địa chỉ giao hàng sau khi đặt không?",
            a: "Có thể, nếu đơn chưa chuyển sang trạng thái 'Đang giao'. Vui lòng liên hệ hotline kèm mã đơn để được hỗ trợ.",
          },
        ],
      },
      {
        name: "Thanh toán",
        items: [
          {
            q: "LAVIPCO chấp nhận hình thức thanh toán nào?",
            a: "COD (thu hộ), chuyển khoản ngân hàng (2 tài khoản) và VNPay (thẻ nội địa, Visa/Master, QR ngân hàng).",
          },
          {
            q: "Tôi có hoá đơn VAT không?",
            a: "Có. Tất cả đơn hàng đều được xuất hoá đơn VAT 10%. Vui lòng cung cấp thông tin công ty (tên, MST, địa chỉ) khi đặt đơn hoặc liên hệ sau khi nhận hàng.",
          },
        ],
      },
      {
        name: "Sản phẩm & Bảo hành",
        items: [
          {
            q: "Thông số kỹ thuật ở trang sản phẩm có chính xác không?",
            a: "Toàn bộ thông số được lấy từ tài liệu nhà sản xuất. Bạn có thể tải catalogue PDF (nếu có) ở tab 'Catalogue' trên trang chi tiết để xem chi tiết hơn.",
          },
          {
            q: "Sản phẩm bảo hành bao lâu?",
            a: "Phổ biến từ 12-24 tháng tuỳ dòng sản phẩm. Xem mục 'Chính sách bảo hành' để biết chi tiết.",
          },
        ],
      },
      {
        name: "Tài khoản",
        items: [
          {
            q: "Tôi quên mật khẩu, làm sao đăng nhập lại?",
            a: "Hiện chức năng 'Quên mật khẩu' đang được phát triển. Trong thời gian này vui lòng liên hệ kỹ thuật để được hỗ trợ reset.",
          },
          {
            q: "Đăng nhập bằng Google có an toàn không?",
            a: "Có. LAVIPCO dùng OAuth chuẩn của Google, không bao giờ thấy được mật khẩu của bạn.",
          },
        ],
      },
    ],
  },

  policy_warranty: {
    title: "Chính sách bảo hành",
    updatedAt: "2026-05-29",
    body: `<h2>1. Phạm vi bảo hành</h2>
<p>LAVIPCO bảo hành cho mọi sản phẩm chính hãng được cung cấp qua website, áp dụng cho lỗi do nhà sản xuất gây ra trong quá trình sử dụng bình thường.</p>
<h2>2. Thời gian bảo hành</h2>
<ul>
<li>Đèn LED chiếu sáng đô thị: 24 tháng.</li>
<li>Đèn tín hiệu giao thông: 24 tháng.</li>
<li>Tủ điều khiển &amp; thiết bị điện: 12 tháng.</li>
<li>Phụ kiện: 6-12 tháng tuỳ chủng loại.</li>
</ul>
<h2>3. Điều kiện bảo hành</h2>
<ul>
<li>Sản phẩm còn tem bảo hành và phiếu mua hàng.</li>
<li>Lỗi do nhà sản xuất, không do tác động bên ngoài (va đập, ngấm nước trái thiết kế IP, quá tải).</li>
<li>Đã được lắp đặt và vận hành đúng hướng dẫn kỹ thuật.</li>
</ul>
<h2>4. Quy trình tiếp nhận</h2>
<ol>
<li>Liên hệ hotline hoặc gửi email kèm mã đơn hàng + mô tả lỗi.</li>
<li>Kỹ thuật LAVIPCO khảo sát từ xa (qua ảnh/video) hoặc đến hiện trường (với dự án lớn).</li>
<li>Xác nhận lỗi → bảo hành (sửa, thay thế hoặc đổi mới tuỳ tình trạng).</li>
</ol>
<h2>5. Không bảo hành</h2>
<p>Các trường hợp sau không thuộc phạm vi bảo hành: tem bảo hành bị rách/sửa; lỗi do tác động bên ngoài; tự ý tháo lắp, sửa chữa; chập điện do sai cấp nguồn; thiên tai, hoả hoạn.</p>`,
  },

  policy_return: {
    title: "Chính sách đổi trả",
    updatedAt: "2026-05-29",
    body: `<h2>1. Đổi/Trả trong vòng 7 ngày</h2>
<p>Khách hàng được đổi hoặc trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng, áp dụng cho các trường hợp:</p>
<ul>
<li>Sản phẩm bị lỗi do nhà sản xuất, ảnh hưởng tới chức năng.</li>
<li>LAVIPCO giao sai mẫu, sai số lượng so với đơn đặt.</li>
<li>Sản phẩm hư hỏng trong quá trình vận chuyển (có biên bản với đơn vị giao hàng).</li>
</ul>
<h2>2. Điều kiện đổi/trả</h2>
<ul>
<li>Sản phẩm còn nguyên đai, nguyên kiện, đầy đủ phụ kiện và tài liệu.</li>
<li>Còn tem bảo hành và hoá đơn mua hàng.</li>
<li>Chưa qua sử dụng (trừ trường hợp lỗi nhà sản xuất phát hiện trong vận hành).</li>
</ul>
<h2>3. Quy trình đổi/trả</h2>
<ol>
<li>Liên hệ hotline trong vòng 7 ngày kèm mã đơn hàng và lý do.</li>
<li>LAVIPCO xác nhận và hướng dẫn cách gửi sản phẩm về.</li>
<li>Sau khi nhận, kiểm tra → đổi sản phẩm mới hoặc hoàn tiền theo phương thức thanh toán ban đầu (trong vòng 5-10 ngày làm việc).</li>
</ol>
<h2>4. Không hỗ trợ đổi/trả</h2>
<p>Sản phẩm đã qua lắp đặt vào công trình; sản phẩm bị hỏng do người dùng; sản phẩm không còn nguyên vẹn bao bì/phụ kiện.</p>
<h2>5. Chi phí vận chuyển đổi/trả</h2>
<p>Lỗi nhà sản xuất hoặc giao sai: LAVIPCO chịu chi phí 2 chiều. Đổi/trả vì lý do khách hàng: khách hàng tự chi trả phí vận chuyển.</p>`,
  },

  policy_privacy: {
    title: "Chính sách bảo mật",
    updatedAt: "2026-05-29",
    body: `<p><em>LAVIPCO cam kết bảo vệ dữ liệu cá nhân của Khách hàng theo Nghị định 13/2023/NĐ-CP của Chính phủ Việt Nam về bảo vệ dữ liệu cá nhân.</em></p>
<h2>1. Thông tin chúng tôi thu thập</h2>
<ul>
<li><strong>Thông tin do bạn cung cấp:</strong> họ tên, email, số điện thoại, địa chỉ giao hàng, tên/MST công ty (đơn B2B).</li>
<li><strong>Thông tin đặt hàng:</strong> sản phẩm đã đặt, lịch sử giao dịch, phương thức thanh toán.</li>
<li><strong>Thông tin kỹ thuật:</strong> địa chỉ IP, loại trình duyệt, hệ điều hành, cookie phục vụ vận hành website.</li>
</ul>
<h2>2. Mục đích sử dụng</h2>
<ul>
<li>Xử lý đơn hàng, giao nhận, xuất hoá đơn, bảo hành.</li>
<li>Liên lạc tư vấn, chăm sóc khách hàng, gửi thông tin khuyến mãi (chỉ khi bạn đồng ý).</li>
<li>Cải thiện chất lượng website, dịch vụ.</li>
<li>Tuân thủ nghĩa vụ pháp lý.</li>
</ul>
<h2>3. Chia sẻ với bên thứ ba</h2>
<p>LAVIPCO chỉ chia sẻ dữ liệu cá nhân với các bên cần thiết để hoàn thành đơn hàng:</p>
<ul>
<li>Đơn vị vận chuyển (GHN, GHTK...) — họ tên, SĐT, địa chỉ giao.</li>
<li>Cổng thanh toán (VNPay) — thông tin giao dịch đã mã hoá.</li>
<li>Cơ quan nhà nước khi có yêu cầu hợp pháp.</li>
</ul>
<p>KHÔNG bán, cho thuê dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại.</p>
<h2>4. Quyền của Chủ thể dữ liệu</h2>
<p>Theo Nghị định 13/2023/NĐ-CP, bạn có quyền:</p>
<ul>
<li><strong>Truy cập, xem</strong> dữ liệu cá nhân của mình tại mục "Tài khoản".</li>
<li><strong>Yêu cầu chỉnh sửa, cập nhật</strong> dữ liệu không chính xác.</li>
<li><strong>Yêu cầu xoá</strong> dữ liệu khi không còn cần cho mục đích thu thập ban đầu (trừ dữ liệu cần lưu theo nghĩa vụ pháp lý — vd đơn hàng đã xuất hoá đơn).</li>
<li><strong>Phản đối, hạn chế</strong> xử lý dữ liệu cho mục đích marketing.</li>
<li><strong>Rút lại sự đồng ý</strong> đã cấp trước đó.</li>
</ul>
<p>Để thực hiện các quyền trên, vui lòng gửi yêu cầu qua email <strong>privacy@lavipco.com.vn</strong> hoặc qua trang Liên hệ.</p>
<h2>5. Lưu trữ &amp; bảo mật</h2>
<ul>
<li>Dữ liệu lưu trên hạ tầng đáng tin cậy, mã hoá TLS khi truyền, bcrypt mật khẩu.</li>
<li>Thời gian lưu trữ: theo nghĩa vụ pháp lý (hoá đơn, kế toán) hoặc cho tới khi bạn yêu cầu xoá.</li>
</ul>
<h2>6. Cookie</h2>
<p>Website sử dụng cookie kỹ thuật (giỏ hàng, đăng nhập) và analytics (Google Analytics). Bạn có thể tắt cookie ở trình duyệt nhưng có thể ảnh hưởng tới chức năng đặt hàng.</p>
<h2>7. Thay đổi chính sách</h2>
<p>Chính sách có thể được cập nhật khi cần thiết. Ngày cập nhật mới nhất hiển thị ở đầu trang. Khi có thay đổi lớn, LAVIPCO sẽ thông báo qua email hoặc banner trên website.</p>
<h2>8. Liên hệ</h2>
<p>Mọi câu hỏi về dữ liệu cá nhân vui lòng liên hệ:</p>
<ul>
<li><strong>Công ty TNHH Kỹ Nghệ Lâm Việt Phát (LAVIPCO)</strong></li>
<li>Email: privacy@lavipco.com.vn</li>
<li>Hotline: xem ở footer website</li>
</ul>`,
  },

  policy_terms: {
    title: "Điều khoản sử dụng",
    updatedAt: "2026-05-29",
    body: `<p><em>Bằng việc truy cập và sử dụng website lavipco.tech, bạn đồng ý với các điều khoản dưới đây.</em></p>
<h2>1. Phạm vi áp dụng</h2>
<p>Điều khoản này áp dụng cho mọi khách truy cập, người dùng đăng ký và khách hàng mua hàng tại website của LAVIPCO. Bằng việc tiếp tục sử dụng website, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ.</p>
<h2>2. Tài khoản người dùng</h2>
<ul>
<li>Bạn phải đủ 18 tuổi (hoặc có sự đồng ý của người giám hộ) để đăng ký tài khoản.</li>
<li>Thông tin đăng ký phải chính xác. Bạn chịu trách nhiệm bảo mật mật khẩu tài khoản của mình.</li>
<li>Một tài khoản chỉ thuộc về một cá nhân/tổ chức. Không chia sẻ, cho thuê, mua bán tài khoản.</li>
<li>LAVIPCO có quyền khoá tài khoản vi phạm điều khoản này.</li>
</ul>
<h2>3. Đặt hàng &amp; thanh toán</h2>
<ul>
<li>Đơn hàng chỉ được xác nhận sau khi LAVIPCO gửi email xác nhận.</li>
<li>Giá sản phẩm có thể thay đổi không báo trước; giá áp dụng là giá tại thời điểm đặt đơn.</li>
<li>Trường hợp lỗi giá/lỗi hệ thống dẫn đến đơn hàng bất thường, LAVIPCO có quyền huỷ đơn và hoàn tiền nguyên trạng.</li>
</ul>
<h2>4. Sở hữu trí tuệ</h2>
<p>Mọi nội dung trên website (text, hình ảnh, logo, video, mã nguồn) đều thuộc sở hữu của LAVIPCO hoặc các đối tác cấp phép. Cấm sao chép, phân phối lại vì mục đích thương mại nếu chưa có sự đồng ý bằng văn bản.</p>
<h2>5. Hành vi bị cấm</h2>
<ul>
<li>Sử dụng website cho mục đích bất hợp pháp.</li>
<li>Cố ý làm gián đoạn dịch vụ (DDoS, brute force, spam form).</li>
<li>Đăng nội dung sai sự thật, vu khống, xâm phạm danh dự cá nhân/tổ chức khác.</li>
<li>Thu thập dữ liệu người dùng khác mà không được sự đồng ý.</li>
</ul>
<h2>6. Giới hạn trách nhiệm</h2>
<p>LAVIPCO không chịu trách nhiệm với các thiệt hại gián tiếp phát sinh từ việc sử dụng website (mất dữ liệu, lợi nhuận, cơ hội kinh doanh). Trách nhiệm tối đa của LAVIPCO trong mọi trường hợp giới hạn ở giá trị đơn hàng đã thanh toán.</p>
<h2>7. Bảo mật &amp; quyền riêng tư</h2>
<p>Việc thu thập, sử dụng dữ liệu cá nhân tuân theo <a href="/privacy">Chính sách bảo mật</a>.</p>
<h2>8. Sửa đổi điều khoản</h2>
<p>LAVIPCO có quyền cập nhật điều khoản khi cần thiết. Phiên bản mới nhất luôn hiển thị tại trang này. Việc bạn tiếp tục sử dụng website sau khi cập nhật coi như đồng ý với các thay đổi.</p>
<h2>9. Luật áp dụng &amp; giải quyết tranh chấp</h2>
<p>Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết qua thương lượng; trường hợp không thoả thuận được, sẽ đưa ra Toà án có thẩm quyền tại Thành phố Hồ Chí Minh.</p>
<h2>10. Liên hệ</h2>
<p>Mọi câu hỏi về điều khoản, vui lòng gửi email tới <strong>contact@lavipco.com.vn</strong> hoặc qua trang <a href="/contact">Liên hệ</a>.</p>`,
  },
};
