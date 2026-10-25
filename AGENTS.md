# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## User-selected seller design baseline — 2026-10-24

The user explicitly requested the exact style of the project `hala kommers seller new desi`, located at `/Volumes/Work/تصميم هلا /dashboard-heroui`.
- Use its current `DESIGN.md`, `src/styles.css`, local IBM Plex Sans Arabic 400/500/600, HeroUI, Gravity icons, and compact shared components as the admin's design baseline.
- `src/styles.css` is copied from that project; admin-only additions belong in `src/admin.css`.
- Shared MetricRows, Section, Icon, BrandLogo and AnimatedNumber were copied into this project. Keep them visually consistent with the seller source.
- The initial Cairo screenshot reconstruction is superseded. User screenshots specify admin content and navigation, not the styling baseline.
- Latest user request explicitly asks for detailed data, entity filters and analytical cards. Use clearly labelled synthetic records for this prototype; never present them as live Hala data. This supersedes the earlier screenshot-only data constraint. Keep settings categories and navigation from the admin screenshots.
- Light is the initial theme; optional dark mode uses the seller's neutral black surfaces and stays session-only.

## Order and shipment analysis — 2026-10-24
- Keep shipping summary immediately after the order summary, before trend charts and financial analysis.
- Show all current order and shipping stages with counts, scoped percentages, click-to-filter actions, and carrier comparison.
- Distinguish current-state distribution from historical conversion or dwell time. Demo records provide current statuses only.
- Distinguish returning shipments from final returns; delivery success denominator is delivered plus final returned.

## Full order details — 2026-10-24
- Order identifiers and eye actions open a full detail workspace rather than a modal, following the five supplied reference tabs: details, activity/calls, edit, shipments, wallet.
- Preserve seller styling. Show unavailable contact, stock, shipment and wallet data honestly; do not copy private customer details from reference screenshots.
- Local edits, comments and call logs must update the selected order and reflect back in its list row.

## Order selection actions — 2026-10-24
- Show a floating purple action bar only when orders are selected, using the supplied selection screenshot for content and layout.
- Include fake order, start work, confirm, cancel, postpone and staff assignment, plus selection count and clear action. On mobile wrap into two rows.
- Apply each action only to selected records and append an activity entry; record reasons for cancellations/fake classification and a follow-up datetime for postponement.

## Assignment filters — 2026-10-24
- Orders include quick filters for all assignments, assigned to an agent, unassigned, and assigned to me, with counts and removable applied-filter chip.
- There is no authenticated agent identity in the prototype. The “assigned to me” filter explicitly shows an agent-of-preview selector instead of assuming the admin account is a real agent.
- Unassigned means empty employeeId. Bulk staff transfer can clear the assignment. Keep counts, metrics, exports and selection scoped to the current filters.

## Seller management and CRM — 2026-10-24
- User requests seller management with per-seller numbers and analytics, and a CRM to manage all sellers. Reference screenshots define seller list, seller detail, tasks, notes/contact history, and add-seller fields.
- Preserve the established seller style. Use the shared synthetic seller/order identities; do not copy personal contact details from screenshots.
- Seller list, detail, task queue and add/edit forms share session-local CRM state. Show demo/local persistence explicitly. Financial performance derives from filtered synthetic orders; CRM tasks and notes are all-time.

## Lifecycle cards — 2026-10-24
- User selected standalone cards for individual order and shipment statuses instead of the two long status lists. Each card keeps its label, count, scoped percentage and click-to-filter behavior. Use responsive card grids and the seller design tokens.

## Compact seller CRM and marketer segmentation — 2026-10-24
- User requests independent metric cards with visible gutters and a shorter top area in seller management. Keep heading, local-demo note and performance date controls compact.
- Add intersecting marketer filters for data source (Hala Share, private data, both), plan and group. Show and edit these attributes in seller records; they are synthetic and new records default to unspecified source/group.
- Default ranking is highest departed shipments; also support orders, delivered sales, delivered count, delivery success, confirmations and final returns. Departed shipments exclude ready-to-ship and include pickup through delivery/return. Respect performance date filters and show the ranking's definition.

