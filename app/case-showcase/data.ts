export type CaseStudy = {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  gallery: string[];
  featured?: boolean;
};

export const caseStudies: CaseStudy[] = [
  { id: "beijing-qingcui-garden", title: "Beijing Qingcui Garden", location: "Beijing · Residential interior", description: "A tailored residential interior with stone, timber and built-in cabinetry working as one calm composition.", image: "/images/case-showcase/beijing-qingcui-garden.jpg", gallery: ["/images/case-showcase/beijing-qingcui-garden-detail.jpg"], featured: true },
  { id: "bao-neng-taikoo-hui", title: "Bao'neng Taikoo Hui", location: "Residential interior", description: "Warm timber wall detailing, integrated storage and a generous living composition made for everyday use.", image: "/images/case-showcase/bao-neng-taikoo-hui.jpg", gallery: ["/images/case-showcase/bao-neng-taikoo-hui-detail.jpg"] },
  { id: "nanjing-jiangwan-city", title: "Nanjing Jiangwan City", location: "Nanjing · Residential interior", description: "A layered living space shaped around natural light, quiet material contrast and made-to-measure furniture.", image: "/images/case-showcase/nanjing-jiangwan-city.jpg", gallery: ["/images/case-showcase/nanjing-jiangwan-city-detail.jpg"] },
  { id: "taiyuan-vanke-jade-garden", title: "Taiyuan Vanke Jade Garden", location: "Taiyuan · Villa interior", description: "Custom cabinetry and kitchen elements coordinated to carry a clear material direction through the home.", image: "/images/case-showcase/taiyuan-vanke-jade-garden.jpg", gallery: ["/images/case-showcase/taiyuan-vanke-jade-garden-detail.jpg"] },
  { id: "shenzhen-lan-jiangshan", title: "Lan Jiangshan", location: "Shenzhen · Modern French residence", description: "A modern French direction with crafted wall finishes, storage and furniture details specified for the room.", image: "/images/case-showcase/shenzhen-lan-jiangshan.jpg", gallery: ["/images/case-showcase/shenzhen-lan-jiangshan-detail.jpg"] },
  { id: "shuixie-huadu", title: "Shuixie Huadu", location: "Residential interior", description: "Soft timber tones, framed cabinetry and considered seating details bring a quiet rhythm to the interior.", image: "/images/case-showcase/shuixie-huadu.jpg", gallery: ["/images/case-showcase/shuixie-huadu-detail.jpg"] },
  { id: "tianjian-tianjiao", title: "Tianjian Tianjiao", location: "Residential interior", description: "A darker tonal scheme balanced with tailored upholstery, integrated storage and warm points of light.", image: "/images/case-showcase/tianjian-tianjiao.jpg", gallery: ["/images/case-showcase/tianjian-tianjiao-detail.jpg"] },
];
