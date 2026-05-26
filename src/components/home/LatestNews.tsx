import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper } from "lucide-react";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Section "Tin tức mới nhất" — Server Component.
 * Lấy 3 bài đã publish, mới nhất. Ẩn section nếu chưa có bài.
 */
export async function LatestNews() {
  const posts = await db.blogPost.findMany({
    where: {
      isPublished: true,
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
    },
  });

  if (posts.length === 0) return null;

  return (
    <section id="latest-news" className="py-16 md:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Badge variant="brand" className="mb-3 rounded-full">
              Tin tức
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">
              Tin tức mới nhất
            </h2>
          </div>
          <Button asChild variant="link" className="text-brand-primary">
            <Link href="/blog">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-primary/40">
                    <Newspaper className="h-12 w-12" />
                  </div>
                )}
              </div>
              <CardContent className="space-y-2 p-5">
                {post.publishedAt && (
                  <time className="text-xs text-muted-foreground" dateTime={post.publishedAt.toISOString()}>
                    {formatDate(post.publishedAt)}
                  </time>
                )}
                <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-brand-primary">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-brand-primary hover:underline"
                >
                  Đọc tiếp <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