## Unified order workspace — 2026-10-24
- User requested merging order details, editing and confirmation into a clearer workflow. This supersedes the separate edit-tab requirement above.
- Keep one “الطلب والتأكيد” workspace with inline customer/address and product edits, a live total, three review steps, and a persistent save/confirm bar. Communication/activity, shipping and wallet remain secondary tabs.
- Save permits incomplete contact/address drafts; confirmation requires valid customer name, phone, country, delivery address, positive prices, integer quantities and an explicit review check. Editing clears that review check.
- Confirmation saves all edits atomically and appends activity. Do not move already shipped/delivered/cancelled orders backwards to confirmed.
- Preserve local drafts while switching tabs or logging calls. Prompt within the UI before leaving a dirty order, with save, discard and keep-editing choices.

## Agent order workflow — 2026-10-24
- New orders require “بدء العمل” before call, postpone, cancel or confirm actions; starting changes status to جاري التأكيد and logs the start. Existing جاري التأكيد records resume their active workflow.
- After start, show call recording, review/confirm, postponement and cancellation actions. Keep edits in the unified workspace.
- Cancellation requires a structured reason plus detailed explanation (minimum 20 characters), saved on the order and in activity history. Fake classification also requires detail.
- Call attempts require a call status and outcome, with optional notes; increment attempts and retain the call in activity/history. Recording agreement on a call does not bypass final confirmation validation.

## Faster single-screen order details — 2026-10-24
- User requested fewer pages and faster order handling. Remove order detail tabs and the three-step navigation strip; keep one compact screen with customer, products, final review and persistent save/confirm.
- Communication/activity and shipping/wallet expand in place as secondary sections. Order facts/assignment remain accessible under a compact disclosure.
- Keep action area prominent; on mobile put it before customer fields. Preserve start-work gating, detailed cancellation reasons, contact outcomes and confirmation validation.

## Simplified administration workspaces — 2026-10-25
- User-approved scope includes sellers, follow-ups, add seller, employees, account managers, stores, orders, shipments, validation and returns, with the existing seller design baseline and Arabic RTL.
- Keep search, account manager and account status directly visible for sellers; put segmentation and other filters in the expandable panel. Keep optional seller columns configurable.
- Keep order statuses, duplicate/Upsell/change-request properties and staff assignment as separate controls. Show common statuses plus an accessible all-statuses selector. Keep primary dates, seller and staff filters visible.
- A single session store owns local orders, shipments and CRM. Migrate the legacy CRM session key without losing sellers, tasks or notes. Edits and manager assignments propagate to linked records and analytical summaries. Confirming a local order creates its one linked pending shipment.
- Pending shipment change requests are independent of saved edit history. Returning/final-returned status is independent of arrival at warehouse. Validation call attempts and final decisions are separate records.
- Scope exports and counts to active filters; retain per-record currency. All records remain synthetic; no API, production updates or real financial transactions are included.

## Orders summary and status filters — 2026-10-25
- User requests visible separators between the six summary metrics and a small percentage for each value. Percentages use the currently filtered result total, with zero-safe values and explicit denominator copy.
- On OrdersPage show all status filters as visible wrapping buttons with counts; do not hide remaining statuses in a dropdown. Other workspaces retain their own status picker behavior.
- Latest screenshot narrows OrdersPage status buttons to this order only: الكل، جديد، قيد التأكيد (internal جاري التأكيد)، بانتظار توفر المخزون، انتظار إجراء، مؤجل، ملغي، مسودة، وهمي. Keep other internal order/shipment states in data, but omit their filter buttons here.
- Assignment filter refinement: omit “كل التعيينات” and “معيّنة لأيجنت”. Place only “غير معيّنة” and “معيّنة لي” next to “طلب تعديل معلق” in the properties row. Clicking an active assignment button clears it; keep preview-agent selection for mine.
- Order summary/action panel should sit on the right of customer/product details on desktop, with a wider 340–380px column, more padding and prominent 44px action buttons. Use purple for review, distinct outlined contact/postpone controls, and red cancellation/fake controls. Mobile retains actions above the editor.

