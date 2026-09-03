type TemplateQuoteLine = {
  productCode: string;
  factoryModel: string;
  name: string;
  category: string;
  image: string;
  spec: string;
  material: string;
  quantity: number;
  weight: number;
  packageLength: number;
  packageWidth: number;
  packageHeight: number;
  unitPrice: number;
  note: string;
  variables: Record<string, number>;
};

type TemplateQuote = {
  quoteNo: string;
  employee: string;
  contact: string;
  client: string;
  clientContact: string;
  clientPhone: string;
  clientEmail: string;
  country: string;
  city: string;
  clientAddress: string;
  quoteDate: string;
  generatedAt: string;
  logisticsMode: string;
  deliveryFee: number;
  installationFee: number;
  extraDiscount: number;
  depositRate: number;
  remarks: string;
  lines: TemplateQuoteLine[];
};

type TemplateTotals = {
  itemsSubtotal: number;
  tax: number;
  total: number;
  deposit: number;
  balance: number;
};

function formatMoney(value: number) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function formatGeneratedAt(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("zh-CN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatDimension(line: TemplateQuoteLine) {
  return line.spec || Object.entries(line.variables)
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" / ");
}

async function imageBuffer(url: string) {
  if (!url) return null;
  try {
    const response = await fetch(new URL(url, window.location.origin));
    if (!response.ok) return null;
    return { buffer: await response.arrayBuffer(), extension: (url.toLowerCase().endsWith(".png") ? "png" : "jpeg") as "png" | "jpeg" };
  } catch {
    return null;
  }
}

export async function downloadQuotationTemplate(quote: TemplateQuote, totals: TemplateTotals) {
  const ExcelJS = await import("exceljs");
  const response = await fetch("/templates/XX-furniture-quotation-template.xlsx");
  if (!response.ok) throw new Error("quotation template unavailable");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await response.arrayBuffer());
  const sheet = workbook.getWorksheet("家具报价") ?? workbook.worksheets[0];
  if (!sheet) throw new Error("quotation sheet unavailable");

  sheet.getCell("A3").value = `客户(client)：${[quote.client, quote.clientContact].filter(Boolean).join(" / ")}`;
  sheet.getCell("A4").value = `电话(tel)：${[quote.clientPhone, quote.clientEmail].filter(Boolean).join(" / ")}`;
  sheet.getCell("A5").value = `到货地址(address)：${[quote.country, quote.city, quote.clientAddress].filter(Boolean).join(" / ")}`;
  sheet.getCell("D3").value = `送货方式(Delivery)：${quote.logisticsMode || "Factory loading"}`;
  sheet.getCell("D4").value = `收货人电话：${quote.clientPhone || "stand by"}`;
  const generatedAt = formatGeneratedAt(quote.generatedAt);
  sheet.getCell("J3").value = `订货日期(order date)：${quote.quoteDate || ""}${generatedAt ? ` / 报价时间：${generatedAt}` : ""}`;
  sheet.getCell("J4").value = `报价员：${quote.employee || ""}${quote.contact ? ` / ${quote.contact}` : ""}`;
  sheet.getCell("J5").value = `备注：(remark) ${quote.remarks || ""}`;

  const firstLineRow = 8;
  const lastLineRow = 24;
  for (let row = firstLineRow; row <= lastLineRow; row += 1) {
    for (let col = 1; col <= 11; col += 1) sheet.getRow(row).getCell(col).value = null;
  }
  const lines = quote.lines.slice(0, lastLineRow - firstLineRow + 1);
  const imageResults = await Promise.all(lines.map((line) => imageBuffer(line.image)));
  lines.forEach((line, index) => {
    const rowNumber = firstLineRow + index;
    const row = sheet.getRow(rowNumber);
    row.getCell(1).value = index + 1;
    row.getCell(3).value = "MEIMI";
    row.getCell(4).value = `${line.name}${line.category ? ` / ${line.category}` : ""}`;
    row.getCell(5).value = line.productCode;
    row.getCell(6).value = formatDimension(line);
    row.getCell(7).value = line.material || "待确认 / To be confirmed";
    row.getCell(8).value = line.quantity;
    row.getCell(9).value = formatMoney(line.unitPrice);
    row.getCell(10).value = { formula: `H${rowNumber}*I${rowNumber}`, result: formatMoney(line.quantity * line.unitPrice) };
    const packageSize = line.packageLength > 0 && line.packageWidth > 0 && line.packageHeight > 0
      ? `${line.packageLength} x ${line.packageWidth} x ${line.packageHeight} cm`
      : "";
    row.getCell(11).value = [
      line.name,
      line.factoryModel ? `Factory: ${line.factoryModel}` : "",
      line.weight > 0 ? `${line.weight} kg` : "",
      packageSize ? `Package: ${packageSize}` : "",
      line.note,
    ].filter(Boolean).join(" / ");
    const image = imageResults[index];
    if (image) {
      const imageId = workbook.addImage({ buffer: image.buffer, extension: image.extension });
      sheet.addImage(imageId, { tl: { col: 1.12, row: rowNumber - 1 + 0.08 }, ext: { width: 105, height: 70 } });
    }
  });

  const depositRate = Math.max(0, Math.min(100, quote.depositRate || 0)) / 100;
  const totalFormula = `SUM(J${firstLineRow}:J${lastLineRow})+${formatMoney(quote.deliveryFee)}+${formatMoney(quote.installationFee)}-${formatMoney(quote.extraDiscount)}+${formatMoney(totals.tax)}`;
  sheet.getCell("J25").value = { formula: totalFormula, result: formatMoney(totals.total) };
  sheet.getCell("J26").value = { formula: `J25*${depositRate}`, result: formatMoney(totals.deposit) };
  sheet.getCell("J27").value = { formula: "J25-J26", result: formatMoney(totals.balance) };
  sheet.getCell("A28").value = `1、以上价格为产品单价，并不包含运输费，搬运费，发票等。Above price is only unit price; transportation, carriage and tax invoice are excluded. 物流费参考：${formatMoney(quote.deliveryFee)} CNY。`;
  sheet.getCell("A29").value = `2、报价总价：${formatMoney(totals.total)} CNY；产品明细合计：${formatMoney(totals.itemsSubtotal)} CNY。请以最终确认单为准。`;
  sheet.getCell("A30").value = "3、尺寸、材质、颜色、重量及包装信息以工厂最终复核和实际出货数据为准。";
  sheet.getCell("A31").value = "4、工厂声明：本报价基于当前客户需求、产品编号、规格变量与图片资料生成，最终以工厂确认单为准。";

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${quote.quoteNo || "meimih-quotation"}.xlsx`;
  link.click();
  URL.revokeObjectURL(link.href);
}
