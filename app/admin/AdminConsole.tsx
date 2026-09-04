"use client";

import Image from "next/image";
import { type ChangeEvent, type DragEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowLeftRight,
  ArrowUpRight,
  Boxes,
  Calculator,
  CheckCircle2,
  Copy,
  CloudUpload,
  ExternalLink,
  FileDown,
  FileText,
  Globe2,
  House,
  LogOut,
  Menu,
  Minus,
  PanelLeftClose,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Trash2,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { productCodePrefix } from "@/lib/productCodes";
import { customerOwnerConflictMessage, deleteSharedCustomerOwner, fetchSharedCustomerOwners, isCustomerOwnerConflict, publishCustomerOwner, replaceCustomerOwners } from "@/lib/customerOwnerSync";
import { SALES_PERMISSION_OPTIONS, type AuthSession, type PermissionKey, type StaffAccount } from "./auth";
import { downloadQuotationTemplate } from "./quotationTemplate";
import { fetchSharedWorkspaceState, publishSharedWorkspaceState, type CloudWorkspaceState } from "@/lib/workspaceSync";

export type ManagedEntry = {
  id: string;
  type: "product" | "studio";
  slug: string;
  productCode: string;
  factoryModel: string;
  pricingRuleId: string;
  basePrice: number;
  stockStatus: "in-stock" | "limited" | "made-to-order" | "unavailable";
  warehouseLocation: string;
  warehouseNote: string;
  name: string;
  category: string;
  tagline: string;
  image: string;
  visible: boolean;
};

type PricingRule = {
  id: string;
  name: string;
  method: "formula" | "manual-review";
  expression: string;
  variables: string[];
  note: string;
};

type QuoteLine = {
  id: string;
  entryId: string;
  productCode: string;
  factoryModel: string;
  pricingRuleId: string;
  name: string;
  category: string;
  image: string;
  stockStatus: ManagedEntry["stockStatus"];
  warehouseLocation: string;
  warehouseNote: string;
  spec: string;
  material: string;
  variables: Record<string, number>;
  quantity: number;
  weight: number;
  packageLength: number;
  packageWidth: number;
  packageHeight: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  note: string;
};

type QuoteDraft = {
  quoteNo: string;
  version: number;
  status: "draft" | "sent" | "revised" | "approved";
  quoteDate: string;
  generatedAt: string;
  employee: string;
  contact: string;
  client: string;
  clientContact: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  customerDemand: string;
  country: string;
  city: string;
  project: string;
  validUntil: string;
  leadTime: string;
  paymentTerms: string;
  logisticsMode: string;
  freightBaseFee: number;
  freightRatePerCbm: number;
  freightRatePerKg: number;
  deliveryFee: number;
  installationFee: number;
  extraDiscount: number;
  depositRate: number;
  remarks: string;
  factoryStatement: string;
  lines: QuoteLine[];
};

type QuoteTextField =
  | "quoteNo"
  | "status"
  | "quoteDate"
  | "generatedAt"
  | "employee"
  | "contact"
  | "client"
  | "clientContact"
  | "clientPhone"
  | "clientEmail"
  | "clientAddress"
  | "customerDemand"
  | "country"
  | "city"
  | "project"
  | "validUntil"
  | "leadTime"
  | "paymentTerms"
  | "logisticsMode"
  | "remarks"
  | "factoryStatement";

type QuoteTotals = {
  itemsSubtotal: number;
  fees: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  balance: number;
  totalWeight: number;
  totalVolume: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
};

type DataIssue = {
  level: "error" | "warning";
  label: string;
  detail: string;
};

type QuoteSnapshot = {
  id: string;
  savedAt: string;
  kind: "manual" | "generated";
  workflowStage: QuoteWorkflowStage;
  pricingRuleId: string;
  customerOwnerKey: string;
  customerOwner: CustomerOwnerRecord | null;
  quote: QuoteDraft;
  totals: QuoteTotals;
};

type QuoteWorkflowStage = "demand" | "warehouse" | "generated";
type ActiveModule = "home" | "customers" | "quote" | "products" | "search" | "logistics" | "admin";

type CustomerTier = "A" | "B" | "C";
type CustomerFollowStatus = "new" | "following" | "quoted" | "won" | "paused";
type CustomerLeadSource = "manual" | "meta" | "website" | "referral" | "other";

type CustomerOwnerRecord = {
  id: string;
  country: string;
  phone: string;
  client: string;
  clientContact: string;
  ownerAccountId?: string;
  owner: string;
  ownerContact: string;
  createdAt: string;
  updatedAt: string;
  tier: CustomerTier;
  followStatus: CustomerFollowStatus;
  leadSource: CustomerLeadSource;
  note: string;
  privateNote: string;
  nextFollowUpDate: string;
  quoteCount: number;
  lastQuotedAt: string;
  lastQuoteNo: string;
  lastQuoteTotal: number;
};

type CurrencyCode = "USD" | "EUR" | "GBP" | "AUD" | "AED" | "SAR" | "INR";
type ConverterCurrency = "CNY" | CurrencyCode;

type ExchangeRates = Record<CurrencyCode, number>;

type ContainerPlan = {
  id: string;
  name: string;
  volumeCbm: number;
  maxWeightKg: number;
};

type LogisticsPreset = {
  id: string;
  name: string;
  mode: string;
  freightBaseFee: number;
  freightRatePerCbm: number;
  freightRatePerKg: number;
  note: string;
};

const CATALOGUE_STORAGE_KEY = "meimih-admin-catalogue-v2";
const LEGACY_CATALOGUE_STORAGE_KEY = "meimih-admin-catalogue-v1";
const QUOTE_STORAGE_KEY = "meimih-staff-quote-v2";
const LEGACY_QUOTE_STORAGE_KEY = "meimih-staff-quote-v1";
const QUOTE_HISTORY_STORAGE_KEY = "meimih-staff-quote-history-v1";
const CUSTOMER_OWNER_PENDING_STORAGE_KEY = "meimih-pending-customer-owners-v1";

function readPendingCustomerOwners(): CustomerOwnerRecord[] {
  try {
    const stored = localStorage.getItem(CUSTOMER_OWNER_PENDING_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) as unknown : [];
    return Array.isArray(parsed)
      ? dedupeCustomerOwnerRecords(parsed.map(normalizeCustomerOwnerRecord).filter((record): record is CustomerOwnerRecord => Boolean(record)))
      : [];
  } catch {
    return [];
  }
}

function readPendingCustomerOwnerCount(): number {
  return readPendingCustomerOwners().length;
}

function dedupeCustomerOwnerRecords(records: CustomerOwnerRecord[]): CustomerOwnerRecord[] {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = normalizeOwnerKey(record.country, record.phone);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
const PRICING_STORAGE_KEY = "meimih-pricing-rules-v1";
const WORKFLOW_PRICING_STORAGE_KEY = "meimih-workflow-pricing-rule-v1";
const WORKFLOW_STAGE_STORAGE_KEY = "meimih-workflow-stage-v1";
const CUSTOMER_OWNER_STORAGE_KEY = "meimih-customer-owner-registry-v1";
const TAX_RATE = 0;
const PRODUCT_CODE_PATTERN = /^MH-[A-Z]{2}-\d{3}$/;
const QUOTE_NO_PATTERN = /^MH-Q-(\d{8})-(\d{3})$/;
const PDF_IMPORT_MAX_PAGES = 60;
const stockStatusLabels: Record<ManagedEntry["stockStatus"], string> = {
  "in-stock": "现货",
  limited: "限量",
  "made-to-order": "定制",
  unavailable: "暂不可用",
};
const customerFollowStatusLabels: Record<CustomerFollowStatus, string> = {
  new: "新客户",
  following: "跟进中",
  quoted: "已报价",
  won: "已成交",
  paused: "暂停",
};
const customerLeadSourceLabels: Record<CustomerLeadSource, string> = {
  manual: "手动录入",
  meta: "Meta 广告",
  website: "独立站",
  referral: "客户转介绍",
  other: "其他来源",
};
const categoryLabels: Record<string, string> = {
  sofa: "沙发",
  dining: "餐厅",
  mattress: "床垫",
  sleep: "卧室",
  storage: "柜类收纳",
  custom: "定制",
  outdoor: "户外",
  studio: "空间方案",
};
const categoryGroups: Record<string, { major: string; minor: string }> = {
  sofa: { major: "客厅家具", minor: "沙发" },
  dining: { major: "餐厨家具", minor: "餐桌 / 餐椅" },
  mattress: { major: "卧室家具", minor: "床垫" },
  sleep: { major: "卧室家具", minor: "床 / 床头柜" },
  storage: { major: "柜类收纳", minor: "边柜 / 衣柜 / 电视柜" },
  custom: { major: "定制木作", minor: "全屋 / 护墙 / 柜体" },
  outdoor: { major: "户外家具", minor: "庭院 / 露台" },
  studio: { major: "空间方案", minor: "整案搭配" },
};
const categorySearchAliases: Record<string, string[]> = {
  sofa: ["沙发", "客厅", "lounge"],
  dining: ["餐桌", "餐椅", "餐厅", "饭厅"],
  mattress: ["床垫", "睡眠", "卧室"],
  sleep: ["床", "床头柜", "卧室", "睡眠"],
  storage: ["柜", "柜子", "收纳", "衣柜", "电视柜"],
  custom: ["定制", "全屋", "护墙", "橱柜", "木作"],
  outdoor: ["户外", "露台", "庭院", "阳台"],
  studio: ["空间", "方案", "案例", "整案"],
};
const codePrefixSearchAliases: Record<string, string[]> = {
  SF: ["沙发", "客厅沙发"],
  DT: ["餐桌", "饭桌", "长桌"],
  CT: ["茶几", "咖啡桌", "边几"],
  AC: ["椅", "椅子", "单椅", "餐椅"],
  BD: ["床", "软床", "床架"],
  CB: ["柜", "柜子", "边柜", "酒柜", "收纳柜"],
  MT: ["床垫"],
  OD: ["户外", "庭院", "露台"],
  ST: ["空间", "方案", "案例", "整案"],
};
const fallbackExchangeRates: ExchangeRates = {
  USD: 0.1484,
  EUR: 0.1275,
  GBP: 0.1093,
  AUD: 0.2068,
  AED: 0.5451,
  SAR: 0.5566,
  INR: 12.35,
};
const currencyLabels: Record<CurrencyCode, string> = {
  USD: "美元 USD",
  EUR: "欧元 EUR",
  GBP: "英镑 GBP",
  AUD: "澳元 AUD",
  AED: "阿联酋迪拉姆 AED",
  SAR: "沙特里亚尔 SAR",
  INR: "印度卢比 INR",
};
const currencyCodes: CurrencyCode[] = ["USD", "EUR", "GBP", "AUD", "AED", "SAR", "INR"];
const converterCurrencies: ConverterCurrency[] = ["CNY", ...currencyCodes];
const converterCurrencyLabels: Record<ConverterCurrency, string> = {
  CNY: "人民币 CNY",
  ...currencyLabels,
};
const containerPlans: ContainerPlan[] = [
  { id: "20gp", name: "20GP 小柜", volumeCbm: 28, maxWeightKg: 21000 },
  { id: "40gp", name: "40GP 大柜", volumeCbm: 58, maxWeightKg: 26000 },
  { id: "40hq", name: "40HQ 高柜", volumeCbm: 68, maxWeightKg: 26000 },
];
const logisticsPresets: LogisticsPreset[] = [
  {
    id: "sea-lcl",
    name: "海运拼柜",
    mode: "海运拼柜 LCL，按 CBM 粗估，最终以货代实报为准",
    freightBaseFee: 800,
    freightRatePerCbm: 680,
    freightRatePerKg: 0,
    note: "适合少量家具或样品单。",
  },
  {
    id: "sea-fcl",
    name: "海运整柜",
    mode: "海运整柜 FCL，按整柜基础成本粗估，最终以港口和船期为准",
    freightBaseFee: 12000,
    freightRatePerCbm: 120,
    freightRatePerKg: 0,
    note: "适合接近满柜的项目单。",
  },
  {
    id: "air",
    name: "空运急单",
    mode: "空运 / 快递急单，按重量粗估，最终以实际计费重量为准",
    freightBaseFee: 600,
    freightRatePerCbm: 0,
    freightRatePerKg: 42,
    note: "适合小件、样板或紧急补件。",
  },
  {
    id: "pickup",
    name: "客户自提",
    mode: "客户自提 / 指定货代提货",
    freightBaseFee: 0,
    freightRatePerCbm: 0,
    freightRatePerKg: 0,
    note: "系统不计物流费，只保留重量和体积供对接。",
  },
];

function quoteDateToken(date = new Date()) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function dateAfterDays(days: number, date = new Date()) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function quoteNoForSequence(sequence: number, date = new Date()) {
  return `MH-Q-${quoteDateToken(date)}-${String(Math.max(sequence, 1)).padStart(3, "0")}`;
}

const defaultPricingRules: PricingRule[] = [
  {
    id: "standard-base",
    name: "标准基础价",
    method: "formula",
    expression: "basePrice + sizeUpgrade + materialUpgrade + customOption",
    variables: ["basePrice", "sizeUpgrade", "materialUpgrade", "customOption"],
    note: "适合已有基础价格，只按尺寸、材料、特殊选项加价的产品。",
  },
  {
    id: "cabinet-area",
    name: "柜体面积报价",
    method: "formula",
    expression: "width * height * unitPrice + hardware + finishUpgrade",
    variables: ["width", "height", "unitPrice", "hardware", "finishUpgrade"],
    note: "适合柜体、护墙、部分定制家具。宽高单位需要管理员统一约定。",
  },
  {
    id: "manual-review",
    name: "人工核价",
    method: "manual-review",
    expression: "",
    variables: [],
    note: "超尺寸、特殊皮料、特殊结构或资料未录入时使用，系统不强行计算。",
  },
];

const defaultQuote: QuoteDraft = {
  quoteNo: quoteNoForSequence(1),
  version: 1,
  status: "draft",
  quoteDate: new Date().toISOString().slice(0, 10),
  generatedAt: "",
  employee: "",
  contact: "",
  client: "",
  clientContact: "",
  clientPhone: "",
  clientEmail: "",
  clientAddress: "",
  customerDemand: "",
  country: "",
  city: "",
  project: "",
  validUntil: "",
  leadTime: "定制产品常规 35-60 天，现货以库存确认为准。",
  paymentTerms: "30% 定金排产，尾款于发货前结清。",
  logisticsMode: "待确认物流渠道",
  freightBaseFee: 0,
  freightRatePerCbm: 0,
  freightRatePerKg: 0,
  deliveryFee: 0,
  installationFee: 0,
  extraDiscount: 0,
  depositRate: 30,
  remarks: "报价为内部员工预估口径，最终生产规格、物流与税费以确认单为准。",
  factoryStatement: "工厂声明：本报价基于当前客户需求、产品编号、规格变量与图片资料生成；尺寸、材质、重量、包装、交期和物流费用需以最终生产确认单、工厂复核及实际出货数据为准。",
  lines: [],
};

function quoteNoSequenceForToday(quoteNo: string, date = new Date()) {
  const match = quoteNo.match(QUOTE_NO_PATTERN);
  if (!match || match[1] !== quoteDateToken(date)) return 0;
  return Number(match[2]) || 0;
}

function quoteHasWorkingContent(quoteDraft: QuoteDraft) {
  return Boolean(
    quoteDraft.lines.length ||
      quoteDraft.client.trim() ||
      quoteDraft.clientPhone.trim() ||
      quoteDraft.customerDemand.trim() ||
      quoteDraft.generatedAt.trim(),
  );
}

function nextQuoteNoFromHistory(history: QuoteSnapshot[], currentQuote?: QuoteDraft) {
  const today = new Date();
  const maxHistorySequence = history.reduce((max, snapshot) => Math.max(max, quoteNoSequenceForToday(snapshot.quote.quoteNo, today)), 0);
  const currentSequence = currentQuote && quoteHasWorkingContent(currentQuote) ? quoteNoSequenceForToday(currentQuote.quoteNo, today) : 0;
  return quoteNoForSequence(Math.max(maxHistorySequence, currentSequence) + 1, today);
}

function createBlankQuote(quoteNo: string) {
  return {
    ...defaultQuote,
    quoteNo,
    version: 1,
    status: "draft" as const,
    quoteDate: new Date().toISOString().slice(0, 10),
    generatedAt: "",
    lines: [],
  };
}

function isEntry(value: unknown): value is ManagedEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<ManagedEntry>;
  return Boolean(
    typeof entry.id === "string" &&
      (entry.type === "product" || entry.type === "studio") &&
      typeof entry.slug === "string" &&
      typeof entry.name === "string" &&
      typeof entry.category === "string" &&
      typeof entry.tagline === "string" &&
      typeof entry.image === "string" &&
      typeof entry.visible === "boolean",
  );
}

function normalizeEntry(value: unknown, fallbackIndex: number): ManagedEntry | null {
  if (!isEntry(value)) return null;
  const entry = value as Partial<ManagedEntry>;
  const stockStatus =
    entry.stockStatus === "limited" || entry.stockStatus === "made-to-order" || entry.stockStatus === "unavailable" ? entry.stockStatus : "in-stock";
  return {
    ...value,
    productCode: typeof entry.productCode === "string" ? entry.productCode : `MH-PR-${String(fallbackIndex + 1).padStart(3, "0")}`,
    factoryModel: typeof entry.factoryModel === "string" ? entry.factoryModel : "",
    pricingRuleId: typeof entry.pricingRuleId === "string" ? entry.pricingRuleId : "manual-review",
    basePrice: typeof entry.basePrice === "number" && Number.isFinite(entry.basePrice) ? Math.max(entry.basePrice, 0) : 0,
    stockStatus,
    warehouseLocation: typeof entry.warehouseLocation === "string" ? entry.warehouseLocation : "Main warehouse",
    warehouseNote: typeof entry.warehouseNote === "string" ? entry.warehouseNote : "",
  };
}

function isPricingRule(value: unknown): value is PricingRule {
  if (!value || typeof value !== "object") return false;
  const rule = value as Partial<PricingRule>;
  return Boolean(
    typeof rule.id === "string" &&
      typeof rule.name === "string" &&
      (rule.method === "formula" || rule.method === "manual-review") &&
      typeof rule.expression === "string" &&
      Array.isArray(rule.variables) &&
      rule.variables.every((item) => typeof item === "string") &&
      typeof rule.note === "string",
  );
}

function normalizeQuoteLine(value: unknown): QuoteLine | null {
  if (!value || typeof value !== "object") return null;
  const line = value as Partial<QuoteLine>;
  const validCore = Boolean(
    typeof line.id === "string" &&
      typeof line.entryId === "string" &&
      typeof line.name === "string" &&
      typeof line.category === "string" &&
      typeof line.image === "string" &&
      typeof line.quantity === "number" &&
      typeof line.unitPrice === "number" &&
      typeof line.discount === "number" &&
      typeof line.note === "string",
  );
  if (!validCore) return null;
  return {
    id: line.id ?? "",
    entryId: line.entryId ?? "",
    productCode: typeof line.productCode === "string" ? line.productCode : "",
    factoryModel: typeof line.factoryModel === "string" ? line.factoryModel : "",
    pricingRuleId: typeof line.pricingRuleId === "string" ? line.pricingRuleId : "manual-review",
    name: line.name ?? "",
    category: line.category ?? "",
    image: line.image ?? "",
    stockStatus:
      line.stockStatus === "limited" || line.stockStatus === "made-to-order" || line.stockStatus === "unavailable" ? line.stockStatus : "in-stock",
    warehouseLocation: typeof line.warehouseLocation === "string" ? line.warehouseLocation : "",
    warehouseNote: typeof line.warehouseNote === "string" ? line.warehouseNote : "",
    spec: typeof line.spec === "string" ? line.spec : "",
    material: typeof line.material === "string" ? line.material : "",
    variables: line.variables && typeof line.variables === "object" ? (line.variables as Record<string, number>) : {},
    quantity: line.quantity ?? 0,
    weight: typeof line.weight === "number" ? line.weight : 0,
    packageLength: typeof line.packageLength === "number" ? line.packageLength : 0,
    packageWidth: typeof line.packageWidth === "number" ? line.packageWidth : 0,
    packageHeight: typeof line.packageHeight === "number" ? line.packageHeight : 0,
    unitPrice: line.unitPrice ?? 0,
    costPrice: typeof line.costPrice === "number" ? line.costPrice : 0,
    discount: line.discount ?? 0,
    note: line.note ?? "",
  };
}

function normalizeQuoteDraft(value: unknown): QuoteDraft | null {
  if (!value || typeof value !== "object") return null;
  const quote = value as Partial<QuoteDraft>;
  const validCore = Boolean(
    typeof quote.quoteNo === "string" &&
      typeof quote.employee === "string" &&
      typeof quote.remarks === "string" &&
      Array.isArray(quote.lines),
  );
  if (!validCore) return null;
  const lines = quote.lines?.map(normalizeQuoteLine).filter((line): line is QuoteLine => Boolean(line));
  return {
    ...defaultQuote,
    ...quote,
    version: typeof quote.version === "number" ? quote.version : 1,
    status: quote.status === "sent" || quote.status === "revised" || quote.status === "approved" ? quote.status : "draft",
    quoteDate: typeof quote.quoteDate === "string" ? quote.quoteDate : defaultQuote.quoteDate,
    generatedAt: typeof quote.generatedAt === "string" ? quote.generatedAt : "",
    contact: typeof quote.contact === "string" ? quote.contact : "",
    client: typeof quote.client === "string" ? quote.client : "",
    clientContact: typeof quote.clientContact === "string" ? quote.clientContact : "",
    clientPhone: typeof quote.clientPhone === "string" ? quote.clientPhone : "",
    clientEmail: typeof quote.clientEmail === "string" ? quote.clientEmail : "",
    clientAddress: typeof quote.clientAddress === "string" ? quote.clientAddress : "",
    customerDemand: typeof quote.customerDemand === "string" ? quote.customerDemand : "",
    country: typeof quote.country === "string" ? quote.country : "",
    city: typeof quote.city === "string" ? quote.city : "",
    project: typeof quote.project === "string" ? quote.project : "",
    validUntil: typeof quote.validUntil === "string" ? quote.validUntil : "",
    leadTime: typeof quote.leadTime === "string" ? quote.leadTime : defaultQuote.leadTime,
    paymentTerms: typeof quote.paymentTerms === "string" ? quote.paymentTerms : defaultQuote.paymentTerms,
    logisticsMode: typeof quote.logisticsMode === "string" ? quote.logisticsMode : defaultQuote.logisticsMode,
    freightBaseFee: typeof quote.freightBaseFee === "number" ? quote.freightBaseFee : 0,
    freightRatePerCbm: typeof quote.freightRatePerCbm === "number" ? quote.freightRatePerCbm : 0,
    freightRatePerKg: typeof quote.freightRatePerKg === "number" ? quote.freightRatePerKg : 0,
    deliveryFee: typeof quote.deliveryFee === "number" ? quote.deliveryFee : 0,
    installationFee: typeof quote.installationFee === "number" ? quote.installationFee : 0,
    extraDiscount: typeof quote.extraDiscount === "number" ? quote.extraDiscount : 0,
    depositRate: typeof quote.depositRate === "number" ? quote.depositRate : 30,
    factoryStatement: typeof quote.factoryStatement === "string" ? quote.factoryStatement : defaultQuote.factoryStatement,
    lines: lines ?? [],
  };
}

function isQuoteSnapshot(value: unknown): value is QuoteSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<QuoteSnapshot>;
  const totals = snapshot.totals as Partial<QuoteTotals> | undefined;
  return Boolean(
    typeof snapshot.id === "string" &&
      typeof snapshot.savedAt === "string" &&
      normalizeQuoteDraft(snapshot.quote) &&
      totals &&
      typeof totals.itemsSubtotal === "number" &&
      typeof totals.fees === "number" &&
      typeof totals.discount === "number" &&
      typeof totals.subtotal === "number" &&
      typeof totals.tax === "number" &&
      typeof totals.total === "number" &&
      typeof totals.deposit === "number" &&
      typeof totals.balance === "number" &&
      (totals.totalWeight === undefined || typeof totals.totalWeight === "number"),
  );
}

function normalizeQuoteSnapshot(value: unknown): QuoteSnapshot | null {
  if (!isQuoteSnapshot(value)) return null;
  return {
    ...value,
    kind: value.kind === "generated" ? "generated" : "manual",
    workflowStage: value.workflowStage === "warehouse" || value.workflowStage === "generated" ? value.workflowStage : "demand",
    pricingRuleId: typeof value.pricingRuleId === "string" ? value.pricingRuleId : "",
    customerOwnerKey: typeof value.customerOwnerKey === "string" ? value.customerOwnerKey : "",
    customerOwner: normalizeCustomerOwnerRecord(value.customerOwner),
    quote: normalizeQuoteDraft(value.quote) ?? defaultQuote,
    totals: { ...value.totals, totalWeight: value.totals.totalWeight ?? 0, totalVolume: value.totals.totalVolume ?? 0 },
  };
}

function normalizeCustomerTier(value: unknown): CustomerTier {
  return value === "A" || value === "B" || value === "C" ? value : "B";
}

function normalizeCustomerFollowStatus(value: unknown): CustomerFollowStatus {
  return value === "new" || value === "following" || value === "quoted" || value === "won" || value === "paused" ? value : "following";
}

function normalizeCustomerLeadSource(value: unknown): CustomerLeadSource {
  return value === "manual" || value === "meta" || value === "website" || value === "referral" || value === "other" ? value : "manual";
}

function normalizeCustomerOwnerRecord(value: unknown): CustomerOwnerRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<CustomerOwnerRecord>;
  if (
    typeof record.id !== "string" ||
    typeof record.country !== "string" ||
    typeof record.phone !== "string" ||
    typeof record.client !== "string" ||
    typeof record.clientContact !== "string" ||
    typeof record.owner !== "string" ||
    typeof record.ownerContact !== "string" ||
    typeof record.createdAt !== "string" ||
    typeof record.note !== "string"
  ) {
    return null;
  }
  return {
    id: record.id,
    country: record.country,
    phone: record.phone,
    client: record.client,
    clientContact: record.clientContact,
    ownerAccountId: typeof record.ownerAccountId === "string" ? record.ownerAccountId : "",
    owner: record.owner,
    ownerContact: record.ownerContact,
    createdAt: record.createdAt,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : record.createdAt,
    tier: normalizeCustomerTier(record.tier),
    followStatus: normalizeCustomerFollowStatus(record.followStatus),
    leadSource: normalizeCustomerLeadSource(record.leadSource),
    note: record.note,
    privateNote: typeof record.privateNote === "string" ? record.privateNote : "",
    nextFollowUpDate: typeof record.nextFollowUpDate === "string" ? record.nextFollowUpDate : "",
    quoteCount: typeof record.quoteCount === "number" ? record.quoteCount : 0,
    lastQuotedAt: typeof record.lastQuotedAt === "string" ? record.lastQuotedAt : "",
    lastQuoteNo: typeof record.lastQuoteNo === "string" ? record.lastQuoteNo : "",
    lastQuoteTotal: typeof record.lastQuoteTotal === "number" ? record.lastQuoteTotal : 0,
  };
}

