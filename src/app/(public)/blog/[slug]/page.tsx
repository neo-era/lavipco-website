import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, ArrowLeft, Tag } from "lucide-react";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  stripHtmlForMeta,
} from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitize";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/common/JsonLd";

export const revalidate = 60;
export const dynamicParams = true;

type RouteParams = { slug: string };

/** Prerender SSG cho bài đã publish. */
export async function generateStaticParams(): Promise<RouteParams[]> {
  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      isPublished: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  if (!post || !post.isPublished) {
    return { title: "Không tìm thấy bài viết", robots: { index: false } };
  }

  const title = post.metaTitle || post.title;
  const description = stripHtmlForMeta(
    post.metaDescription || post.excerpt || post.content,
    160,
  );

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title} | ${SITE_CONFIG.name}`,
      description,
      url: `/blog/${slug}`,
      type: "article",
      siteName: SITE_CONFIG.name,
      locale: "vi_VN",
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { name: true, email: true } } },
  });

  if (!post || !post.isPublished) notFound();

  // Sanitize content (defense-in-depth — admin đã sanitize khi save nhưng
  // re-sanitize render time đề phòng data cũ)
  const safeHtml = sanitizeHtml(post.content);

  // Related posts: cùng tag, 3 bài
  const relatedPosts = post.tags.length
    ? await db.blogPost.findMany({
        where: {
          isPublished: true,
          id: { not: post.id },
          tags: { hasSome: post.tags },
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          publishedAt: true,
        },
      })
    : [];

  const articleSchema = buildArticleSchema({
    title: post.title,
    description: stripHtmlForMeta(post.excerpt || post.content, 500),
    slug: post.slug,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.author?.name || post.author?.email || SITE_CONFIG.name,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Trang chủ", url: "/" },
    { name: "Tin tức", url: "/blog" },
    { name: post.title },
  ]);

  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbSchema]} />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/20">
        <Container className="py-4">
          <Breadcrumb
            items={[
              { title: "Tin tức", href: "/blog" },
              { title: post.title },
            ]}
          />
        </Container>
      </section>

      <article className="py-10 md:py-12">
        <Container className="max-w-3xl">
          {/* Header */}
          <header className="mb-8">
            {post.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`}>
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {t}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
            <h1 className="text-balance text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              {post.author && (
                <span>
                  Tác giả:{" "}
                  <strong className="text-foreground">
                    {post.author.name || post.author.email}
                  </strong>
                </span>
              )}
            </div>
            {post.excerpt && (
              <p className="mt-5 border-l-4 border-brand-primary pl-4 text-lg italic text-muted-foreground">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl border">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content - Tiptap HTML rendered through prose */}
          <div
            className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-brand-primary prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          {/* Back link */}
          <div className="mt-12 border-t pt-6">
            <Button asChild variant="ghost">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách tin tức
              </Link>
            </Button>
          </div>
        </Container>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t py-12 md:py-16">
          <Container>
            <h2 className="mb-6 text-2xl font-bold">Bài viết liên quan</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {related.coverImage ? (
                      <Image
                        src={related.coverImage}
                        alt={related.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 280px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Calendar className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-brand-primary">
                      {related.title}
                    </h3>
                    {related.publishedAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(related.publishedAt)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
