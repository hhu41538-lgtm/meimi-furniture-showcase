# MEIMI&H Internal Quotation Workbench

## Product Boundary

This is an internal employee tool for the MEIMI&H sales team. It is designed to work as an adaptive web app and as the foundation for an Android wrapper. It is not a public storefront: there is no blog, about page, contact page, marketing hero, public catalogue navigation, or synthetic performance dashboard.

The workbench keeps the existing local-data model and business rules: staff-owned customer records, private employee notes, administrator-only formula and catalogue maintenance, product codes, quote history, Excel export, daily currency conversion, and logistics estimation.

## Surface Direction

- Concept seed: `e1c5c897`
- Direction: a Miura-fold sheet unfolding from a compact work packet.
- Own-world: crisp white paper, graphite rules, cobalt navigation ink, amber confirmation, and restrained teal success states.
- Material language: fold seams and ruled sections are expressed with precise borders and diagonal fold details; no gradients, glass panels, blobs, stock photography, or decorative illustration.
- Typography: existing Jost/system and Chinese fallbacks are retained for reliable Chinese readability. The measurable condensed reference face was catalogued as Saira Extra Condensed, but it is not forced into the production UI where it would reduce Chinese legibility.

The approved visual set contains three compositions. `admin-comp-01-module-grid.png` is the homepage reference, while the quote-desk and command-center compositions remain task-view references. The build state records the earlier quote-desk approval and the two forced content decisions below; this is intentional and documented rather than silently changing the review history.

## Navigation And Flow

The first viewport shows only the six large workbench modules:

1. Customer pool
2. Quotation flow
3. Product warehouse
4. Product search
5. Exchange and logistics
6. Administration

Each module is a single, fully clickable entry and routes to its own page. Details are not dumped below the homepage. On mobile, the rail becomes a drawer and the module list becomes one column.

The workbench presents the six modules as numbered panels. Each panel pairs a short description with real local counts and the next useful destinations, so a salesperson can scan the whole system before opening a module.

Quotation is a focused three-step route:

1. Customer demand and fixed formula selection, including salesperson, date, country, and phone.
2. Warehouse search, product detail expansion, and prepared-quote selection.
3. Quote generation, review, Excel export, and quote history.

The quotation route starts with two explicit views: `客户报价` continues the current three-step draft, while `报价留档` is a standalone list of past sales quotations. The archive shows salesperson, customer, date, amount, restore, and delete actions without duplicating history inside the active quote form. Customer preview and Excel/copy output stay at the bottom of the generated quotation so the review order matches the final customer-facing result.

The customer country and phone gate remains outside the quote form's internal detail flow. A duplicate owner is surfaced before a new quote can continue. Adding a warehouse item returns a visible status and prepared-item count. Completing a quote archives the record automatically, and `新开报价` creates a fresh daily sequence with blank working fields.

## Interaction Rules

- Keep one task visible at a time inside a module.
- Use clear status feedback for save, blocked, added, generated, archived, and export states.
- Keep product cards compact: image, name, and code first; click the image to reveal specifications and pricing fields.
- Keep staff notes private to their owner; administrators can inspect all notes and customer records.
- Preserve keyboard focus, readable contrast, disabled states, empty states, and mobile-safe wrapping.

## Intentional Deviations

The visual diff is low because the user explicitly requested a different information architecture:

> “第一页主页只显示大板块，点击具体的板块以后才会跳转”

> “具体的流程只做单独显示，不要一起显示”

Therefore the shipped homepage intentionally drops the reference comp's active quote queue, synthetic metrics, extra public-style navigation, and decorative footer. Those elements would make this internal tool harder to understand in three minutes and would contradict the routed module-first workflow.

## Verification

Manual browser acceptance used a synthetic customer, `Dubai Home Deco Trading L.L.C`, and salesperson `张三`:

- selected a non-default formula and confirmed its preview;
- registered and rechecked customer ownership using country plus phone;
- entered the warehouse, expanded `MH-SF-001`, and added it to the prepared quote;
- completed product and logistics inputs;
- generated `MH-Q-20260903-001`, confirmed date/time, customer, salesperson, product, totals, ownership, and logistics;
- exported through the `XX furniture` Excel template action;
- opened a new quote and confirmed the fresh `MH-Q-20260903-002` draft.

Responsive captures cover 1440px desktop and 390px mobile home, quote, products, and customers routes. TypeScript, lint, catalogue, admin, export, security, and smoke checks passed. The impeccable detector returned no findings for `AdminConsole.tsx` or `globals.css` after the final CSS pass.

The follow-up functional hardening also covers two failure paths: an exchange-rate timeout now exits the loading state with an explicit offline-reference message, and formula validation rejects unmatched parentheses before a rule can be used for a quote. Both paths were exercised from the live administrator surface; restoring the valid formula returned the data self-check to zero blocking issues.

The workbench now starts with a role entry surface. The administrator enters with the fixed `2675982129` key and owns product, unified-price, formula, and sales-permission maintenance; sales accounts self-register a local key and receive only their assigned modules. Current quote drafts are scoped by account while shared catalogue, pricing rules, customer ownership, and quote history remain available for the appropriate role. The exchange surface also includes a compact two-currency converter with CNY as the base reference.

Customer entry is intentionally distilled to one action. Sales account name is carried into each new customer record, country plus phone checks ownership as the user types, and an existing record is surfaced as `已被销售“某某”录入` before the entry action can be repeated. Legacy customer records without an account id remain readable through their stored owner name.

Product catalogue intake is administrator-only. A PDF can be dropped into the maintenance surface; each page becomes a compressed product preview, page text is used to infer a working name and category, and product codes continue from the highest existing number for that category. Imported items remain hidden with zero price and a source-page note until an administrator reviews the generated draft.

## Residual Risk

`npm audit` reports a moderate advisory for the nested `uuid` dependency under ExcelJS. A forced audit fix would downgrade ExcelJS and risk breaking the current export path, so it was deliberately not applied during this UI-focused rebuild. Revisit it as a dependency upgrade task with a dedicated export regression pass.
