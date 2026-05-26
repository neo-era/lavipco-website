import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { parseVideoEmbed } from "@/lib/projects-data";

/**
 * Section video minh hoạ dự án.
 * Hỗ trợ YouTube/Vimeo (iframe) và file mp4/webm (video tag).
 * Ẩn section nếu videoUrl rỗng hoặc không nhận diện được.
 */
export function ProjectVideo({
  videoUrl,
  title,
}: {
  videoUrl: string | null;
  title: string;
}) {
  const embed = parseVideoEmbed(videoUrl);
  if (!embed) return null;

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <Container className="max-w-5xl">
        <div className="mb-8 text-center">
          <Badge variant="brand" className="mb-3 rounded-full">
            Video
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Video dự án
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border bg-black shadow-lg">
          <div className="relative aspect-video">
            {embed.type === "mp4" ? (
              <video
                src={embed.embedUrl}
                controls
                playsInline
                className="absolute inset-0 h-full w-full"
                aria-label={`Video dự án ${title}`}
              />
            ) : (
              <iframe
                src={embed.embedUrl}
                title={`Video dự án ${title}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
