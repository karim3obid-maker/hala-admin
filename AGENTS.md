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

## Orders selection bar: dropdowns + WhatsApp templates — 2026-11-11
- User requested reworking the orders selection bar: staff assignment and status change become dropdown menus, plus a WhatsApp send action.
- The bar now holds exactly: «تحويل لموظف» menu (all employees + إلغاء التعيين), «تغيير الحالة» menu (جديد، قيد التأكيد، مؤكد، بانتظار توفر المخزون، انتظار إجراء، مؤجل، مسودة، وملغي/وهمي marked «يطلب سببًا» which open the reason dialog; plus تأجيل بموعد متابعة at the end), «إرسال واتساب» button, count and clear. Old separate buttons (بدء العمل، تأكيد، إلغاء، تأجيل، وهمي) are covered by the two menus.
- Menus are custom `.orders-menu` components in BulkOrderActions.jsx (button + upward list, outside-click/Escape close); styles in src/admin.css with `wa-template` classes for the dialog.
- WhatsApp dialog requires choosing one of 5 ready templates (تأكيد الطلب، تأكيد العنوان، متابعة الشحنة، تأجيل موعد التوصيل، بانتظار التوفر); the text fills an editable textarea; submit is disabled until a template is picked. Prototype sends nothing — it logs «إرسال رسالة واتساب جماعية» in each selected order's activity and shows recipient phone counts.

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
- Communication/activity and shipping/wallet expand in place as secondary sections. Order facts and assignment stay visible alongside secondary order actions without disclosures.
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

## Person-scoped analytics page (تحليلاتي) — 2026-11-10
- User requests تحليلاتي as a dedicated per-person analysis; the whole page shows only the selected person's data. Person selection lives inside the slim top demo banner: type segment (الموظفين / الأكونت مانجر / البائعين) + name select + inline key stats (الطلبات، نسبة التأكيد، نسبة التسليم، الإيراد، بانتظار التأكيد). No separate picker/header cards.
- Removed from this page only: بطاقة تصفية التحليلات، تحليل مراحل الطلبات والشحن (بما فيها كروت المراحل وتحليل شركات الشحن)، البائعون والمتاجر المرتبطون، الأداء المالي، تطور الأداء/توزيع الدول، أداء الأكونت مانجر، أولوية المتابعة، وجدول «الطلبات التي عمل عليها».
- Every summary surface on this page carries both نسبة التأكيد and نسبة التسليم (delivered ÷ (delivered + final returned)): the banner stats, the تفصيلية table columns plus footer plus CSV export, and the entity-detail modal. The modal summary grid is five tiles.
- The page keeps: أداء الطلبات، أداء الشحن، «تحليل مراحل الطلبات والشحن» (كروت حالات الطلبات والشحن بنسبها — بدون كروت الملاحظات وبدون تحليل شركات الشحن)، و«تحليلات تفصيلية» بـ 4 تابات فقط (البائعين / المتاجر / الدول / المنتجات) محسوبة من طلبات الشخص المختار، مع بحث وفرز وتصدير CSV.
- Stage cards on this page are click-to-details: pressing a status opens a modal with that status's orders for the selected person (count, share, totals, average call attempts, orders table with CSV export).
- Implemented in src/components/analytics/PersonAnalytics.jsx; AnalyticsDashboard delegates page='تحليلاتي' to it via a hook-free wrapper. الرئيسية keeps the existing global filtered workspace unchanged (its entity modal also gained the نسبة التسليم tile for consistency).

## Unified order cancellation reasons — 2026-11-10
- User requested ready-made unified order cancellation reasons plus manual admin-added reasons.
- أسباب إلغاء الطلبات ships with 12 unified seeded reasons (تغيير رأي العميل، وجد سعرًا أفضل، تأخير التوصيل، عدم رد العميل، خطأ في بيانات الطلب، المنتج غير متوفر، مشكلة في الدفع، مشكلة في العنوان، طلب مكرر، رفض استلام الطلب، طلب وهمي، سبب آخر) marked موحّد؛ أسباب إلغاء الشحنات ships with 8.
- The reasons page supports manual add (name + optional description, duplicate check), inline edit with rename propagation to linked orders, enable/disable, and delete blocked for reasons already used by orders.
- Reasons live in the shared session store (version 3 with v2 migration). The order cancellation dialog reads its سبب الإلغاء dropdown from active store reasons only; usage counts come from orders' cancellationCategory.
- Shipping price group in pricing plans extended per user: تجهيز وتغليف الطلب (packing) and الطلب المشحون (shipped) sit before الموصل/المرتجع/COD fee in the table and plan form.
- Pricing plans page (2026-11-10 user review): must stay fully inside the shared design system — MetricRows cards (crm-metric-cards), crm-panel header + admin-record-toolbar + crm-table-note, analytics-table with accent-soft group header row, and the analytics-detail-modal/orders-dialog modal pattern (HeroUI modal--md max-width is overridden with !important like drawer-container). No bespoke chips or fieldsets.

