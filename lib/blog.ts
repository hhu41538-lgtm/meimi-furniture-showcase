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
  {
    slug: "handmade-mattress-guide",
    title:
      "The Handmade Mattress, Explained: How Hand-Tufted Mattresses Are Made — and How to Choose One",
    description:
      "What makes a handmade mattress different from a mass-produced one? A clear guide to hand-tufted construction, comfort layers, natural materials and how to choose a handmade mattress direct from the maker.",
    date: "2026-07-28",
    readingTime: "6 min read",
    excerpt:
      "Machine-rolled mattresses are everywhere. A hand-tufted one is a different object entirely — built in layers and stitched by hand. Here is how they are made, and how to choose one.",
    heroImage: "/images/Mattress Collection/01-hero.jpg",
    keywords: [
      "handmade mattress",
      "hand-tufted mattress",
      "handmade mattress manufacturer",
      "how are handmade mattresses made",
      "custom mattress manufacturer",
    ],
    body: [
      {
        type: "p",
        text: "We spend a third of our lives on a mattress, yet it is often the least considered piece of furniture we own. Most are made the same way: rolled off a production line, compressed into a box and sold on a single number. A handmade mattress is a different object entirely — built slowly, in layers, and finished by hand.",
      },
      {
        type: "p",
        text: "If you have only ever bought a mass-produced mattress, the difference can be hard to picture. This guide explains what handmade actually means in a mattress, what goes on inside a fine one, and how to choose the right mattress when you buy directly from the maker.",
      },
      { type: "h2", text: "What Makes a Mattress Handmade?" },
      {
        type: "p",
        text: "The term covers several distinct techniques, all of which take skill and time rather than machinery. Three matter most.",
      },
      {
        type: "p",
        text: "**Hand tufting.** Tufts are the small, evenly spaced ties that pass through the whole mattress and hold its layers together. Done by hand, they compress the fillings into a stable, breathable structure without glue, stopping the layers from shifting or bunching over years of use. The gentle dimples they leave are the visual signature of a traditionally built mattress.",
      },
      {
        type: "p",
        text: "**Hand-stitched sides.** Side stitching secures the border of the mattress and supports its edges, so the surface stays even and you can sit or sleep right to the perimeter. Stitched by hand, that edge holds its shape far longer than a glued or taped one.",
      },
      {
        type: "p",
        text: "**Built in layers.** Rather than a single foam slab, a handmade mattress is assembled from distinct comfort and support layers, each chosen and placed by hand. This is what allows the feel to be tuned — and what gives a good mattress its longevity.",
      },
      { type: "h2", text: "What Is Inside a Fine Mattress" },
      {
        type: "p",
        text: "Quality lives in the layers. While every model is different, a well-made mattress is typically built up from several considered elements:",
      },
      {
        type: "ul",
        items: [
          "**A comfort layer** — the top upholstery that sets the initial feel, from natural fillings to specialist foams.",
          "**Insulation and upholstery layers** — natural fibres that add resilience, help regulate temperature and separate the comfort layer from the support core.",
          "**A support core** — commonly a pocket-spring unit, where each spring is housed individually so it responds to your body independently and limits partner disturbance.",
          "**A durable cover, or ticking** — a breathable outer fabric, often quilted or tufted, that ties the whole mattress together.",
        ],
      },
      {
        type: "p",
        text: "Because these layers are assembled rather than moulded, a handmade mattress breathes better, keeps its shape longer and can be tuned to a specific feel — advantages a single block of foam cannot match.",
      },
      { type: "h2", text: "Why Choose a Handmade Mattress?" },
      {
        type: "p",
        text: "Beyond the craftsmanship, the practical benefits are real:",
      },
      {
        type: "ul",
        items: [
          "**Longevity.** Hand-tufted, hand-stitched construction resists the sagging and shifting that shorten the life of glued, mass-produced mattresses.",
          "**Temperature and breathability.** Layered natural materials move air and wick moisture far better than dense foam, sleeping cooler and fresher.",
          "**A tailored feel.** The comfort layers can be specified to your preference rather than a one-size-fits-all firmness.",
          "**Considered materials.** A good maker can build with natural fibres and quality covers — and tell you exactly what is inside.",
        ],
      },
      { type: "h2", text: "Firmness and Comfort Feel" },
      {
        type: "p",
        text: "Comfort is personal, and firmness is the most misunderstood part of buying a mattress. The right feel depends on your weight, your preferred sleeping position and simple taste — there is no universal best. A softer surface cushions the shoulders and hips; a firmer one gives a more supported, on-top feeling.",
      },
      {
        type: "p",
        text: "This is where made-to-order construction is a genuine advantage. A handmade mattress can be built to a specified comfort feel and — for couples with different preferences — even tuned differently on each side. The key is to describe how you like to sleep clearly, so the maker can translate it into the right combination of layers.",
      },
      { type: "h2", text: "Buying a Handmade Mattress Direct from the Maker" },
      {
        type: "p",
        text: "Ordering directly from the workshop that builds the mattress removes retail markup and opens up customisation — but it does ask you to be precise. Because size names vary from country to country, the single most useful thing you can do is provide exact measurements. When you enquire, be ready to confirm:",
      },
      {
        type: "ul",
        items: [
          "**Exact dimensions** — width, length and height in millimetres or inches, rather than a size name.",
          "**Your preferred comfort feel** — softer, medium or firmer, and how you sleep.",
          "**Cover or finish preference** — the look and fabric of the ticking.",
          "**Packaging and compliance needs** — any requirements for your destination market.",
          "**Quantity and target delivery date** — so production and shipping can be planned.",
        ],
      },
      {
        type: "p",
        text: "With those details, a good maker can confirm specification, availability and a transparent, factory-direct price in writing before anything is built.",
      },
      { type: "h2", text: "A Craft, Not a Commodity" },
      {
        type: "p",
        text: "A mattress is the most-used piece of furniture in any home, and it rewards being chosen with the same care as a sofa or a bed. A handmade one is not simply more expensive — it is a different category of object, built to be slept on for many years rather than replaced on a cycle.",
      },
      {
        type: "p",
        text: "At Meimi&H, our mattresses are hand-tufted and hand-stitched, built layer by layer in our own workshop in Foshan — a signature craft alongside the furniture and interiors we make. Every mattress is made to order, so the size and feel are yours to specify. If you would like to explore the collection or plan an enquiry, we would be glad to help.",
      },
    ],
  },
  {
    slug: "why-foshan-furniture-capital",
    title: "Why Foshan? Inside the Region That Makes the World's Furniture",
    description:
      "Foshan in Guangdong is one of the world's great furniture-manufacturing regions. Here is why so much premium and custom furniture is made there, and what it means for buyers.",
    date: "2026-07-24",
    readingTime: "5 min read",
    excerpt:
      "There is a good chance the furniture in your home was made within a few hours of one Chinese city. This is the story of Foshan — and why it matters when you buy.",
    heroImage: "/images/Residences/warm-contemporary/01-hero.jpg",
    keywords: [
      "Foshan furniture",
      "Foshan furniture manufacturer",
      "furniture from Foshan",
      "furniture manufacturing China",
      "Guangdong furniture",
    ],
    body: [
      {
        type: "p",
        text: "Foshan is not a household name the way Milan or Copenhagen are, yet it is one of the most important furniture-making places on earth. Tucked into Guangdong province in southern China, this single region produces an extraordinary share of the world's furniture — from mass-market flat-packs to the quietly luxurious pieces sold under famous European labels.",
      },
      {
        type: "p",
        text: "For anyone considering furniture made in China, it is worth understanding why so much of it comes from here, and what that concentration of skill means for the quality and value you can expect.",
      },
      { type: "h2", text: "A Long Heritage of Making" },
      {
        type: "p",
        text: "Foshan has been a manufacturing city for centuries, long known for ceramics, metalwork and craft trades. Over the past few decades that making culture turned decisively toward furniture, and the region built up a depth of expertise — in joinery, upholstery, finishing and materials — that is difficult to replicate anywhere else.",
      },
      {
        type: "p",
        text: "The result is not a single giant factory but a dense landscape of workshops, from large production plants to small specialist ateliers, all working within the same ecosystem.",
      },
      { type: "h2", text: "A Complete Ecosystem in One Place" },
      {
        type: "p",
        text: "What sets Foshan apart is that almost everything a furniture maker needs sits close at hand. That proximity is the region's real advantage:",
      },
      {
        type: "ul",
        items: [
          "**Materials on the doorstep** — timber, stone, foam, metal, fabrics and leathers from specialist suppliers nearby.",
          "**Specialist workshops** — dedicated makers for frames, upholstery, cabinetry, stone and metalwork, each expert in one craft.",
          "**Deep skilled labour** — generations of craftspeople who have grown up around furniture-making.",
          "**Hardware and finishing** — fittings, mechanisms and finishing services all within reach.",
          "**Export infrastructure** — packing, freight and logistics geared to shipping worldwide.",
        ],
      },
      {
        type: "p",
        text: "When every part of the process is local, quality is easier to control and value is easier to deliver. The same piece that would carry several layers of markup elsewhere can be built to a high standard and sold closer to its true cost.",
      },
      { type: "h2", text: "Craft Meets Scale" },
      {
        type: "p",
        text: "Foshan's reputation for volume sometimes obscures a more interesting truth: the region is equally home to serious craftsmanship. The best workshops combine industrial capability — precision, consistency, capacity — with genuine handwork: the tufting, stitching and finishing that machines cannot do.",
      },
      {
        type: "p",
        text: "It is precisely this combination that draws so many respected international brands to produce here, often quietly. The craft is mature, the materials are excellent, and the makers know how to work to an exacting brief.",
      },
      { type: "h2", text: "What Foshan Means for You as a Buyer" },
      {
        type: "p",
        text: "For an international buyer or designer, sourcing from Foshan offers a clear set of advantages:",
      },
      {
        type: "ul",
        items: [
          "**Factory-direct value** — working near the source removes the markups added along a traditional retail chain.",
          "**Breadth of capability** — almost any material, style or configuration can be made, from a single sofa to a whole-home interior.",
          "**Real customisation** — established makers build to your specification rather than adapting a catalogue piece.",
          "**Export experience** — workshops here handle international packing and shipping as routine.",
        ],
      },
      {
        type: "p",
        text: "The one caveat is that not every workshop is equal. Foshan's scale means the full range of quality exists side by side, so the region's advantages are only fully realised when you choose an established maker with a real track record, transparent communication and genuine export experience.",
      },
      { type: "h2", text: "From Foshan, to the World" },
      {
        type: "p",
        text: "The furniture capital most people have never heard of is exactly why so much fine, well-priced furniture reaches homes around the globe. Understanding where a piece is made — and the ecosystem behind it — turns a leap of faith into an informed decision.",
      },
      {
        type: "p",
        text: "Meimi&H is a Foshan atelier built on two decades of furniture craftsmanship. We began as a factory and, in 2020, opened a dedicated company to bring that workshop directly to clients worldwide — from a single custom piece to a complete interior, made here and shipped to you.",
      },
    ],
  },
  {
    slug: "interior-designer-guide-custom-furniture-china",
    title:
      "A Designer's Guide to Sourcing Custom Furniture and Interiors from China",
    description:
      "For interior designers and trade buyers: how to source bespoke furniture and whole-home interiors directly from a Chinese atelier — writing the brief, specifying, sampling, timelines and communication.",
    date: "2026-07-20",
    readingTime: "7 min read",
    excerpt:
      "For an interior designer, a reliable overseas maker is a competitive advantage. Here is how to brief, specify and manage a bespoke furniture project with a Chinese atelier.",
    heroImage: "/images/Residences/soft-minimal/01-hero.jpg",
    keywords: [
      "custom furniture for interior designers",
      "trade furniture supplier China",
      "sourcing bespoke furniture China",
      "interior designer furniture manufacturer",
      "whole home interior manufacturer",
    ],
    body: [
      {
        type: "p",
        text: "For an interior designer, the right maker is part of the toolkit. A workshop that can build precisely to your drawings — at factory-direct value — lets you deliver a signature interior with the margin and control that off-the-shelf sourcing rarely allows. Increasingly, that maker is a Chinese atelier.",
      },
      {
        type: "p",
        text: "Sourcing bespoke furniture and fitted interiors from overseas is not difficult, but it does reward a professional method. This guide sets out how to brief, specify and manage a custom project with a Chinese workshop so that what arrives matches what you drew.",
      },
      { type: "h2", text: "Why Designers Work Directly with a Maker" },
      {
        type: "p",
        text: "Going straight to the workshop changes both the economics and the creative control of a project:",
      },
      {
        type: "ul",
        items: [
          "**Margin.** Factory-direct pricing leaves room for a healthy design fee without inflating the client's budget.",
          "**True customisation.** Pieces are built to your dimensions, materials and details — not adapted from a range.",
          "**Single accountability.** One maker responsible for furniture, cabinetry and fitted elements keeps quality and timing consistent.",
          "**Coherence.** A whole scheme made in one workshop shares the same hand, finish and standard across every room.",
        ],
      },
      { type: "h2", text: "Start with a Clear Brief" },
      {
        type: "p",
        text: "Every successful custom project begins with a good brief. The more precisely you define the work up front, the more accurate the quote and the fewer revisions later. A strong brief usually includes:",
      },
      {
        type: "ul",
        items: [
          "**Room type and intended use** for each area.",
          "**Site location or destination market**, which can affect materials and compliance.",
          "**Plans, elevations or key dimensions** — even rough drawings help enormously.",
          "**Reference images and preferred direction** — the look, mood and materials you are aiming for.",
          "**Required products and quantities.**",
          "**Colour and material preferences.**",
          "**Any technical or regulatory requirements.**",
          "**Your target schedule.**",
        ],
      },
      {
        type: "p",
        text: "A custom enquiry can begin with something as simple as a reference image, a drawing or a room plan. From there, a capable atelier works with you toward a resolved specification.",
      },
      { type: "h2", text: "Specify Like a Professional" },
      {
        type: "p",
        text: "Once the brief is agreed, the detail is where quality is won or lost. Focus a specification on the things that define the finished result: form and proportion, key dimensions, material and colour direction, visible detailing, and the deliverables you expect. Treat colour, grain, sheen, edge profile and hardware as decisions to be made together, not in isolation.",
      },
      {
        type: "p",
        text: "Confirm every point in writing. Reputable workshops expect this and will document the agreed specification before anything is built.",
      },
      { type: "h2", text: "Samples, Prototypes and Quality Control" },
      {
        type: "p",
        text: "For a project of any significance, insist on seeing the work before it ships. A confident atelier will provide material samples and, where appropriate, a prototype so you can approve the feel and construction. Final selections are best confirmed against physical samples or agreed references rather than screen images. During production, the workshop should run its own quality control and be willing to share progress photos — a supplier reluctant to show work in progress is a warning sign.",
      },
      { type: "h2", text: "Timelines and Logistics" },
      {
        type: "p",
        text: "Plan realistic time into your programme. For considered, made-to-order work a sensible expectation is around two months of production, plus shipping to your country. Because a good maker handles export packing and freight as routine, coordinate the delivery method and route around your installation schedule rather than rushing the craft. Share your key site dates early so production can be sequenced to meet them.",
      },
      { type: "h2", text: "Communication Is the Whole Game" },
      {
        type: "p",
        text: "More than anything, a cross-border project lives or dies on communication. Before you commit, notice how clearly and quickly a workshop answers your questions — responsiveness before the sale reliably predicts responsiveness during production. Aim for a single, consistent point of contact who understands the whole project, and keep decisions documented as you go.",
      },
      { type: "h2", text: "Building a Long-Term Partner" },
      {
        type: "p",
        text: "The real prize for a designer is not a single order but a dependable partner — a workshop you can return to, project after project, knowing the standard will hold. That relationship turns overseas manufacturing from a risk into one of your most valuable resources.",
      },
      {
        type: "p",
        text: "Meimi&H works with designers and private clients on bespoke furniture and whole-home interiors, taking projects from first reference to resolved specification and finished, install-ready pieces. Built in our Foshan atelier and shipped worldwide, our work is made to your drawings — and to a standard you can build a practice on.",
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