const countryOwnerAliases: Record<string, string> = {
  america: "us",
  australia: "au",
  canada: "ca",
  china: "cn",
  cn: "cn",
  deutschland: "de",
  dubai: "ae",
  france: "fr",
  germany: "de",
  hongkong: "hk",
  hk: "hk",
  ksa: "sa",
  saudi: "sa",
  saudiarabia: "sa",
  singapore: "sg",
  uae: "ae",
  uk: "gb",
  unitedarabemirates: "ae",
  unitedkingdom: "gb",
  unitedstates: "us",
  unitedstatesofamerica: "us",
  us: "us",
  usa: "us",
  中国: "cn",
  中国大陆: "cn",
  内地: "cn",
  大陆: "cn",
  美国: "us",
  英国: "gb",
  阿联酋: "ae",
  迪拜: "ae",
  沙特: "sa",
  澳大利亚: "au",
  新加坡: "sg",
  香港: "hk",
};

const countryDialingCodes: Record<string, string> = {
  ae: "971",
  au: "61",
  ca: "1",
  cn: "86",
  de: "49",
  fr: "33",
  gb: "44",
  hk: "852",
  sa: "966",
  sg: "65",
  us: "1",
};

function normalizeCountryForOwner(country: string) {
  const normalized = country.trim().toLowerCase().replace(/[\s._-]+/g, "");
  return countryOwnerAliases[normalized] ?? normalized;
}

function normalizePhoneForOwner(country: string, phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  const countryKey = normalizeCountryForOwner(country);
  const dialingCode = countryDialingCodes[countryKey];
  if (dialingCode && digits.startsWith(dialingCode) && digits.length > dialingCode.length + 6) {
    digits = digits.slice(dialingCode.length);
  }
  return digits.replace(/^0+(?=\d{7,}$)/, "");
}

function normalizeOwnerKey(country: string, phone: string) {
  const normalizedCountry = normalizeCountryForOwner(country);
  const normalizedPhone = normalizePhoneForOwner(country, phone);
  if (!normalizedCountry || !normalizedPhone) return "";
  return `${normalizedCountry}:${normalizedPhone}`;
}

function ownerIdentityLabel(country: string, phone: string) {
  const normalizedCountry = normalizeCountryForOwner(country);
  const normalizedPhone = normalizePhoneForOwner(country, phone);
  if (!normalizedCountry || !normalizedPhone) return "系统识别键：待补国家和电话";
  return `系统识别键：${normalizedCountry.toUpperCase()} / ${normalizedPhone}`;
}

function categoryLabel(category: string) {
  return categoryLabels[category] ? `${categoryLabels[category]} / ${category}` : category;
}

function categoryGroupLabel(category: string) {
  const group = categoryGroups[category];
  if (!group) return `未归类 / ${category || "-"}`;
  return `${group.major} / ${group.minor}`;
}

const pdfCategoryMatchers: Array<{ category: string; patterns: RegExp[] }> = [
  { category: "sofa", patterns: [/\bsofa\b/i, /\bcouch\b/i, /沙发|客厅/] },
  { category: "dining", patterns: [/\bdining\b/i, /\btable\b/i, /\bchair\b/i, /餐桌|餐椅|餐厅/] },
  { category: "mattress", patterns: [/\bmattress\b/i, /床垫|睡眠/] },
  { category: "sleep", patterns: [/\bbed\b/i, /\bbedroom\b/i, /床|卧室|床头柜/] },
  { category: "storage", patterns: [/\bcabinet\b/i, /\bstorage\b/i, /\bwardrobe\b/i, /柜|收纳|衣柜|电视柜/] },
  { category: "outdoor", patterns: [/\boutdoor\b/i, /\bgarden\b/i, /\bterrace\b/i, /户外|庭院|露台/] },
  { category: "custom", patterns: [/\bcustom\b/i, /\binterior\b/i, /\bjoinery\b/i, /定制|全屋|护墙|木作/] },
];

function inferPdfCategory(text: string) {
  return pdfCategoryMatchers.find(({ patterns }) => patterns.some((pattern) => pattern.test(text)))?.category ?? "custom";
}

function pdfTextLines(items: Array<{ str?: string }>) {
  return items
    .map((item) => (typeof item.str === "string" ? item.str.replace(/\s+/g, " ").trim() : ""))
    .filter((line) => line.length > 1);
}

function inferPdfProductName(lines: string[], pageNumber: number) {
  const ignored = /^(meimi(?:&h)?|meimi furniture|catalog(?:ue)?|产品图册|产品目录|page\s*\d+|第\s*\d+\s*页|www\.|https?:\/\/)/i;
  const candidate = lines.find((line) => {
    if (ignored.test(line) || /^\d+$/.test(line) || /^mh-[a-z]{2}-\d+$/i.test(line)) return false;
    if (line.length < 3 || line.length > 90) return false;
    return /[A-Za-z\u4e00-\u9fff]/.test(line);
  });
  return candidate ?? `PDF产品 ${String(pageNumber).padStart(2, "0")}`;
}

function nextSequentialProductCode(entry: Pick<ManagedEntry, "category" | "name" | "type">, usedCodes: Set<string>) {
  const prefix = productCodePrefix(entry);
  let maxNumber = 0;
  usedCodes.forEach((code) => {
    const match = code.match(new RegExp(`^MH-${prefix}-(\\d+)$`));
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  });
  let nextNumber = maxNumber + 1;
  let nextCode = `MH-${prefix}-${String(nextNumber).padStart(3, "0")}`;
  while (usedCodes.has(nextCode)) {
    nextNumber += 1;
    nextCode = `MH-${prefix}-${String(nextNumber).padStart(3, "0")}`;
  }
  usedCodes.add(nextCode);
  return nextCode;
}

function entrySearchText(entry: ManagedEntry) {
  const codeDigits = entry.productCode.replace(/\D/g, "");
  const codePrefix = entry.productCode.match(/^MH-([A-Z]{2})-/)?.[1] ?? "";
  return [
    entry.productCode,
    codeDigits,
    codePrefix,
    ...(codePrefixSearchAliases[codePrefix] ?? []),
    entry.factoryModel,
    entry.name,
    entry.category,
    categoryLabels[entry.category] ?? "",
    ...(categorySearchAliases[entry.category] ?? []),
    entry.tagline,
    entry.warehouseLocation,
    entry.warehouseNote,
    stockStatusLabels[entry.stockStatus],
    entry.type === "studio" ? "空间 方案 案例 studio" : "产品 product",
  ]
    .join(" ")
    .toLowerCase();
}

function entrySearchScore(entry: ManagedEntry, normalizedQuery: string) {
  if (!normalizedQuery) return 0;
  const codeDigits = entry.productCode.replace(/\D/g, "");
  const codePrefix = entry.productCode.match(/^MH-([A-Z]{2})-/)?.[1] ?? "";
  const prefixAliases = (codePrefixSearchAliases[codePrefix] ?? []).join(" ").toLowerCase();
  const categoryText = [entry.category, categoryLabels[entry.category] ?? ""].join(" ").toLowerCase();
  const aliases = (categorySearchAliases[entry.category] ?? []).join(" ").toLowerCase();
  const nameText = [entry.name, entry.factoryModel].join(" ").toLowerCase();
  let score = 0;
  if (entry.productCode.toLowerCase() === normalizedQuery || codeDigits === normalizedQuery) score += 120;
  if (entry.productCode.toLowerCase().includes(normalizedQuery) || codeDigits.includes(normalizedQuery)) score += 95;
  if (nameText.includes(normalizedQuery)) score += 80;
  if (prefixAliases.includes(normalizedQuery)) score += 72;
  if (categoryText.includes(normalizedQuery)) score += 65;
  if (aliases.includes(normalizedQuery)) score += 45;
  if ([entry.tagline, entry.warehouseLocation, entry.warehouseNote].join(" ").toLowerCase().includes(normalizedQuery)) score += 25;
  if (score && entry.visible) score += 5;
  return score;
}

function currency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

function customerOwnerSummary(record?: CustomerOwnerRecord) {
  if (!record) return "未确认客户归属";
  return `${record.owner || "未填销售"} / ${record.tier}类 / ${customerLeadSourceLabels[record.leadSource]} / ${record.country || "-"} / ${record.phone || "-"} / ${record.client || "未填客户"}`;
}

function employeeOwnsCustomer(record: CustomerOwnerRecord, employee: string, accountId = "") {
  if (accountId && record.ownerAccountId) return record.ownerAccountId === accountId;
  return Boolean(employee.trim() && record.owner.trim().toLowerCase() === employee.trim().toLowerCase());
}

function customerRecordTimestamp(record: CustomerOwnerRecord) {
  const value = new Date(record.updatedAt || record.createdAt).getTime();
  return Number.isFinite(value) ? value : 0;
}