## طلبات المحفظة: سحب وإيداع بمراحل وصورة تحويل — 2026-11-10
- طلب السحب صادر من البائع إلى الشركة (الشركة مستقبلة المبلغ)، وطلب الإيداع هو العكس حرفيًا: صادر من الشركة إلى البائع تطلب منه إيداع رصيد. الجهة المصدرة مبنية من نوع الطلب ولا تُختار يدويًا.
- صفحات طلبات السحب وطلبات الإيداع (src/components/settings/WalletRequests.jsx) من مخزن الجلسة المشترك walletRequests (بذور 9 طلبات + migration للمخزن القديم).
- كل طلب يوثق: من هو الطالب وبياناته، الجهة المستهدفة، المبلغ والعملة، طريقة التحويل ومرجعه، سبب الطلب (إلزامي 5 أحرف)، ملاحظات، صورة التحويل، مرحلة العملية، وسجل أحداث موقّت.
- مراحل موحدة بالمفاتيح new/review/proof/completed/rejected بترتيب تسميات مختلف لكل نوع. سحب: جديد ← قيد المراجعة ← بانتظار صورة التحويل ← مكتمل. إيداع: جديد ← بانتظار تحويل البائع ← بانتظار التحقق ← مكتمل. الرفض من أي مرحلة غير نهائية يتطلب سببًا جاهزًا + تفصيلًا لا يقل عن 10 أحرف.
- صورة التحويل تُرفع من الجهاز (تُصغَّر عبر canvas للحفظ في الجلسة) أو نموذجان تجريبيان SVG للمخزونين المكتملين، كل واحد معلَّم «نموذج تجريبي». الإقفال (مكتمل) ممنوع بدون صورة مرفقة.
- كروت المراحل بأسلوب lifecycle تُصفي القائمة، وكروت الملخص: إجمالي/قيد التنفيذ/مكتملة/مرفوضة. كل شيء سجلات محلية للمعاينة وهمية.

