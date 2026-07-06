import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal | Meimi&H",
  description:
    "Guides and insights on custom furniture, bespoke interiors and factory-direct manufacturing from Meimi&H, a Foshan-based atelier serving clients worldwide.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getPosts();

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* HEADER */}
      <section className="px-6 pt-32 sm:px-8 lg:px-10 lg:pt-40">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
              Journal
            </p>
            <h1 className="mt-5 text-4xl font-extralight tracking-tight text-stone-900 sm:text-6xl">
              Guides &amp; insights
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-base font-light leading-loose text-stone-500">
              Practical guidance on custom furniture, bespoke interiors and working
              directly with a manufacturer &mdash; from our atelier in Foshan.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* POSTS */}
      <section className="px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-4xl space-y-16">
          {posts.map((post, index) => (
            <FadeIn key={post.slug} delay={(index % 3) * 100}>
              <article>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                    <Image
                      src={post.heroImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-6">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                      {formatDate(post.date)} &middot; {post.readingTime}
                    </p>
                    <h2 className="mt-3 text-2xl font-extralight leading-snug tracking-tight text-stone-900 transition-colors duration-300 group-hover:text-[#6B2737] sm:text-3xl">
                      {post.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-base font-light leading-loose text-stone-500">
                      {post.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] text-[#6B2737]">
                      READ MORE
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </span>
                  </div>
                </Link>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
    </main>
  );
}
