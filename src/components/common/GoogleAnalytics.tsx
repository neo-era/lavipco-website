/**
 * Defensive Google Analytics 4 + Google Tag Manager loader.
 *
 * Env:
 *  - NEXT_PUBLIC_GA_ID: GA4 Measurement ID (G-XXXXXXXXXX)
 *  - NEXT_PUBLIC_GTM_ID: GTM Container ID (GTM-XXXXXXX)
 *
 * Cả 2 đều optional. Chỉ inject khi env có giá trị → khi dev local
 * không gửi event giả về GA prod.
 *
 * Dùng Next.js `<Script>` với strategy="afterInteractive" để không block
 * hydration. Nội dung gtag init theo doc chính thức của Google.
 */
import Script from "next/script";

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gaId && !gtmId) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {gtmId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}
    </>
  );
}