## صفحة موحدة مبسطة لطلبات السحب والإيداع — 2026-11-11
- بطلب المستخدم: تبسيط التصميم ودمج طلبات السحب والإيداع في صفحة واحدة بعنوان «إدارة طلبات السحب والإيداع» في المالية (رابط #wallet-requests). الروابط القديمة #wallet-withdrawals و#wallet-deposits تفتح نفس الصفحة مع تفعيل تبويب النوع المناسب.
- التبويبات: الكل / طلبات السحب (بائع ← شركة) / طلبات الإيداع (شركة ← بائع)، مع حبيبات مراحل موحدة (جديد / مراجعة-تحويل / صورة التحويل / مكتمل / مرفوض)، بحث، فلتر بائع، وتصدير CSV.
- اتجاه كل طلب موضح في الجدول: سحب من البائع إلى الشركة، إيداع من الشركة إلى البائع، مع اسم البائع وكوده وهاتفه والمبلغ والطريقة والسبب وصورة التحويل والحالة.
- تفاصيل الطلب أصبحت شاشة مبسطة (بطاقتان + شريط مراحل) بدل الكروت الأربعة الطويلة: بطاقة بيانات الطلب والسبب والسجل، وبطاقة صورة التحويل وقرار المرحلة (تقدم/رجوع/رفض مع سبب)؛ زر إرفاق نموذج إيصال تجريبي متاح للتجربة.
- كل الكلاسات ببادئة .wr-* داخل src/admin.css لتفادي تعارض .wallet-table القديم في styles.css.

## فلاتر الشحنات فوق كروت التحليل — 2026-11-11
- طلب المستخدم: بطاقة الفلاتر (بحث، من/إلى تاريخ، الدولة، المدينة، شركة الشحن، العملة، البائع، + متجر/منتج للمرتجعات) تظهر أعلى صفحة الشحنات مباشرة بعد العنوان وأزرار الاستيراد/التصدير، قبل كروت حالات الشحنات وكروت الملخص ومقارنة شركات الشحن.
- الترتيب الآن: العنوان ← بطاقة الفلاتر ← كروت الحالات الـ12 ← كروت الملخص ← مقارنة الشركات ← شريط حالات سريع ← الجدول. نفس المكون يخدم المرتجعات فانتقلت فلاترها لأعلى أيضًا.
- كروت التحليل محسوبة دائمًا من النطاق المفلتر (scoped)، وبنقل الفلاتر لأعلى يصبح تأثير الفلترة على الأرقام واضحًا بصريًا.
- بعدها بطلب المستخدم: الفلاتر صارت «فلاتر متقدمة» بنمط صفحات الطلبات والبائعين — الصف الأول الظاهر دائمًا: البحث + من/إلى تاريخ؛ فلاتر الكيانات (الدولة، المدينة، شركة الشحن، العملة، البائع + المتجر/المنتج للمرتجعات) تنفتح في صف `.shipment-advanced` أسفل خط فاصل عند التفعيل. زر «فلاتر متقدمة» وعلامة «إعادة ضبط» معًا في آخر قسم بالبطاقة (التذييل، `.shipment-filter-actions`) بجوار «طلبات تعديل معلقة».

## الشحنات والسجل تحت تفاصيل الطلب — 2026-11-11
- طلب المستخدم: نقل قسمي «الشحنات والمحفظة» و«التواصل وسجل المتابعة» من العمود الجانبي إلى أسفل تفاصيل الطلب مباشرة.
- This supersedes the 2026-10-25 three-column note (right actions / center order / left records): the order workspace is now two columns (right summary/actions, center order details), and the shipments plus communication/log panels render full-width beneath the details in `ow-records-below`.
- Panels sit side by side at ≥761px widths (shipments and log each ~half width) and stack in one column on mobile, before the persistent save/confirm bar. All `ow-records-aside` CSS was removed and replaced with `ow-records-below` rules in src/admin.css.

## فلاتر إدارة الطلبات: مدينة وحالة الدفع — 2026-11-11
- بطلب المستخدم: حذف فلترَي «النشاط من/إلى» نهائيًا من الفلاتر المتقدمة وإضافة «المدينة» و«حالة الدفع» بدلًا منهما.
- المدينة مرتبطة بالدولة: قائمة المدن تُبنى من مدن الطلبات الفعلية للدولة المختارة (بذور: السعودية الرياض/جدة/الدمام، الإمارات دبي/أبوظبي/الشارقة، الكويت الكويت/حولي، عُمان مسقط/صلالة)؛ تغيير الدولة يصفّر المدينة إذا لم تعد تابعة لها.
- حالة الدفع قيمتان: COD (الدفع عند الاستلام) ومدفوع؛ مخزنة على الطلب paymentStatus مع ترحيل للجلسات القديمة في read() وتصنيف ثابت من رقم الطلب (paymentStatusOf).
- ملصق COD/مدفوع يظهر بجوار المبلغ في الجدول، وكلا الفلترين يظهرا كشرائح قابلة للإزالة في «الفلاتر المطبقة»، ويؤثران على العدادات والتصدير (عمود حالة الدفع أُضيف لـ CSV).

## تطوير قسم الشحنات الشامل — 2026-11-11
- بطلب المستخدم بعد تحليل النواقص: تنفيذ كل من أسباب إلغاء الشحنات، وصول المرتجع للمخزن، الإجراءات الجماعية، فلتر شركة الشحن + الفرز + السجل الكامل، وكروت الملخص التشغيلي وشريط المراحل وكشف التأخير ومقارنة شركات الشحن.
- أسباب الإلغاء: تحديث حالة الشحنة إلى «ملغية» أو «فشل التسليم» (فردي أو جماعي) يطلب سببًا من أسباب الشحنات المفعّلة + تفاصيل لا تقل عن 20 حرفًا (ثابت reasonMinLength — انتبه: المتغير detail في المكوّن هو حالة التفاصيل ولا يستخدم للطول). يُحفظ على الشحنة cancellationCategory/cancellationDetails ويظهر في شارة الصف («سبب الإلغاء: …») وحقول التفاصيل وسجل التحديثات وCSV (عمودان جديدان: شركة الشحن، سبب الإلغاء — والاستيراد يقبل 11–14 عمودًا). صفحة الأسباب تعرض عدد الشحنات لكل سبب، وإعادة التسمية تنعكس على الشحنات، والحذف ممنوع للسبب المستخدم.
- وصول المخزن: زر «تسجيل وصول للمخزن» في صف المرتجع وتفاصيل الشحنة وزر جماعي في شريط المحدد (للمرتجعات فقط) يضبط arrivedAtWarehouse/arrivedAtWarehouseAt ويسجّل حدث «وصول المخزن».
- الإجراءات الجماعية في شريط sh-bulk-bar (يظهر عند التحديد): شحن المحدد، تحديث الحالة (نافذة بنفس قواعد الأسباب)، إسناد شركة الشحن والتتبع (شركة/تتبع/توصيل متوقع — قيمة واحدة تُطبق على كل محدد)، وتسجيل وصول المخزن في المرتجعات. ملاحظة مهمة: حقول السبب في نافذة الحالة اسمها cancellationCategory/cancellationDetails في الـ draft الواحد الموحّد (draft الشحنة وbulkDraft معًا) — لا تفرّق بينهما.
- كروت تشغيلية (ShipmentOpsSummary في ShipmentStatusSummary.jsx): نسبة نجاح التسليم = تم التسليم ÷ (تم التسليم + مرتجع نهائي) داخل الفلاتر، و«شحنات متأخرة» (تجاوزت expectedDelivery ولم تصل لحالة نهائية — مساعدة isLate والقائمة lateExempt)، و«تحتاج إجراء» (فشل تسليم + تعديل معلق + مشحونة بدون تتبع — needsActionOf). كرتا المتأخرة وتحتاج إجراء قابلان للضغط كفلاتر تُطبَّق داخل scoped قبل عدّادات الحالات.
- شريط المراحل (Steps في ShipmentDetail.jsx): 6 مراحل + عقدة إرجاع إضافية لجاري الإرجاع/مرتجع، كل عقدة تاريخها من date/shippedAt/failedAt/deliveredAt/returnedAt، فشل التسليم يضيء عقدة محاولة التسليم بأحمر، وملغية تُظهر المسار كله غير مفعّل. السجل كاملًا بعد 5 أحداث عبر زر «عرض كل التحديثات» وتمرير داخلي (sh-history-all).
- فلاتر جديدة في شريط الشحنات: المدينة (تتبع الدولة وتُصفَّر معها) وشركة الشحن (خيارها من بذور carrier: أرامكس/سمسا/ناقل + القيم المستوردة) والعملة، وفرز الأعمدة برقم الشحنة/الحالة/المبلغ/التاريخ (sortKey/sortDir مع aria-sort). البذور والترحيل: createInitialState وread() يضيفان carrier وexpectedDelivery (كل ثالث شحنة = تاريخها + 3 أيام لتجربة التأخير).
- مقارنة شركات الشحن تعتمد بيانات carrier الجاهزة؛ كل شيء معاينة محلية بدون أي تكامل فعلي.

## إعادة بناء الفالديشن كسير تحقق تشغيلي — 2026-11-11
- بطلب المستخدم: الشحنات المسلّمة لا تدخل الفالديشن؛ الجهة محل التحقق هي تحديث شركة الشحن على فشل التسليم/جاري الإرجاع/مرتجع. كل حالة تسجّل 5 محاولات على الأقل ما لم يتأكد استلام العميل، وبعد 5 محاولات دون رد يكون الإلغاء النهائي بقرار الإدارة.
- مراحل التحقق الخمس في validationStatuses: في الانتظار ← قيد التنفيذ ← تم الإرسال لشركة الشحن ← جاري العمل عليه مع شركة الشحن ← تم التصرف. القائمة تعرض كروت استكمال المحاولات/5 محاولات/الإرسال/العمل مع الشركة، ومقارنة صحة أبديتات الشركات من نتائج الاتصالات، وفلاتر شركة الشحن وعدد المحاولات والحالة.
- صفحة التفاصيل أعيد بناؤها في ValidationDetails.jsx: بيانات الطلب والعميل والشحنة والتتبع والقيمة والدفع، مكونات الطلب وتفاصيل المنتجات (نفس productDetails المستخدم في الكونفيرميشن)، أبديت الشركة محل التحقق، وشريط المراحل وسجل موحد. بيانات المنتجات للعرض فقط وليست تحريرًا من الفالديشن.
- ValidationAttemptModal.jsx يدمج تسجيل المكالمة والقرار في نموذج واحد (نتيجة + ملاحظة يدوية اختيارية + القرار التالي)، بدل نموذج المحاولة والقرار النهائي الطويلين السابقين. زر «إرسال إلى شركة الشحن — العميل عايز الطلب» هو بديل تأكيد الطلب في هذه المساحة. الحالات المغلقة تمنع أي محاولة جديدة.
- applyValidationAction في adminStore.js ينفذ المحاولة والقرار ذريًا: تأكيد الاستلام يغلق الحالة ويزامن الطلب والشحنة إلى تم التسليم حتى قبل 5 محاولات؛ الإلغاء يحفظ سببًا تفصيليًا 20 حرفًا ويجعل الطلب ملغي والشحنة ملغية بسبب قرار الفالديشن؛ الإعادة للشحن تعيدهما لقيد الانتظار/مؤكد. updateValidationCarrier يسجل بدء العمل مع الشركة واكتمال المعالجة دون احتساب مكالمة.
- بيانات التأكيد تحتفظ داخليًا بـ confirmedById/confirmedAt وتاريخ التأكيد؛ OrderDetails يحفظهما عند التأكيد الجديد، والبذور والترحيل يضيفانهما للسجلات السابقة. بطلب المستخدم اللاحق: **يُخفى اسم موظف التأكيد من واجهة الفالديشن ومن نافذة البلاغ**، مع بقاء تاريخ التأكيد والموظف المسؤول الحالي. زر «الإبلاغ عن تأكيد غير صحيح» يسجل بلاغًا تفصيليًا (20 حرفًا) داخليًا بالمُبلّغ والمُؤكد السابق في الطلب والشحنة والفالديشن، دون تغيير حالة الطلب تلقائيًا.
- سجلات الحالة: attempts للمكالمات، carrierUpdates للإرسال/العمل/المعالجة، history للأحداث، confirmationReports للبلاغات، وcarrierUpdate لبيانات أبديت الشركة الأصلي. read() يرحّل الحقول للجلسات القديمة. كل الأنماط الجديدة ببادئة vd-* في admin.css، والإرسال والاتصال والبلاغات معاينة محلية فقط.
- أولوية الأيجنت بعد مراجعة الصفحة بصريًا (2026-11-11): بطاقة «اتصال العميل والإجراء» أولًا وتضم العميل والهاتف وآخر نتيجة اتصال، وعمود الإجراءات sticky على الديسكتوب؛ يليه العميل والتوصيل ثم التأكيد السابق. الترتيب البصري للمحتوى: بيانات الطلب والشحنة ← سجل المحاولات والقرارات ← المنتجات. تفاصيل المنتجات تبقى متاحة داخل disclosures مغلقة افتراضيًا لتقليل التمرير، والسجل بطول داخلي محدود.

## تعديلات تفاصيل الطلب — 2026-11-11
- بطلب المستخدم: تقليص عرض عمود تفاصيل الطلب قليلاً وتوسيع قسمي الشحنات والمحفظة.
- تم توسيع العمود الجانبي (ملخص الطلب + الإجراءات) ليصبح 380px عند 761–1050px، 330px عند ≥1200px، و420px عند ≥1700px (بدل 300/290/320px سابقًا)، مما يقلّص المساحة المتاحة لعمود تفاصيل الطلب.
- تم تغيير شبكة «الشحنات والمحفظة / التواصل وسجل المتابعة» في أسفل الصفحة لتصبح 1.45fr للشحنات والمحفظة مقابل 1fr للسجل، بحيث يصبح قسما الشحنات والمحفظة أعرض من سجل المتابعة على الشاشات ≥761px.

## تبسيط صفحة طلبات السحب والإيداع — 2026-11-11
- الصفحة موحدة بالفعل؛ تم تبسيطها أكثر باستبدال كروت المقاييس الأربعة الكبيرة بشريط إحصاءات مدمج (الكل / سحب / إيداع / قيد التنفيذ).
- تم اختصار تسميات حبيبات المراحل إلى: جديد، قيد المراجعة، صورة التحويل، مكتمل، مرفوض.
- تم تقليص أعمدة الجدول إلى: رقم الطلب، النوع، البائع، المبلغ، الحالة، إجراء؛ مع إظهار ملاحظة «صورة مرفقة» تحت الحالة عند وجود إثبات، وإبقاء زر واحد «فتح» للتفاصيل.
- الصفوف أصبحت clickable بالكامل — الضغط على أي صف يفتح تفاصيل الطلب.

## إضافة طرق دفع العملاء في الإعدادات — 2026-11-11
- إنشاء صفحة مخصصة «طرق دفع العملاء» (src/components/settings/PaymentMethods.jsx) تحل محل SettingsRecords لهذا القسم.
- الصفحة للطرق اللي العميل يدفع من خلالها لإتمام طلباته، وتدعم أربع طرق افتراضية: Payoneer، حساب بنكي، InstaPay، ومحفظة.
- التصميم جدول بسيط: كل صف يعرض اسم الطريقة والنوع، وSwitch بجانبها لتشغيل/إيقاف، وأزرار تعديل/حذف.
- زر «إضافة طريقة» فوق الجدول؛ التعديل والإضافة يفتحان نافذة بها حقول الطريقة (حساب Payoneer، اسم البنك ورقم الحساب/IBAN وصاحب الحساب، رقم InstaPay، نوع المحفظة ورقمها).
- البيانات تُحفظ في store الجلسة (paymentMethods) مع بذور افتراضية وترحيل للجلسات القديمة في adminStore.js.

## صفحة مستقلة لتأكيد الطلب السريع — 2026-11-11
- وافق المستخدم على تطبيق مقترح التصميم الجديد كصفحة مستقلة، مع إبقاء صفحة تفاصيل الطلب الحالية دون تغيير. الصفحة الجديدة: «تأكيد الطلب السريع» في القائمة، والرابط #order-confirmation-fast (ويقبل /رقم-الطلب).
- المكوّن src/components/orders/FastOrderConfirmation.jsx والكلاسات fc-* في src/admin.css. على الشاشات الواسعة: إجراءات الطلب في عمود أيمن، وبيانات العميل والتوصيل + بيانات الطلب + المنتجات والكميات كثلاث بطاقات متجاورة، ثم المراجعة وسجلات الطلب وشريط سفلي.
- الصفحة تقرأ وتعدل نفس بيانات الجلسة التجريبية. التأكيد يحافظ على قواعد بدء العمل والمراجعة وإنشاء الشحنة؛ تسجيل المكالمات والتأجيل والإلغاء/الوهمي يحتفظ بالتحقق المطلوب. زر تعديل البيانات وحاسبة Upsell ينقلان إلى صفحة تفاصيل الطلب الحالية بدل تكرار محرر الطلب.

## Order detail actions — 2026-11-11
- Match the two action states in the supplied reference, with the user's later priority correction: **primary order actions come before the WhatsApp/copy/phone channels; تسجيل محاولة اتصال is the first action after work starts**, then تأجيل/تأكيد، and إلغاء/طلب وهمي last. Before work starts, بدء العمل is the full-width first action. Keep next order, team comments directly below the actions, sticky summary and visible order metadata. Use synthetic data and never dial the placeholder phone.
- Fast standalone page removed (2026-11-11 user request): the separate «تأكيد الطلب السريع» page (FastOrderConfirmation, sidebar item, route, CSS) was deleted entirely. Confirmation lives only inside the order details workspace: the restored panel «تأكيد» shortcut plus the save bar's green «تأكيد الطلب» review flow.

## ترتيب أزرار إجراءات الطلب — 2026-11-12
- بطلب المستخدم (مع صورة مرجعية): إلغاء وطلب وهمي يجتمعان جنب بعض في صف واحد أسفل الأزرار، و«تسجيل محاولة اتصال» بعرض كامل فوقهما مباشرة.
- الترتيب في `.ow-panel-grid` (src/components/orders/OrderDetails.jsx): تأجيل/بدء العمل ← تأكيد ← تسجيل محاولة اتصال (بعرض كامل) ← إلغاء + طلب وهمي (نصف عرض لكل منهما).
- CSS في src/admin.css: `ow-start-work` و`ow-panel-call` و`ow-panel-postpone` بعرض كامل (`grid-column:1/-1`)، و`ow-panel-postpone` يعود لنصف العرض عند وجود `ow-panel-confirm` عبر `:has`، والإلغاء/الوهمي تلقائيًا في صف واحد (إلغاء على اليمين في RTL). لا تغيير على النوافذ أو منطق الإجراءات.

## نسب بطاقات المؤشرات في آخر الكارد — 2026-11-12
- بطلب المستخدم: النسبة تبقى بجانب الرقم لكن في الطرف المقابل من الكارد (آخر الكارد) بعيدة عن الرقم، وليس ملتصقة به.
- التنفيذ في src/styles.css: `.metric-number` أصبحت تمتد على عمودي شبكة الكارد (`grid-area:2/1/3/3`) مع `justify-content:space-between` و`justify-self:stretch`، فيبقى الرقم في بداية الكارد (يمين RTL) والنسبة في نهايته (يسار) مع حد أدنى 8px بينهما.
- حجم النسبة كما هو: 16px/400 على الديسكتوب، 15px عند 761–1100px، 14px على الموبايل؛ الرقم 25–27px/600.

## طي فلاتر التحليلات — 2026-11-12
- بطلب المستخدم: زر سهم في رأس بطاقة «تصفية التحليلات» يطوي الفلاتر لتبقى صفًا واحدًا ويمكن توسيعها مرة أخرى.
- التنفيذ في AnalyticsDashboard.jsx: حالة `filtersOpen` (مفتوحة افتراضيًا)، وزر `.analytics-filter-toggle` بأيقونة chevron-up/down مع `aria-expanded` و`aria-controls="analytics-filter-fields"`، بجوار زر «إعادة ضبط» داخل `.analytics-filter-actions`.
- CSS: `.analytics-filter-grid` بحد أقصى 640px و`overflow:hidden` مع انتقال max-height؛ `.is-collapsed` = 71px على الديسكتوب (صف واحد: 5 حقول) و75px على الموبايل (الفترة الزمنية بعرض كامل). شريط النتيجة ورقائق الفلاتر المطبقة يظلان ظاهرين.
- اختيار «فترة مخصصة» يفتح الفلاتر تلقائيًا، وحقلا التاريخ يظهران فقط عند فتح الفلاتر.

## توحيد تسميات الفلاتر — 2026-11-12
- بطلب المستخدم: كل أزرار تصفير/مسح الفلاتر في النظام اسمها **«إعادة ضبط»** (بدل «مسح الكل» و«مسح الفلاتر»)، وكل زر يفتح الفلاتر المتقدمة اسمه **«فلاتر متقدمة»** (بدل «فلاتر إضافية»).
- التنفيذ: `FilterChips` في WorkspaceTools.jsx (يخدم الفالديشن والبائعين)، وOrdersPage (شريط الفلاتر المطبقة + حالة «لا نتائج»)، وValidationsPage (حالة «لا نتائج»)، وSellersCRM (فلاتر المهام + حالة «لا نتائج» + زر الفلاتر المتقدمة).
- زر إعادة الضبط المكرر في تذييل بطاقة البائعين أُزيل؛ يبقى زر واحد داخل شريط الفلاتر المطبقة يظهر عند وجود فلاتر، وزر في حالة «لا نتائج».
- الشحنات والتحليلات والكيانات كانت بالفعل تستخدم «إعادة ضبط»، والطلبات والشحنات تستخدم «فلاتر متقدمة».

### تفاصيل الفالديشن بتوزيع تفاصيل الطلب
- اعرض حالة الشحنة الحالية ومرحلة التحقق منفصلتين، واحتفظ بتحديث الشركة الأصلي كمرجع للموظف. الشاشة تعرض بيانات العميل والمنتجات للقراءة، الإجراءات على اليمين، والسجل بالأسفل.
- نموذج واحد يحفظ اتصالًا وإجراء شركة اختياريًا، أو إجراء شركة وحده دون زيادة العداد. تفاصيل إجراء الشركة إلزامية، والبلاغ عن التأكيد له تصنيف ووصف إلزاميان. العمليات محلية داخل المعاينة.
- تحديث إجراءات الفالديشن: أُزيل زر «تسجيل إجراء للشركة» المستقل؛ يبقى الإجراء الاختياري داخل نموذج الاتصال. زر «العميل يريد الاستلام» أخضر ويسجّل رغبة العميل بلا محاولة جديدة أو تحديث حالة الشحنة. زر «إلغاء الشحن» أحمر ويغلق الفالديشن ويلغي الشحنة فقط بعد التحقق من أهلية الإلغاء وسبب القرار واعتماد الإدارة، مع توثيق القرار في سجل الطلب.
- أضيف زر «الطلب التالي» داخل إجراءات الفالديشن؛ يفتح الحالة التالية من نفس نتائج الفلاتر، ويدور لأول حالة عند الوصول إلى آخر حالة لتسريع المراجعة المتتابعة على الموظف.

### ملف البائع داخل إدارة المستخدمين
- في «قائمة البائعين»، تبدأ تفاصيل كل بائع بإدارة العلاقة وبيانات البائع على اليمين (وفي بداية الصفحة على الهاتف). تعرض البطاقة موعد المتابعة وتتيح تسجيل التواصل وإضافة مهمة مباشرة. تعرض النظرة العامة مؤشرات الأداء والطلبات الأخيرة، ويمكن توسيع توزيع الحالات وبيانات البائع الإضافية عند الحاجة.

### لوحة مهام متابعة البائعين — 2026-11-12
- حافظ على لوحة الحالات الثلاث، لكن اجعل الفلاتر الأساسية فقط ظاهرة افتراضيًا (بحث، حالة، مسؤول، أولوية) واجمع الأقل استخدامًا تحت «فلاتر متقدمة».
- اجعل أعمدة اللوحة تتبع محتواها مع حالات فارغة قصيرة، وبطاقة المهمة تعرض إجراءً واحدًا واضحًا لتغيير الحالة لتقليل التكرار.
- أظهر كل بيانات البائع في ملفه من دون طي قسم البيانات الإضافية، وضع إجراء واتساب بجوار الهاتف؛ لا تستخدم أرقامًا غير موجودة في بيانات البائع.

## Seller expenses — 2026-11-12
- المالية → مصروفات records seller charges and payouts in separate ledgers. A record has seller, category (preset or free text), date, currency, full amount, optional reference and notes, and one or more settlement entries. Remaining balance derives from recorded payments in that record’s currency.
- Keep entries in the prototype session store. Recording a settlement never moves funds or changes wallet balances.

## Product categories — 2026-11-12
- Categories use the catalog's ten existing names, each with a locally stored illustrative photo. Keep compact Arabic category rows with description, order, state and actions.
- Category additions, edits, uploaded images and state persist in sessionStorage; active categories feed the product form. Renames preserve aliases so existing product category labels resolve correctly. Prevent deleting categories used by products.

## Suppliers and linked product performance — 2026-11-12
- Suppliers have editable contact/type/country data, session-persisted IDs, and linked catalog products. Product creation selects these suppliers; test products require one.
- A supplier file shows products, current catalog stock, date-filtered order quantities, delivery counts/rates and a per-order quantity ledger linking to order details. Preserve order/product identifiers.
- Prototype withdrawn quantities derive from current shipped stages, not a physical inventory ledger; disclose this. Returned quantity requires recorded warehouse arrival. Never subtract historical withdrawals from catalog stock again.

## Product type cards — 2026-11-12
- In the add-product form, show the four product types as selectable cards rather than a dropdown. Highlight the selected type with purple border/tint and a checkmark. Preserve entered form data when switching types and keep native radio keyboard behavior.

## Sourcing financial workflow decision — 2026-11-12
- Seller acceptance of a specific sourcing quote should create an outstanding invoice in their account. Payment is recorded only after verification, not automatically deducted from the wallet. This is the user's accepted business rule for the planned sourcing workflow.
