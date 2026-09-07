export type ShowroomProduct = {
  slug: string;
  name: string;
  image: string;
  tagline: string;
  description: string;
  details: string[];
};

export const showroomProducts: ShowroomProduct[] = [
  {
    slug: "lillian-lounge-chair",
    name: "Lillian Lounge Chair",
    image: "/images/showroom-products/lounge-chairs/lillian-lounge-chair.webp",
    tagline: "A generous lounge silhouette with a tailored textile seat.",
    description: "A verified Meimi&H showroom piece with a softly upholstered seat, contrasting frame and a relaxed reading-chair proportion.",
    details: [
      "Product family — lounge chair",
      "Upholstery — textile and leather options confirmed at specification",
      "Frame finish — confirmed with the sales team",
      "Dimensions and project quantity — confirmed at enquiry",
    ],
  },
  {
    slug: "lounge-chair-collection",
    name: "Lounge Chair Collection",
    image: "/images/showroom-products/lounge-chairs/lounge-chair-collection.webp",
    tagline: "A considered selection of individual lounge-chair directions.",
    description: "A verified showroom selection for conversation areas, reading corners and hospitality lounges. Individual models, finishes and dimensions are confirmed with the team before specification.",
    details: [
      "Product family — lounge chair collection",
      "Selection — individual models confirmed from the showroom set",
      "Upholstery and frame — options confirmed at specification",
      "Dimensions and project quantity — confirmed at enquiry",
    ],
  },
];