function followUpTimestamp(record: CustomerOwnerRecord) {
  if (!record.nextFollowUpDate) return Number.POSITIVE_INFINITY;
  const value = new Date(`${record.nextFollowUpDate}T00:00:00`).getTime();
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function customerFollowUpLabel(record: CustomerOwnerRecord) {
  if (!record.nextFollowUpDate) return "未设置下次跟进";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${record.nextFollowUpDate}T00:00:00`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`;
  if (diffDays === 0) return "今天跟进";
  if (diffDays === 1) return "明天跟进";
  return `${record.nextFollowUpDate} 跟进`;
}

function customerNeedsFollowUp(record: CustomerOwnerRecord) {
  if (!record.nextFollowUpDate || record.followStatus === "won" || record.followStatus === "paused") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${record.nextFollowUpDate}T00:00:00`);
  return Number.isFinite(target.getTime()) && target.getTime() <= today.getTime();
}

function mergeCustomerOwnerRecords(current: CustomerOwnerRecord[], incoming: CustomerOwnerRecord[]) {
  const byKey = new Map<string, CustomerOwnerRecord>();
  current.forEach((record) => byKey.set(normalizeOwnerKey(record.country, record.phone) || record.id, record));
  incoming.forEach((record) => {
    const key = normalizeOwnerKey(record.country, record.phone) || record.id;
    const existing = byKey.get(key);
    if (!existing || customerRecordTimestamp(record) >= customerRecordTimestamp(existing)) byKey.set(key, record);
  });
  return Array.from(byKey.values()).sort((left, right) => customerRecordTimestamp(right) - customerRecordTimestamp(left));
}

function lineTotal(line: QuoteLine) {
  const discount = Math.min(Math.max(line.discount, 0), 100);
  return Math.max(line.quantity, 0) * Math.max(line.unitPrice, 0) * (1 - discount / 100);
}

function lineCostTotal(line: QuoteLine) {
  return Math.max(line.quantity, 0) * Math.max(line.costPrice, 0);
}

function marginRate(profit: number, revenue: number) {
  if (revenue <= 0) return 0;
  return profit / revenue;
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function lineVolume(line: QuoteLine) {
  return (Math.max(line.packageLength, 0) * Math.max(line.packageWidth, 0) * Math.max(line.packageHeight, 0)) / 1000000;
}

function customerSafeLineNote(line: QuoteLine) {
  const note = line.note.trim();
  if (!note || /price requires review|人工核价|内部|管理员|工厂确认/i.test(note)) return "";
  return note;
}

function volume(value: number) {
  return `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 3 }).format(value)} CBM`;
}

function foreignCurrency(value: number, code: CurrencyCode, rates: ExchangeRates) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(value * (rates[code] ?? 0));
}

function converterRate(code: ConverterCurrency, rates: ExchangeRates) {
  return code === "CNY" ? 1 : rates[code] ?? 0;
}

function formatConverterValue(value: number, code: ConverterCurrency) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value) + ` ${code}`;
}

function formatExchangeRateDate(raw?: string) {
  if (!raw) return "未知时间";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 16);
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function containerLoadPercent(plan: ContainerPlan, totals: QuoteTotals) {
  const volumeLoad = plan.volumeCbm > 0 ? totals.totalVolume / plan.volumeCbm : 0;
  const weightLoad = plan.maxWeightKg > 0 ? totals.totalWeight / plan.maxWeightKg : 0;
  return Math.max(volumeLoad, weightLoad) * 100;
}

function containerLoadLabel(plan: ContainerPlan, totals: QuoteTotals) {
  const percent = containerLoadPercent(plan, totals);
  if (!totals.totalVolume && !totals.totalWeight) return "待加入产品";
  if (percent <= 100) return `约占 ${Math.ceil(percent)}%`;
  return `约 ${Math.ceil(percent / 100)} 柜起`;
}

function recommendedContainerPlan(totals: QuoteTotals) {
  if (!totals.totalVolume && !totals.totalWeight) return null;
  return (
    containerPlans.find((plan) => containerLoadPercent(plan, totals) <= 100) ??
    containerPlans[containerPlans.length - 1] ??
    null
  );
}

function quoteIssueAction(issue: DataIssue) {
  const text = `${issue.label} ${issue.detail}`;
  if (/客户需求|需求|公式|模式/.test(text)) return { label: "去报价流程", targetId: "quote-workflow" };
  if (/归属|客户|报价员|地区|国家|城市|电话/.test(text)) return { label: "去客户池", targetId: "customer-pool" };
  if (/物流|CBM|KG|重量|包装/.test(text)) return { label: "去物流", targetId: "exchange-logistics" };
  if (/明细|产品|单价|数量|折扣|规格|人工核价|毛利|底价|成本/.test(text)) return { label: "去报价明细", targetId: "quote-lines" };
  return { label: "去补资料", targetId: "quote-workflow" };
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function parseVariables(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function calculateExpression(expression: string, variables: Record<string, number>) {
  const tokens = expression.match(/[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|[()+\-*/]/g);
  if (!tokens || tokens.join("").replace(/\s/g, "") !== expression.replace(/\s/g, "")) return null;
  const output: string[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
  let parenthesisDepth = 0;
  let invalidParentheses = false;
  tokens.forEach((token) => {
    if (/^\d/.test(token) || /^[A-Za-z_]/.test(token)) {
      output.push(token);
    } else if (token in precedence) {
      while (operators.length && precedence[operators[operators.length - 1]] >= precedence[token]) output.push(operators.pop() ?? "");
      operators.push(token);
    } else if (token === "(") {
      parenthesisDepth += 1;
      operators.push(token);
    } else if (token === ")") {
      if (parenthesisDepth === 0) {
        invalidParentheses = true;
        return;
      }
      parenthesisDepth -= 1;
      while (operators.length && operators[operators.length - 1] !== "(") output.push(operators.pop() ?? "");
      operators.pop();
    }
  });
  if (invalidParentheses || parenthesisDepth !== 0) return null;
  while (operators.length) output.push(operators.pop() ?? "");
  const stack: number[] = [];
  output.forEach((token) => {
    if (token in precedence) {
      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) return;
      if (token === "+") stack.push(left + right);
      if (token === "-") stack.push(left - right);
      if (token === "*") stack.push(left * right);
      if (token === "/") stack.push(right === 0 ? 0 : left / right);
      return;
    }
    stack.push(/^\d/.test(token) ? Number(token) : variables[token] ?? 0);
  });
  return stack.length === 1 && Number.isFinite(stack[0]) ? Math.max(stack[0], 0) : null;
}

function validatePricingRule(rule: PricingRule) {
  if (rule.method === "manual-review") return "人工核价规则不自动计算。";
  if (!rule.expression.trim()) return "缺少表达式。";
  const names = rule.expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  const unknown = names.filter((name) => !rule.variables.includes(name));
  if (unknown.length) return `表达式包含未登记变量：${unknown.join(", ")}`;
  if (calculateExpression(rule.expression, Object.fromEntries(rule.variables.map((variable) => [variable, 1]))) === null) {
    return "表达式无法计算，请检查括号或运算符。";
  }
  return "公式自检通过。";
}

function pricingRuleIsValid(rule: PricingRule) {
  return validatePricingRule(rule) === "公式自检通过。" || rule.method === "manual-review";
}

function nextAvailableProductCode(entry: ManagedEntry, usedCodes: Set<string>) {
  const prefix = productCodePrefix(entry);
  let index = 1;
  let nextCode = `MH-${prefix}-${String(index).padStart(3, "0")}`;
  while (usedCodes.has(nextCode)) {
    index += 1;
    nextCode = `MH-${prefix}-${String(index).padStart(3, "0")}`;
  }
  usedCodes.add(nextCode);
  return nextCode;
}

function normalizeCatalogueCodes(entries: ManagedEntry[]) {
  const firstCodeOwner = new Map<string, string>();
  entries.forEach((entry) => {
    const code = entry.productCode.trim().toUpperCase();
    if (PRODUCT_CODE_PATTERN.test(code) && !firstCodeOwner.has(code)) firstCodeOwner.set(code, entry.id);
  });

  const reservedCodes = new Set(firstCodeOwner.keys());
  const usedCodes = new Set<string>();
  let repairedCount = 0;
  const normalizedEntries = entries.map((entry) => {
    const code = entry.productCode.trim().toUpperCase();
    if (PRODUCT_CODE_PATTERN.test(code) && firstCodeOwner.get(code) === entry.id) {
      usedCodes.add(code);
      return { ...entry, productCode: code };
    }
    const nextCode = nextAvailableProductCode(entry, new Set([...reservedCodes, ...usedCodes]));
    usedCodes.add(nextCode);
    repairedCount += 1;
    return { ...entry, productCode: nextCode };
  });

  return { entries: normalizedEntries, repairedCount };
}

function buildDataIssues(entries: ManagedEntry[], pricingRules: PricingRule[], quote: QuoteDraft): DataIssue[] {
  const issues: DataIssue[] = [];
  const codeCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    const code = entry.productCode.trim().toUpperCase();
    counts[code] = (counts[code] ?? 0) + 1;
    return counts;
  }, {});
  Object.entries(codeCounts)
    .filter(([code, count]) => Boolean(code) && count > 1)
    .forEach(([code, count]) => issues.push({ level: "error", label: "产品编号重复", detail: `${code} 出现 ${count} 次` }));

  entries.forEach((entry) => {
    if (!PRODUCT_CODE_PATTERN.test(entry.productCode)) {
      issues.push({ level: "warning", label: "编号格式异常", detail: `${entry.name} / ${entry.productCode || "空编号"}` });
    }
    if (!entry.image.trim()) {
      issues.push({ level: "error", label: "缺少报价图片", detail: `${entry.productCode} / ${entry.name}` });
    }
    if (!pricingRules.some((rule) => rule.id === entry.pricingRuleId)) {
      issues.push({ level: "error", label: "产品公式丢失", detail: `${entry.productCode} / ${entry.name}` });
    }
    if (entry.visible && entry.stockStatus === "unavailable") {
      issues.push({ level: "warning", label: "上架产品暂不可用", detail: `${entry.productCode} / ${entry.name}` });
    }
  });

  pricingRules.forEach((rule) => {
    if (!pricingRuleIsValid(rule)) {
      issues.push({ level: "error", label: "公式自检失败", detail: `${rule.name}：${validatePricingRule(rule)}` });
    }
  });

  quote.lines.forEach((line) => {
    const linkedEntry = entries.some((entry) => entry.id === line.entryId);
    if (!linkedEntry) issues.push({ level: "warning", label: "报价明细已脱离产品库", detail: `${line.productCode || "-"} / ${line.name}` });
    const rule = pricingRules.find((item) => item.id === line.pricingRuleId);
    if (!rule) issues.push({ level: "error", label: "报价明细公式丢失", detail: `${line.productCode || "-"} / ${line.name}` });
    if (rule?.method === "manual-review") issues.push({ level: "warning", label: "需要人工核价", detail: `${line.productCode || "-"} / ${line.name}` });
  });

  if (!quote.quoteNo.trim()) issues.push({ level: "error", label: "报价编号为空", detail: "请先填写 Quote No." });
  if (quote.lines.length > 0 && !quote.client.trim()) issues.push({ level: "warning", label: "报价缺少客户名称", detail: quote.quoteNo });
  if (quote.lines.length > 0 && (!quote.country.trim() || !quote.city.trim())) {
    issues.push({ level: "warning", label: "报价缺少地区信息", detail: "国家和城市会影响后续物流测算" });
  }

  return issues;
}

function buildQuoteReadinessIssues(quote: QuoteDraft, pricingRules: PricingRule[]): DataIssue[] {
  const issues: DataIssue[] = [];
  if (!quote.quoteNo.trim()) issues.push({ level: "error", label: "缺少报价编号", detail: "请先填写 Quote No." });
  if (!quote.quoteDate.trim()) issues.push({ level: "warning", label: "缺少报价日期", detail: "请填写报价生成日期" });
  if (!quote.employee.trim()) issues.push({ level: "warning", label: "缺少报价员", detail: "请填写报价员姓名" });
  if (!quote.customerDemand.trim()) issues.push({ level: "warning", label: "缺少客户需求", detail: "第一步请记录客户需求和报价口径" });
  if (!quote.lines.length) issues.push({ level: "error", label: "报价明细为空", detail: "请至少按产品编号加入 1 个产品" });
  if (quote.lines.length && !quote.client.trim()) issues.push({ level: "warning", label: "缺少客户名称", detail: "导出后不方便追踪客户" });
  if (quote.lines.length && !quote.clientContact.trim()) issues.push({ level: "warning", label: "缺少客户联系人", detail: "请填写客户联系人或采购负责人" });
  if (quote.lines.length && (!quote.country.trim() || !quote.city.trim())) {
    issues.push({ level: "warning", label: "缺少目的地区", detail: "国家和城市会影响后续物流、安装与税费测算" });
  }
  if (quote.lines.length && !quote.logisticsMode.trim()) {
    issues.push({ level: "warning", label: "缺少物流渠道", detail: "请填写海运、陆运、空运或客户自提等物流口径" });
  }
  if (quote.lines.length && quote.deliveryFee <= 0 && quote.freightBaseFee <= 0 && quote.freightRatePerCbm <= 0 && quote.freightRatePerKg <= 0) {
    issues.push({ level: "warning", label: "缺少物流估算", detail: "请填写物流费或设置 CBM/KG 估算单价" });
  }
  [
    ["物流费", quote.deliveryFee],
    ["安装费", quote.installationFee],
    ["整单优惠", quote.extraDiscount],
    ["物流基础费", quote.freightBaseFee],
    ["CBM单价", quote.freightRatePerCbm],
    ["KG单价", quote.freightRatePerKg],
  ].forEach(([label, value]) => {
    if (Number(value) < 0) issues.push({ level: "error", label: "费用不能为负", detail: String(label) });
  });
  if (quote.depositRate < 0 || quote.depositRate > 100) {
    issues.push({ level: "error", label: "定金比例异常", detail: "定金比例需要在 0-100 之间" });
  }
  quote.lines.forEach((line) => {
    const rule = pricingRules.find((item) => item.id === line.pricingRuleId);
    if (!rule) issues.push({ level: "error", label: "明细公式丢失", detail: `${line.productCode || "-"} / ${line.name}` });
    if (rule?.method === "manual-review") issues.push({ level: "warning", label: "人工核价未确认", detail: `${line.productCode || "-"} / ${line.name}` });
    if (line.unitPrice <= 0) issues.push({ level: "error", label: "单价未确认", detail: `${line.productCode || "-"} / ${line.name}` });
    if (line.quantity <= 0) issues.push({ level: "error", label: "数量异常", detail: `${line.productCode || "-"} / ${line.name}` });
    if (line.costPrice > 0 && lineTotal(line) < lineCostTotal(line)) issues.push({ level: "error", label: "低于内部底价", detail: `${line.productCode || "-"} / ${line.name}` });
    if (line.costPrice > 0 && lineTotal(line) >= lineCostTotal(line) && marginRate(lineTotal(line) - lineCostTotal(line), lineTotal(line)) < 0.15) {
      issues.push({ level: "warning", label: "毛利偏低", detail: `${line.productCode || "-"} / ${line.name}` });
    }
    if (line.discount < 0 || line.discount > 100) issues.push({ level: "error", label: "明细折扣异常", detail: `${line.productCode || "-"} / ${line.name}` });
    if (line.stockStatus === "unavailable") issues.push({ level: "error", label: "产品暂不可用", detail: `${line.productCode || "-"} / ${line.name}` });
    if (!line.spec.trim()) issues.push({ level: "warning", label: "缺少规格", detail: `${line.productCode || "-"} / ${line.name}` });
    if (!(line.material || "").trim()) issues.push({ level: "warning", label: "缺少材质", detail: `${line.productCode || "-"} / ${line.name}` });
    if (line.weight <= 0) issues.push({ level: "warning", label: "缺少重量", detail: `${line.productCode || "-"} / ${line.name}` });
    if (line.packageLength <= 0 || line.packageWidth <= 0 || line.packageHeight <= 0) {
      issues.push({ level: "warning", label: "缺少包装尺寸", detail: `${line.productCode || "-"} / ${line.name}` });
    }
  });
  if (!quote.factoryStatement.trim()) issues.push({ level: "warning", label: "缺少工厂声明", detail: "第三步生成报价单需要保留工厂声明" });
  return issues;
}

function buildCustomerQuoteText(quote: QuoteDraft, totals: QuoteTotals) {
  const header = [
    "MEIMI&H 报价单",
    `报价编号：${quote.quoteNo || "-"} / V${quote.version}`,
    `报价日期：${quote.quoteDate || "-"}`,
    `报价人：${quote.employee || "-"}${quote.contact ? ` / ${quote.contact}` : ""}`,
    `客户：${quote.client || "-"}`,
    `联系人：${quote.clientContact || "-"}`,
    `国家/城市：${[quote.country, quote.city].filter(Boolean).join(" / ") || "-"}`,
    `项目：${quote.project || "-"}`,
    `有效期：${quote.validUntil || "-"}`,
  ];
  const clientInfo = [
    quote.clientPhone ? `客户电话：${quote.clientPhone}` : "",
    quote.clientEmail ? `客户邮箱：${quote.clientEmail}` : "",
    quote.clientAddress ? `客户地址：${quote.clientAddress}` : "",
    quote.customerDemand ? `客户需求：${quote.customerDemand}` : "",
  ].filter(Boolean);
  const lines = quote.lines.map((line, index) =>
    [
      `${index + 1}. ${line.productCode || "-"} ${line.name}`,
      line.spec ? `规格：${line.spec}` : "规格：待确认",
      line.material ? `材质：${line.material}` : "材质：待确认",
      `供应状态：${stockStatusLabels[line.stockStatus]}`,
      `重量：${line.weight || 0} kg`,
      `包装：${line.packageLength || 0} x ${line.packageWidth || 0} x ${line.packageHeight || 0} cm`,
      `体积：${volume(lineVolume(line))}`,
      `数量：${line.quantity}`,
      `单价：${currency(line.unitPrice)}`,
      line.discount ? `折扣：${line.discount}%` : "",
      `小计：${currency(lineTotal(line))}`,
      customerSafeLineNote(line) ? `备注：${customerSafeLineNote(line)}` : "",
    ]
      .filter(Boolean)
      .join(" | "),
  );
  const footer = [
    `产品小计：${currency(totals.itemsSubtotal)}`,
    `物流与安装：${currency(totals.fees)}`,
    `整单优惠：-${currency(totals.discount)}`,
    `总重量：${totals.totalWeight} kg`,
    `总体积：${volume(totals.totalVolume)}`,
    `物流渠道：${quote.logisticsMode}`,
    `合计：${currency(totals.total)}`,
    `建议定金：${currency(totals.deposit)}`,
    `预计尾款：${currency(totals.balance)}`,
    `交付周期：${quote.leadTime}`,
    `付款条款：${quote.paymentTerms}`,
    quote.remarks ? `报价备注：${quote.remarks}` : "",
    quote.factoryStatement,
  ].filter(Boolean);
  return [...header, ...clientInfo, "", "产品明细", ...lines, "", "费用与条款", ...footer].join("\n");
}

function buildWarehousePickListText(quote: QuoteDraft, totals: QuoteTotals) {
  const header = [
    "MEIMI&H 内部备货/核仓清单",
    `报价编号：${quote.quoteNo || "-"} / V${quote.version}`,
    `报价日期：${quote.quoteDate || "-"}`,
    `报价员：${quote.employee || "-"}${quote.contact ? ` / ${quote.contact}` : ""}`,
    `客户：${quote.client || "-"} / ${quote.clientContact || "-"}`,
    `目的地：${[quote.country, quote.city].filter(Boolean).join(" / ") || "-"}`,
    `物流口径：${quote.logisticsMode || "-"}`,
  ];
  const lines = quote.lines.map((line, index) =>
    [
      `${index + 1}. ${line.productCode || "-"} ${line.name}`,
      line.factoryModel ? `工厂型号：${line.factoryModel}` : "",
      `数量：${line.quantity}`,
      line.costPrice > 0 ? `内部成本：${currency(line.costPrice)}` : "",
      `仓库：${stockStatusLabels[line.stockStatus]} / ${line.warehouseLocation || "-"}`,
      line.spec ? `规格：${line.spec}` : "规格：待确认",
      line.material ? `材质：${line.material}` : "材质：待确认",
      `单件重量：${line.weight || 0} kg`,
      `包装：${line.packageLength || 0} x ${line.packageWidth || 0} x ${line.packageHeight || 0} cm`,
      `小计体积：${volume(lineVolume(line) * Math.max(line.quantity, 0))}`,
      line.warehouseNote ? `仓库备注：${line.warehouseNote}` : "",
      line.note ? `报价备注：${line.note}` : "",
    ]
      .filter(Boolean)
      .join(" | "),
  );
  const footer = [
    `合计数量：${quote.lines.reduce((sum, line) => sum + Math.max(line.quantity, 0), 0)}`,
    `总重量：${totals.totalWeight} kg`,
    `总体积：${volume(totals.totalVolume)}`,
    "请仓库/采购复核库存、包装尺寸、出货重量和特殊备注后再确认最终交期。",
  ];
  return [...header, "", "产品清单", ...lines, "", "仓库复核", ...footer].join("\n");
}

type AdminConsoleProps = {
  initialEntries: ManagedEntry[];
  session: AuthSession;
  adminSyncKey: string;
  staffSyncKey: string;
  salesAccounts: StaffAccount[];
  onUpdateSalesAccount: (id: string, patch: Partial<Pick<StaffAccount, "permissions" | "active">>) => void;
  onDeleteSalesAccount: (id: string) => void;
  onLogout: () => void;
};

type PdfImportState = {
  phase: "idle" | "reading" | "done" | "error";
  fileName: string;
  message: string;
  importedCount: number;
};

export default function AdminConsole({ initialEntries, session, adminSyncKey, staffSyncKey, salesAccounts, onUpdateSalesAccount, onDeleteSalesAccount, onLogout }: AdminConsoleProps) {
  const adminUnlocked = session.role === "admin";
  const quoteStorageKey = `${QUOTE_STORAGE_KEY}:${session.accountId}`;
  const legacyQuoteStorageKey = session.role === "admin" ? LEGACY_QUOTE_STORAGE_KEY : "";
  const workflowPricingStorageKey = `${WORKFLOW_PRICING_STORAGE_KEY}:${session.accountId}`;
  const workflowStageStorageKey = `${WORKFLOW_STAGE_STORAGE_KEY}:${session.accountId}`;
  const [entries, setEntries] = useState(initialEntries);
  const [pricingRules, setPricingRules] = useState(defaultPricingRules);
  const [quote, setQuote] = useState<QuoteDraft>(() => ({ ...defaultQuote, employee: session.role === "sales" ? session.name : "" }));
  const [quoteHistory, setQuoteHistory] = useState<QuoteSnapshot[]>([]);
  const [customerOwners, setCustomerOwners] = useState<CustomerOwnerRecord[]>([]);
  const [pricingSamples, setPricingSamples] = useState<Record<string, Record<string, number>>>({});
  const [quoteWorkflowStage, setQuoteWorkflowStage] = useState<QuoteWorkflowStage>("demand");
  const [quoteWorkspaceView, setQuoteWorkspaceView] = useState<"customer" | "archive">("customer");
  const [activeModule, setActiveModule] = useState<ActiveModule>("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quoteDetailsOpen, setQuoteDetailsOpen] = useState(false);
  const [workflowPricingRuleId, setWorkflowPricingRuleId] = useState(defaultPricingRules[0].id);
  const [ownerLookup, setOwnerLookup] = useState({ country: "", phone: "" });
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [customerTierFilter, setCustomerTierFilter] = useState<"all" | CustomerTier>("all");
  const [customerFollowFilter, setCustomerFollowFilter] = useState<"all" | "due">("all");
  const [customerStatusFilter, setCustomerStatusFilter] = useState<"all" | CustomerFollowStatus>("all");
  const [customerLeadSourceFilter, setCustomerLeadSourceFilter] = useState<"all" | CustomerLeadSource>("all");
  const [newCustomerTier, setNewCustomerTier] = useState<CustomerTier>("B");
  const [newCustomerLeadSource, setNewCustomerLeadSource] = useState<CustomerLeadSource>("manual");
  const [expandedCustomerId, setExpandedCustomerId] = useState("");
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [quoteHistoryQuery, setQuoteHistoryQuery] = useState("");
  const [query, setQuery] = useState("");
  const [productCodeInput, setProductCodeInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedEntryId, setSelectedEntryId] = useState(initialEntries[0]?.id ?? "");
  const [expandedEntryId, setExpandedEntryId] = useState("");
  const [type, setType] = useState<"all" | ManagedEntry["type"]>("all");
  const [onlyVisible, setOnlyVisible] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(fallbackExchangeRates);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");
  const [exchangeAmount, setExchangeAmount] = useState("1");
  const [exchangeFrom, setExchangeFrom] = useState<ConverterCurrency>("USD");
  const [exchangeTo, setExchangeTo] = useState<ConverterCurrency>("EUR");
  const [exchangeRateDate, setExchangeRateDate] = useState("离线参考");
  const [exchangeRateStatus, setExchangeRateStatus] = useState("正在获取今日汇率");
  const [isRefreshingExchangeRates, setIsRefreshingExchangeRates] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("正在读取本地资料");
  const [sharedSyncReady, setSharedSyncReady] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState("正在连接云端资料");
  const [isOnline, setIsOnline] = useState(true);
  const [cloudSyncPending, setCloudSyncPending] = useState(false);
  const [customerOwnerCloudReady, setCustomerOwnerCloudReady] = useState(false);
  const [pendingCustomerOwnerVersion, setPendingCustomerOwnerVersion] = useState(0);
  const [pendingCustomerOwnerCount, setPendingCustomerOwnerCount] = useState(0);
  const [isRefreshingSharedWorkspace, setIsRefreshingSharedWorkspace] = useState(false);
  const cloudVersionRef = useRef<number | null>(null);
  const cloudSyncInFlightRef = useRef(false);
  const sharedWorkspaceRefreshInFlightRef = useRef(false);
  const [pdfDropActive, setPdfDropActive] = useState(false);
  const [pdfImportState, setPdfImportState] = useState<PdfImportState>({ phase: "idle", fileName: "", message: "等待导入产品图册", importedCount: 0 });
  const [status, setStatus] = useState(`已进入${session.role === "admin" ? "管理员" : "销售"}版：${session.name}`);
  const customerOwnerSyncKey = adminUnlocked ? adminSyncKey : staffSyncKey;
  const canAccessModule = useCallback((module: ActiveModule) => {
    if (module === "home" || module === "admin") return module === "home" || adminUnlocked;
    if (module === "products") {
      return adminUnlocked || session.permissions.includes("products") || session.permissions.includes("search");
    }
    return adminUnlocked || session.permissions.includes(module as PermissionKey);
  }, [adminUnlocked, session.permissions]);

  useEffect(() => {
    const validModules: ActiveModule[] = ["home", "customers", "quote", "products", "search", "logistics", "admin"];
    const readHash = () => {
      const hash = window.location.hash.replace(/^#/, "") as ActiveModule;
      const requestedModule = hash === "search" ? "products" : hash;
      if (validModules.includes(hash) && (requestedModule === "home" || canAccessModule(requestedModule))) {
        setActiveModule(requestedModule);
        if (hash === "search") window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#products`);
      }
      else {
        setActiveModule("home");
        if (hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [canAccessModule]);

  useEffect(() => {
    const storedSidebarState = localStorage.getItem("meimi-admin-sidebar-collapsed");
    if (storedSidebarState === "true") setSidebarCollapsed(true);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setExpandedEntryId("");
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (storageReady) localStorage.setItem("meimi-admin-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed, storageReady]);

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine);
    updateOnlineState();
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    void navigator.storage?.persist?.().catch(() => false);
    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const persistLocalData = useCallback(() => {
    localStorage.setItem(CATALOGUE_STORAGE_KEY, JSON.stringify(entries));
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricingRules));
    localStorage.setItem(workflowPricingStorageKey, workflowPricingRuleId);
    localStorage.setItem(workflowStageStorageKey, quoteWorkflowStage);
    localStorage.setItem(quoteStorageKey, JSON.stringify(quote));
    localStorage.setItem(QUOTE_HISTORY_STORAGE_KEY, JSON.stringify(quoteHistory));
    localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(customerOwners));
    const savedAt = new Date().toISOString();
    setLastSavedAt(savedAt);
    return savedAt;
  }, [customerOwners, entries, pricingRules, quote, quoteHistory, quoteStorageKey, quoteWorkflowStage, workflowPricingStorageKey, workflowPricingRuleId, workflowStageStorageKey]);

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(CATALOGUE_STORAGE_KEY) ?? localStorage.getItem(LEGACY_CATALOGUE_STORAGE_KEY);
      const storedQuote = localStorage.getItem(quoteStorageKey) ?? (session.role === "admin" ? localStorage.getItem(QUOTE_STORAGE_KEY) : null) ?? (legacyQuoteStorageKey ? localStorage.getItem(legacyQuoteStorageKey) : null);
      const storedHistory = localStorage.getItem(QUOTE_HISTORY_STORAGE_KEY);
      const storedRules = localStorage.getItem(PRICING_STORAGE_KEY);
      const storedWorkflowPricingRuleId = localStorage.getItem(workflowPricingStorageKey) ?? (session.role === "admin" ? localStorage.getItem(WORKFLOW_PRICING_STORAGE_KEY) : null);
      const storedWorkflowStage = localStorage.getItem(workflowStageStorageKey) ?? (session.role === "admin" ? localStorage.getItem(WORKFLOW_STAGE_STORAGE_KEY) : null);
      const storedCustomerOwners = localStorage.getItem(CUSTOMER_OWNER_STORAGE_KEY);
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries) as unknown;
        if (Array.isArray(parsedEntries)) {
          const normalizedEntries = parsedEntries.map(normalizeEntry).filter((entry): entry is ManagedEntry => Boolean(entry));
          if (normalizedEntries.length) {
            setEntries(normalizedEntries);
            setSelectedEntryId(normalizedEntries[0].id);
          }
        }
      }
      if (storedRules) {
        const parsedRules = JSON.parse(storedRules) as unknown;
        if (Array.isArray(parsedRules) && parsedRules.every(isPricingRule)) {
          setPricingRules(parsedRules);
          if (storedWorkflowPricingRuleId && parsedRules.some((rule) => rule.id === storedWorkflowPricingRuleId)) {
            setWorkflowPricingRuleId(storedWorkflowPricingRuleId);
          }
        }
      } else if (storedWorkflowPricingRuleId && defaultPricingRules.some((rule) => rule.id === storedWorkflowPricingRuleId)) {
        setWorkflowPricingRuleId(storedWorkflowPricingRuleId);
      }
      if (storedQuote) {
        const parsedQuote = JSON.parse(storedQuote) as unknown;
        const normalizedQuote = normalizeQuoteDraft(parsedQuote);
        if (normalizedQuote) {
          const scopedQuote = session.role === "sales" ? { ...normalizedQuote, employee: session.name } : normalizedQuote;
          setQuote(scopedQuote);
          setOwnerLookup({ country: scopedQuote.country, phone: scopedQuote.clientPhone });
          const restoredStage = storedWorkflowStage === "warehouse" || storedWorkflowStage === "generated" || storedWorkflowStage === "demand"
            ? storedWorkflowStage
            : scopedQuote.lines.length ? "warehouse" : "demand";
          setQuoteWorkflowStage(scopedQuote.generatedAt ? "generated" : restoredStage === "generated" ? "warehouse" : restoredStage);
          if (scopedQuote.lines[0]?.pricingRuleId) setWorkflowPricingRuleId(scopedQuote.lines[0].pricingRuleId);
        }
      }
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory) as unknown;
        if (Array.isArray(parsedHistory)) {
          const normalizedHistory = parsedHistory.map(normalizeQuoteSnapshot).filter((snapshot): snapshot is QuoteSnapshot => Boolean(snapshot));
          if (normalizedHistory.length) setQuoteHistory(normalizedHistory);
        }
      }
      if (storedCustomerOwners) {
        const parsedOwners = JSON.parse(storedCustomerOwners) as unknown;
        if (Array.isArray(parsedOwners)) {
          const normalizedOwners = parsedOwners.map(normalizeCustomerOwnerRecord).filter((record): record is CustomerOwnerRecord => Boolean(record));
          if (normalizedOwners.length) setCustomerOwners(normalizedOwners);
        }
      }
    } catch {
      setStatus("本地缓存读取失败，已使用代码中的默认资料");
    } finally {
      setStorageReady(true);
      setPendingCustomerOwnerCount(readPendingCustomerOwnerCount());
      setAutoSaveStatus("本地资料已读取，后续修改会自动保存");
    }
  }, [legacyQuoteStorageKey, quoteStorageKey, session.name, session.role, workflowPricingStorageKey, workflowStageStorageKey]);

  useEffect(() => {
    if (!storageReady || !isOnline || !customerOwnerSyncKey) return undefined;
    let cancelled = false;
    void fetchSharedCustomerOwners(customerOwnerSyncKey).then((records) => {
      if (cancelled) return;
      const normalized = records.map(normalizeCustomerOwnerRecord).filter((record): record is CustomerOwnerRecord => Boolean(record));
      const pending = adminUnlocked ? [] : readPendingCustomerOwners();
      const merged = dedupeCustomerOwnerRecords([...normalized, ...pending]);
      setCustomerOwners((current) => merged.map((record) => ({
        ...record,
        privateNote: current.find((item) => item.id === record.id)?.privateNote ?? record.privateNote,
      })));
      setCustomerOwnerCloudReady(true);
      setStatus(`已读取 ${normalized.length} 条云端客户归属${pending.length ? `，保留 ${pending.length} 条待同步客户` : ""}`);
    }).catch(() => {
      if (!cancelled) setStatus("客户归属云端暂时无法读取，当前继续使用本机资料");
    });
    return () => { cancelled = true; };
  }, [adminUnlocked, customerOwnerSyncKey, isOnline, storageReady]);

  useEffect(() => {
    if (adminUnlocked || !isOnline || !staffSyncKey) return undefined;
    let pending: CustomerOwnerRecord[] = [];
    try {
      const stored = localStorage.getItem(CUSTOMER_OWNER_PENDING_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) as unknown : [];
      if (Array.isArray(parsed)) pending = dedupeCustomerOwnerRecords(parsed.map(normalizeCustomerOwnerRecord).filter((record): record is CustomerOwnerRecord => Boolean(record)));
    } catch { return undefined; }
    if (!pending.length) return undefined;
    let cancelled = false;
    void Promise.allSettled(pending.map((record) => publishCustomerOwner(staffSyncKey, normalizeOwnerKey(record.country, record.phone), record))).then((results) => {
      if (cancelled) return;
      const conflictedKeys = new Set<string>();
      const conflicts = results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected" && isCustomerOwnerConflict(result.reason))
        .map((result, index) => {
          conflictedKeys.add(normalizeOwnerKey(pending[index].country, pending[index].phone));
          return customerOwnerConflictMessage(result.reason);
        });
      const failed = pending.filter((_, index) => {
        const result = results[index];
        return result?.status === "rejected" && !isCustomerOwnerConflict(result.reason);
      });
      if (failed.length) localStorage.setItem(CUSTOMER_OWNER_PENDING_STORAGE_KEY, JSON.stringify(failed));
      else localStorage.removeItem(CUSTOMER_OWNER_PENDING_STORAGE_KEY);
      setPendingCustomerOwnerCount(failed.length);
      if (conflictedKeys.size) {
        setCustomerOwners((current) => {
          const next = current.filter((record) => !conflictedKeys.has(normalizeOwnerKey(record.country, record.phone)));
          localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      }
      if (conflicts.length) setStatus(conflicts[0]);
      else setStatus(failed.length ? `还有 ${failed.length} 条客户归属等待同步` : `已补同步 ${pending.length} 条客户归属`);
    });
    return () => { cancelled = true; };
  }, [adminUnlocked, isOnline, pendingCustomerOwnerVersion, staffSyncKey]);

  useEffect(() => {
    if (!adminUnlocked || !customerOwnerCloudReady || !customerOwnerSyncKey) return undefined;
    const timer = window.setTimeout(() => {
      const records = customerOwners.map((record) => {
        const { privateNote, ...sharedRecord } = record;
        void privateNote;
        return { ownerKey: normalizeOwnerKey(record.country, record.phone), record: sharedRecord };
      });
      void replaceCustomerOwners(customerOwnerSyncKey, records).catch(() => setStatus("客户归属已保存在本机，但云端更新失败"));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [adminUnlocked, customerOwnerCloudReady, customerOwnerSyncKey, customerOwners]);

  const applySharedWorkspaceState = useCallback((state: CloudWorkspaceState) => {
    cloudVersionRef.current = state.version;
    if (!state.initialized) {
      setCloudSyncStatus("云端已连接，等待管理员首次发布");
      return;
    }
    const normalizedEntries = state.entries.map(normalizeEntry).filter((entry): entry is ManagedEntry => Boolean(entry));
    const normalizedRules = state.pricingRules.filter(isPricingRule);
    setEntries(normalizedEntries);
    setPricingRules(normalizedRules);
    if (state.workflowPricingRuleId && normalizedRules.some((rule) => rule.id === state.workflowPricingRuleId)) {
      setWorkflowPricingRuleId(state.workflowPricingRuleId);
    }
    localStorage.setItem(CATALOGUE_STORAGE_KEY, JSON.stringify(normalizedEntries));
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(normalizedRules));
    if (state.workflowPricingRuleId) localStorage.setItem(workflowPricingStorageKey, state.workflowPricingRuleId);
    setSelectedEntryId((current) => normalizedEntries.some((entry) => entry.id === current) ? current : normalizedEntries[0]?.id ?? "");
    setCloudSyncStatus(`已同步云端 V${state.version} · ${shortDateTime(state.updatedAt)}`);
  }, [workflowPricingStorageKey]);

  const refreshSharedWorkspaceState = useCallback(async (announce = false) => {
    if (sharedWorkspaceRefreshInFlightRef.current) return;
    sharedWorkspaceRefreshInFlightRef.current = true;
    setIsRefreshingSharedWorkspace(true);
    setCloudSyncStatus("正在读取云端产品与报价公式");
    try {
      const result = await fetchSharedWorkspaceState();
      if (result.kind === "ready") {
        applySharedWorkspaceState(result.state);
        if (announce) setStatus(`已刷新云端目录 V${result.state.version}`);
      } else {
        cloudVersionRef.current = null;
        setCloudSyncStatus(result.message);
        if (announce) setStatus(result.message);
      }
    } finally {
      sharedWorkspaceRefreshInFlightRef.current = false;
      setIsRefreshingSharedWorkspace(false);
    }
  }, [applySharedWorkspaceState]);

  useEffect(() => {
    if (!storageReady) return undefined;
    let cancelled = false;
    void refreshSharedWorkspaceState().then(() => {
      if (cancelled) return;
      setSharedSyncReady(true);
    });
    return () => { cancelled = true; };
  }, [refreshSharedWorkspaceState, storageReady]);

  const syncSharedWorkspaceState = useCallback(async () => {
    if (!isOnline || !adminUnlocked || !sharedSyncReady || cloudVersionRef.current === null || cloudSyncInFlightRef.current) return;
    cloudSyncInFlightRef.current = true;
    setCloudSyncStatus("正在发布产品与报价公式");
    try {
      const result = await publishSharedWorkspaceState({
        entries,
        pricingRules,
        workflowPricingRuleId,
        version: cloudVersionRef.current,
        updatedBy: session.name,
        adminKey: adminSyncKey,
      });
      if (result.kind === "saved") {
        applySharedWorkspaceState(result.state);
        setCloudSyncPending(false);
        setStatus(`云端已同步 ${entries.length} 条资料和 ${pricingRules.length} 个报价公式`);
      } else {
        setCloudSyncPending(true);
        setCloudSyncStatus(result.message);
        if (result.kind === "conflict") setStatus("云端已有其他管理员更新，请刷新后再保存");
      }
    } finally {
      cloudSyncInFlightRef.current = false;
    }
  }, [adminSyncKey, adminUnlocked, applySharedWorkspaceState, entries, isOnline, pricingRules, session.name, sharedSyncReady, workflowPricingRuleId]);

  useEffect(() => {
    if (!storageReady || !sharedSyncReady) return undefined;
    setAutoSaveStatus("有修改，准备自动保存");
    const timer = window.setTimeout(() => {
      try {
        const savedAt = persistLocalData();
        setAutoSaveStatus(`已自动保存 ${shortDateTime(savedAt)}`);
      } catch {
        setAutoSaveStatus("自动保存失败，请点击保存本地数据");
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [persistLocalData, sharedSyncReady, storageReady]);

  useEffect(() => {
    if (!storageReady || !sharedSyncReady || !adminUnlocked || cloudVersionRef.current === null) return undefined;
    const timer = window.setTimeout(() => { void syncSharedWorkspaceState(); }, 900);
    return () => window.clearTimeout(timer);
  }, [adminUnlocked, entries, pricingRules, sharedSyncReady, storageReady, syncSharedWorkspaceState, workflowPricingRuleId]);

  useEffect(() => {
    if (!isOnline || !storageReady || !sharedSyncReady || !adminUnlocked || !cloudSyncPending) return undefined;
    const timer = window.setTimeout(() => { void syncSharedWorkspaceState(); }, 400);
    return () => window.clearTimeout(timer);
  }, [adminUnlocked, cloudSyncPending, isOnline, sharedSyncReady, storageReady, syncSharedWorkspaceState]);

  useEffect(() => {
    if (!isOnline || !storageReady || !sharedSyncReady || !adminUnlocked || !cloudSyncPending) return undefined;
    const timer = window.setInterval(() => { void syncSharedWorkspaceState(); }, 10000);
    return () => window.clearInterval(timer);
  }, [adminUnlocked, cloudSyncPending, isOnline, sharedSyncReady, storageReady, syncSharedWorkspaceState]);

  useEffect(() => {
    if (!storageReady || !sharedSyncReady || session.role !== "sales") return undefined;
    const refresh = async () => {
      const previousVersion = cloudVersionRef.current ?? 0;
      await refreshSharedWorkspaceState();
      if (cloudVersionRef.current !== null && cloudVersionRef.current > previousVersion) {
        setStatus("产品与报价公式已自动更新");
      }
    };
    const timer = window.setInterval(() => { void refresh(); }, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [refreshSharedWorkspaceState, session.role, sharedSyncReady, storageReady]);


  const refreshExchangeRates = useCallback(async (signal?: AbortSignal) => {
    setIsRefreshingExchangeRates(true);
    setExchangeRateStatus("正在获取今日汇率");
    const requestController = new AbortController();
    const timeoutId = window.setTimeout(() => requestController.abort(), 10000);
    const abortRequest = () => requestController.abort();
    signal?.addEventListener("abort", abortRequest, { once: true });
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/CNY", { signal: requestController.signal });
      if (!response.ok) throw new Error("exchange request failed");
      const payload = await response.json() as {
        result?: string;
        time_last_update_utc?: string;
        rates?: Partial<Record<CurrencyCode, number>>;
      };
      if (payload.result !== "success" || !payload.rates) throw new Error("invalid exchange payload");
      const nextRates = { ...fallbackExchangeRates };
      currencyCodes.forEach((code) => {
        const rate = payload.rates?.[code];
        if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) nextRates[code] = rate;
      });
      setExchangeRates(nextRates);
      setExchangeRateDate(formatExchangeRateDate(payload.time_last_update_utc));
      setExchangeRateStatus("已更新 CNY 实时参考汇率");
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // A timeout is an expected offline path; an external abort means the page is leaving.
        if (!signal?.aborted) setExchangeRateStatus("汇率请求超时，使用离线参考汇率");
        return;
      }
      setExchangeRateStatus("汇率获取失败，使用离线参考汇率");
    } finally {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortRequest);
      if (!signal?.aborted) setIsRefreshingExchangeRates(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshExchangeRates(controller.signal);
    return () => controller.abort();
  }, [refreshExchangeRates]);

  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? entries[0];
  const selectedRule = pricingRules.find((rule) => rule.id === selectedEntry?.pricingRuleId) ?? pricingRules[0];
  const workflowPricingRule = pricingRules.find((rule) => rule.id === workflowPricingRuleId) ?? pricingRules[0];
  const effectiveOwnerLookup = {
    country: ownerLookup.country || quote.country,
    phone: ownerLookup.phone || quote.clientPhone,
  };
  const customerOwnerKey = normalizeOwnerKey(effectiveOwnerLookup.country, effectiveOwnerLookup.phone);
  const customerOwnerRecord = customerOwnerKey
    ? customerOwners.find((record) => normalizeOwnerKey(record.country, record.phone) === customerOwnerKey)
    : undefined;
  const customerOwnerConflict = Boolean(
    customerOwnerRecord &&
      !adminUnlocked &&
      !employeeOwnsCustomer(customerOwnerRecord, quote.employee, session.accountId),
  );
  const similarPhoneOwnerRecords = useMemo(() => {
    const normalizedPhone = normalizePhoneForOwner(effectiveOwnerLookup.country, effectiveOwnerLookup.phone);
    if (!normalizedPhone || normalizedPhone.length < 7 || customerOwnerRecord) return [];
    return customerOwners
      .filter((record) => normalizePhoneForOwner(record.country, record.phone) === normalizedPhone)
      .sort((left, right) => customerRecordTimestamp(right) - customerRecordTimestamp(left))
      .slice(0, 3);
  }, [customerOwnerRecord, customerOwners, effectiveOwnerLookup.country, effectiveOwnerLookup.phone]);
  const employeeCustomerOwners = useMemo(() => {
    return customerOwners.filter((record) => employeeOwnsCustomer(record, quote.employee, session.accountId));
  }, [customerOwners, quote.employee, session.accountId]);
  const visibleCustomerOwners = useMemo(() => {
    if (adminUnlocked) return customerOwners;
    return employeeCustomerOwners;
  }, [adminUnlocked, customerOwners, employeeCustomerOwners]);
  const visibleQuoteHistory = useMemo(() => {
    if (adminUnlocked) return quoteHistory;
    const employee = session.name.trim().toLowerCase();
    return quoteHistory.filter((snapshot) => snapshot.quote.employee.trim().toLowerCase() === employee);
  }, [adminUnlocked, quoteHistory, session.name]);
  const filteredQuoteHistory = useMemo(() => {
    const normalized = quoteHistoryQuery.trim().toLowerCase();
    if (!normalized) return visibleQuoteHistory.slice(0, 8);
    return visibleQuoteHistory
      .filter((snapshot) =>
        [
          snapshot.quote.quoteNo,
          snapshot.quote.employee,
          snapshot.quote.client,
          snapshot.quote.clientContact,
          snapshot.quote.clientPhone,
          snapshot.quote.country,
          snapshot.quote.city,
          snapshot.customerOwner?.owner ?? "",
          snapshot.customerOwner?.phone ?? "",
          snapshot.customerOwner?.country ?? "",
          snapshot.customerOwner ? normalizeOwnerKey(snapshot.customerOwner.country, snapshot.customerOwner.phone) : "",
          normalizeOwnerKey(snapshot.quote.country, snapshot.quote.clientPhone),
          snapshot.quote.lines.map((line) => `${line.productCode} ${line.name} ${line.factoryModel}`).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 8);
  }, [quoteHistoryQuery, visibleQuoteHistory]);
  const filteredCustomerOwners = useMemo(() => {
    const normalized = ownerSearchQuery.trim().toLowerCase();
    const followMatches = customerFollowFilter === "due"
      ? visibleCustomerOwners.filter(customerNeedsFollowUp)
      : visibleCustomerOwners;
    const statusMatches = customerStatusFilter === "all"
      ? followMatches
      : followMatches.filter((record) => record.followStatus === customerStatusFilter);
    const tierMatches = customerTierFilter === "all"
      ? statusMatches
      : statusMatches.filter((record) => record.tier === customerTierFilter);
    const sourceMatches = customerLeadSourceFilter === "all"
      ? tierMatches
      : tierMatches.filter((record) => record.leadSource === customerLeadSourceFilter);
    const matches = normalized
      ? sourceMatches.filter((record) =>
          [
            record.country,
            record.phone,
            normalizeCountryForOwner(record.country),
            normalizePhoneForOwner(record.country, record.phone),
            normalizeOwnerKey(record.country, record.phone),
            record.client,
            record.clientContact,
            record.owner,
            record.ownerContact,
            record.tier,
            customerFollowStatusLabels[record.followStatus],
            customerLeadSourceLabels[record.leadSource],
            record.note,
            record.privateNote,
            record.lastQuoteNo,
            record.nextFollowUpDate,
            customerFollowUpLabel(record),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalized),
        )
      : sourceMatches;
    return [...matches]
      .sort(
        (left, right) =>
          Number(customerNeedsFollowUp(right)) - Number(customerNeedsFollowUp(left)) ||
          followUpTimestamp(left) - followUpTimestamp(right) ||
          customerRecordTimestamp(right) - customerRecordTimestamp(left),
      );
  }, [customerFollowFilter, customerLeadSourceFilter, customerStatusFilter, customerTierFilter, ownerSearchQuery, visibleCustomerOwners]);
  const displayedCustomerOwners = useMemo(
    () => showAllCustomers ? filteredCustomerOwners : filteredCustomerOwners.slice(0, 8),
    [filteredCustomerOwners, showAllCustomers],
  );
  const customerTierCounts = useMemo(() => {
    return visibleCustomerOwners.reduce<Record<CustomerTier, number>>(
      (counts, record) => ({ ...counts, [record.tier]: counts[record.tier] + 1 }),
      { A: 0, B: 0, C: 0 },
    );
  }, [visibleCustomerOwners]);
  const customerLeadSourceCounts = useMemo(() => {
    return visibleCustomerOwners.reduce<Record<CustomerLeadSource, number>>(
      (counts, record) => ({ ...counts, [record.leadSource]: counts[record.leadSource] + 1 }),
      { manual: 0, meta: 0, website: 0, referral: 0, other: 0 },
    );
  }, [visibleCustomerOwners]);
  const dueFollowUpCount = useMemo(() => visibleCustomerOwners.filter(customerNeedsFollowUp).length, [visibleCustomerOwners]);
  const categoryOptions = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => entry.category).filter(Boolean))).sort((left, right) => left.localeCompare(right));
  }, [entries]);
  const categoryStats = useMemo(() => {
    return entries.reduce<Record<string, { total: number; visible: number; inStock: number }>>((stats, entry) => {
      const current = stats[entry.category] ?? { total: 0, visible: 0, inStock: 0 };
      current.total += 1;
      if (entry.visible) current.visible += 1;
      if (entry.visible && entry.stockStatus === "in-stock") current.inStock += 1;
      stats[entry.category] = current;
      return stats;
    }, {});
  }, [entries]);
  const groupedCategoryOptions = useMemo(() => {
    return categoryOptions
      .map((category) => ({
        category,
        major: categoryGroups[category]?.major ?? "其他资料",
        minor: categoryGroups[category]?.minor ?? category,
        stats: categoryStats[category] ?? { total: 0, visible: 0, inStock: 0 },
      }))
      .sort((left, right) => left.major.localeCompare(right.major) || left.minor.localeCompare(right.minor));
  }, [categoryOptions, categoryStats]);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesQuery = !normalized || entrySearchText(entry).includes(normalized);
      const matchesType = type === "all" || entry.type === type;
      const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
      return matchesQuery && matchesType && matchesCategory && (!onlyVisible || entry.visible);
    });
  }, [categoryFilter, entries, onlyVisible, query, type]);
  const warehouseStats = useMemo(() => {
    return entries.reduce(
      (stats, entry) => {
        stats.total += 1;
        if (entry.visible) stats.visible += 1;
        if (entry.visible && entry.stockStatus === "in-stock") stats.inStock += 1;
        if (entry.visible && entry.stockStatus === "limited") stats.limited += 1;
        if (entry.visible && entry.stockStatus === "made-to-order") stats.madeToOrder += 1;
        if (!entry.visible || entry.stockStatus === "unavailable") stats.unavailable += 1;
        return stats;
      },
      { total: 0, visible: 0, inStock: 0, limited: 0, madeToOrder: 0, unavailable: 0 },
    );
  }, [entries]);

  const productSearchMatches = useMemo(() => {
    const normalized = productCodeInput.trim().toLowerCase();
    if (!normalized) return [];
    const searchableEntries = adminUnlocked ? entries : entries.filter((entry) => entry.visible);
    return searchableEntries
      .map((entry) => ({ entry, score: entrySearchScore(entry, normalized) }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || left.entry.productCode.localeCompare(right.entry.productCode))
      .map((item) => item.entry)
      .slice(0, 8);
  }, [adminUnlocked, entries, productCodeInput]);

  const selectedSearchEntry = productSearchMatches.find((entry) => entry.id === selectedEntryId) ?? productSearchMatches[0];

  const totals = useMemo(() => {
    const itemsSubtotal = quote.lines.reduce((sum, line) => sum + lineTotal(line), 0);
    const totalCost = quote.lines.reduce((sum, line) => sum + lineCostTotal(line), 0);
    const totalWeight = quote.lines.reduce((sum, line) => sum + Math.max(line.weight, 0) * Math.max(line.quantity, 0), 0);
    const totalVolume = quote.lines.reduce((sum, line) => sum + lineVolume(line) * Math.max(line.quantity, 0), 0);
    const fees = Math.max(quote.deliveryFee, 0) + Math.max(quote.installationFee, 0);
    const discount = Math.min(Math.max(quote.extraDiscount, 0), itemsSubtotal + fees);
    const subtotal = itemsSubtotal + fees - discount;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    const deposit = total * (Math.min(Math.max(quote.depositRate, 0), 100) / 100);
    const balance = Math.max(total - deposit, 0);
    const grossProfit = itemsSubtotal - totalCost - Math.max(quote.extraDiscount, 0);
    const grossMargin = marginRate(grossProfit, itemsSubtotal);
    return { itemsSubtotal, fees, discount, subtotal, tax, total, deposit, balance, totalWeight, totalVolume, totalCost, grossProfit, grossMargin };
  }, [quote.deliveryFee, quote.extraDiscount, quote.installationFee, quote.lines, quote.depositRate]);

  const dataIssues = useMemo(() => buildDataIssues(entries, pricingRules, quote), [entries, pricingRules, quote]);
  const blockingIssueCount = dataIssues.filter((issue) => issue.level === "error").length;
  const quoteReadinessIssues = useMemo(() => buildQuoteReadinessIssues(quote, pricingRules), [pricingRules, quote]);
  const quoteBlockingIssueCount = quoteReadinessIssues.filter((issue) => issue.level === "error").length;
  const preparedLineCount = quote.lines.length;
  const suggestedDeliveryFee = Math.max(
    0,
    quote.freightBaseFee + totals.totalVolume * Math.max(quote.freightRatePerCbm, 0) + totals.totalWeight * Math.max(quote.freightRatePerKg, 0),
  );
  const recommendedContainer = recommendedContainerPlan(totals);
  const exchangeSnapshot = {
    baseCurrency: "CNY",
    selectedCurrency,
    selectedCurrencyLabel: currencyLabels[selectedCurrency],
    selectedCurrencyTotal: totals.total * exchangeRates[selectedCurrency],
    selectedCurrencyFormatted: foreignCurrency(totals.total, selectedCurrency, exchangeRates),
    rates: exchangeRates,
    date: exchangeRateDate,
    status: exchangeRateStatus,
  };
  const exchangeConversion = useMemo(() => {
    const amount = numberValue(exchangeAmount);
    const fromRate = converterRate(exchangeFrom, exchangeRates);
    const toRate = converterRate(exchangeTo, exchangeRates);
    if (!Number.isFinite(amount) || fromRate <= 0 || toRate <= 0) return 0;
    return amount * toRate / fromRate;
  }, [exchangeAmount, exchangeFrom, exchangeRates, exchangeTo]);
  const logisticsSnapshot = {
    mode: quote.logisticsMode,
    suggestedDeliveryFee: Math.round(suggestedDeliveryFee),
    totalVolume: totals.totalVolume,
    totalWeight: totals.totalWeight,
    recommendedContainer: recommendedContainer
      ? {
          ...recommendedContainer,
          loadLabel: containerLoadLabel(recommendedContainer, totals),
          loadPercent: Math.ceil(containerLoadPercent(recommendedContainer, totals)),
        }
      : null,
    containerPlans: containerPlans.map((plan) => ({
      ...plan,
      loadLabel: containerLoadLabel(plan, totals),
      loadPercent: Math.ceil(containerLoadPercent(plan, totals)),
    })),
  };
  const customerQuotePreviewText = useMemo(() => buildCustomerQuoteText(quote, totals), [quote, totals]);
  const warehousePickListText = useMemo(() => buildWarehousePickListText(quote, totals), [quote, totals]);
  const customerOwnershipIssue = useMemo(() => {
    if (!effectiveOwnerLookup.country.trim() || !effectiveOwnerLookup.phone.trim()) return "请先填写客户国家和客户电话";
    if (!quote.employee.trim()) return "请先填写报价员姓名，再确认客户归属";
    if (!customerOwnerRecord) return "请先点击“录入客户”确认归属，再开始报价";
    if (!employeeOwnsCustomer(customerOwnerRecord, quote.employee, session.accountId)) {
      return `该客户已归属 ${customerOwnerRecord.owner || "其他销售"}，当前报价员不能继续报价`;
    }
    return "";
  }, [customerOwnerRecord, effectiveOwnerLookup.country, effectiveOwnerLookup.phone, quote.employee, session.accountId]);
  const nextSalesAction = (() => {
    if (customerOwnershipIssue) return customerOwnershipIssue;
    if (!quote.customerDemand.trim()) return "填写客户需求，再确定固定报价模式";
    if (quoteWorkflowStage === "demand") return "点击进入上架仓库，开始添加产品";
    if (!quote.lines.length) return "从产品仓库按编号、品类或名称添加产品";
    if (quoteBlockingIssueCount) return quoteReadinessIssues.find((issue) => issue.level === "error")?.detail ?? "补齐正式报价单阻断项";
    if (quoteWorkflowStage !== "generated") return "确认所有产品后生成正式报价单";
    return "正式报价单已生成，可以复制客户版或打印";
  })();
  const quoteProgressItems = [
    Boolean(customerOwnerRecord && !customerOwnershipIssue),
    Boolean(quote.customerDemand.trim()),
    Boolean(workflowPricingRule),
    quote.lines.length > 0,
    quoteBlockingIssueCount === 0,
    quoteWorkflowStage === "generated",
  ];
  const quoteProgress = Math.round((quoteProgressItems.filter(Boolean).length / quoteProgressItems.length) * 100);
  const activeModuleTitle = {
    home: "工作台首页",
    customers: "客户池",
    quote: "报价流程",
    products: "产品仓库",
    search: "产品仓库",
    logistics: "汇率物流",
    admin: "管理员维护",
  }[activeModule];
  const deliveryChecklist = [
    {
      label: "客户版报价",
      ok: quoteWorkflowStage === "generated" && !quoteBlockingIssueCount,
      detail: quoteWorkflowStage === "generated" ? "可复制、打印或导出给客户" : "先生成正式报价单",
    },
    {
      label: "内部备货",
      ok: quoteWorkflowStage === "generated" && quote.lines.length > 0,
      detail: quote.lines.length ? `已整理 ${quote.lines.length} 个产品给仓库/采购` : "预备报价单还没有产品",
    },
    {
      label: "归属留档",
      ok: Boolean(customerOwnerRecord && !customerOwnershipIssue),
      detail: customerOwnerRecord ? customerOwnerSummary(customerOwnerRecord) : "客户国家和电话未登记",
    },
    {
      label: "报价跟进",
      ok: Boolean(customerOwnerRecord?.nextFollowUpDate),
      detail: customerOwnerRecord ? customerFollowUpLabel(customerOwnerRecord) : "客户归属确认后可设置",
    },
    {
      label: "汇率/物流",
      ok: totals.totalVolume > 0 && totals.totalWeight > 0 && Boolean(quote.logisticsMode.trim()),
      detail: `${foreignCurrency(totals.total, selectedCurrency, exchangeRates)} · ${recommendedContainer ? recommendedContainer.name : "待估柜型"}`,
    },
    {
      label: "风险复核",
      ok: quoteReadinessIssues.length === 0,
      detail: quoteReadinessIssues.length ? `${quoteReadinessIssues.length} 个提示需处理` : "关键字段已通过基础检查",
    },
  ];

  function scrollToWorkspace(id: string) {
    const moduleByTarget: Record<string, ActiveModule> = {
      "customer-pool": "customers",
      "quote-workflow": "quote",
      "quote-lines": "quote",
      "quote-sheet": "quote",
      "product-search": "products",
      "search-center": "products",
      "product-warehouse": "products",
      "exchange-logistics": "logistics",
      "admin-access": "admin",
    };
    navigateToModule(moduleByTarget[id] ?? "home");
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function navigateToModule(module: ActiveModule) {
    const targetModule = module === "search" ? "products" : module;
    if (!canAccessModule(targetModule)) {
      setStatus("当前账号没有这个板块的权限，请联系管理员分配");
      return;
    }
    setActiveModule(targetModule);
    if (targetModule === "home") {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
    } else {
      window.location.hash = targetModule;
    }
  }

  function openModule(module: ActiveModule) {
    navigateToModule(module);
    setSidebarOpen(false);
    if (module === "products") {
      setQuery("");
      setProductCodeInput("");
      setSelectedEntryId("");
    }
    if (module === "search") setQuery("");
    if (module === "customers") {
      setOwnerLookup((current) => ({
        country: current.country || quote.country,
        phone: current.phone || quote.clientPhone,
      }));
    }
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function selectSearchEntry(entry: ManagedEntry, preserveSearch = false) {
    setSelectedEntryId(entry.id);
    if (!preserveSearch) {
      setProductCodeInput(entry.productCode);
    }
    setStatus("已从搜索结果选中：" + entry.productCode + " / " + entry.name);
  }

  function handleSearchResultKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, entry: ManagedEntry) {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button[role="radio"]') ?? []);
    const currentIndex = productSearchMatches.findIndex((item) => item.id === entry.id);
    if (currentIndex < 0 || !buttons.length) return;
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + productSearchMatches.length) % productSearchMatches.length;
    event.preventDefault();
    selectSearchEntry(productSearchMatches[nextIndex], true);
    buttons[nextIndex]?.focus();
  }

  function sampleVariablesForRule(rule: PricingRule) {
    const stored = pricingSamples[rule.id] ?? {};
    return Object.fromEntries(rule.variables.map((variable) => [variable, stored[variable] ?? 1]));
  }

  function variablesForRule(rule: PricingRule, previousVariables: Record<string, number> = {}, basePrice = 0) {
    return Object.fromEntries(rule.variables.map((variable) => [
      variable,
      previousVariables[variable] ?? ((variable === "basePrice" || variable === "unitPrice") ? basePrice : 0),
    ]));
  }

  function ensureCustomerOwnershipReady() {
    if (!customerOwnershipIssue) return true;
    setQuoteDetailsOpen(true);
    setStatus(customerOwnershipIssue);
    return false;
  }

  function ensureQuoteReadyForGeneration() {
    if (!quoteBlockingIssueCount) return true;
    const firstBlockingIssue = quoteReadinessIssues.find((issue) => issue.level === "error");
    setStatus(`正式报价单还有 ${quoteBlockingIssueCount} 个阻断问题：${firstBlockingIssue?.label ?? "请检查报价资料"}`);
    return false;
  }

  function ensureFormalCustomerOutputReady() {
    if (quoteWorkflowStage !== "generated") {
      setStatus("请先完成第三步生成正式报价单，再输出客户版");
      return false;
    }
    if (!ensureCustomerOwnershipReady()) return false;
    if (!ensureQuoteReadyForGeneration()) return false;
    return true;
  }

  function ensureWarehouseSelectionActive() {
    if (quoteWorkflowStage === "warehouse" || quoteWorkflowStage === "generated") return true;
    setStatus("请先完成第一步：确认客户需求和固定报价模式，再进入上架仓库选品");
    return false;
  }

  function startWarehouseSelection() {
    if (!ensureCustomerOwnershipReady()) {
      openModule("customers");
      return;
    }
    if (!workflowPricingRule) {
      setStatus("请先选择报价公式");
      return;
    }
    setQuoteWorkflowStage("warehouse");
    if (quoteWorkflowStage === "generated") setQuote((current) => ({ ...current, generatedAt: "" }));
    setType("all");
    setOnlyVisible(true);
    setQuery("");
    openModule("products");
    setStatus(quote.customerDemand.trim() ? `已确认客户需求和报价公式：${workflowPricingRule.name}，请从上架仓库添加产品` : `已进入上架仓库，报价公式：${workflowPricingRule.name}；客户需求可稍后补充`);
  }

  function confirmSelectedProducts() {
    if (!ensureCustomerOwnershipReady()) {
      openModule("customers");
      return;
    }
    if (!ensureQuoteReadyForGeneration()) return;
    if (!quote.lines.length) {
      setStatus("预备报价单为空，请先从上架仓库添加产品");
      return;
    }
    const generatedQuote = { ...quote, generatedAt: new Date().toISOString() };
    setQuote(generatedQuote);
    setQuoteWorkflowStage("generated");
    saveQuoteSnapshot(generatedQuote, "generated", `已生成并自动留档：${generatedQuote.quoteNo || "未编号报价"} / ${generatedQuote.lines.length} 个产品`);
  }

  function restartQuoteWorkflow() {
    setQuoteWorkflowStage("demand");
    setQuote((current) => (current.generatedAt ? { ...current, generatedAt: "" } : current));
    setStatus("已回到第一步，可重新确认客户需求和报价公式");
  }

  function returnToWarehouseSelection() {
    setQuoteWorkflowStage("warehouse");
    setQuote((current) => (current.generatedAt ? { ...current, generatedAt: "" } : current));
    setType("all");
    setOnlyVisible(true);
    openModule("products");
    setStatus("已回到第二步，可继续修改产品明细");
  }

  function applyWorkflowPricingRule(ruleId: string) {
    setWorkflowPricingRuleId(ruleId);
    const rule = pricingRules.find((item) => item.id === ruleId);
    if (!rule) {
      setStatus("未找到该报价模式，请检查管理员公式设置");
      return;
    }
    if (!quote.lines.length) {
      setStatus(`已选择固定报价模式：${rule.name}`);
      return;
    }
    setQuote((current) => ({
      ...current,
      lines: current.lines.map((line) => {
        const entry = entries.find((item) => item.id === line.entryId);
        const variables = variablesForRule(rule, line.variables, entry?.basePrice ?? 0);
        const unitPrice = rule.method === "formula" ? calculateExpression(rule.expression, variables) ?? line.unitPrice : 0;
        return { ...line, pricingRuleId: rule.id, variables, unitPrice };
      }),
    }));
    markPreparedQuoteChanged(`已切换固定报价模式并重算 ${quote.lines.length} 条明细：${rule.name}`);
  }

  function markPreparedQuoteChanged(message: string) {
    if (quoteWorkflowStage === "generated") {
      setQuoteWorkflowStage("warehouse");
      setQuote((current) => ({ ...current, generatedAt: "" }));
      setStatus(`${message}，请重新确认产品后生成报价单`);
      return;
    }
    setStatus(message);
  }

  function nextCodeFor(entry: Pick<ManagedEntry, "category" | "name" | "type">) {
    const prefix = productCodePrefix(entry);
    const maxNumber = entries.reduce((max, item) => {
      const match = item.productCode.match(new RegExp(`^MH-${prefix}-(\\d+)$`));
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    return `MH-${prefix}-${String(maxNumber + 1).padStart(3, "0")}`;
  }

  function requireAdminAccess() {
    if (adminUnlocked) return true;
    setStatus("当前登录账号没有管理员权限，请切换管理员版");
    return false;
  }

  function updateEntry(id: string, field: keyof Omit<ManagedEntry, "id">, value: string | number | boolean) {
    if (!requireAdminAccess()) return;
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  }

  function addEntry() {
    if (!requireAdminAccess()) return;
    const seed = { type: "product" as const, category: "sofa", name: "New Product" };
    const id = `custom:${Date.now()}`;
    const entry: ManagedEntry = {
      id,
      type: seed.type,
      slug: `custom-${Date.now()}`,
      productCode: nextCodeFor(seed),
      factoryModel: "",
      pricingRuleId: "manual-review",
      basePrice: 0,
      stockStatus: "made-to-order",
      warehouseLocation: "待分配仓位",
      warehouseNote: "新产品资料，请确认库存状态。",
      name: seed.name,
      category: seed.category,
      tagline: "新产品资料，请补充描述。",
      image: "/images/Other/fallback.jpg",
      visible: false,
    };
    setEntries((current) => [entry, ...current]);
    setSelectedEntryId(id);
    setStatus(`已新增产品并自动编号：${entry.productCode}`);
  }

  async function importPdfFile(file?: File) {
    if (!requireAdminAccess() || !file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setPdfImportState({ phase: "error", fileName: file.name, message: "只支持 PDF 图册文件", importedCount: 0 });
      setStatus("产品图册导入失败：请选择 PDF 文件");
      return;
    }

    setPdfImportState({ phase: "reading", fileName: file.name, message: "正在读取页面、提取文字并生成预览图", importedCount: 0 });
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
        isEvalSupported: false,
        useWorkerFetch: false,
      });
      const pdf = await loadingTask.promise;
      const pageCount = Math.min(pdf.numPages, PDF_IMPORT_MAX_PAGES);
      const usedCodes = new Set(entries.map((entry) => entry.productCode.trim().toUpperCase()).filter(Boolean));
      const importedEntries: ManagedEntry[] = [];

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const lines = pdfTextLines(textContent.items.map((item) => ("str" in item ? { str: item.str } : {})));
        const pageText = lines.join(" ");
        const category = inferPdfCategory(pageText);
        const name = inferPdfProductName(lines, pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const renderScale = Math.min(1.25, 1024 / baseViewport.width);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const canvasContext = canvas.getContext("2d");
        if (!canvasContext) throw new Error(`无法创建第 ${pageNumber} 页的图片画布`);
        await page.render({ canvasContext, viewport }).promise;
        const image = canvas.toDataURL("image/jpeg", 0.74);
        const type = "product" as const;
        const entry: ManagedEntry = {
          id: `pdf:${Date.now()}:${pageNumber}`,
          type,
          slug: `pdf-${Date.now()}-${pageNumber}`,
          productCode: nextSequentialProductCode({ type, category, name }, usedCodes),
          factoryModel: "",
          pricingRuleId: pricingRules[0]?.id ?? "manual-review",
          basePrice: 0,
          stockStatus: "made-to-order",
          warehouseLocation: "PDF图册导入 / 待确认",
          warehouseNote: `来源：${file.name} · 第 ${pageNumber} 页。识别结果待管理员核对。`,
          name,
          category,
          tagline: lines.filter((line) => line !== name).slice(0, 2).join(" · ") || "PDF图册页面导入，请补充产品描述。",
          image,
          visible: false,
        };
        importedEntries.push(entry);
        page.cleanup();
        setPdfImportState((current) => ({ ...current, importedCount: importedEntries.length, message: `已处理第 ${pageNumber} / ${pageCount} 页` }));
      }

      if (!importedEntries.length) throw new Error("PDF 没有可导入的页面");
      setEntries((current) => [...importedEntries, ...current]);
      setSelectedEntryId(importedEntries[0].id);
      setExpandedEntryId(importedEntries[0].id);
      setType("product");
      setOnlyVisible(false);
      setCategoryFilter("all");
      setQuery("");
      const pageNote = pdf.numPages > PDF_IMPORT_MAX_PAGES ? `，已按上限导入前 ${PDF_IMPORT_MAX_PAGES} 页` : "";
      setPdfImportState({ phase: "done", fileName: file.name, message: `已生成 ${importedEntries.length} 条待确认产品${pageNote}`, importedCount: importedEntries.length });
      setStatus(`PDF 图册已导入 ${importedEntries.length} 页，编号从现有序列继续生成；请先核对后上架`);
      await pdf.destroy();
    } catch (error) {
      const message = error instanceof Error ? error.message : "PDF 解析失败，请检查文件是否完整";
      setPdfImportState({ phase: "error", fileName: file.name, message, importedCount: 0 });
      setStatus(`产品图册导入失败：${message}`);
    }
  }

  function handlePdfInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    void importPdfFile(file);
  }

  function handlePdfDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setPdfDropActive(false);
    void importPdfFile(event.dataTransfer.files?.[0]);
  }

  function deleteEntry(id: string) {
    if (!requireAdminAccess()) return;
    const entry = entries.find((item) => item.id === id);
    if (!entry || !window.confirm(`确定删除产品“${entry.name || entry.productCode}”吗？相关报价明细也会被移除，此操作无法撤销。`)) return;
    if (expandedEntryId === id) setExpandedEntryId("");
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setQuote((current) => ({ ...current, lines: current.lines.filter((line) => line.entryId !== id) }));
    setStatus("已从本地资料库删除该产品，并移除相关报价明细");
  }

  function repairProductCodes() {
    if (!requireAdminAccess()) return;
    const normalized = normalizeCatalogueCodes(entries);
    const codeByEntryId = new Map(normalized.entries.map((entry) => [entry.id, entry.productCode]));
    setEntries(normalized.entries);
    setQuote((current) => ({
      ...current,
      lines: current.lines.map((line) => ({ ...line, productCode: codeByEntryId.get(line.entryId) ?? line.productCode })),
    }));
    setStatus(normalized.repairedCount ? `已修复 ${normalized.repairedCount} 个产品编号，请保存本地数据` : "产品编号已是唯一且格式正确");
  }

  function addPricingRule() {
    if (!requireAdminAccess()) return;
    const id = `rule-${Date.now()}`;
    setPricingRules((current) => [
      ...current,
      { id, name: "新报价公式", method: "formula", expression: "basePrice", variables: ["basePrice"], note: "请补充适用范围。" },
    ]);
    setStatus("已新增报价公式，请编辑变量和表达式后保存");
  }

  function updatePricingRule(id: string, field: keyof PricingRule, value: string | string[]) {
    if (!requireAdminAccess()) return;
    setPricingRules((current) => current.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
  }

  function updatePricingSample(ruleId: string, variable: string, value: string) {
    setPricingSamples((current) => ({
      ...current,
      [ruleId]: {
        ...(current[ruleId] ?? {}),
        [variable]: numberValue(value),
      },
    }));
  }

  function deletePricingRule(id: string) {
    if (!requireAdminAccess()) return;
    if (id === "manual-review") {
      setStatus("人工核价为兜底规则，不能删除");
      return;
    }
    if (workflowPricingRuleId === id) {
      setWorkflowPricingRuleId(pricingRules.find((rule) => rule.id !== id)?.id ?? "manual-review");
    }
    const quoteUsesDeletedRule = quote.lines.some((line) => line.pricingRuleId === id);
    if (quoteUsesDeletedRule && quoteWorkflowStage === "generated") setQuoteWorkflowStage("warehouse");
    setPricingRules((current) => current.filter((rule) => rule.id !== id));
    setEntries((current) => current.map((entry) => (entry.pricingRuleId === id ? { ...entry, pricingRuleId: "manual-review" } : entry)));
    setQuote((current) => ({
      ...current,
      generatedAt: quoteUsesDeletedRule && quoteWorkflowStage === "generated" ? "" : current.generatedAt,
      lines: current.lines.map((line) => (line.pricingRuleId === id
        ? { ...line, pricingRuleId: "manual-review", note: line.note.includes("PRICE REQUIRES REVIEW") ? line.note : `${line.note} PRICE REQUIRES REVIEW：原报价公式已删除，请重新核价。` }
        : line)),
    }));
    setStatus("已删除报价公式，关联产品和当前报价明细已切回人工核价");
  }

  function updateQuote(field: QuoteTextField, value: string) {
    if (field === "employee" && session.role === "sales") return;
    setQuote((current) => ({ ...current, [field]: value }));
  }

  function updateOwnerLookup(field: "country" | "phone", value: string) {
    setOwnerLookup((current) => ({ ...current, [field]: value }));
  }

  function loadCustomerOwnerToQuote(record: CustomerOwnerRecord) {
    setOwnerLookup({ country: record.country, phone: record.phone });
    setQuote((current) => ({
      ...current,
      employee: current.employee || record.owner,
      contact: current.contact || record.ownerContact,
      client: record.client || current.client,
      clientContact: record.clientContact || current.clientContact,
      country: record.country,
      clientPhone: record.phone,
      customerDemand: current.customerDemand || record.note,
    }));
    setStatus(`已载入客户到报价单：${record.client || record.phone} / ${record.owner || "未填销售"}`);
  }

  function showCustomerQuoteHistory(record: CustomerOwnerRecord) {
    setQuoteHistoryQuery([record.country, record.phone, record.client, record.clientContact].filter(Boolean).join(" "));
    setStatus(`已筛选客户报价历史：${record.client || record.phone}`);
    scrollToWorkspace("quote-sheet");
  }

  function newQuoteVersion() {
    const nextVersion = quote.version + 1;
    setQuote((current) => ({ ...current, version: nextVersion, status: "revised", generatedAt: "" }));
    setQuoteWorkflowStage(quote.lines.length ? "warehouse" : "demand");
    setStatus(`已复制为报价修订草稿 V${nextVersion}，请检查产品后重新生成`);
  }

  function assignNextQuoteNo() {
    const nextQuoteNo = nextQuoteNoFromHistory(quoteHistory, quote);
    setQuote((current) => ({ ...current, quoteNo: nextQuoteNo, quoteDate: new Date().toISOString().slice(0, 10), generatedAt: "" }));
    setQuoteWorkflowStage("demand");
    setStatus(`已自动生成今日下一个报价编号：${nextQuoteNo}`);
  }

  function updateQuoteNumber(
    field: "deliveryFee" | "installationFee" | "extraDiscount" | "depositRate" | "freightBaseFee" | "freightRatePerCbm" | "freightRatePerKg",
    value: string,
  ) {
    setQuote((current) => ({ ...current, [field]: numberValue(value) }));
  }

  function applySuggestedDeliveryFee() {
    setQuote((current) => ({ ...current, deliveryFee: Math.round(suggestedDeliveryFee) }));
    setStatus(`已按物流估算写入物流费：${currency(Math.round(suggestedDeliveryFee))}`);
  }

  function applyLogisticsPreset(preset: LogisticsPreset) {
    setQuote((current) => ({
      ...current,
      logisticsMode: preset.mode,
      freightBaseFee: preset.freightBaseFee,
      freightRatePerCbm: preset.freightRatePerCbm,
      freightRatePerKg: preset.freightRatePerKg,
    }));
    setStatus(`已套用物流模式：${preset.name}。${preset.note}`);
  }

  function registerCustomerOwner() {
    const country = effectiveOwnerLookup.country.trim();
    const phone = effectiveOwnerLookup.phone.trim();
    if (!country || !phone) {
      setStatus("请先填写客户国家和电话，再确认客户归属");
      return false;
    }
    if (customerOwnerRecord) {
      setStatus(`该客户已被销售“${customerOwnerRecord.owner || "其他销售"}”录入，不能重复登记`);
      return false;
    }
    const ownerName = quote.employee.trim() || session.name.trim();
    const record: CustomerOwnerRecord = {
      id: `${normalizeOwnerKey(country, phone)}:${Date.now()}`,
      country,
      phone,
      client: quote.client.trim(),
      clientContact: quote.clientContact.trim(),
      ownerAccountId: session.accountId,
      owner: ownerName,
      ownerContact: quote.contact.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tier: newCustomerTier,
      followStatus: "new",
      leadSource: newCustomerLeadSource,
      note: quote.customerDemand.trim(),
      privateNote: "",
      nextFollowUpDate: "",
      quoteCount: 0,
      lastQuotedAt: "",
      lastQuoteNo: "",
      lastQuoteTotal: 0,
    };
    setCustomerOwners((current) => {
      const next = [record, ...current].slice(0, 200);
      localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setOwnerLookup({ country, phone });
    setQuote((current) => ({ ...current, employee: current.employee.trim() || ownerName, country, clientPhone: phone }));
    setExpandedCustomerId(record.id);
    setStatus(`已录入客户：${record.country} / ${record.phone} · 销售账号：${record.owner}`);
    if (!adminUnlocked && staffSyncKey) {
      void publishCustomerOwner(staffSyncKey, customerOwnerKey, record)
        .then(() => setStatus(`已录入客户并同步云端：${record.country} / ${record.phone}`))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "";
          if (message.startsWith("OWNER_CONFLICT:")) {
            setCustomerOwners((current) => {
              const next = current.filter((item) => item.id !== record.id);
              localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(next));
              return next;
            });
            setStatus(message.slice("OWNER_CONFLICT:".length));
          } else {
            try {
              const stored = localStorage.getItem(CUSTOMER_OWNER_PENDING_STORAGE_KEY);
              const pending = stored ? JSON.parse(stored) as unknown : [];
              const queued = Array.isArray(pending) ? pending.map(normalizeCustomerOwnerRecord).filter((item): item is CustomerOwnerRecord => Boolean(item)) : [];
              const next = dedupeCustomerOwnerRecords([record, ...queued]).slice(0, 100);
              localStorage.setItem(CUSTOMER_OWNER_PENDING_STORAGE_KEY, JSON.stringify(next));
              setPendingCustomerOwnerCount(next.length);
            } catch { /* Keep the local record even if the retry queue cannot be written. */ }
            setPendingCustomerOwnerVersion((current) => current + 1);
            setStatus("客户已保存到本机，云端暂不可用，联网后会自动重试");
          }
        });
    }
    return true;
  }

  function clearCustomerEntry() {
    setOwnerLookup({ country: "", phone: "" });
    setNewCustomerTier("B");
    setNewCustomerLeadSource("manual");
    setExpandedCustomerId("");
    setQuote((current) => ({
      ...current,
      client: "",
      clientContact: "",
      clientPhone: "",
      clientEmail: "",
      country: "",
      city: "",
      clientAddress: "",
      project: "",
      customerDemand: "",
    }));
    setStatus("已清空本次客户录入内容，客户池历史记录未受影响");
  }

  function updateCustomerOwner(
    id: string,
    field: "tier" | "followStatus" | "leadSource" | "privateNote" | "note" | "client" | "clientContact" | "nextFollowUpDate",
    value: string,
  ) {
    const record = customerOwners.find((item) => item.id === id);
    if (!record) {
      setStatus("未找到该客户记录");
      return;
    }
    if (!adminUnlocked && !employeeOwnsCustomer(record, quote.employee, session.accountId)) {
      setStatus("只能维护自己的客户资源；管理员可查看和维护全部客户");
      return;
    }
    const nextValue = field === "tier" ? normalizeCustomerTier(value) : field === "followStatus" ? normalizeCustomerFollowStatus(value) : field === "leadSource" ? normalizeCustomerLeadSource(value) : value;
    setCustomerOwners((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, [field]: nextValue, updatedAt: new Date().toISOString() } : item));
      localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setStatus(
      field === "tier"
        ? `已更新客户等级：${nextValue}类`
        : field === "followStatus"
          ? `已更新客户状态：${customerFollowStatusLabels[nextValue as CustomerFollowStatus]}`
          : field === "leadSource"
            ? `已更新客户来源：${customerLeadSourceLabels[nextValue as CustomerLeadSource]}`
          : field === "nextFollowUpDate"
            ? `已更新下次跟进：${nextValue || "未设置"}`
            : "已更新客户资源备注",
    );
  }

  function scheduleQuoteFollowUp(days: number) {
    if (!customerOwnerKey) {
      setStatus("请先确认客户归属，再设置报价跟进");
      return;
    }
    if (!customerOwnerRecord) {
      setStatus("未找到客户资源记录，请先登记客户归属");
      return;
    }
    const nextFollowUpDate = dateAfterDays(days);
    setCustomerOwners((current) => {
      const next = current.map((record) => {
        if (normalizeOwnerKey(record.country, record.phone) !== customerOwnerKey) return record;
        return {
          ...record,
          updatedAt: new Date().toISOString(),
          followStatus: "quoted" as const,
          nextFollowUpDate,
        };
      });
      localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setStatus(`已设置报价后 ${days} 天跟进：${nextFollowUpDate}`);
  }

  function deleteCustomerOwner(id: string) {
    if (!requireAdminAccess()) return;
    const record = customerOwners.find((item) => item.id === id);
    if (!record || !window.confirm(`确定删除客户“${record.client || record.phone}”的归属记录吗？此操作无法撤销。`)) return;
    if (expandedCustomerId === id) setExpandedCustomerId("");
    if (customerOwnerRecord?.id === id) setOwnerLookup({ country: "", phone: "" });
    setCustomerOwners((current) => {
      const next = current.filter((record) => record.id !== id);
      localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    if (adminUnlocked && customerOwnerSyncKey) {
      void deleteSharedCustomerOwner(customerOwnerSyncKey, normalizeOwnerKey(record.country, record.phone)).catch(() => setStatus("客户已从本机删除，但云端删除失败"));
    }
    setStatus("已删除一条客户归属记录");
  }

  function updateLine(id: string, field: keyof Omit<QuoteLine, "id" | "entryId" | "name" | "category" | "image">, value: string | number | Record<string, number>) {
    setQuote((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    }));
    markPreparedQuoteChanged("已更新预备报价单明细");
  }

  function updateLineVariable(lineId: string, variable: string, value: string) {
    setQuote((current) => ({
      ...current,
      lines: current.lines.map((line) => {
        if (line.id !== lineId) return line;
        const nextVariables = { ...line.variables, [variable]: numberValue(value) };
        const rule = pricingRules.find((item) => item.id === line.pricingRuleId);
        const unitPrice = rule?.method === "formula" ? calculateExpression(rule.expression, nextVariables) ?? line.unitPrice : line.unitPrice;
        return { ...line, variables: nextVariables, unitPrice };
      }),
    }));
    markPreparedQuoteChanged("已更新报价公式变量");
  }

  function findEntryByCode() {
    const normalized = productCodeInput.trim().toLowerCase();
    const searchableEntries = adminUnlocked ? entries : entries.filter((entry) => entry.visible);
    const entry =
      searchableEntries.find((item) => item.productCode.toLowerCase() === normalized) ??
      productSearchMatches[0];
    if (!entry) {
      setStatus(`未找到产品：${productCodeInput.trim() || "空"}`);
      return;
    }
    setSelectedEntryId(entry.id);
    setStatus(`已定位 ${entry.productCode} / ${entry.name}`);
  }

  function addQuoteLine(entry: ManagedEntry, forceWarehouseStage = false) {
    if (!ensureCustomerOwnershipReady()) {
      openModule("customers");
      return false;
    }
    if (!forceWarehouseStage && !ensureWarehouseSelectionActive()) return false;
    if (entry.stockStatus === "unavailable") {
      setStatus(`该产品暂不可用，不能加入报价：${entry.productCode}`);
      return false;
    }
    if (forceWarehouseStage && quoteWorkflowStage === "demand") setQuoteWorkflowStage("warehouse");
    const ruleId = forceWarehouseStage || quoteWorkflowStage === "warehouse" || quoteWorkflowStage === "generated" ? workflowPricingRuleId : entry.pricingRuleId;
    const rule = pricingRules.find((item) => item.id === ruleId) ?? defaultPricingRules[2];
    const variables = variablesForRule(rule, {}, entry.basePrice);
    const unitPrice = rule.method === "formula" ? calculateExpression(rule.expression, variables) ?? 0 : 0;
    const existingLine = quote.lines.find((line) => line.entryId === entry.id && line.pricingRuleId === rule.id && !line.spec.trim());
    const mergedQuantity = existingLine ? existingLine.quantity + 1 : 0;
    setQuote((current) => {
      if (existingLine) {
        return {
          ...current,
          lines: current.lines.map((line) => (line.id === existingLine.id ? { ...line, quantity: mergedQuantity } : line)),
        };
      }
      return {
        ...current,
        lines: [
          ...current.lines,
          {
            id: `${entry.id}:${Date.now()}`,
            entryId: entry.id,
            productCode: entry.productCode,
            factoryModel: entry.factoryModel,
            pricingRuleId: rule.id,
            name: entry.name,
            category: entry.category,
            image: entry.image,
            stockStatus: entry.stockStatus,
            warehouseLocation: entry.warehouseLocation,
            warehouseNote: entry.warehouseNote,
            spec: "",
            material: "",
            variables,
            quantity: 1,
            weight: 0,
            packageLength: 0,
            packageWidth: 0,
            packageHeight: 0,
            unitPrice,
            costPrice: 0,
            discount: 0,
            note: rule.method === "manual-review" ? "PRICE REQUIRES REVIEW：需管理员或工厂确认。" : entry.tagline,
          },
        ],
      };
    });
    markPreparedQuoteChanged(
      mergedQuantity ? `已合并同款产品数量：${entry.productCode} x${mergedQuantity}` : `已加入预备报价单：${entry.productCode}`,
    );
    return true;
  }

  function addSelectedEntryFromSearch() {
    if (!selectedSearchEntry) return;
    if (addQuoteLine(selectedSearchEntry, true)) openModule("quote");
  }

  function addWarehouseEntryToQuote(entry: ManagedEntry) {
    if (addQuoteLine(entry, true)) openModule("quote");
  }

  function removeQuoteLine(id: string) {
    setQuote((current) => ({ ...current, lines: current.lines.filter((line) => line.id !== id) }));
    markPreparedQuoteChanged("已从预备报价单移除产品");
  }

  function duplicateQuoteLine(line: QuoteLine) {
    setQuote((current) => ({
      ...current,
      lines: [...current.lines, { ...line, id: `${line.entryId}:${Date.now()}` }],
    }));
    markPreparedQuoteChanged(`已复制预备报价明细：${line.productCode}`);
  }

  function startNewQuote() {
    const shouldArchiveCurrentDraft = quoteHasWorkingContent(quote) && quoteWorkflowStage !== "generated";
    if (shouldArchiveCurrentDraft) {
      saveQuoteSnapshot(quote, "manual", `已自动留档 ${quote.quoteNo || "未编号报价"} / V${quote.version}`);
    }
    const nextQuoteNo = nextQuoteNoFromHistory(quoteHistory, quote);
    setQuote({ ...createBlankQuote(nextQuoteNo), employee: session.role === "sales" ? session.name : "" });
    setQuoteWorkflowStage("demand");
    setOwnerLookup({ country: "", phone: "" });
    setQuoteHistoryQuery("");
    setQuoteDetailsOpen(false);
    setStatus(
      shouldArchiveCurrentDraft
        ? `旧报价已留档，已新开报价单：${nextQuoteNo}`
        : `已新开报价单：${nextQuoteNo}`,
    );
  }

  function saveQuoteSnapshot(quoteDraft: QuoteDraft, kind: QuoteSnapshot["kind"], message: string) {
    const savedAt = new Date().toISOString();
    const quotedAt = quoteDraft.generatedAt || savedAt;
    const quotedStatus: CustomerFollowStatus = "quoted";
    const defaultFollowUpDate = dateAfterDays(3, new Date(quotedAt));
    const snapshotOwner = kind === "generated" && customerOwnerRecord
      ? {
          ...customerOwnerRecord,
          updatedAt: quotedAt,
          followStatus: quotedStatus,
          nextFollowUpDate: customerOwnerRecord.nextFollowUpDate || defaultFollowUpDate,
          quoteCount: customerOwnerRecord.quoteCount + 1,
          lastQuotedAt: quotedAt,
          lastQuoteNo: quoteDraft.quoteNo,
          lastQuoteTotal: totals.total,
        }
      : customerOwnerRecord ?? null;
    const snapshot: QuoteSnapshot = {
      id: `${quoteDraft.quoteNo || "quote"}-v${quoteDraft.version}-${kind}-${Date.now()}`,
      savedAt,
      kind,
      workflowStage: kind === "generated" ? "generated" : quoteWorkflowStage,
      pricingRuleId: workflowPricingRuleId,
      customerOwnerKey,
      customerOwner: snapshotOwner,
      quote: quoteDraft,
      totals,
    };
    if (kind === "generated" && customerOwnerKey) {
      setCustomerOwners((current) => {
        const next = current.map((record) =>
          normalizeOwnerKey(record.country, record.phone) === customerOwnerKey
            ? {
                ...record,
                updatedAt: quotedAt,
                followStatus: quotedStatus,
                nextFollowUpDate: record.nextFollowUpDate || defaultFollowUpDate,
                quoteCount: record.quoteCount + 1,
                lastQuotedAt: quotedAt,
                lastQuoteNo: quoteDraft.quoteNo,
                lastQuoteTotal: totals.total,
              }
            : record,
        );
        localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
    setQuoteHistory((current) => {
      const next = [snapshot, ...current].slice(0, 20);
      localStorage.setItem(QUOTE_HISTORY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setStatus(message);
  }

  function archiveQuote() {
    saveQuoteSnapshot(quote, "manual", `已留档 ${quote.quoteNo || "未编号报价"} / V${quote.version}`);
  }

  function restoreQuoteSnapshot(id: string) {
    const snapshot = quoteHistory.find((item) => item.id === id);
    if (!snapshot) {
      setStatus("暂无可恢复的报价留档");
      return;
    }
    setQuote(session.role === "sales" ? { ...snapshot.quote, employee: session.name } : snapshot.quote);
    setOwnerLookup({ country: snapshot.customerOwner?.country || snapshot.quote.country, phone: snapshot.customerOwner?.phone || snapshot.quote.clientPhone });
    setWorkflowPricingRuleId(snapshot.pricingRuleId || snapshot.quote.lines[0]?.pricingRuleId || workflowPricingRuleId);
    setQuoteWorkflowStage(snapshot.workflowStage);
    setStatus(`已恢复 ${snapshot.quote.quoteNo || "未编号报价"} / V${snapshot.quote.version}，客户归属：${customerOwnerSummary(snapshot.customerOwner ?? undefined)}`);
  }

  function restoreLatestQuote() {
    const latest = visibleQuoteHistory[0];
    if (!latest) {
      setStatus("暂无可恢复的报价留档");
      return;
    }
    restoreQuoteSnapshot(latest.id);
  }

  function deleteQuoteSnapshot(id: string) {
    const snapshot = quoteHistory.find((item) => item.id === id);
    if (!snapshot || !window.confirm(`确定删除报价“${snapshot.quote.quoteNo || "未编号报价"} / V${snapshot.quote.version}”吗？此操作无法撤销。`)) return;
    setQuoteHistory((current) => {
      const next = current.filter((snapshot) => snapshot.id !== id);
      localStorage.setItem(QUOTE_HISTORY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setStatus("已删除一条报价留档");
  }

  function clearQuoteHistory() {
    if (!visibleQuoteHistory.length || !window.confirm(`确定清空 ${visibleQuoteHistory.length} 条报价留档吗？此操作无法撤销。`)) return;
    const next = adminUnlocked
      ? []
      : quoteHistory.filter((snapshot) => snapshot.quote.employee.trim().toLowerCase() !== session.name.trim().toLowerCase());
    setQuoteHistory(next);
    if (next.length) localStorage.setItem(QUOTE_HISTORY_STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(QUOTE_HISTORY_STORAGE_KEY);
    setStatus(adminUnlocked ? "已清空全部本地报价留档" : "已清空自己的本地报价留档");
  }

  function save() {
    try {
      const savedAt = persistLocalData();
      setAutoSaveStatus(`已手动保存 ${shortDateTime(savedAt)}`);
      setStatus(adminUnlocked && isOnline
        ? `已保存 ${entries.length} 条资料、${pricingRules.length} 个公式和 ${quote.lines.length} 条报价明细，并已提交云端同步`
        : adminUnlocked
          ? "已保存到本机，联网后会自动同步云端"
          : "已保存到本机；产品目录和报价公式由云端统一更新");
      void syncSharedWorkspaceState();
    } catch {
      setStatus("保存失败：请检查浏览器是否允许本地存储");
    }
  }

  function reset() {
    if (!requireAdminAccess()) return;
    localStorage.removeItem(CATALOGUE_STORAGE_KEY);
    localStorage.removeItem(LEGACY_CATALOGUE_STORAGE_KEY);
    localStorage.removeItem(PRICING_STORAGE_KEY);
    localStorage.removeItem(workflowPricingStorageKey);
    localStorage.removeItem(workflowStageStorageKey);
    localStorage.removeItem(quoteStorageKey);
    if (legacyQuoteStorageKey) localStorage.removeItem(legacyQuoteStorageKey);
    localStorage.removeItem(QUOTE_HISTORY_STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_OWNER_STORAGE_KEY);
    setEntries(initialEntries);
    setPricingRules(defaultPricingRules);
    setWorkflowPricingRuleId(defaultPricingRules[0].id);
    setQuoteWorkflowStage("demand");
    setQuote({ ...defaultQuote, employee: session.role === "sales" ? session.name : "" });
    setQuoteHistory([]);
    setCustomerOwners([]);
    setSelectedEntryId(initialEntries[0]?.id ?? "");
    setStatus("已恢复代码中的默认资料、默认公式，并清空报价草稿");
  }

  function exportCatalogueJson() {
    if (!requireAdminAccess()) return;
    downloadJson("meimih-admin-data.json", { version: 3, exportedAt: new Date().toISOString(), entries, pricingRules, workflowPricingRuleId, workflowStage: quoteWorkflowStage, quote, quoteHistory, customerOwners, dataIssues });
    setStatus("已导出管理员完整资料 JSON");
  }

  async function exportQuoteTemplate() {
    if (!ensureFormalCustomerOutputReady()) return;
    try {
      await downloadQuotationTemplate(quote, totals);
      setStatus("已按 XX furniture 报价模板导出 Excel 报价单");
    } catch {
      setStatus("Excel 模板导出失败，请检查模板文件或产品图片路径");
    }
  }

  async function copyCustomerQuoteText() {
    if (!ensureFormalCustomerOutputReady()) return;
    try {
      await navigator.clipboard.writeText(customerQuotePreviewText);
      setStatus("已复制客户版正式报价单，可粘贴给客户");
    } catch {
      setStatus("复制失败：浏览器未开放剪贴板权限，请使用导出报价");
    }
  }

  async function copyWarehousePickListText() {
    try {
      await navigator.clipboard.writeText(warehousePickListText);
      setStatus("已复制内部备货/核仓清单，可发给仓库或采购复核");
    } catch {
      setStatus("复制失败：浏览器未开放剪贴板权限，请使用导出报价");
    }
  }

  function printQuoteSheet() {
    if (!ensureFormalCustomerOutputReady()) return;
    setStatus(`正在打印正式报价单：${quote.quoteNo || "未编号报价"} / V${quote.version}`);
    window.print();
  }

  function downloadJson(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    if (!requireAdminAccess()) {
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as {
          scope?: unknown;
          entries?: unknown;
          pricingRules?: unknown;
          quote?: unknown;
          workflowStage?: unknown;
          workflowPricingRuleId?: unknown;
          quoteHistory?: unknown;
          customerOwners?: unknown;
        };
        let imported = false;
        const isEmployeeCustomerImport = parsed.scope === "employee-customer-resources";
        if (Array.isArray(parsed.entries)) {
          const normalizedEntries = parsed.entries.map(normalizeEntry).filter((entry): entry is ManagedEntry => Boolean(entry));
          if (normalizedEntries.length) {
            const repaired = normalizeCatalogueCodes(normalizedEntries);
            setEntries(repaired.entries);
            setSelectedEntryId(repaired.entries[0].id);
            imported = true;
            if (repaired.repairedCount) setStatus(`导入时已自动修复 ${repaired.repairedCount} 个产品编号，请点击保存`);
          }
        }
        if (Array.isArray(parsed.pricingRules) && parsed.pricingRules.every(isPricingRule)) {
          setPricingRules(parsed.pricingRules);
          imported = true;
        }
        if (Array.isArray(parsed.quoteHistory)) {
          const normalizedHistory = parsed.quoteHistory.map(normalizeQuoteSnapshot).filter((snapshot): snapshot is QuoteSnapshot => Boolean(snapshot));
          if (normalizedHistory.length) {
            setQuoteHistory(normalizedHistory);
            imported = true;
          }
        }
        if (Array.isArray(parsed.customerOwners)) {
          const normalizedOwners = parsed.customerOwners.map(normalizeCustomerOwnerRecord).filter((record): record is CustomerOwnerRecord => Boolean(record));
          if (normalizedOwners.length) {
            if (isEmployeeCustomerImport) {
              setCustomerOwners((current) => {
                const next = mergeCustomerOwnerRecords(current, normalizedOwners);
                localStorage.setItem(CUSTOMER_OWNER_STORAGE_KEY, JSON.stringify(next));
                return next;
              });
            } else {
              setCustomerOwners(normalizedOwners);
            }
            imported = true;
          }
        }
        const normalizedQuote = normalizeQuoteDraft(parsed.quote);
        if (normalizedQuote) {
          setQuote(session.role === "sales" ? { ...normalizedQuote, employee: session.name } : normalizedQuote);
          if (parsed.workflowPricingRuleId && typeof parsed.workflowPricingRuleId === "string" && parsed.workflowPricingRuleId !== "") {
            setWorkflowPricingRuleId(parsed.workflowPricingRuleId);
          }
          if (parsed.workflowStage === "demand" || parsed.workflowStage === "warehouse" || parsed.workflowStage === "generated") {
            setQuoteWorkflowStage(parsed.workflowStage === "generated" && !normalizedQuote.generatedAt ? "warehouse" : parsed.workflowStage);
          }
          imported = true;
        }
        if (!imported) throw new Error("格式不匹配");
        setStatus((current) => {
          if (current.includes("自动修复")) return current;
          return isEmployeeCustomerImport ? "已合并导入员工客户资源，请点击保存" : "已导入 JSON，请点击保存";
        });
      } catch {
        setStatus("导入失败：请使用本工作台导出的 JSON 文件");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <main className="admin-shell">
      <aside className={`admin-sidebar${sidebarCollapsed ? " is-collapsed" : ""}${sidebarOpen ? " is-open" : ""}`} aria-label="主导航">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-mark">M</span>
          <div className="admin-sidebar-brand-copy">
            <strong>MEIMI&H</strong>
            <small>内部报价工具</small>
          </div>
          <button className="admin-sidebar-collapse" type="button" onClick={() => setSidebarCollapsed((current) => !current)} aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"} aria-expanded={!sidebarCollapsed} title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}>
            {sidebarCollapsed ? <Menu size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <button className="admin-sidebar-mobile-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="关闭主导航" title="关闭主导航"><X size={18} /></button>
        </div>
        <nav className="admin-sidebar-nav">
          <span className="admin-sidebar-label">工作区</span>
          {([
            ["home", "工作台", <House key="home" size={17} strokeWidth={1.8} />],
            ["customers", "客户池", <UsersRound key="customers" size={17} strokeWidth={1.8} />],
            ["quote", "报价流程", <Calculator key="quote" size={17} strokeWidth={1.8} />],
            ["products", "产品仓库", <Boxes key="products" size={17} strokeWidth={1.8} />],
            ["logistics", "汇率物流", <Globe2 key="logistics" size={17} strokeWidth={1.8} />],
          ] as [ActiveModule, string, ReactNode][]).filter(([module]) => canAccessModule(module)).map(([module, label, icon]) => (
            <button key={module} className={activeModule === module ? "is-active" : ""} type="button" onClick={() => openModule(module)} title={module === "quote" && quote.lines.length ? `报价流程，${quote.lines.length} 项明细` : label} aria-current={activeModule === module ? "page" : undefined}>
            <span className="admin-sidebar-icon" aria-hidden="true">{icon}</span>
              <span>{module === "quote" && quote.lines.length ? `${label} · ${quote.lines.length}` : label}</span>
            </button>
          ))}
          <span className="admin-sidebar-label admin-sidebar-label-settings">设置</span>
          {adminUnlocked ? <button className={activeModule === "admin" ? "is-active" : ""} type="button" onClick={() => openModule("admin")} title="管理员维护" aria-current={activeModule === "admin" ? "page" : undefined}>
            <span className="admin-sidebar-icon" aria-hidden="true"><Settings2 size={17} strokeWidth={1.8} /></span>
            <span>管理员维护</span>
          </button> : null}
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-sidebar-dot" />
          <span>{storageReady ? "本地数据已启用" : "正在读取本地数据"}</span>
        </div>
      </aside>
      {sidebarOpen ? <button className="admin-sidebar-backdrop" type="button" aria-label="关闭主导航" onClick={() => setSidebarOpen(false)} /> : null}
      <div className="admin-main-content">
      <header className="admin-header">
        <div>
          <button className="admin-mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="打开主导航" aria-expanded={sidebarOpen}><Menu size={18} /></button>
          <p className="eyebrow">MEIMI&H / INTERNAL SALES APP</p>
          <h1>产品编号报价系统</h1>
          <p className="admin-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
          <p className="admin-save-state">
            {autoSaveStatus}
            {lastSavedAt ? ` · 最近保存 ${shortDateTime(lastSavedAt)}` : ""}
            {` · ${isOnline ? (cloudSyncPending ? "等待云端重试" : cloudSyncStatus) : "当前离线，本地资料仍会保存"}`}
            {pendingCustomerOwnerCount ? ` · ${pendingCustomerOwnerCount} 条客户待同步` : ""}
          </p>
        </div>
        <div className="admin-header-actions">
          <div className="admin-header-session" title={`${session.role === "admin" ? "管理员版" : "销售版"} · ${session.name}`}>
            <strong>{session.name}</strong>
            <span>{session.role === "admin" ? "管理员版" : "销售版"}</span>
          </div>
          {session.role === "sales" ? <button type="button" onClick={() => void refreshSharedWorkspaceState(true)} disabled={isRefreshingSharedWorkspace} aria-busy={isRefreshingSharedWorkspace} title="立即读取管理员发布的产品和报价公式">
            <RotateCcw size={15} />{isRefreshingSharedWorkspace ? "刷新中" : "刷新云端目录"}
          </button> : null}
          {session.role === "sales" && pendingCustomerOwnerCount ? <button type="button" onClick={() => { setPendingCustomerOwnerVersion((current) => current + 1); setStatus("正在重试同步待上传客户"); }} disabled={!isOnline} title={isOnline ? "立即重试上传待同步客户" : "联网后才能同步客户"}>
            <CloudUpload size={15} />立即同步客户
          </button> : null}
          <button onClick={save}>
            <Save size={15} />
            {adminUnlocked ? "保存并同步" : "保存本地资料"}
          </button>
          <a className="admin-link" href="/app" target="_blank" rel="noreferrer">
            <ExternalLink size={15} />
            打开图册
          </a>
          <button className="admin-header-logout" type="button" onClick={onLogout} title="退出当前账号"><LogOut size={15} />退出</button>
        </div>
      </header>

      {activeModule === "home" ? <section className="sales-cockpit" aria-label="销售三分钟工作台">
        <div className="sales-cockpit-status" role="status" aria-live="polite">
          <span className="sales-cockpit-status-main"><CheckCircle2 size={15} />{storageReady ? "已保存最新内容" : "正在读取本地资料"}</span>
          <span>{lastSavedAt ? `最近保存 ${shortDateTime(lastSavedAt)}` : autoSaveStatus}</span>
            <span>{isOnline
              ? (adminUnlocked ? "本地 + 云端" : "本地资料 + 云端目录")
              : "离线本地"}</span>
          <strong>报价完成度 {quoteProgress}%</strong>
        </div>
        <div className="sales-cockpit-head">
          <div>
            <p className="eyebrow">今日工作台</p>
            <h2>从这里开始今天的报价</h2>
            <p className="sales-next-action">下一步：{nextSalesAction}</p>
          </div>
        </div>
        <div className="sales-cockpit-grid">
          {canAccessModule("customers") ? <article className="sales-cockpit-card">
            <button className="sales-cockpit-card-hit" type="button" onClick={() => openModule("customers")} aria-label="进入客户池">
              <span className="sales-cockpit-card-number" aria-hidden="true">01</span>
              <span className="sales-cockpit-card-icon" aria-hidden="true"><UsersRound size={24} strokeWidth={1.8} /></span>
              <span className="sales-cockpit-card-copy"><strong>客户池</strong><small>先用国家 + 电话查归属，再录入和跟进。</small></span>
              <span className="sales-cockpit-card-links" aria-hidden="true"><span>客户列表</span><span>待跟进</span><span>A 类客户</span></span>
              <span className="sales-cockpit-card-stats" aria-hidden="true"><b>{visibleCustomerOwners.length}</b><small>客户总数</small><b>{dueFollowUpCount}</b><small>待跟进</small></span>
              <span className="sales-cockpit-card-arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
            </button>
          </article> : null}
          {canAccessModule("quote") ? <article className="sales-cockpit-card">
            <button className="sales-cockpit-card-hit" type="button" onClick={() => { if (quoteWorkflowStage === "generated") startNewQuote(); openModule("quote"); }} aria-label={quoteWorkflowStage === "generated" ? "新开报价" : "进入报价流程"}>
              <span className="sales-cockpit-card-number" aria-hidden="true">02</span>
              <span className="sales-cockpit-card-icon" aria-hidden="true"><Calculator size={24} strokeWidth={1.8} /></span>
              <span className="sales-cockpit-card-copy"><strong>报价流程</strong><small>{quoteWorkflowStage === "generated" ? "当前报价已生成，可新开一张。" : "客户需求 → 固定公式 → 仓库选品 → 生成报价单。"}</small></span>
              <span className="sales-cockpit-card-links" aria-hidden="true"><span>新开报价</span><span>进行中</span><span>报价留档</span></span>
              <span className="sales-cockpit-card-stats" aria-hidden="true"><b>{quote.lines.length}</b><small>当前产品</small><b>{visibleQuoteHistory.length}</b><small>报价留档</small></span>
              <span className="sales-cockpit-card-arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
            </button>
          </article> : null}
          {canAccessModule("products") ? <article className="sales-cockpit-card">
            <button className="sales-cockpit-card-hit" type="button" onClick={() => openModule("products")} aria-label="进入产品仓库">
              <span className="sales-cockpit-card-number" aria-hidden="true">03</span>
              <span className="sales-cockpit-card-icon" aria-hidden="true"><Boxes size={24} strokeWidth={1.8} /></span>
              <span className="sales-cockpit-card-copy"><strong>产品仓库</strong><small>浏览、模糊搜索并加入报价，点击图片再查看规格和价格。</small></span>
              <span className="sales-cockpit-card-links" aria-hidden="true"><span>编号搜索</span><span>品类筛选</span><span>已上架</span></span>
              <span className="sales-cockpit-card-stats" aria-hidden="true"><b>{warehouseStats.total}</b><small>产品总数</small><b>{warehouseStats.visible}</b><small>已上架</small></span>
              <span className="sales-cockpit-card-arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
            </button>
          </article> : null}
          {canAccessModule("logistics") ? <article className="sales-cockpit-card">
            <button className="sales-cockpit-card-hit" type="button" onClick={() => openModule("logistics")} aria-label="进入汇率物流">
              <span className="sales-cockpit-card-number" aria-hidden="true">04</span>
              <span className="sales-cockpit-card-icon" aria-hidden="true"><Globe2 size={24} strokeWidth={1.8} /></span>
              <span className="sales-cockpit-card-copy"><strong>汇率物流</strong><small>查当天汇率，并按 CBM、重量和柜型估算物流。</small></span>
              <span className="sales-cockpit-card-links" aria-hidden="true"><span>汇率查询</span><span>物流方式</span><span>货柜估算</span></span>
              <span className="sales-cockpit-card-stats" aria-hidden="true"><b>{quote.lines.length}</b><small>待估产品</small><b>{Math.round(totals.totalWeight)}</b><small>当前重量 kg</small></span>
              <span className="sales-cockpit-card-arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
            </button>
          </article> : null}
          {adminUnlocked ? <article className="sales-cockpit-card">
            <button className="sales-cockpit-card-hit" type="button" onClick={() => openModule("admin")} aria-label="进入管理员维护">
              <span className="sales-cockpit-card-number" aria-hidden="true">05</span>
              <span className="sales-cockpit-card-icon" aria-hidden="true"><Settings2 size={24} strokeWidth={1.8} /></span>
              <span className="sales-cockpit-card-copy"><strong>管理员维护</strong><small>维护产品、统一价格、报价公式和销售权限。</small></span>
              <span className="sales-cockpit-card-links" aria-hidden="true"><span>用户管理</span><span>价格公式</span><span>产品维护</span></span>
              <span className="sales-cockpit-card-stats" aria-hidden="true"><b>{salesAccounts.length}</b><small>销售账号</small><b>{entries.length}</b><small>资料总数</small></span>
              <span className="sales-cockpit-card-arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
            </button>
          </article> : null}
        </div>
      </section> : null}

      {activeModule !== "home" ? (
        <nav className="admin-module-nav" aria-label="当前板块">
          <button onClick={() => openModule("home")}>返回首页</button>
          <strong>{activeModuleTitle}</strong>
          <div className="admin-module-nav-copy">
            <span>{nextSalesAction !== status ? `${nextSalesAction} · ` : ""}报价完成度 {quoteProgress}%</span>
          </div>
        </nav>
      ) : null}

      {activeModule === "admin" ? (
        <>
          <section id="admin-access" className="admin-access is-unlocked" aria-label="当前登录账号">
            <div>
              <p className="eyebrow">Signed in</p>
              <h2>管理员版已开启</h2>
              <small>可以维护产品、统一销售端价格、管理报价公式和分配销售权限。</small>
            </div>
            <div className="admin-session-chip">
              <strong>{session.name}</strong>
              <span>管理员账号 · 全部权限</span>
            </div>
            <button className="admin-logout-button" type="button" onClick={onLogout}><LogOut size={15} />退出登录</button>
          </section>
          <section className="account-permission-panel" aria-label="销售账号权限">
            <div className="admin-section-heading">
              <div>
                <p>Staff accounts</p>
                <h2>销售账号与权限</h2>
              </div>
              <span>{salesAccounts.length ? `${salesAccounts.length} 个销售账号` : "销售可以在登录页自行注册"}</span>
            </div>
            {salesAccounts.length ? (
              <div className="account-permission-list">
                {salesAccounts.map((account) => (
                  <article key={account.id} className={!account.active ? "is-disabled" : ""}>
                    <div className="account-permission-head">
                      <div>
                        <strong>{account.name}</strong>
                        <small>销售密钥末四位 · {account.loginKey.slice(-4)} · 注册于 {shortDateTime(account.createdAt)}</small>
                      </div>
                      <div className="account-permission-actions">
                        <button type="button" className={account.active ? "account-active" : "account-inactive"} onClick={() => onUpdateSalesAccount(account.id, { active: !account.active })}>
                          {account.active ? "使用中" : "已停用"}
                        </button>
                        <button type="button" className="account-delete" onClick={() => onDeleteSalesAccount(account.id)} title={`删除销售账号：${account.name}`} aria-label={`删除销售账号：${account.name}`}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="account-permission-options">
                      {SALES_PERMISSION_OPTIONS.map((permission) => {
                        const checked = account.permissions.includes(permission.key);
                        return (
                          <label key={permission.key} title={permission.detail}>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!account.active}
                              onChange={() => onUpdateSalesAccount(account.id, { permissions: checked ? account.permissions.filter((item) => item !== permission.key) : [...account.permissions, permission.key] })}
                            />
                            <span>{permission.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="account-permission-empty"><UsersRound size={18} /><span>还没有销售账号。销售在登录页注册后，会出现在这里，默认拥有销售端基础板块。</span></div>
            )}
          </section>
          <section className="pdf-import-panel" aria-label="PDF产品图册导入">
            <div className="admin-section-heading">
              <div>
                <p>Catalogue import</p>
                <h2>导入产品图册 PDF</h2>
              </div>
              <span>管理员专用 · 导入后待确认</span>
            </div>
            <div
              className={`pdf-dropzone${pdfDropActive ? " is-dragging" : ""}${pdfImportState.phase === "error" ? " has-error" : ""}`}
              onDragEnter={(event) => { event.preventDefault(); setPdfDropActive(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (event.currentTarget === event.target) setPdfDropActive(false);
              }}
              onDrop={handlePdfDrop}
            >
              <FileText size={26} strokeWidth={1.7} aria-hidden="true" />
              <strong>拖入 PDF 图册</strong>
              <span>按页面生成产品预览，推断名称与类别，并从现有编号继续递增。</span>
              <label className="pdf-pick-button">
                选择 PDF
                <input type="file" accept="application/pdf,.pdf" onChange={handlePdfInput} />
              </label>
            </div>
            <div className={`pdf-import-status is-${pdfImportState.phase}`} aria-live="polite">
              <span>{pdfImportState.fileName || "尚未选择文件"}</span>
              <strong>{pdfImportState.message}</strong>
              {pdfImportState.phase === "reading" ? <small>已处理 {pdfImportState.importedCount} 页 · 大图册最多导入前 {PDF_IMPORT_MAX_PAGES} 页</small> : null}
              {pdfImportState.phase === "done" ? <small>新产品默认隐藏且价格为 0，请打开产品详情核对后再上架。</small> : null}
              {pdfImportState.phase === "idle" ? <small>支持电脑中的 .pdf 文件；识别结果保存在当前浏览器的内部资料库。</small> : null}
            </div>
          </section>
        </>
      ) : null}

      {activeModule === "customers" ? (
      <section id="customer-pool" className={`customer-owner-panel${customerOwnerRecord && !customerOwnershipIssue ? " has-owner" : ""}${customerOwnerConflict ? " has-conflict" : ""}`} aria-label="客户归属确认">
        <div>
          <h2>录入客户</h2>
          <small>国家 + 客户电话是唯一识别依据，输入后自动检查是否已有销售录入。</small>
        </div>
        <div className="customer-owner-fields">
          <label>
            销售账号
            <input value={quote.employee || session.name} readOnly={session.role === "sales"} onChange={(event) => updateQuote("employee", event.target.value)} placeholder="当前销售账号" />
          </label>
          <label>
            账号联系方式
            <input value={quote.contact} onChange={(event) => updateQuote("contact", event.target.value)} placeholder="电话 / 微信" />
          </label>
          <label>
            国家
            <input value={ownerLookup.country} onChange={(event) => updateOwnerLookup("country", event.target.value)} placeholder={quote.country || "客户国家"} />
          </label>
          <label>
            客户电话
            <input value={ownerLookup.phone} onChange={(event) => updateOwnerLookup("phone", event.target.value)} placeholder={quote.clientPhone || "电话 / WhatsApp / 微信"} />
          </label>
          <label>
            客户 / 公司
            <input value={quote.client} onChange={(event) => updateQuote("client", event.target.value)} placeholder="客户或公司名称" />
          </label>
          <label>
            联系人
            <input value={quote.clientContact} onChange={(event) => updateQuote("clientContact", event.target.value)} placeholder="采购 / 负责人" />
          </label>
          <label>
            登记等级
            <select value={newCustomerTier} onChange={(event) => setNewCustomerTier(normalizeCustomerTier(event.target.value))}>
              <option value="A">A类 最优质</option>
              <option value="B">B类 跟进中</option>
              <option value="C">C类 普通 / 观察</option>
            </select>
          </label>
          <label>
            线索来源
            <select value={newCustomerLeadSource} onChange={(event) => setNewCustomerLeadSource(normalizeCustomerLeadSource(event.target.value))}>
              {(Object.keys(customerLeadSourceLabels) as CustomerLeadSource[]).map((source) => <option key={source} value={source}>{customerLeadSourceLabels[source]}</option>)}
            </select>
          </label>
        </div>
        <div className={`customer-owner-status${customerOwnerConflict ? " is-conflict" : ""}${customerOwnerRecord && !customerOwnerConflict ? " is-confirmed" : ""}`} aria-live="polite">
          <span>{effectiveOwnerLookup.country || "未填国家"} / {effectiveOwnerLookup.phone || "未填电话"}</span>
          <strong>{customerOwnerConflict ? `已被销售“${customerOwnerRecord?.owner || "其他销售"}”录入` : customerOwnerRecord ? `已录入：${customerOwnerRecord.owner || "当前销售"}` : "可以录入新客户"}</strong>
          <small>{ownerIdentityLabel(effectiveOwnerLookup.country, effectiveOwnerLookup.phone)}</small>
          <small>
            {customerOwnerRecord
              ? adminUnlocked || employeeOwnsCustomer(customerOwnerRecord, quote.employee, session.accountId)
                ? `${customerOwnerRecord.tier}类 · ${customerFollowStatusLabels[customerOwnerRecord.followStatus]} · ${customerLeadSourceLabels[customerOwnerRecord.leadSource]} · ${customerOwnerRecord.client || "未填客户"} · ${customerOwnerRecord.clientContact || "未填联系人"} · ${shortDateTime(customerOwnerRecord.createdAt)}`
                : `${customerOwnerRecord.owner || "其他销售"} 已收录该客户；具体备注仅本人和管理员可见。`
              : "确认无重复后，点击下方“录入客户”即可建立归属。"}
          </small>
          {customerOwnershipIssue ? <small className="customer-owner-gate">{customerOwnershipIssue}</small> : null}
          {similarPhoneOwnerRecords.length ? (
            <div className="customer-owner-similar">
              <strong>疑似同电话客户</strong>
              {similarPhoneOwnerRecords.map((record) => (
                <button key={record.id} onClick={() => loadCustomerOwnerToQuote(record)}>
                  <span>{record.country} / {record.phone}</span>
                  <small>{record.owner} · {record.client || "未填客户"} · {ownerIdentityLabel(record.country, record.phone)}</small>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="customer-owner-actions">
          <button className="customer-register-button" onClick={registerCustomerOwner} disabled={Boolean(customerOwnerRecord)} title={customerOwnerRecord ? `该客户已被销售 ${customerOwnerRecord.owner || "其他销售"} 录入` : "确认国家和客户电话后录入客户"}>
            {customerOwnerConflict ? "已被销售录入" : customerOwnerRecord ? "已录入客户" : "录入客户"}
          </button>
          <button className="customer-clear-button" type="button" onClick={clearCustomerEntry} title="清空本次客户录入内容，不删除客户池历史记录">
            <RotateCcw size={15} />
            一键清空
          </button>
        </div>
        <div className="customer-owner-recent">
            <div className="customer-owner-ledger-head">
              <strong>员工客户资源仓库</strong>
              <span>{filteredCustomerOwners.length} / {visibleCustomerOwners.length} 条 · {dueFollowUpCount} 个到期{adminUnlocked ? ` / 全部 ${customerOwners.length} 条` : ""}</span>
            </div>
            <label className="customer-owner-search">
              <Search size={15} />
              <input
                value={ownerSearchQuery}
                onChange={(event) => setOwnerSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setOwnerSearchQuery("");
                    setStatus("已清空客户搜索");
                  }
                }}
                placeholder="搜索国家、电话、客户、联系人、销售、来源、等级或备注"
                aria-label="搜索客户资源"
              />
              <button className="customer-owner-search-clear" type="button" onClick={() => { setOwnerSearchQuery(""); setStatus("已清空客户搜索"); }} disabled={!ownerSearchQuery} aria-label="清空客户搜索" title="清空搜索"><X size={14} /></button>
            </label>
            <div className="customer-tier-summary" role="group" aria-label="客户资源筛选">
              <button className={customerTierFilter === "all" && customerFollowFilter === "all" && customerStatusFilter === "all" && customerLeadSourceFilter === "all" ? "active" : ""} aria-pressed={customerTierFilter === "all" && customerFollowFilter === "all" && customerStatusFilter === "all" && customerLeadSourceFilter === "all"} onClick={() => { setCustomerTierFilter("all"); setCustomerFollowFilter("all"); setCustomerStatusFilter("all"); setCustomerLeadSourceFilter("all"); setStatus("已显示全部客户"); }}>全部 {visibleCustomerOwners.length}</button>
              <button className={customerFollowFilter === "due" ? "active" : ""} aria-pressed={customerFollowFilter === "due"} onClick={() => setCustomerFollowFilter((current) => { const next = current === "due" ? "all" : "due"; setStatus(next === "due" ? "已筛选待跟进客户" : "已取消待跟进筛选"); return next; })}>待跟进 {dueFollowUpCount}</button>
              <button className={customerTierFilter === "A" ? "active" : ""} aria-pressed={customerTierFilter === "A"} onClick={() => { setCustomerTierFilter("A"); setStatus("已筛选 A 类客户"); }}>A类 {customerTierCounts.A}</button>
              <button className={customerTierFilter === "B" ? "active" : ""} aria-pressed={customerTierFilter === "B"} onClick={() => { setCustomerTierFilter("B"); setStatus("已筛选 B 类客户"); }}>B类 {customerTierCounts.B}</button>
              <button className={customerTierFilter === "C" ? "active" : ""} aria-pressed={customerTierFilter === "C"} onClick={() => { setCustomerTierFilter("C"); setStatus("已筛选 C 类客户"); }}>C类 {customerTierCounts.C}</button>
              <label className="customer-status-filter">
                <span>状态</span>
                <select aria-label="客户跟进状态" value={customerStatusFilter} onChange={(event) => { const next = event.target.value as "all" | CustomerFollowStatus; setCustomerStatusFilter(next); setStatus(next === "all" ? "已显示全部客户状态" : `已筛选客户状态：${customerFollowStatusLabels[next]}`); }}>
                  <option value="all">全部状态</option>
                  {(Object.keys(customerFollowStatusLabels) as CustomerFollowStatus[]).map((statusKey) => <option key={statusKey} value={statusKey}>{customerFollowStatusLabels[statusKey]}</option>)}
                </select>
              </label>
              <label className="customer-status-filter">
                <span>来源</span>
                <select aria-label="客户线索来源" value={customerLeadSourceFilter} onChange={(event) => { const next = event.target.value as "all" | CustomerLeadSource; setCustomerLeadSourceFilter(next); setStatus(next === "all" ? "已显示全部客户来源" : `已筛选客户来源：${customerLeadSourceLabels[next]}`); }}>
                  <option value="all">全部来源</option>
                  {(Object.keys(customerLeadSourceLabels) as CustomerLeadSource[]).map((source) => <option key={source} value={source}>{customerLeadSourceLabels[source]} ({customerLeadSourceCounts[source]})</option>)}
                </select>
              </label>
              <button
                type="button"
                className={ownerSearchQuery || customerTierFilter !== "all" || customerFollowFilter !== "all" || customerStatusFilter !== "all" || customerLeadSourceFilter !== "all" ? "active" : ""}
                onClick={() => {
                  setOwnerSearchQuery("");
                  setCustomerTierFilter("all");
                  setCustomerFollowFilter("all");
                  setCustomerStatusFilter("all");
                  setCustomerLeadSourceFilter("all");
                  setShowAllCustomers(false);
                  setStatus("已清空客户池筛选");
                }}
              >清空筛选</button>
            </div>
            {displayedCustomerOwners.map((record) => (
              <article key={record.id}>
                <button
                  className={customerNeedsFollowUp(record) ? "needs-follow-up" : ""}
                  onClick={() => {
                    setExpandedCustomerId(record.id);
                    setStatus(`已打开客户资料：${record.client || record.phone}，如需报价请点击“继续报价”`);
                  }}
                >
                  <span><b>{record.tier}类</b> <b>{customerFollowStatusLabels[record.followStatus]}</b> {record.country} / {record.phone}</span>
                  <small>{record.owner} · {record.client || "未填客户"} · {record.clientContact || "未填联系人"} · {customerLeadSourceLabels[record.leadSource]} · 更新 {shortDateTime(record.updatedAt)}</small>
                  <small>{ownerIdentityLabel(record.country, record.phone)}</small>
                  <small>{customerFollowUpLabel(record)}</small>
                  <small>
                    报价 {record.quoteCount} 次
                    {record.lastQuoteNo ? ` · 最近 ${record.lastQuoteNo}` : ""}
                    {record.lastQuotedAt ? ` · ${shortDateTime(record.lastQuotedAt)}` : ""}
                    {record.lastQuoteTotal ? ` · ${currency(record.lastQuoteTotal)}` : ""}
                  </small>
                </button>
                <button className="customer-continue-button" aria-label={`继续报价：${record.client || record.phone}`} onClick={() => {
                  loadCustomerOwnerToQuote(record);
                  scrollToWorkspace("quote-workflow");
                }}>继续报价</button>
                <button className="customer-history-button" aria-label={`查看报价历史：${record.client || record.phone}`} onClick={() => showCustomerQuoteHistory(record)}>报价历史</button>
                <button className="customer-edit-button" aria-expanded={expandedCustomerId === record.id} aria-label={`${expandedCustomerId === record.id ? "收起" : "编辑"}客户：${record.client || record.phone}`} onClick={() => setExpandedCustomerId((current) => current === record.id ? "" : record.id)}>
                  {expandedCustomerId === record.id ? "收起编辑" : "编辑客户"}
                </button>
                {expandedCustomerId === record.id ? <div className="customer-resource-editor">
                  <label>
                    等级
                    <select value={record.tier} onChange={(event) => updateCustomerOwner(record.id, "tier", event.target.value)}>
                      <option value="A">A类 最优质</option>
                      <option value="B">B类 跟进中</option>
                      <option value="C">C类 普通/观察</option>
                    </select>
                  </label>
                  <label>
                    状态
                    <select value={record.followStatus} onChange={(event) => updateCustomerOwner(record.id, "followStatus", event.target.value)}>
                      <option value="new">新客户</option>
                      <option value="following">跟进中</option>
                      <option value="quoted">已报价</option>
                      <option value="won">已成交</option>
                      <option value="paused">暂停</option>
                    </select>
                  </label>
                  <label>
                    线索来源
                    <select value={record.leadSource} onChange={(event) => updateCustomerOwner(record.id, "leadSource", event.target.value)}>
                      {(Object.keys(customerLeadSourceLabels) as CustomerLeadSource[]).map((source) => <option key={source} value={source}>{customerLeadSourceLabels[source]}</option>)}
                    </select>
                  </label>
                  <label>客户名称<input value={record.client} onChange={(event) => updateCustomerOwner(record.id, "client", event.target.value)} placeholder="客户或公司名称" /></label>
                  <label>联系人<input value={record.clientContact} onChange={(event) => updateCustomerOwner(record.id, "clientContact", event.target.value)} placeholder="采购 / 负责人" /></label>
                  <label>下次跟进<input type="date" value={record.nextFollowUpDate} onChange={(event) => updateCustomerOwner(record.id, "nextFollowUpDate", event.target.value)} /></label>
                  <label className="customer-resource-note">客户情况<textarea value={record.note} rows={2} onChange={(event) => updateCustomerOwner(record.id, "note", event.target.value)} placeholder="公共情况：项目、需求、预算、阶段" /></label>
                  <label className="customer-resource-note">员工私有备注<textarea value={record.privateNote} rows={2} onChange={(event) => updateCustomerOwner(record.id, "privateNote", event.target.value)} placeholder="仅归属员工和管理员可见" /></label>
                </div> : null}
                {adminUnlocked ? (
                  <button className="danger" onClick={() => deleteCustomerOwner(record.id)}>删除</button>
                ) : null}
              </article>
            ))}
            {!filteredCustomerOwners.length ? <small className="customer-empty-state">{quote.employee.trim() || adminUnlocked ? "没有匹配的客户资源记录，可先用国家 + 电话登记新客户。" : "先填写报价员姓名，即可查看自己的客户资源；管理员解锁后可查看全部客户。"}</small> : null}
            {filteredCustomerOwners.length > 8 ? (
              <button className="customer-list-toggle" type="button" onClick={() => setShowAllCustomers((current) => !current)}>
                {showAllCustomers ? "收起列表" : `显示全部 ${filteredCustomerOwners.length} 条`}
              </button>
            ) : null}
        </div>
      </section>
      ) : null}

      {activeModule === "products" ? (
      <section id="product-search" className="quick-quote" aria-label="产品仓库搜索">
        <div>
          <p className="eyebrow">Quick quote</p>
          <h2>输入编号、尾号、品类或中英文名查找产品</h2>
        </div>
        <label className="admin-search">
          <Search size={17} />
          <input
            value={productCodeInput}
            onChange={(event) => setProductCodeInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") findEntryByCode();
              if (event.key === "Escape") {
                setProductCodeInput("");
                setStatus("已清空产品仓库搜索");
              }
            }}
            placeholder="例如 001 / MH-SF-001 / sofa / 沙发 / 餐桌 / 柜"
            aria-label="输入产品编号或关键词"
          />
        </label>
        <button onClick={findEntryByCode} disabled={!productCodeInput.trim()}>
          <Calculator size={15} />
          查找编号
        </button>
        {selectedSearchEntry && (adminUnlocked || selectedSearchEntry.visible) ? (
          <button onClick={addSelectedEntryFromSearch} title={customerOwnershipIssue || "加入后返回报价流程"}>
            <Plus size={15} />
            加入预备报价 · {selectedSearchEntry.productCode}
          </button>
        ) : null}
        {productSearchMatches.length ? (
          <div className="product-search-results" aria-live="polite">
            <div className="product-search-results-heading">
              <span>匹配 {productSearchMatches.length} 个产品</span>
              {selectedSearchEntry ? <strong>已选：{selectedSearchEntry.productCode} / {selectedSearchEntry.name}</strong> : null}
            </div>
            <div className="product-search-suggestions" role="radiogroup" aria-label="产品仓库搜索结果">
            {productSearchMatches.map((entry) => (
              <button
                className={selectedEntryId === entry.id ? "is-selected" : ""}
                key={entry.id}
                role="radio"
                aria-checked={selectedSearchEntry?.id === entry.id}
                onKeyDown={(event) => handleSearchResultKeyDown(event, entry)}
                onClick={() => {
                  selectSearchEntry(entry);
                }}
              >
                <strong>{entry.productCode}</strong>
                <span>{entry.name} · {categoryGroupLabel(entry.category)}</span>
              </button>
            ))}
            </div>
          </div>
        ) : null}
        {productCodeInput.trim() && !productSearchMatches.length ? (
          <div className="product-search-empty">
            <span>没有匹配产品，请尝试编号尾号、中文名、英文名或品类。</span>
            <button type="button" onClick={() => { setProductCodeInput(""); setStatus("已清空产品仓库搜索"); }}>清空搜索</button>
          </div>
        ) : null}
      </section>
      ) : null}

      {activeModule === "quote" ? (
      <section id="quote-workflow" className="quote-flow" aria-label="三步报价流程">
        <div className="quote-view-switcher" role="tablist" aria-label="报价页面">
          <button className={quoteWorkspaceView === "customer" ? "is-active" : ""} type="button" role="tab" aria-selected={quoteWorkspaceView === "customer"} onClick={() => setQuoteWorkspaceView("customer")}>
            <FileText size={16} />
            <span><strong>客户报价</strong><small>继续当前报价</small></span>
          </button>
          <button className={quoteWorkspaceView === "archive" ? "is-active" : ""} type="button" role="tab" aria-selected={quoteWorkspaceView === "archive"} onClick={() => setQuoteWorkspaceView("archive")}>
            <Archive size={16} />
            <span><strong>报价留档</strong><small>{visibleQuoteHistory.length} 条过往报价</small></span>
          </button>
        </div>
        {quoteWorkspaceView === "customer" ? (
        <div className="quote-customer-workspace">
        <div className="quote-flow-steps" role="group" aria-label="报价步骤导航">
          <button disabled={quoteWorkflowStage === "demand"} aria-current={quoteWorkflowStage === "demand" ? "step" : undefined} className={quoteWorkflowStage === "demand" ? "active" : ""} onClick={restartQuoteWorkflow}>
            <span>01</span>
            客户需求 / 选择公式
          </button>
          <button disabled={quoteWorkflowStage === "demand" || quoteWorkflowStage === "warehouse"} title={quoteWorkflowStage === "demand" ? "先完成第一步并确定报价公式" : undefined} aria-current={quoteWorkflowStage === "warehouse" ? "step" : undefined} className={quoteWorkflowStage === "warehouse" ? "active" : ""} onClick={startWarehouseSelection}>
            <span>02</span>
            上架仓库选品
          </button>
          <button disabled={quoteWorkflowStage !== "warehouse" || !quote.lines.length} title={quoteWorkflowStage !== "warehouse" ? "请先进入第二步上架仓库选品" : !quote.lines.length ? "请先加入至少一个产品" : undefined} aria-current={quoteWorkflowStage === "generated" ? "step" : undefined} className={quoteWorkflowStage === "generated" ? "active" : ""} onClick={confirmSelectedProducts}>
            <span>03</span>
            生成报价单
          </button>
        </div>
        <div className="quote-flow-body">
          {quoteWorkflowStage === "demand" ? (
          <>
          <div>
            <p className="eyebrow">Step 01</p>
            <h2>收到客户需求，填写基础信息并确定报价公式</h2>
          </div>
          <div className="quote-customer-summary" aria-label="客户基础信息摘要">
            <span><small>客户名称</small><strong>{quote.client || "待填写"}</strong></span>
            <span><small>国家 / 电话</small><strong>{[quote.country, quote.clientPhone].filter(Boolean).join(" / ") || "待确认归属"}</strong></span>
            <span><small>报价日期</small><strong>{quote.quoteDate || "待填写"}</strong></span>
            <span><small>报价员</small><strong>{quote.employee || session.name || "待填写"}</strong></span>
          </div>
          <div className="quote-flow-fields">
            <label>
              报价模式
              <select value={workflowPricingRuleId} onChange={(event) => applyWorkflowPricingRule(event.target.value)}>
                {pricingRules.map((rule) => <option key={rule.id} value={rule.id}>{rule.name}</option>)}
              </select>
            </label>
            <label className="quote-flow-demand">
              客户需求
              <textarea value={quote.customerDemand} rows={3} onChange={(event) => updateQuote("customerDemand", event.target.value)} placeholder="记录客户要什么产品、风格、数量、预算、交付地区和特殊要求" />
            </label>
            <div className="quote-pricing-rule-preview">
              <span>当前报价公式</span>
              <strong>{workflowPricingRule?.name ?? "未选择"}</strong>
              <small>{workflowPricingRule?.method === "formula" ? `${workflowPricingRule.expression} · 变量：${workflowPricingRule.variables.join(", ") || "无"}` : workflowPricingRule?.note}</small>
            </div>
            <button className="quote-detail-toggle" onClick={() => setQuoteDetailsOpen((value) => !value)}>
              {quoteDetailsOpen ? "收起客户/项目细节" : "展开客户/项目细节"}
            </button>
            {quoteDetailsOpen ? (
              <>
            <label>报价员姓名<input value={quote.employee} readOnly={session.role === "sales"} onChange={(event) => updateQuote("employee", event.target.value)} placeholder="报价员 / Sales" /></label>
            <label>报价员联系方式<input value={quote.contact} onChange={(event) => updateQuote("contact", event.target.value)} placeholder="电话 / 微信" /></label>
            <label>报价日期<input type="date" value={quote.quoteDate} onChange={(event) => updateQuote("quoteDate", event.target.value)} /></label>
            <label>客户名称<input value={quote.client} onChange={(event) => updateQuote("client", event.target.value)} placeholder="客户或公司名称" /></label>
            <label>客户联系人<input value={quote.clientContact} onChange={(event) => updateQuote("clientContact", event.target.value)} placeholder="采购 / 设计师 / 负责人" /></label>
            <label>客户电话<input value={quote.clientPhone} onChange={(event) => updateQuote("clientPhone", event.target.value)} placeholder="电话 / WhatsApp / 微信" /></label>
            <label>客户邮箱<input value={quote.clientEmail} onChange={(event) => updateQuote("clientEmail", event.target.value)} placeholder="Email" /></label>
            <label>国家<input value={quote.country} onChange={(event) => updateQuote("country", event.target.value)} placeholder="目的国家" /></label>
            <label>城市<input value={quote.city} onChange={(event) => updateQuote("city", event.target.value)} placeholder="目的城市" /></label>
            <label>客户地址<input value={quote.clientAddress} onChange={(event) => updateQuote("clientAddress", event.target.value)} placeholder="收货地址 / 项目地址" /></label>
            <label>项目名称<input value={quote.project} onChange={(event) => updateQuote("project", event.target.value)} placeholder="住宅 / 酒店 / 软装项目" /></label>
              </>
            ) : null}
          </div>
          <div className="quote-flow-actions">
            <button onClick={startWarehouseSelection}>确定公式，进入上架仓库</button>
            {customerOwnershipIssue ? <button type="button" onClick={() => openModule("customers")}>去客户池确认归属</button> : null}
          </div>
          </>
          ) : quoteWorkflowStage === "warehouse" ? (
          <>
            <div>
              <p className="eyebrow">Step 02</p>
              <h2>上架仓库选品</h2>
              <p className="quote-step-note">请在产品仓库中搜索并加入产品。每加入一项，系统会自动回到这张报价流程单。</p>
            </div>
            <div className="prepared-quote quote-step-summary">
              <div>
                <span>当前预备报价单</span>
                <strong>{preparedLineCount} 个产品 · {currency(totals.itemsSubtotal)}</strong>
                <small>固定报价模式：{workflowPricingRule?.name ?? "未选择"}</small>
              </div>
              <div className="quote-flow-actions">
                <button onClick={() => openModule("products")}>进入产品仓库搜索</button>
                <button onClick={confirmSelectedProducts} disabled={!quote.lines.length} title={!quote.lines.length ? "请先从产品仓库搜索并加入产品" : undefined}>确认产品，生成报价单</button>
              </div>
            </div>
            {quote.lines.length ? (
              <div className="quote-selection-table" role="table" aria-label="已选产品明细">
                <div className="quote-selection-row is-header" role="row">
                  <span role="columnheader">产品编号</span>
                  <span role="columnheader">产品名称</span>
                  <span role="columnheader">数量</span>
                  <span role="columnheader">单价</span>
                  <span role="columnheader">小计</span>
                  <span role="columnheader">操作</span>
                </div>
                {quote.lines.slice(0, 10).map((line) => (
                  <div className="quote-selection-row" role="row" key={line.id}>
                    <strong role="cell">{line.productCode}</strong>
                    <span role="cell">{line.name}</span>
                    <span role="cell">{line.quantity}</span>
                    <span role="cell">{currency(line.unitPrice)}</span>
                    <span role="cell">{currency(lineTotal(line))}</span>
                    <span role="cell"><button type="button" onClick={() => removeQuoteLine(line.id)}>移除</button></span>
                  </div>
                ))}
                {quote.lines.length > 10 ? <small className="quote-selection-more">另有 {quote.lines.length - 10} 项将在下方报价明细中显示。</small> : null}
              </div>
            ) : (
              <div className="quote-selection-empty">还没有产品。进入产品仓库，搜索后点击产品上的“加入预备报价单”。</div>
            )}
          </>
          ) : (
          <>
            <div>
              <p className="eyebrow">Step 03</p>
              <h2>报价单已生成</h2>
              <p className="quote-step-note">正式报价单已生成，可在下方检查明细，复制客户版或打印。</p>
            </div>
            <div className="prepared-quote quote-step-summary">
              <div>
                <span>正式报价单</span>
                <strong>{quote.quoteNo || "待编号"} · {preparedLineCount} 个产品 · {currency(totals.total)}</strong>
                <small>报价员：{quote.employee || "未填写"} · 客户：{quote.client || "未填写"}</small>
              </div>
              <div className="quote-flow-actions">
                <button onClick={returnToWarehouseSelection}>回到第二步修改产品</button>
              </div>
            </div>
          </>
          )}
        </div>
        </div>
        ) : (
        <section className="quote-archive-view" aria-label="报价留档">
          <div className="quote-archive-heading">
            <div>
              <p className="eyebrow">Quote archive</p>
              <h2>报价留档</h2>
              <p>这里集中保存销售过往报价，点击一条可以恢复继续编辑，也可以删除不再需要的记录。</p>
            </div>
            <strong>{visibleQuoteHistory.length} 条记录</strong>
          </div>
          <div className="quote-archive-tools">
            <label className="quote-history-search">
              <Search size={14} />
              <input value={quoteHistoryQuery} onChange={(event) => setQuoteHistoryQuery(event.target.value)} placeholder="搜索报价编号、客户、电话、国家、销售或产品" />
            </label>
            <div className="quote-history-actions">
              <button type="button" onClick={restoreLatestQuote}>恢复最近报价</button>
              <button type="button" onClick={() => setQuoteHistoryQuery([quote.country, quote.clientPhone || effectiveOwnerLookup.phone, quote.client].filter(Boolean).join(" "))}>当前客户</button>
              <button type="button" onClick={() => setQuoteHistoryQuery(quote.employee)}>我的报价</button>
              <button type="button" onClick={clearQuoteHistory}>清空留档</button>
            </div>
          </div>
          <div className="quote-archive-list">
            {filteredQuoteHistory.map((snapshot) => (
              <article key={snapshot.id}>
                <button className="quote-archive-record" type="button" onClick={() => { restoreQuoteSnapshot(snapshot.id); setQuoteWorkspaceView("customer"); }}>
                  <span className="quote-archive-record-top">
                    <strong>{snapshot.quote.quoteNo || "未编号报价"}</strong>
                    <em>{snapshot.workflowStage === "generated" ? "已生成" : "草稿"}</em>
                  </span>
                  <span className="quote-archive-record-meta">销售：{snapshot.quote.employee || "未填写"} · 客户：{snapshot.quote.client || "未填写"} · {shortDateTime(snapshot.savedAt)}</span>
                  <span className="quote-archive-record-meta">{snapshot.quote.country || "未填国家"} · {snapshot.quote.clientPhone || "未填电话"} · {snapshot.quote.lines.length} 个产品 · {currency(snapshot.totals.total)}</span>
                </button>
                <button className="quote-archive-delete" type="button" aria-label={`删除 ${snapshot.quote.quoteNo || "未编号报价"} 留档`} title="删除这条报价留档" onClick={() => deleteQuoteSnapshot(snapshot.id)}><Trash2 size={15} /></button>
              </article>
            ))}
            {!filteredQuoteHistory.length ? <div className="quote-archive-empty">{quoteHistoryQuery ? "没有匹配的报价留档。" : "还没有报价留档，完成一张报价后会自动出现在这里。"}</div> : null}
          </div>
        </section>
        )}
      </section>
      ) : null}

      {activeModule === "products" || activeModule === "admin" ? (
      <>
      <section className="admin-toolbar" aria-label="资料筛选与操作">
        <label className="admin-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                setStatus("已清空仓库筛选");
              }
            }}
            placeholder="搜索编号、名称、工厂型号、中文品类或描述"
            aria-label="仓库筛选"
          />
          <button className="admin-search-clear" type="button" onClick={() => { setQuery(""); setStatus("已清空仓库筛选"); }} disabled={!query} aria-label="清空资料搜索" title="清空搜索"><X size={14} /></button>
        </label>
        <div className="admin-filters" role="group" aria-label="产品类型筛选">
          <button className={type === "all" ? "active" : ""} aria-pressed={type === "all"} onClick={() => { setType("all"); setStatus("已显示全部资料"); }}>全部</button>
          <button className={type === "product" ? "active" : ""} aria-pressed={type === "product"} onClick={() => { setType("product"); setStatus("已筛选产品资料"); }}>产品</button>
          <button className={type === "studio" ? "active" : ""} aria-pressed={type === "studio"} onClick={() => { setType("studio"); setStatus("已筛选空间方案"); }}>空间方案</button>
          <button className={onlyVisible ? "active" : ""} aria-pressed={onlyVisible} onClick={() => setOnlyVisible((value) => { const next = !value; setStatus(next ? "已切换为仅看上架" : "已显示全部上架状态"); return next; })}>仅看上架</button>
        </div>
        <div className="category-menu" role="group" aria-label="产品品类筛选">
          <button className={categoryFilter === "all" ? "active" : ""} onClick={() => { setCategoryFilter("all"); setStatus("已显示全部品类"); }}>全部品类</button>
          {groupedCategoryOptions.map((item) => (
            <button className={categoryFilter === item.category ? "active" : ""} key={item.category} onClick={() => { setCategoryFilter(item.category); setStatus(`已筛选${item.major} / ${item.minor}`); }}>
              <strong>{item.major}</strong>
              <span>{item.minor}</span>
              <small>上架 {item.stats.visible} / 现货 {item.stats.inStock} / 全部 {item.stats.total}</small>
            </button>
          ))}
        </div>
        <div className="admin-actions">
          {activeModule === "products" ? (
            <button onClick={printQuoteSheet} title="打印第三步生成的正式报价单"><Printer size={15} />打印正式报价</button>
          ) : (
            <>
              <button disabled={!adminUnlocked} title="新增产品资料" onClick={addEntry}><Plus size={15} />新增产品</button>
              <button disabled={!adminUnlocked} title="检查并修复产品编号" onClick={repairProductCodes}><RotateCcw size={15} />修复编号</button>
              <button disabled={!adminUnlocked} title="导出完整产品资料" onClick={exportCatalogueJson}><FileDown size={15} />导出全部资料</button>
              <label className={`admin-button${adminUnlocked ? "" : " is-disabled"}`} title="导入工作台 JSON 资料">
                <Upload size={15} />
                导入 JSON
                <input disabled={!adminUnlocked} type="file" accept="application/json,.json" onChange={importJson} />
              </label>
              <button disabled={!adminUnlocked} title="恢复默认产品和公式资料" onClick={reset}><RotateCcw size={15} />恢复默认</button>
            </>
          )}
        </div>
      </section>

      <div className="admin-summary">
        <strong>{filteredEntries.length}</strong> / {entries.length} 条资料 <span>·</span>
        {entries.filter((entry) => entry.visible).length} 条上架 <span>·</span>
        {pricingRules.length} 个报价公式 <span>·</span>
        {quote.lines.length} 条报价明细 <span>·</span>
        {visibleQuoteHistory.length} 个报价留档 <span>·</span>
        {blockingIssueCount} 个阻断问题 <span>·</span>
        合计 {currency(totals.total)}
      </div>

      <section className={`admin-audit${blockingIssueCount ? " has-errors" : ""}`} aria-label="后台数据自检">
        <div>
          <p className="eyebrow">Data audit</p>
          <h2>{dataIssues.length ? `${dataIssues.length} 个数据提示` : "数据自检通过"}</h2>
        </div>
        {dataIssues.length ? (
          <div className="admin-audit-list">
            {dataIssues.slice(0, 6).map((issue, issueIndex) => (
              <span className={issue.level === "error" ? "is-error" : ""} key={`${issue.label}-${issue.detail}-${issueIndex}`}>
                {issue.label}：{issue.detail}
              </span>
            ))}
            {dataIssues.length > 6 ? <span>另有 {dataIssues.length - 6} 个提示，请导出资料 JSON 查看完整清单。</span> : null}
          </div>
        ) : (
          <p>产品编号、报价公式、当前报价草稿没有发现阻断问题。</p>
        )}
      </section>
      </>
      ) : null}

      {activeModule !== "home" && activeModule !== "customers" && !(activeModule === "quote" && quoteWorkspaceView === "archive") ? (
      <div className={`admin-workspace admin-workspace-${activeModule}${activeModule === "quote" ? ` admin-workspace-quote-${quoteWorkflowStage}` : ""}`}>
        <section id="product-warehouse" className="admin-library" aria-label="产品资料库">
          <div className="admin-section-heading">
            <div>
              <p>Product master</p>
              <h2>产品图册与编号</h2>
            </div>
            <span>{activeModule === "admin" ? "点击图片查看详情 · 新增产品默认待确认" : "点击图片查看详情 · 当前只展示已上架产品"}</span>
          </div>
          <div className="warehouse-metrics" aria-label="产品仓库状态概览">
            <span><strong>{warehouseStats.visible}</strong> 上架</span>
            <span><strong>{warehouseStats.inStock}</strong> 现货</span>
            <span><strong>{warehouseStats.limited}</strong> 限量</span>
            <span><strong>{warehouseStats.madeToOrder}</strong> 定制</span>
            <span><strong>{warehouseStats.unavailable}</strong> 隐藏/不可用</span>
          </div>
          <div className="admin-grid">
            {filteredEntries.map((entry) => {
              const preparedQuantity = quote.lines
                .filter((line) => line.entryId === entry.id)
                .reduce((total, line) => total + line.quantity, 0);
              return (
              <article className={`admin-card${entry.visible ? "" : " is-hidden"}${expandedEntryId === entry.id ? " is-expanded" : ""}`} key={entry.id}>
                <button className="admin-card-media" type="button" onClick={() => {
                  const willExpand = expandedEntryId !== entry.id;
                  setExpandedEntryId(willExpand ? entry.id : "");
                  setStatus(willExpand ? `已展开产品详情：${entry.productCode} / ${entry.name}` : `已收起产品详情：${entry.productCode}`);
                }} aria-expanded={expandedEntryId === entry.id} aria-label={`${expandedEntryId === entry.id ? "收起" : "查看"}${entry.name}详情`}>
                  <Image src={entry.image} alt={entry.name || entry.productCode || "产品图片"} fill sizes="(max-width: 900px) 100vw, 260px" unoptimized={entry.image.startsWith("data:")} />
                </button>
                <div className="admin-card-body">
                  <div className="admin-card-meta">
                    <button onClick={() => selectSearchEntry(entry)}>{entry.productCode}</button>
                    <button disabled={!adminUnlocked} title={adminUnlocked ? "修改产品上架状态" : "需要管理员权限才能调整上架状态"} onClick={() => updateEntry(entry.id, "visible", !entry.visible)}>{entry.visible ? "已上架" : "已隐藏"}</button>
                  </div>
                  <div className="admin-card-compact">
                    <strong>{entry.name || "未命名产品"}</strong>
                    <small>{entry.basePrice > 0 ? `统一售价 ${currency(entry.basePrice)}` : "统一售价待管理员设置"}</small>
                  </div>
                  {expandedEntryId === entry.id ? <>
                  <label>产品编号<input disabled={!adminUnlocked} value={entry.productCode} onChange={(event) => updateEntry(entry.id, "productCode", event.target.value.toUpperCase())} /></label>
                  <label>工厂型号<input disabled={!adminUnlocked} value={entry.factoryModel} onChange={(event) => updateEntry(entry.id, "factoryModel", event.target.value)} placeholder="用于工厂 / 采购 / 对单" /></label>
                  <label>名称<input disabled={!adminUnlocked} value={entry.name} onChange={(event) => updateEntry(entry.id, "name", event.target.value)} /></label>
                  <label>分类<input disabled={!adminUnlocked} value={entry.category} onChange={(event) => updateEntry(entry.id, "category", event.target.value)} /></label>
                  <label>统一售价（CNY）<input disabled={!adminUnlocked} type="number" min="0" step="1" value={entry.basePrice} onChange={(event) => updateEntry(entry.id, "basePrice", numberValue(event.target.value))} /></label>
                  <div className="category-hierarchy">
                    <span>大类 / 小类</span>
                    <strong>{categoryGroupLabel(entry.category)}</strong>
                    <small>系统类目：{categoryLabel(entry.category)}</small>
                  </div>
                  <label>
                    库存状态
                    <select disabled={!adminUnlocked} value={entry.stockStatus} onChange={(event) => updateEntry(entry.id, "stockStatus", event.target.value)}>
                      <option value="in-stock">现货</option>
                      <option value="limited">限量</option>
                      <option value="made-to-order">定制</option>
                      <option value="unavailable">暂不可用</option>
                    </select>
                  </label>
                  <label>仓位/区域<input disabled={!adminUnlocked} value={entry.warehouseLocation} onChange={(event) => updateEntry(entry.id, "warehouseLocation", event.target.value)} placeholder="Main warehouse / A区-01" /></label>
                  <label>
                    报价公式
                    <select disabled={!adminUnlocked} value={entry.pricingRuleId} onChange={(event) => updateEntry(entry.id, "pricingRuleId", event.target.value)}>
                      {pricingRules.map((rule) => <option key={rule.id} value={rule.id}>{rule.name}</option>)}
                    </select>
                  </label>
                  <label>报价图片路径<input disabled={!adminUnlocked} value={entry.image} onChange={(event) => updateEntry(entry.id, "image", event.target.value)} /></label>
                  <label>仓库备注<textarea disabled={!adminUnlocked} value={entry.warehouseNote} rows={2} onChange={(event) => updateEntry(entry.id, "warehouseNote", event.target.value)} placeholder="库存数量、样品状态、包装或特殊注意事项" /></label>
                  <label>一句话描述<textarea disabled={!adminUnlocked} value={entry.tagline} rows={2} onChange={(event) => updateEntry(entry.id, "tagline", event.target.value)} /></label>
                  <div className="admin-card-footer">
                    <button className={preparedQuantity ? "is-added" : undefined} disabled={entry.stockStatus === "unavailable"} onClick={() => addWarehouseEntryToQuote(entry)} title={preparedQuantity ? `已加入预备报价单 ${preparedQuantity} 件，点击可继续增加` : "加入预备报价单"}><Plus size={14} />{preparedQuantity ? `已加入 · ${preparedQuantity}件` : "加入预备报价单"}</button>
                    <button disabled={!adminUnlocked} onClick={() => deleteEntry(entry.id)}><Trash2 size={14} />删除</button>
                    <a href={entry.type === "product" ? `/app/products/${entry.slug}` : `/app/studio/${entry.slug}`} target="_blank" rel="noreferrer">
                      查看图册 <ExternalLink size={13} />
                    </a>
                  </div>
                  </> : <button className="admin-card-more" type="button" onClick={() => setExpandedEntryId(entry.id)}>查看详情 <span aria-hidden="true">→</span></button>}
                </div>
              </article>
              );
            })}
            {!filteredEntries.length ? (
              <div className="admin-empty-state">
                <strong>没有找到匹配产品</strong>
                <span>可以清除搜索、品类和类型条件；“仅看上架”会继续保护销售视图。</span>
                <button type="button" onClick={() => { setQuery(""); setCategoryFilter("all"); setType("all"); }}>清除搜索与品类</button>
              </div>
            ) : null}
          </div>

          <div className="pricing-editor">
          <div className="admin-section-heading">
            <div>
              <p>Pricing rules</p>
              <h2>固定报价模式管理</h2>
            </div>
            <button disabled={!adminUnlocked} onClick={addPricingRule}><Plus size={14} />新增公式</button>
          </div>
            <div className="pricing-grid">
              {pricingRules.map((rule) => {
                const sampleVariables = sampleVariablesForRule(rule);
                const samplePrice = rule.method === "formula" ? calculateExpression(rule.expression, sampleVariables) : null;
                return (
                  <article className="pricing-card" key={rule.id}>
                    <label>公式名称<input disabled={!adminUnlocked} value={rule.name} onChange={(event) => updatePricingRule(rule.id, "name", event.target.value)} /></label>
                    <label>
                      模式
                      <select disabled={!adminUnlocked} value={rule.method} onChange={(event) => updatePricingRule(rule.id, "method", event.target.value as PricingRule["method"])}>
                        <option value="formula">公式计算</option>
                        <option value="manual-review">人工核价</option>
                      </select>
                    </label>
                    <label>变量<input disabled={!adminUnlocked} value={rule.variables.join(", ")} onChange={(event) => updatePricingRule(rule.id, "variables", parseVariables(event.target.value))} placeholder="basePrice, materialUpgrade" /></label>
                    <label>表达式<input disabled={!adminUnlocked} value={rule.expression} onChange={(event) => updatePricingRule(rule.id, "expression", event.target.value)} placeholder="basePrice + materialUpgrade" /></label>
                    <label>说明<textarea disabled={!adminUnlocked} value={rule.note} rows={2} onChange={(event) => updatePricingRule(rule.id, "note", event.target.value)} /></label>
                    <p className={validatePricingRule(rule) === "公式自检通过。" ? "pricing-check is-ok" : "pricing-check"}>
                      {validatePricingRule(rule)}
                    </p>
                    <div className="pricing-simulator">
                      <div>
                        <span>公式试算</span>
                        <strong>{rule.method === "formula" && samplePrice !== null ? currency(samplePrice) : "人工核价"}</strong>
                      </div>
                      {rule.method === "formula" && rule.variables.length ? (
                        <div className="pricing-sample-grid">
                          {rule.variables.map((variable) => (
                            <label key={variable}>
                              {variable}
                              <input type="number" value={sampleVariables[variable] ?? 1} onChange={(event) => updatePricingSample(rule.id, variable, event.target.value)} />
                            </label>
                          ))}
                        </div>
                      ) : (
                        <small>此规则不自动计算，报价单会标记为需要人工核价。</small>
                      )}
                    </div>
                    <button disabled={!adminUnlocked} onClick={() => deletePricingRule(rule.id)}><Trash2 size={14} />删除公式</button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <aside id="quote-sheet" className="quote-panel" aria-label="内部员工报价系统">
          <div className="admin-section-heading">
            <div>
              <p>Internal quote</p>
              <h2>员工报价单 V{quote.version}</h2>
            </div>
            <div className="quote-panel-actions">
              <button className="quote-clear-button" onClick={archiveQuote}>留档</button>
              <button className="quote-clear-button" onClick={newQuoteVersion}>修订版</button>
              <button className="quote-clear-button" onClick={assignNextQuoteNo}>自动编号</button>
              <button className="quote-clear-button quote-new-button" onClick={startNewQuote}><Plus size={14} />新开报价</button>
            </div>
          </div>

          <div className="quote-selected">
            <span>当前编号</span>
            <strong>{selectedEntry?.productCode ?? "-"}</strong>
            <small>{selectedEntry ? `${selectedEntry.name} / 当前固定模式：${workflowPricingRule?.name ?? selectedRule?.name ?? "未设置公式"}` : "先输入或选择产品编号"}</small>
          </div>

          <div className={`quote-readiness${quoteBlockingIssueCount ? " has-errors" : ""}`}>
            <div>
              <span>发出前检查</span>
              <strong>{quoteReadinessIssues.length ? `${quoteReadinessIssues.length} 个提示` : "当前报价可发出"}</strong>
            </div>
            {quoteReadinessIssues.length ? (
              <div className="quote-readiness-list">
                {quoteReadinessIssues.slice(0, 5).map((issue, issueIndex) => {
                  const action = quoteIssueAction(issue);
                  return (
                    <div className={issue.level === "error" ? "is-error" : ""} key={`${issue.label}-${issue.detail}-${issueIndex}`}>
                      <small>{issue.label}：{issue.detail}</small>
                      <button onClick={() => scrollToWorkspace(action.targetId)}>{action.label}</button>
                    </div>
                  );
                })}
                {quoteReadinessIssues.length > 5 ? <small>另有 {quoteReadinessIssues.length - 5} 个提示会写入报价 JSON。</small> : null}
              </div>
            ) : (
              <small>报价编号、明细数量、价格和客户关键信息已通过基础检查。</small>
            )}
          </div>

          {quoteDetailsOpen ? (
          <div className="quote-fields">
            <label>报价编号<input value={quote.quoteNo} onChange={(event) => updateQuote("quoteNo", event.target.value)} /></label>
            <label>报价日期<input type="date" value={quote.quoteDate} onChange={(event) => updateQuote("quoteDate", event.target.value)} /></label>
            <label>
              状态
              <select value={quote.status} onChange={(event) => updateQuote("status", event.target.value)}>
                <option value="draft">草稿</option>
                <option value="sent">已发送</option>
                <option value="revised">已修订</option>
                <option value="approved">已确认</option>
              </select>
            </label>
            <label>报价员<input value={quote.employee} readOnly={session.role === "sales"} onChange={(event) => updateQuote("employee", event.target.value)} placeholder="填写报价人" /></label>
            <label>联系方式<input value={quote.contact} onChange={(event) => updateQuote("contact", event.target.value)} placeholder="电话 / 微信" /></label>
            <label>客户<input value={quote.client} onChange={(event) => updateQuote("client", event.target.value)} placeholder="客户或公司名称" /></label>
            <label>客户联系人<input value={quote.clientContact} onChange={(event) => updateQuote("clientContact", event.target.value)} placeholder="采购 / 设计师 / 负责人" /></label>
            <label>客户电话<input value={quote.clientPhone} onChange={(event) => updateQuote("clientPhone", event.target.value)} placeholder="电话 / WhatsApp / 微信" /></label>
            <label>客户邮箱<input value={quote.clientEmail} onChange={(event) => updateQuote("clientEmail", event.target.value)} placeholder="Email" /></label>
            <label>国家<input value={quote.country} onChange={(event) => updateQuote("country", event.target.value)} placeholder="目的国家" /></label>
            <label>城市<input value={quote.city} onChange={(event) => updateQuote("city", event.target.value)} placeholder="目的城市" /></label>
            <label>客户地址<input value={quote.clientAddress} onChange={(event) => updateQuote("clientAddress", event.target.value)} placeholder="收货地址 / 项目地址" /></label>
            <label>项目<input value={quote.project} onChange={(event) => updateQuote("project", event.target.value)} placeholder="住宅 / 酒店 / 软装项目" /></label>
            <label>有效期<input type="date" value={quote.validUntil} onChange={(event) => updateQuote("validUntil", event.target.value)} /></label>
            <label>物流费<input type="number" min="0" value={quote.deliveryFee} onChange={(event) => updateQuoteNumber("deliveryFee", event.target.value)} /></label>
            <label>安装费<input type="number" min="0" value={quote.installationFee} onChange={(event) => updateQuoteNumber("installationFee", event.target.value)} /></label>
            <label>整单优惠<input type="number" min="0" value={quote.extraDiscount} onChange={(event) => updateQuoteNumber("extraDiscount", event.target.value)} /></label>
            <label>定金%<input type="number" min="0" max="100" value={quote.depositRate} onChange={(event) => updateQuoteNumber("depositRate", event.target.value)} /></label>
          </div>
          ) : null}

          <div id="quote-lines" className="quote-lines">
            {quote.lines.length ? (
              quote.lines.map((line) => {
                const rule = pricingRules.find((item) => item.id === line.pricingRuleId);
                return (
                  <article className="quote-line" key={line.id}>
                    <div className="quote-line-image">
                      <Image src={line.image} alt="" fill sizes="70px" unoptimized={line.image.startsWith("data:")} />
                    </div>
                    <div className="quote-line-main">
                      <div className="quote-line-title">
                        <div>
                          <strong>{line.productCode} / {line.name}</strong>
                          <span>{line.factoryModel ? `${line.factoryModel} · ` : ""}{categoryGroupLabel(line.category)} · {stockStatusLabels[line.stockStatus]} · {line.warehouseLocation || "未填仓位"} · {rule?.name ?? "未设置公式"}</span>
                        </div>
                        <div className="quote-line-actions">
                          <button aria-label={`复制 ${line.name}`} onClick={() => duplicateQuoteLine(line)}><Copy size={14} /></button>
                          <button aria-label={`移除 ${line.name}`} onClick={() => removeQuoteLine(line.id)}><Minus size={14} /></button>
                        </div>
                      </div>
                      {rule?.method === "formula" && rule.variables.length ? (
                        <div className="quote-variable-grid">
                          {rule.variables.map((variable) => (
                            <label key={variable}>
                              {variable}
                              <input type="number" value={line.variables[variable] ?? 0} onChange={(event) => updateLineVariable(line.id, variable, event.target.value)} />
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="quote-review">PRICE REQUIRES REVIEW：此产品需要人工核价后再发正式报价。</div>
                      )}
                      <div className="quote-line-controls">
                        <label>规格<input value={line.spec} onChange={(event) => updateLine(line.id, "spec", event.target.value)} placeholder="长 x 宽 x 高 / 型号" /></label>
                        <label>材质<input value={line.material} onChange={(event) => updateLine(line.id, "material", event.target.value)} placeholder="木材 / 皮革 / 布艺 / 石材 / 颜色" /></label>
                        <label>数量<input type="number" min="0" value={line.quantity} onChange={(event) => updateLine(line.id, "quantity", numberValue(event.target.value))} /></label>
                        <label>重量kg<input type="number" min="0" value={line.weight} onChange={(event) => updateLine(line.id, "weight", numberValue(event.target.value))} /></label>
                        <label>长cm<input type="number" min="0" value={line.packageLength} onChange={(event) => updateLine(line.id, "packageLength", numberValue(event.target.value))} /></label>
                        <label>宽cm<input type="number" min="0" value={line.packageWidth} onChange={(event) => updateLine(line.id, "packageWidth", numberValue(event.target.value))} /></label>
                        <label>高cm<input type="number" min="0" value={line.packageHeight} onChange={(event) => updateLine(line.id, "packageHeight", numberValue(event.target.value))} /></label>
                        <label>单价<input type="number" min="0" value={line.unitPrice} onChange={(event) => updateLine(line.id, "unitPrice", numberValue(event.target.value))} /></label>
                        <label>成本<input type="number" min="0" value={line.costPrice} onChange={(event) => updateLine(line.id, "costPrice", numberValue(event.target.value))} /></label>
                        <label>折扣%<input type="number" min="0" max="100" value={line.discount} onChange={(event) => updateLine(line.id, "discount", numberValue(event.target.value))} /></label>
                      </div>
                      <label className="quote-note">备注<input value={line.note} onChange={(event) => updateLine(line.id, "note", event.target.value)} /></label>
                      <div className="quote-line-total">
                        {currency(lineTotal(line))}
                        {line.costPrice > 0 ? <small>内部毛利 {currency(lineTotal(line) - lineCostTotal(line))} / {percent(marginRate(lineTotal(line) - lineCostTotal(line), lineTotal(line)))}</small> : null}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="quote-empty">
                <span>输入产品编号，系统会自动带出产品图片、产品编号、工厂型号、报价公式和变量。</span>
                <div className="quote-empty-actions">
                  <button type="button" onClick={() => openModule("products")}>进入产品仓库搜索</button>
                </div>
              </div>
            )}
          </div>

          {quoteDetailsOpen ? (
          <>
          <label className="quote-remarks">
            客户需求
            <textarea value={quote.customerDemand} rows={3} onChange={(event) => updateQuote("customerDemand", event.target.value)} />
          </label>

          <label className="quote-remarks">
            报价备注
            <textarea value={quote.remarks} rows={3} onChange={(event) => updateQuote("remarks", event.target.value)} />
          </label>

          <div className="quote-terms">
            <label>交付周期<input value={quote.leadTime} onChange={(event) => updateQuote("leadTime", event.target.value)} /></label>
            <label>付款条款<input value={quote.paymentTerms} onChange={(event) => updateQuote("paymentTerms", event.target.value)} /></label>
            <label>物流渠道<input value={quote.logisticsMode} onChange={(event) => updateQuote("logisticsMode", event.target.value)} placeholder="海运 / 陆运 / 空运 / 客户自提" /></label>
            <label>工厂声明<textarea value={quote.factoryStatement} rows={4} onChange={(event) => updateQuote("factoryStatement", event.target.value)} /></label>
          </div>
          </>
          ) : null}

          {quote.lines.length ? <div className="freight-estimator">
            <div aria-live="polite">
              <span>物流估算</span>
              <strong>{currency(Math.round(suggestedDeliveryFee))}</strong>
              <small>{quote.logisticsMode ? `当前方式：${quote.logisticsMode}` : "尚未选择物流方式"} · {volume(totals.totalVolume)} · {totals.totalWeight} kg · {quote.country || "未填国家"} / {quote.city || "未填城市"}</small>
            </div>
            <span className="logistics-preset-heading">选择物流方式</span>
            <div className="logistics-preset-grid" role="group" aria-label="物流方式选择">
              {logisticsPresets.map((preset) => (
                <button className={quote.logisticsMode === preset.mode ? "is-selected" : ""} key={preset.id} onClick={() => applyLogisticsPreset(preset)} aria-pressed={quote.logisticsMode === preset.mode}>
                  <strong>{preset.name}</strong>
                  <span>{preset.note}</span>
                  {quote.logisticsMode === preset.mode ? <em>已选择</em> : null}
                </button>
              ))}
            </div>
            <div className="freight-estimator-grid">
              <label>基础费<input type="number" min="0" value={quote.freightBaseFee} onChange={(event) => updateQuoteNumber("freightBaseFee", event.target.value)} /></label>
              <label>CBM单价<input type="number" min="0" value={quote.freightRatePerCbm} onChange={(event) => updateQuoteNumber("freightRatePerCbm", event.target.value)} /></label>
              <label>KG单价<input type="number" min="0" value={quote.freightRatePerKg} onChange={(event) => updateQuoteNumber("freightRatePerKg", event.target.value)} /></label>
            </div>
            <button onClick={applySuggestedDeliveryFee} disabled={suggestedDeliveryFee <= 0} title={suggestedDeliveryFee <= 0 ? "先在报价单中填写产品重量或包装尺寸" : "将估算金额写入报价单"}>写入物流费</button>
          </div> : <div className="freight-estimator-empty">先在产品仓库加入产品，系统会根据数量、重量和包装尺寸显示物流估算。</div>}

          {activeModule === "logistics" || quote.lines.length ? <div id="exchange-logistics" className="exchange-logistics-panel">
            <div className="exchange-head">
              <div>
                <span>今日汇率参考</span>
                <strong>{foreignCurrency(totals.total, selectedCurrency, exchangeRates)}</strong>
                <small>{exchangeRateStatus} · {exchangeRateDate}</small>
              </div>
              <label>
                目标货币
                <select value={selectedCurrency} onChange={(event) => setSelectedCurrency(event.target.value as CurrencyCode)}>
                  {currencyCodes.map((code) => <option key={code} value={code}>{currencyLabels[code]}</option>)}
                </select>
              </label>
              <button className="exchange-refresh" type="button" onClick={() => void refreshExchangeRates()} disabled={isRefreshingExchangeRates}>
                <RotateCcw size={14} />
                {isRefreshingExchangeRates ? "刷新中" : "刷新汇率"}
              </button>
            </div>
            <div className="exchange-converter" aria-label="快速汇率换算">
              <div className="exchange-converter-heading">
                <div>
                  <span>快速换算</span>
                  <small>像搜索引擎换算一样，选择两种货币即可查看参考值</small>
                </div>
                <span className="exchange-converter-date">{exchangeRateDate}</span>
              </div>
              <div className="exchange-converter-row">
                <label className="exchange-converter-field">
                  <span>金额</span>
                  <div>
                    <input type="number" min="0" step="any" value={exchangeAmount} onChange={(event) => setExchangeAmount(event.target.value)} aria-label="换算金额" />
                    <select value={exchangeFrom} onChange={(event) => setExchangeFrom(event.target.value as ConverterCurrency)} aria-label="换出货币">
                      {converterCurrencies.map((code) => <option key={code} value={code}>{converterCurrencyLabels[code]}</option>)}
                    </select>
                  </div>
                </label>
                <button className="exchange-swap" type="button" onClick={() => { setExchangeFrom(exchangeTo); setExchangeTo(exchangeFrom); }} aria-label="交换换算货币" title="交换货币"><ArrowLeftRight size={18} /></button>
                <label className="exchange-converter-field exchange-converter-result">
                  <span>换算结果</span>
                  <div>
                    <strong aria-live="polite">{formatConverterValue(exchangeConversion, exchangeTo)}</strong>
                    <select value={exchangeTo} onChange={(event) => setExchangeTo(event.target.value as ConverterCurrency)} aria-label="目标货币">
                      {converterCurrencies.map((code) => <option key={code} value={code}>{converterCurrencyLabels[code]}</option>)}
                    </select>
                  </div>
                </label>
              </div>
              <small className="exchange-converter-foot">1 {exchangeFrom} ≈ {formatConverterValue(converterRate(exchangeTo, exchangeRates) / Math.max(converterRate(exchangeFrom, exchangeRates), 0.000001), exchangeTo)} · {exchangeRateStatus}</small>
            </div>
            <div className="exchange-rate-grid">
              {currencyCodes.map((code) => (
                <span key={code}>
                  {code}
                  <strong>{foreignCurrency(totals.total, code, exchangeRates)}</strong>
                </span>
              ))}
            </div>
            <div className="container-planner">
              <div>
                <span>国际物流粗估</span>
                <small>按当前报价单总体积和总重量估算装柜，占比越高越接近满柜。</small>
              </div>
              {containerPlans.map((plan) => (
                <article key={plan.id}>
                  <strong>{plan.name}</strong>
                  <span>{containerLoadLabel(plan, totals)}</span>
                  <small>{volume(plan.volumeCbm)} / {plan.maxWeightKg} kg</small>
                </article>
              ))}
            </div>
          </div> : null}

          {quote.lines.length ? <div className="quote-totals">
            <div><span>产品小计</span><strong>{currency(totals.itemsSubtotal)}</strong></div>
            <div><span>总重量</span><strong>{totals.totalWeight} kg</strong></div>
            <div><span>总体积</span><strong>{volume(totals.totalVolume)}</strong></div>
            <div><span>物流与安装</span><strong>{currency(totals.fees)}</strong></div>
            <div><span>整单优惠</span><strong>-{currency(totals.discount)}</strong></div>
            <div><span>税费</span><strong>{currency(totals.tax)}</strong></div>
            <div><span>建议定金</span><strong>{currency(totals.deposit)}</strong></div>
            <div><span>预计尾款</span><strong>{currency(totals.balance)}</strong></div>
            <div className="quote-grand-total"><span>合计</span><strong>{currency(totals.total)}</strong></div>
          </div> : <div className="quote-empty-summary">加入产品后显示产品小计、物流费用、定金和报价合计。</div>}

          {quoteWorkflowStage === "generated" ? (
            <div className="generated-quote-sheet">
              <div className="generated-quote-head">
                <span>正式报价单</span>
                <strong>{quote.quoteNo || "-"} / V{quote.version}</strong>
                <small>{quote.quoteDate || "-"} · {quote.generatedAt ? `生成 ${shortDateTime(quote.generatedAt)}` : "未记录生成时间"} · {quote.employee || "未填报价员"} · {quote.client || "未填客户"}</small>
              </div>
              <div className="generated-internal-copy">
                <span>内部备货清单已准备</span>
                <button onClick={copyWarehousePickListText}>复制给仓库/采购</button>
              </div>
              <div className="generated-delivery-checklist">
                <div>
                  <span>交付清单</span>
                  <small>销售发出前按这些项复核，避免漏客户、漏仓库、漏物流。</small>
                </div>
                {deliveryChecklist.map((item) => (
                  <article className={item.ok ? "is-ok" : "needs-work"} key={item.label}>
                    {item.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </article>
                ))}
              </div>
              <div className="generated-follow-up-actions">
                <span>报价后跟进</span>
                <small>{customerOwnerRecord ? customerFollowUpLabel(customerOwnerRecord) : "先确认客户归属"}</small>
                <button onClick={() => scheduleQuoteFollowUp(3)}>3天后</button>
                <button onClick={() => scheduleQuoteFollowUp(7)}>7天后</button>
                <button onClick={() => scheduleQuoteFollowUp(14)}>14天后</button>
              </div>
              <div className="generated-owner-record">
                <span>内部归属确认</span>
                <strong>{customerOwnerSummary(customerOwnerRecord)}</strong>
              </div>
              <div className="generated-client-grid">
                <span>客户：{quote.client || "-"}</span>
                <span>联系人：{quote.clientContact || "-"}</span>
                <span>电话：{quote.clientPhone || "-"}</span>
                <span>邮箱：{quote.clientEmail || "-"}</span>
                <span>国家/城市：{[quote.country, quote.city].filter(Boolean).join(" / ") || "-"}</span>
                <span>地址：{quote.clientAddress || "-"}</span>
                <span>项目：{quote.project || "-"}</span>
                <span>有效期：{quote.validUntil || "-"}</span>
              </div>
              <p>{quote.customerDemand || "未填写客户需求。"}</p>
              <div className="generated-lines">
                {quote.lines.map((line) => (
                  <article key={line.id}>
                    <div className="generated-line-image">
                      <Image src={line.image} alt="" fill sizes="76px" unoptimized={line.image.startsWith("data:")} />
                    </div>
                    <div>
                      <strong>{line.productCode} / {line.name}</strong>
                      <span>{categoryGroupLabel(line.category)} · {stockStatusLabels[line.stockStatus]} · {line.spec || "未填写规格"} · {line.material || "未填写材质"} · {line.weight || 0} kg · {volume(lineVolume(line))} · x{line.quantity}</span>
                    </div>
                    <b>{currency(lineTotal(line))}</b>
                  </article>
                ))}
              </div>
              <div className="generated-total">
                <span>统一报价合计</span>
                <strong>{currency(totals.total)}</strong>
              </div>
              <div className="generated-quote-intelligence">
                <div>
                  <span>外币参考</span>
                  <strong>{exchangeSnapshot.selectedCurrencyFormatted}</strong>
                  <small>{exchangeSnapshot.selectedCurrencyLabel} · {exchangeSnapshot.status}</small>
                </div>
                <div>
                  <span>推荐货柜</span>
                  <strong>{logisticsSnapshot.recommendedContainer ? logisticsSnapshot.recommendedContainer.name : "待加入产品"}</strong>
                  <small>{logisticsSnapshot.recommendedContainer ? logisticsSnapshot.recommendedContainer.loadLabel : "需要先填写产品重量和包装尺寸"}</small>
                </div>
              </div>
              <div className="generated-commercials">
                <div><span>产品小计</span><strong>{currency(totals.itemsSubtotal)}</strong></div>
                <div><span>内部成本</span><strong>{currency(totals.totalCost)}</strong></div>
                <div><span>内部毛利</span><strong>{currency(totals.grossProfit)} / {percent(totals.grossMargin)}</strong></div>
                <div><span>物流渠道</span><strong>{quote.logisticsMode || "-"}</strong></div>
                <div><span>物流与安装</span><strong>{currency(totals.fees)}</strong></div>
                <div><span>建议物流</span><strong>{currency(Math.round(suggestedDeliveryFee))}</strong></div>
                <div><span>整单优惠</span><strong>-{currency(totals.discount)}</strong></div>
                <div><span>总重量</span><strong>{totals.totalWeight} kg</strong></div>
                <div><span>总体积</span><strong>{volume(totals.totalVolume)}</strong></div>
                <div><span>定金比例</span><strong>{Math.min(Math.max(quote.depositRate, 0), 100)}%</strong></div>
                <div><span>建议定金</span><strong>{currency(totals.deposit)}</strong></div>
                <div><span>预计尾款</span><strong>{currency(totals.balance)}</strong></div>
              </div>
              <div className="generated-terms">
                <span>交付周期：{quote.leadTime || "-"}</span>
                <span>付款条款：{quote.paymentTerms || "-"}</span>
                <span>报价备注：{quote.remarks || "-"}</span>
              </div>
              <div className="generated-factory-statement">
                <strong>工厂声明</strong>
                <small>{quote.factoryStatement}</small>
              </div>
              <div className="generated-customer-output">
                <div className="generated-customer-preview">
                  <div>
                    <span>客户版报价预览</span>
                    <small>这是最后发送给客户的版本，不含客户归属、员工私有备注、公式变量和内部自检。</small>
                  </div>
                  <pre>{customerQuotePreviewText}</pre>
                </div>
                <div className="generated-customer-copy">
                  <span>客户版报价输出</span>
                  <button onClick={copyCustomerQuoteText}>复制客户版报价单</button>
                  <button onClick={exportQuoteTemplate}><FileDown size={15} />导出 Excel 报价单</button>
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
      ) : null}
      </div>
    </main>
  );
}
