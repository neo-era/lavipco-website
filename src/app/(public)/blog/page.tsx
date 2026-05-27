import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, Calendar, Tag } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import { Pagination } from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = { q?: string; tag?: string; page?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const tag = sp.tag?.trim() ?? "";

  const title = tag
    ? `Tin tức với tag "${tag}"`
    : page > 1
      ? `Tin tức - Trang ${page}`
      : "Tin tức";

  return {
    title,
    description:
      "Tin tức, bài viết kỹ thuật và cập nhật về chiếu sáng đô thị, đèn tín hiệu giao thông từ LAVIPCO.",
    alternates: {
      canonical: page > 1 ? `/blog?page=${page}` : "/blog",
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      type: "website",
      siteName: SITE_CONFIG.name,
      locale: "vi_VN",
      url: page > 1 ? `/blog?page=${page}` : "/blog",
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tag = sp.tag?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.BlogPostWhereInput = { isPublished: true };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
    ];
  }
  if (tag) {
    where.tags = { has: tag };
  }

  const [posts, total, allTagsRaw] = await Promise.all([
    db.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        publishedAt: true,
      },
    }),
    db.blogPost.count({ where }),
    db.blogPost.findMany({
      where: { isPublished: true },
      select: { tags: true },
    }),
  ]);

  // Aggregate tags từ tất cả published posts (cho tag cloud)
  const tagCountMap = new Map<string, number>();
  for (const post of allTagsRaw) {
    for (const t of post.tags) {
      tagCountMap.set(t, (tagCountMap.get(t) ?? 0) + 1);
    }
  }
  const popularTags = Array.from(tagCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-muted/20 py-12 md:py-16">
        <Container>
          <div className="flex items-center gap-3 text-brand-primary">
            <Newspaper className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Tin tức
            </span>
          </div>
          <h1 className="mt-2 text-balance text-3xl font-bold md:text-4xl">
            Bài viết & cập nhật từ LAVIPCO
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            Kiến thức kỹ thuật, xu hướng ngành chiếu sáng đô thị, đèn tín hiệu
            giao thông và các giải pháp Smart City.
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Posts grid */}
            <div className="space-y-6">
              {/* Search */}
              <form action="/blog" method="get" className="flex gap-2">
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Tìm bài viết..."
                />
                {tag && (
                  <input type="hidden" name="tag" defaultValue={tag} />
                )}
                <Button type="submit" variant="brand">
                  Tìm
                </Button>
              </form>

              {tag && (
                <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
                  <Tag className="h-4 w-4 text-brand-primary" />
                  Đang lọc theo tag: <strong>{tag}</strong>
                  <Link
                    href="/blog"
                    className="ml-auto text-xs text-brand-primary hover:underline"
                  >
                    Xoá lọc
                  </Link>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {total === 0
                  ? "Không tìm thấy bài viết phù hợp."
                  : `Hiển thị ${skip + 1}–${skip + posts.length} trên tổng ${total} bài`}
              </p>

              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
                  <Newspaper className="h-8 w-8" />
                  Chưa có bài viết phù hợp.
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  buildPageUrl={buildPageUrl}
                />
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-xl border bg-card p-5">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Tag phổ biến
                </h2>
                {popularTags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Chưa có tag.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {popularTags.map(([t, count]) => (
                      <Link
                        key={t}
                        href={`/blog?tag=${encodeURIComponent(t)}`}
                      >
                        <Badge
                          variant={t === tag ? "brand" : "secondary"}
                          className="text-[10px]"
                        >
                          {t}
                          <span className="ml-1 opacity-60">({count})</span>
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

type BlogCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  publishedAt: Date | null;
};

function BlogCard({ post }: { post: BlogCardData }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Newspaper className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="p-4">
          {post.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          <h2 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-brand-primary md:text-lg">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          {post.publishedAt && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(post.publishedAt)}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
