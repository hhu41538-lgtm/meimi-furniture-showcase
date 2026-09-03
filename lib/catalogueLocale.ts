const productNames: Record<string, string> = {
  "bamboo-sofa": "Bamboo 沙发",
  "bessel-sofa": "Bessel 沙发",
  "brera-sofa": "Brera 沙发",
  "coupe-sofa": "Coupe 沙发",
  "roger-sofa": "Roger 沙发",
  "vincent-sofa": "Vincent 沙发",
  "vivian-sofa": "Vivian 沙发",
  "baxter-drop-dining-table": "Baxter Drop 餐桌",
  "hourglass-dining-table": "Hourglass 餐桌",
  "walnut-long-dining-table": "胡桃木长餐桌",
  "square-coffee-table": "方形茶几",
  "woven-garden-lounge": "编织花园休闲组",
  "modular-terrace-lounge": "模块化露台沙发",
  "poolside-daybed": "池畔日床",
  "terrace-conversation-set": "露台会客组",
  elizabeth: "Elizabeth 床垫",
  isabel: "Isabel 床垫",
  margaret: "Margaret 床垫",
  sophia: "Sophia 床垫",
  louise: "Louise 床垫",
  "ms-233b": "MS-233B 床垫",
  "ms-3d": "MS-3D 床垫",
  "experts-choice-125": "Expert's Choice 125 床垫",
  stina: "Stina 床垫",
};

const productTaglines: Record<string, string> = {
  "bamboo-sofa": "沉静自然的柔和线条。",
  "bessel-sofa": "单一雕塑弧线，形成鲜明轮廓。",
  "brera-sofa": "米兰式克制与定制化线条。",
  "coupe-sofa": "低矮、建筑感与雕塑感并存。",
  "roger-sofa": "宽松舒展，历久弥新的日常陪伴。",
  "vincent-sofa": "结构清晰、定制而现代。",
  "vivian-sofa": "柔和包裹，低调而有魅力。",
  "baxter-drop-dining-table": "柔化轮廓与雕塑感流动底座。",
  "hourglass-dining-table": "围绕中央沙漏形底座的平衡比例。",
  "walnut-long-dining-table": "长纹木材的温度，为相聚而生。",
  "square-coffee-table": "紧凑沉稳的客厅陪伴。",
  "woven-garden-lounge": "编织肌理与柔和体量，适合花园空间。",
  "modular-terrace-lounge": "灵活户外组合与松弛的建筑线条。",
  "poolside-daybed": "面向长日光的圆形休憩空间。",
  "terrace-conversation-set": "围绕安静中心展开的低位会客组合。",
  elizabeth: "克制而细腻的定制质感。",
  isabel: "柔和建筑感，带来稳定支撑。",
  margaret: "经典姿态的重新诠释。",
  sophia: "安静、平衡的睡眠体验。",
  louise: "细节表达清晰而有分寸。",
  "ms-233b": "少一点装饰，多一点存在感。",
  "ms-3d": "能被身体感知的结构。",
  "experts-choice-125": "从结构到表面，都经过认真考量。",
  stina: "一套设计，多种空间表达。",
};

const studioNames: Record<string, string> = {
  "custom-curve-sofa": "弧形定制沙发",
  "beijing-residence-interior": "北京住宅空间方案",
  "dark-tonal-residence": "深色调住宅",
  "modern-french-kitchen": "现代法式厨房",
  "soft-minimal-study": "极简书房",
  "warm-contemporary-living": "温润现代客厅",
  "riviere-bed": "Riviere 床",
  "elizabeth-mattress": "Elizabeth 床垫",
  "isabel-mattress": "Isabel 床垫",
  "travertine-dining-table": "洞石餐桌",
  "jason-dining-table": "Jason 餐桌",
  "maxim-petal-dining-table": "Maxim 花瓣餐桌",
  "airplane-cabinet": "Airplane 收纳柜",
  "palawan-bar-cabinet": "Palawan 酒柜",
  "stina-upholstered-bed": "Stina 软包床",
  "terrace-dining-setting": "户外露台餐厅",
  "outdoor-modular-lounge": "户外模块沙发",
};

export function localizeCatalogueName(slug: string, fallback: string) {
  return productNames[slug] ?? studioNames[slug] ?? fallback;
}

export function localizeCatalogueTagline(slug: string, fallback: string) {
  return productTaglines[slug] ?? fallback;
}
