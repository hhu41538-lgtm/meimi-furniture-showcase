export type CatalogueCategory = "living" | "sleep" | "dining" | "storage" | "outdoor" | "custom";

export const catalogueCategories: CatalogueCategory[] = ["living", "sleep", "dining", "storage", "outdoor", "custom"];

export function isCatalogueCategory(value: string | undefined): value is CatalogueCategory {
  return typeof value === "string" && catalogueCategories.includes(value as CatalogueCategory);
}

export type StudioItem = {
  slug: string;
  name: string;
  category: CatalogueCategory;
  eyebrow: string;
  tagline: string;
  description: string;
  image: string;
  imageLabel: string;
  details: string[];
  gallery?: { image: string; label: string }[];
};

export const studioItems: StudioItem[] = [
  {
    slug: "custom-curve-sofa",
    name: "Custom Curve Sofa",
    category: "custom",
    eyebrow: "Showroom piece",
    tagline: "A low line with a composed, modular rhythm.",
    description:
      "A made-to-order curved seating study shown in the Meimi&H showroom. The form is a starting point for proportion, upholstery and configuration conversations.",
    image: "/images/catalogue-app/custom-sofa-showroom.jpg",
    imageLabel: "Showroom reference",
    details: ["Configuration - adapted to plan", "Upholstery - selected at specification", "Dimensions - confirmed per project"],
  },
  {
    slug: "beijing-residence-interior",
    name: "Beijing Residence Interior Study",
    category: "custom",
    eyebrow: "Custom interiors",
    tagline: "A complete material direction for dining, kitchen and living.",
    description:
      "A Meimi&H residential interior reference bringing together a sculptural dining setting, fitted kitchen, display joinery and soft seating. It is intended as a starting point for clients who want the architecture, furniture and finishes considered as one composition.",
    image: "/images/catalogue-app/beijing-residence-interior.jpg",
    imageLabel: "Project reference",
    details: ["Space - open-plan dining and living", "Joinery - fitted kitchen and display storage", "Furniture - dining and lounge coordinated together", "Materials - specified to the project palette"],
    gallery: [
      { image: "/images/catalogue-app/beijing-residence-gallery-art-wall.jpg", label: "Art wall detail" },
      { image: "/images/catalogue-app/beijing-residence-gallery-dining.jpg", label: "Dining setting" },
      { image: "/images/catalogue-app/beijing-residence-gallery-living.jpg", label: "Living room" },
      { image: "/images/catalogue-app/beijing-residence-gallery-bedroom.jpg", label: "Bedroom" },
      { image: "/images/catalogue-app/beijing-residence-gallery-open-plan.jpg", label: "Open-plan interior" },
      { image: "/images/catalogue-app/beijing-residence-gallery-lounge.jpg", label: "Lounge detail" },
    ],
  },
  {
    slug: "dark-tonal-residence",
    name: "Dark Tonal Residence",
    category: "custom",
    eyebrow: "Residential case study",
    tagline: "Deep texture, low light and a composed lounge.",
    description:
      "A residential living room direction built around charcoal joinery, dark stone flooring and soft, generously proportioned seating. The restrained palette lets texture and silhouette carry the atmosphere.",
    image: "/images/Residences/dark-tonal/01-hero.jpg",
    imageLabel: "Residential case study",
    gallery: [
      { image: "/images/Residences/dark-tonal/02-view.jpg", label: "Lounge view" },
      { image: "/images/Residences/dark-tonal/03-view.jpg", label: "Bathroom joinery" },
    ],
    details: ["Space - private living room", "Joinery - charcoal-toned media wall and storage", "Furniture - low lounge seating and occasional tables", "Materials - coordinated dark timber, stone and textiles"],
  },
  {
    slug: "modern-french-kitchen",
    name: "Modern French Kitchen",
    category: "custom",
    eyebrow: "Kitchen case study",
    tagline: "Classical proportion, tailored for contemporary use.",
    description:
      "A fitted kitchen study that pairs framed ivory cabinetry with deep green base units, light stone worktops and understated brass hardware. It is a useful reference for clients seeking a more formal material language without losing everyday practicality.",
    image: "/images/Residences/modern-french/01-hero.jpg",
    imageLabel: "Kitchen case study",
    gallery: [
      { image: "/images/Residences/modern-french/02-view.jpg", label: "Framed wardrobe" },
    ],
    details: ["Cabinetry - framed upper and lower units", "Island - central preparation and storage zone", "Hardware - warm metal detail", "Materials - selected to the project palette"],
  },
  {
    slug: "soft-minimal-study",
    name: "Soft Minimal Study",
    category: "custom",
    eyebrow: "Joinery case study",
    tagline: "A quiet workspace shaped by light, oak and stone.",
    description:
      "A softly minimal study with integrated shelves, a monolithic work surface and full-height panelled storage. The room demonstrates how made-to-measure joinery can turn a compact work zone into a calm architectural composition.",
    image: "/images/Residences/soft-minimal/01-hero.jpg",
    imageLabel: "Joinery case study",
    gallery: [
      { image: "/images/Residences/soft-minimal/02-view.jpg", label: "Bedroom joinery" },
      { image: "/images/Residences/soft-minimal/03-view.jpg", label: "Dining and kitchen" },
    ],
    details: ["Joinery - integrated shelves and full-height storage", "Work surface - made to the room dimensions", "Lighting - recessed shelf illumination", "Materials - pale oak and stone direction"],
  },
  {
    slug: "warm-contemporary-living",
    name: "Warm Contemporary Living",
    category: "custom",
    eyebrow: "Residential case study",
    tagline: "Soft seating set against warm timber architecture.",
    description:
      "A relaxed living-room composition with tailored modular seating, a framed media wall and a continuous timber ceiling detail. It is a starting point for residential spaces where joinery and loose furniture need to read as one whole.",
    image: "/images/Residences/warm-contemporary/01-hero.jpg",
    imageLabel: "Residential case study",
    gallery: [
      { image: "/images/Residences/warm-contemporary/02-view.jpg", label: "Kitchen joinery" },
      { image: "/images/Residences/warm-contemporary/03-view.jpg", label: "Wardrobe interior" },
      { image: "/images/Residences/warm-contemporary/04-view.jpg", label: "Bathroom joinery" },
    ],
    details: ["Space - open living area", "Joinery - media wall and timber ceiling detail", "Furniture - tailored modular seating", "Materials - warm timber, stone and upholstered textiles"],
  },
  {
    slug: "riviere-bed",
    name: "Riviere Bed",
    category: "sleep",
    eyebrow: "Bedroom collection",
    tagline: "A softly tailored headboard with architectural calm.",
    description:
      "An upholstered bed study that balances a generous headboard with a quietly detailed bedside setting. Available as a reference for custom bedroom schemes.",
    image: "/images/catalogue-app/riviere-bed-showroom.jpg",
    imageLabel: "Bedroom reference",
    details: ["Bed size - confirmed at enquiry", "Headboard - upholstery options available", "Bedside integration - on request"],
  },
  {
    slug: "elizabeth-mattress",
    name: "Elizabeth Mattress",
    category: "sleep",
    eyebrow: "Handcrafted mattress collection",
    tagline: "Layered comfort with an unmistakably tailored finish.",
    description:
      "A full-height handcrafted mattress shown within a softly composed bedroom. The layered construction and quilted finish make it a strong starting point for a complete sleep specification.",
    image: "/images/catalogue-app/elizabeth-mattress.jpg",
    imageLabel: "Product reference",
    gallery: [
      { image: "/images/explore%20by%20space/Elizabeth%20mattress/02-02.jpg", label: "Hand-tufted surface" },
      { image: "/images/explore%20by%20space/Elizabeth%20mattress/03-03.jpg", label: "Side fastening detail" },
    ],
    details: ["Collection - Elizabeth", "Construction - layered handcrafted comfort", "Bed base - coordinated upholstery available", "Size - confirmed for the project"],
  },
  {
    slug: "isabel-mattress",
    name: "Isabel Mattress",
    category: "sleep",
    eyebrow: "Svisbedy mattress collection",
    tagline: "A tailored two-tone mattress with deep hand-tufted sides.",
    description:
      "A standalone mattress reference with a softly quilted sleep surface, navy hand-tufted side panels and warm contrast piping. A strong fit for clients who want the mattress itself to carry a crafted visual identity.",
    image: "/images/catalogue-app/isabel-mattress.jpg",
    imageLabel: "Product reference",
    gallery: [
      { image: "/images/explore%20by%20space/Isabel%20mattress/02-02.jpg", label: "Tufted mattress profile" },
      { image: "/images/explore%20by%20space/Isabel%20mattress/03-03.jpg", label: "Tailored side panel" },
    ],
    details: ["Collection - Isabel", "Surface - quilted comfort layer", "Side panel - hand-tufted upholstery", "Size - confirmed for the project"],
  },
  {
    slug: "travertine-dining-table",
    name: "Travertine Dining Table",
    category: "dining",
    eyebrow: "Dining collection",
    tagline: "Stone, warm metal and a sculptural base.",
    description:
      "A refined dining table study with a natural stone top and paired support bases. Ideal for tailored dining rooms and hospitality-style entertaining spaces.",
    image: "/images/catalogue-app/travertine-table-showroom.jpg",
    imageLabel: "Showroom reference",
    details: ["Top - natural stone selection", "Base - finish options available", "Size - tailored to seating plan"],
  },
  {
    slug: "jason-dining-table",
    name: "Jason Dining Table",
    category: "dining",
    eyebrow: "Light luxury series · WD001",
    tagline: "A generous dining centrepiece with a graphic stone inlay.",
    description:
      "A formal dining table from the Light Luxury Series, shown in a complete room setting with tailored seating and layered material contrast. Its scale suits substantial residential dining rooms.",
    image: "/images/catalogue-app/jason-dining-table.jpg",
    imageLabel: "Product reference",
    details: ["Model - WD001", "Table height - 750 mm", "Diameter - 2400 mm shown", "Finish and dimensions - confirmed at specification"],
  },
  {
    slug: "maxim-petal-dining-table",
    name: "Maxim Petal Dining Table",
    category: "dining",
    eyebrow: "Dining collection",
    tagline: "An oval top set on a sculptural petal base.",
    description:
      "A generously proportioned dining table with a soft oval silhouette and layered petal base. The composition is photographed with tailored dining chairs and works especially well in formal dining rooms or hospitality-style entertaining spaces.",
    image: "/images/catalogue-app/maxim-petal-dining-table.jpg",
    imageLabel: "Product reference",
    gallery: [
      { image: "/images/catalogue-app/maxim-petal-gallery-1.jpg", label: "Formal dining view" },
      { image: "/images/catalogue-app/maxim-petal-gallery-2.jpg", label: "Oval top and seating" },
      { image: "/images/catalogue-app/maxim-petal-gallery-3.jpg", label: "Petal base detail" },
    ],
    details: ["Base - sculptural petal form", "Top - finish selected at specification", "Seating - coordinated dining chairs available", "Size - tailored to the seating plan"],
  },
  {
    slug: "airplane-cabinet",
    name: "Airplane Cabinet",
    category: "storage",
    eyebrow: "Storage collection",
    tagline: "Warm timber, reflective framing, precise storage.",
    description:
      "A cabinetry study combining a richly grained timber core with a reflective metal frame. Suitable as a distinctive storage piece or a cue for a larger joinery scheme.",
    image: "/images/catalogue-app/airplane-cabinet-showroom.jpg",
    imageLabel: "Showroom reference",
    gallery: [
      {
        image: "/images/catalogue-app/airplane-cabinet-construction-v1.webp",
        label: "Construction study",
      },
    ],
    details: ["Timber - finish selected at specification", "Frame - metal finish options", "Internal layout - configured per use"],
  },
  {
    slug: "palawan-bar-cabinet",
    name: "Palawan Bar Cabinet",
    category: "storage",
    eyebrow: "Light luxury series · WD037S26",
    tagline: "Display storage in lacquer, timber and reflective glass.",
    description:
      "A freestanding bar cabinet that pairs a warm timber exterior with black lacquer framing and illuminated glass display storage. A refined option for dining rooms, lounges and private entertaining spaces.",
    image: "/images/catalogue-app/palawan-bar-cabinet.jpg",
    imageLabel: "Product reference",
    details: ["Model - WD037S26", "Size shown - 1000 × 500 × 1900 mm", "Storage - glass display and bar service", "Finish - specified per project"],
  },
  {
    slug: "stina-upholstered-bed",
    name: "Stina Upholstered Bed",
    category: "sleep",
    eyebrow: "Svisbedy scene collection",
    tagline: "A deep navy textile note in a composed bedroom.",
    description:
      "A handcrafted mattress setting retained in its original product language, then placed within a calm stone and oak bedroom. Use it as a direction for beds, textiles and bedside finishes.",
    image: "/images/catalogue-app/stina-bedroom-scene.jpg",
    imageLabel: "Scene collection",
    gallery: [
      { image: "/images/explore%20by%20space/Stina%20mattress/02-02.jpg", label: "Upholstered bed base" },
      { image: "/images/explore%20by%20space/Stina%20mattress/03-03.jpg", label: "Mattress profile" },
      { image: "/images/explore%20by%20space/Stina%20mattress/04-04.jpg", label: "Tufted topper" },
    ],
    details: ["Upholstery - navy checker weave", "Mattress - handcrafted collection", "Bedroom scheme - coordinated on request"],
  },
  {
    slug: "terrace-dining-setting",
    name: "Terrace Dining Setting",
    category: "outdoor",
    eyebrow: "Outdoor collection",
    tagline: "Natural timber, woven texture and open-air dining.",
    description:
      "A relaxed exterior dining composition that combines a generous timber table with woven seating and weather-ready materials. Suitable for terraces, garden rooms and hospitality projects.",
    image: "/images/catalogue-app/terrace-dining-scene.jpg",
    imageLabel: "Outdoor scene",
    details: ["Table - outdoor timber finish", "Seating - woven weather-resistant material", "Layout - scaled to terrace plan"],
  },
  {
    slug: "outdoor-modular-lounge",
    name: "Outdoor Modular Lounge",
    category: "outdoor",
    eyebrow: "Outdoor collection",
    tagline: "Soft modular seating framed for open-air living.",
    description:
      "A relaxed outdoor seating system shown across several compositions, from an expansive lounge setting to a compact curved sofa. The modular proportions make it suitable for terraces, pool decks and covered garden rooms.",
    image: "/images/catalogue-app/outdoor-modular-lounge.jpg",
    imageLabel: "Outdoor scene",
    details: ["Configuration - modular seating system", "Upholstery - weather-ready selection", "Frame - outdoor material finish", "Layout - tailored to the space"],
  },
];
