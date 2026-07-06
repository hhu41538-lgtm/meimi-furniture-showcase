export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  excerpt: string;
  heroImage: string;
  keywords: string[];
  body: Block[];
};

const posts: Post[] = [
  {
    slug: "how-to-buy-custom-furniture-from-china",
    title:
      "How to Buy Custom Furniture Directly from a Chinese Factory: A Complete Guide",
    description:
      "Thinking of ordering custom furniture from China? Learn how factory-direct bespoke furniture works — safety, process, timelines, shipping, and how to choose the right manufacturer.",
    date: "2026-07-06",
    readingTime: "5 min read",
    excerpt:
      "Ordering bespoke furniture directly from a Chinese factory is a smart move — but a daunting one if you've never done it. Here's everything you need to know before you begin.",
    heroImage: "/images/explore by space/Bessel sofa/New Arrivals.jpg",
    keywords: [
      "custom furniture from China",
      "buy custom furniture from Chinese factory",
      "custom furniture manufacturer China",
      "factory direct furniture China",
      "is it safe to buy furniture from China",
    ],
    body: [
      {
        type: "p",
        text: "Commissioning custom furniture is one of the most rewarding ways to furnish a home — every piece is made to your exact space, taste and proportions. Increasingly, discerning buyers and their designers are going straight to the source: ordering bespoke furniture directly from Chinese factories, the workshops that already produce for many of the world's respected brands.",
      },
      {
        type: "p",
        text: "It's a smart move, but a daunting one if you've never done it. How do you know the quality will be there? How does the process actually work across borders? And how do you choose a factory you can trust? This guide walks through everything you need to know before you begin.",
      },
      { type: "h2", text: "Why Buy Custom Furniture Direct from China?" },
      {
        type: "p",
        text: "China's furniture heartland — particularly the Foshan region in Guangdong — is home to workshops with decades of craftsmanship and access to premium materials. Buying factory-direct, rather than through a showroom or importer, offers three clear advantages.",
      },
      {
        type: "p",
        text: "**Factory-direct pricing.** When you work with the makers themselves, you remove the layers of markup added by distributors, retailers and importers. The same quality of piece often costs a fraction of what a branded showroom would charge.",
      },
      {
        type: "p",
        text: "**Genuine made-to-order flexibility.** A factory can build to your specification — your dimensions, your upholstery, your finish — rather than adapting something off a catalogue. For an unusual space or a specific design vision, this freedom is invaluable.",
      },
      {
        type: "p",
        text: "**A direct relationship with the maker.** Communicating straight with the workshop means fewer misunderstandings and a clearer path from your idea to the finished piece.",
      },
      { type: "h2", text: "Is It Safe to Buy Custom Furniture from China?" },
      {
        type: "p",
        text: "This is the question almost every first-time buyer asks, and it deserves an honest answer: yes, it can be — provided you approach it carefully. The risks are real but manageable, and they fall into three areas.",
      },
      {
        type: "p",
        text: "**Communication.** Clear, responsive communication is the foundation of a good custom order. Before committing, pay attention to how quickly and clearly a factory answers your questions. A workshop that communicates well before the sale will communicate well during production.",
      },
      {
        type: "p",
        text: "**Quality control.** Reputable factories run their own quality control and are happy to share progress photos, material samples, or even a prototype before full production begins. If a supplier resists showing you the work in progress, treat that as a warning sign.",
      },
      {
        type: "p",
        text: "**Logistics.** International shipping sounds intimidating, but an experienced factory handles export packing and freight as a matter of routine. The key is to agree on how your pieces will be protected and shipped before production starts.",
      },
      {
        type: "p",
        text: "Manage these three areas well — by choosing an established maker and confirming everything in writing — and a cross-border custom order becomes far less risky than it first appears.",
      },
      { type: "h2", text: "The Custom Furniture Process, Step by Step" },
      {
        type: "p",
        text: "A well-run bespoke order follows a clear sequence. Understanding it in advance removes most of the uncertainty.",
      },
      {
        type: "ul",
        items: [
          "**Consultation.** You share your space, reference images and requirements — usually over a messaging app like WhatsApp. The factory discusses what's possible and helps refine your idea.",
          "**Design and quote.** The workshop prepares drawings, material options and a transparent, factory-direct quote so you know exactly what you're getting and what it costs.",
          "**Prototype and sampling.** Where appropriate, samples or a prototype are produced so you can approve materials and construction before committing to the full order.",
          "**Production.** Your pieces are handcrafted to order under the factory's own quality control. For a considered, made-to-order project, a conservative timeline is around two months, depending on scope and materials.",
          "**Global logistics.** The factory export-packs your order and arranges shipping. Freight can be tailored to your needs — the method and route are arranged around your timeline and destination.",
        ],
      },
      { type: "h2", text: "What Can Be Customised?" },
      {
        type: "p",
        text: "Far more than most people expect. With a true made-to-order workshop, you can typically specify:",
      },
      {
        type: "ul",
        items: [
          "**Dimensions** — sized precisely to your room, down to the centimetre.",
          "**Upholstery** — a wide range of fabrics and leathers.",
          "**Materials and finishes** — solid woods, stone, metals and bespoke finishes.",
          "**Configuration** — from a single sofa to sectionals, dining sets, bedroom suites, wardrobes, cabinetry and complete whole-home interiors.",
        ],
      },
      {
        type: "p",
        text: "This flexibility is exactly why serious buyers choose to commission rather than settle for what's on a showroom floor.",
      },
      { type: "h2", text: "How Long Does It Take, and What About Shipping?" },
      {
        type: "p",
        text: "Timelines depend on the complexity of your project, but a sensible expectation for considered custom work is around **two months** for production, plus shipping time to your country. It's always better to work with a realistic timeline than to rush craftsmanship.",
      },
      {
        type: "p",
        text: "Shipping is arranged to suit each client. Because needs vary — some buyers want the fastest possible delivery, others prioritise cost or coordinate with a wider renovation schedule — a good factory will tailor the freight method and route to your particular project rather than forcing a one-size-fits-all approach.",
      },
      { type: "h2", text: "How to Choose the Right Factory" },
      {
        type: "p",
        text: "Not all workshops are equal. As you evaluate suppliers, look for these signs of a maker you can trust with a significant commission:",
      },
      {
        type: "ul",
        items: [
          "**Real manufacturing experience.** A long track record in furniture-making — ideally decades — means the craft is mature and the quality consistent.",
          "**Willingness to sample.** A confident workshop will show you samples or a prototype before full production.",
          "**Clear, prompt communication.** Responsiveness before the sale predicts responsiveness throughout your project.",
          "**Transparent, factory-direct pricing.** You should understand exactly what you're paying for.",
          "**Export and logistics experience.** A factory used to shipping worldwide will handle packing and freight smoothly.",
        ],
      },
      {
        type: "p",
        text: "Because bespoke work of this kind is a substantial investment, most established ateliers focus on sizable, whole-project commissions rather than one-off small orders — a sign that they're set up for serious, considered projects.",
      },
      { type: "h2", text: "Ready to Start Your Project?" },
      {
        type: "p",
        text: "Buying custom furniture from China doesn't have to be a leap of faith. With the right factory — one with genuine craftsmanship, transparent communication and real export experience — you can commission pieces made exactly to your vision, at factory-direct value, and have them delivered anywhere in the world.",
      },
      {
        type: "p",
        text: "Meimi&H is a Foshan-based atelier built on two decades of furniture craftsmanship. We began as a factory and, in 2020, opened a dedicated company to bring that workshop directly to clients worldwide — handling everything from first sketch to final delivery.",
      },
    ],
  },
];

export function getPosts(): Post[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostSlugs(): string[] {
  return posts.map((p) => p.slug);
}

export function getPostBySlug(slug: string): Post | null {
  return posts.find((p) => p.slug === slug) ?? null;
}
