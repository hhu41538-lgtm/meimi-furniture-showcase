import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/ui/FadeIn";
import { getPostSlugs, getPostBySlug } from "@/lib/blog";

const WHATSAPP =
  "https://wa.me/8617796076275?text=" +
  encodeURIComponent("Hi Meimi&H, I read your guide and I'd like to discuss a custom project.");

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return { title: "Article not found | Meimi&H" };
  }
  const ogImage = encodeURI(post.heroImage);
  return {
    title: `${post.title} | Meimi&H`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

function renderInline(text: string): ReactNode[] {
  return text.split(/\*\*/).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-medium text-stone-900">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-3xl px-6 pt-28 sm:px-8 lg:px-10 lg:pt-32">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-stone-400 transition-colors hover:text-stone-700"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            &larr;
          </span>
          Journal
        </Link>
      </div>

      {/* TITLE */}
      <section className="px-6 pt-8 sm:px-8 lg:px-10">
        <FadeIn>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
              {formatDate(post.date)} &middot; {post.readingTime}
            </p>
            <h1 className="mt-4 text-3xl font-extralight leading-tight tracking-tight text-stone-900 sm:text-5xl">
              {post.title}
            </h1>
          </div>
        </FadeIn>
      </section>

      {/* HERO IMAGE */}
      <section className="px-6 pt-10 sm:px-8 lg:px-10">
        <FadeIn>
          <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-sm">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </FadeIn>
      </section>

      {/* BODY */}
      <article className="px-6 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl">
          {post.body.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={i}
                  className="mt-14 text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={i} className="mt-6 space-y-3">
                  {block.items.map((item, j) => (
                    <li
                      key={j}
                      className="relative pl-5 text-base font-light leading-loose text-stone-600 before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-1 before:rounded-full before:bg-[#6B2737]"
                    >
                      {renderInline(item)}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={i}
                className="mt-6 text-base font-light leading-loose text-stone-600"
              >
                {renderInline(block.text)}
              </p>
            );
          })}

          {/* CTA */}
          <div className="mt-16 border-t border-stone-200 pt-10">
            <p className="text-base font-light leading-loose text-stone-600">
              If you&apos;re planning a bespoke piece or a whole-home interior,
              we&apos;d love to hear about it.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/custom"
                className="inline-flex items-center gap-2 bg-[#6B2737] px-6 py-3 text-sm font-medium tracking-[0.12em] text-white transition-colors duration-300 hover:bg-stone-900"
              >
                CUSTOM SERVICE
                <span>&rarr;</span>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border-b border-[#6B2737] pb-1 text-sm font-medium tracking-[0.12em] text-[#6B2737] transition-colors duration-300 hover:border-stone-900 hover:text-stone-900"
              >
                BROWSE COLLECTIONS
                <span>&rarr;</span>
              </Link>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border-b border-stone-300 pb-1 text-sm font-medium tracking-[0.12em] text-stone-600 transition-colors duration-300 hover:border-stone-900 hover:text-stone-900"
              >
                WHATSAPP
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
