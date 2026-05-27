/**
 * Render JSON-LD script tag cho schema.org structured data.
 *
 * Caller pass `data` là object schema (built từ lib/seo.ts). Component output
 * <script type="application/ld+json"> với JSON.stringify(data).
 *
 * Server component — không cần "use client". Inject vào bất kỳ trang nào.
 *
 * @example
 *   <JsonLd data={buildProductSchema({...})} />
 */
type Props = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: Props) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          // dangerouslySetInnerHTML chấp nhận vì data từ server, không có user
          // input. Nếu cần, sanitize bằng JSON.stringify (đã escape <).
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
