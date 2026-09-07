import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies } from "../data";
import { siteConfig } from "@/lib/seo-config";

const PHONE = "https://wa.me/8617796045579";

export function generateStaticParams() {
  return caseStudies.map((item) => ({ slug: item.id }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const item = caseStudies.find((candidate) => candidate.id === slug);
    if (!item) return { title: "Case not found | Meimi&H" };
    const title = `${item.title} | Case Showcase`;
    const image = encodeURI(item.image);
    return {
      title,
      description: item.description,
      alternates: { canonical: `/case-showcase/${item.id}/` },
      openGraph: { title, description: item.description, type: "website", images: [{ url: image }] },
      twitter: { card: "summary_large_image", title, description: item.description, images: [image] },
    };
  });
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = caseStudies.find((candidate) => candidate.id === slug);
  if (!item) notFound();
  const relatedCases = caseStudies.filter((candidate) => candidate.id !== item.id).slice(0, 3);

  const caseJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.description,
    image: [item.image, ...item.gallery].map((image) => `${siteConfig.url}${encodeURI(image)}`),
    url: `${siteConfig.url}/case-showcase/${item.id}`,
    locationCreated: { "@type": "Place", name: item.location },
    creator: { "@type": "Organization", name: "Meimi&H" },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Case Showcase", item: `${siteConfig.url}/case-showcase` },
      { "@type": "ListItem", position: 2, name: item.title, item: `${siteConfig.url}/case-showcase/${item.id}` },
    ],
  };

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(caseJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="px-6 pb-16 pt-28 sm:px-8 lg:px-10 lg:pb-24 lg:pt-36">
        <div className="mx-auto max-w-6xl">
          <Link href="/case-showcase" className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-400 transition-colors hover:text-stone-900">← Case Showcase</Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.55fr)] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#6B2737]">Custom project</p>
              <h1 className="mt-5 text-4xl font-light tracking-tight text-stone-950 sm:text-6xl">{item.title}</h1>
              <p className="mt-4 text-sm font-medium text-stone-500">{item.location}</p>
            </div>
            <p className="max-w-md text-base font-light leading-8 text-stone-600">{item.description}</p>
          </div>
          <div className="relative mt-12 aspect-[16/10] overflow-hidden bg-stone-200 lg:mt-16"><Image src={item.image} alt={`${item.title} custom interior`} fill priority sizes="(max-width: 1024px) 100vw, 80vw" className="object-cover" /></div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {item.gallery.map((image, index) => (
              <div key={image} className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                <Image src={image} alt={`${item.title} project detail ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200/70 bg-white/60 px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">Project direction</p>
            <h2 className="mt-5 text-3xl font-light tracking-tight text-stone-950">Furniture that belongs to the room.</h2>
          </div>
          <div className="space-y-5 text-base font-light leading-8 text-stone-600">
            <p>{item.description}</p>
            <p>From the first reference image to the final specification, our team can coordinate furniture, cabinetry, finishes and room proportions around the project brief.</p>
            <div className="flex flex-wrap gap-4 pt-3">
              <Link href="/custom" className="inline-flex min-h-11 items-center gap-2 bg-[#6B2737] px-5 text-sm font-medium text-white transition-colors hover:bg-stone-900">Explore custom furniture <span aria-hidden="true">→</span></Link>
              <a href={PHONE} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-stone-300 px-5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-950">WhatsApp +86 177 9604 5579</a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-stone-300 pb-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">Continue exploring</p>
              <h2 className="mt-4 text-3xl font-light tracking-tight text-stone-950">More custom spaces</h2>
            </div>
            <Link href="/case-showcase" className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B2737] transition-colors hover:text-stone-900">View all cases <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {relatedCases.map((related) => (
              <Link key={related.id} href={`/case-showcase/${related.id}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-200"><Image src={related.image} alt={`${related.title} custom interior`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]" /></div>
                <h3 className="mt-4 text-xl font-light tracking-tight text-stone-950">{related.title}</h3>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-400">{related.location}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