## Agent product and seller offer visibility — 2026-10-25
- Show product identity/SKU, item count and total pieces clearly in order details. Let agents expand product description and contents inline.
- Show seller-scoped product offers/Upsell with quantity, full offer total and clear apply action. Applying replaces the current line quantity/unit price, recalculates totals, resets review and requires saving.
- Catalog details/offers are synthetic demo fixtures in orderProductDetails.js until actual seller data is connected; label them accordingly and do not invent real product photos/specifications.

## Ready-to-review order — 2026-10-25
- Default details view is read-only and ready for agent review; “تعديل الطلب” enables fields/products, then “حفظ الطلب” returns to read-only. Confirmation is a green action and requires edits saved first.
- Top summary shows product names, number of products, pieces and COD total. Display full available address components in the customer section.
- Product rows have separate “عروض المنتج” (seller Upsell) and “تفاصيل المنتج” disclosures. Details includes available image gallery; missing actual product images must be explicitly disclosed rather than invented.
- Synthetic HL demo records may show explicit fictional phone/address defaults so the ready-review workflow is demonstrable; never use real reference customer contacts.
- Seller offer fixtures now contain exactly two choices per product: 2 pieces for SAR150 total (unit75), or 4 pieces for SAR160 total (unit40), each with its own apply button. Applying updates draft currency to SAR and save persists it. Do not silently combine SAR offers with an existing multi-line order in another currency.
- Add Next beside summary heading and Edit order beside actions heading, retaining top and bottom edit/save access. Make phone prominent and one-click copy.
- Add an Upsell calculator for a selected order line: total new quantity must exceed current quantity; apply exact matching seller bundle pricing or otherwise current unit price. Preview new total and same-currency difference; never describe cross-currency difference as a conversion. Apply changes to draft, then save. Editing invalidates any calculated preview.
- User requests a shorter order page and moving communication/activity plus shipping/wallet to the left. At desktop widths use three columns: right actions, center compact order data/products/review, left expandable related records. Keep long histories internally scrollable and key order fields visible together. Smaller screens adapt to two/one columns without horizontal overflow.

## Complete shipment statuses — 2026-10-25
- Shipment workspace shows every status as a visible count filter, with independent summary cards, including preparing, in transit, delivery attempt, failed delivery, returning, final return and cancelled. Never hide shipment statuses in a dropdown.
- Every card filters the same shipment table; counts and zero-safe percentages use the current search/entity/date scope before the selected status. Include a short explanation of the selected status. Keep returning distinct from final return and warehouse arrival.

## Staff settings navigation — 2026-10-25
- Move الأدوار والصلاحيات and المديرين out of general settings into a separate sidebar group إعدادات الموظفين. Both entries open their existing record-management pages, with direct routes and sidebar search support.

## Sidebar financial, system and reason groups — 2026-10-25
- المالية contains خطط الأسعار، العملات، طلبات المحفظة (nested طلبات الإيداع and طلبات السحب)، طرق الدفع.
- إعدادات النظام contains الدول. الأسباب contains أسباب إلغاء الطلبات and أسباب إلغاء الشحنات. These moved sections no longer appear in general settings. Preserve the separate إعدادات الموظفين group.

## Seller row identity and bulk actions — 2026-10-25
- Show selection, eye/details and open-account actions together at the leading edge of the seller row. Keep seller name, ID, code and account status visible in the identity cell, independent of optional columns.
- Selected sellers get a floating purple toolbar matching the supplied reference: change plan, change account manager, send new-password action, activate, deactivate, count and clear selection. Apply local supported mutations only to the selected sellers and log each affected seller.
- Account opening is an explicitly labelled local account preview until authentication/impersonation is connected. Password action explains the unavailable delivery service; never claim to send email, reset credentials or impersonate a seller in this prototype.

## Seller follow-up Kanban — 2026-10-25
- Show a red circular count of open seller tasks next to متابعات البائعين in the sidebar, updating from shared CRM state.
- Use a Kanban board for follow-ups and seller tasks with للمتابعة، قيد التنفيذ، مكتملة. Support drag and drop plus an accessible state selector; keep filters, edit/create, activity logging and legacy done compatibility. Initially show all stages.
