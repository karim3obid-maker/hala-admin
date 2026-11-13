# Simplified administration QA — 2026-10-25

final result: passed

## Scope and visual reference

Implemented the approved local redesign for users/CRM, orders and shipping, validation and returns. Preserved the latest single-screen order handling workflow, seller style, HeroUI controls, Gravity icons, purple #270A5E, local IBM Plex Sans Arabic, and RTL. `src/styles.css` remains the seller baseline; administration additions are in `src/admin.css`.

Reference: `sellers-crm-cards-preview.png` (1141×1034). Implementation: `qa-simplified/sellers-desktop.png` (1141×1034). Side-by-side evidence: `qa-simplified/comparison.jpg` (2282×1078). Equal-sized panels preserve aspect ratio without stretching. The comparison was opened and inspected. Different demo seller counts are intentional; source session contained an additional test seller. The new information hierarchy intentionally shows core filters/columns, with the rest available through expandable filters and column customization.

## Visual checks

Inspected desktop screenshots at 1141×1034 for sellers, orders, shipments, returns and validation. Inspected mobile screenshots at 390×844 for sellers, orders, shipment filters and validation. Evidence is in `qa-simplified/`.

Font, logo, icons, colors, card radii, table density and field anatomy retain the chosen baseline. Arabic labels and all-status selectors remain readable. Tables scroll within their own containers. Document width equals the viewport width (390px) on the checked mobile pages. Search keyboard focus is visibly purple; native date keyboard input updates filters. Mobile navigation opens as an accessible dialog. No remaining blocking visual finding was observed in the tested views.

## Browser verification

- Changed a shipment from pending to ready: counts changed 27→26 and 44→45, and linked order HL-24476 showed the new state.
- Saved an order customer edit and verified it in the linked shipment after navigating across sections.
- Recorded a validation attempt: history increased from zero to one. Saved a final decision independently; closed case retained its history and disabled further saving.
- Seller manager filter updated the list and scoped metrics from eight sellers to three. Filter chip and optional contact column worked. Empty seller form showed inline required-field errors.
- Employees, managers and stores display local performance and linked order records.
- Order search returned one record; selection displayed the floating action bar and a modal explicitly targeting one record. Cancellation was disabled while its required reason was empty.
- Returning from order details retained the same search. No-match search displayed the empty state. Invalid date order showed an inline alert and an empty result range.
- Shipment sorting and pagination worked: page two displayed records 16–30 of 333. Pending requests showed a distinct empty state, separate from edit history.
- Actual shipment CSV export after one-record search contained exactly one data row, the matching identifiers, state and USD currency.
- Analytics dashboard rendered after shared-store wiring. Captured console error logs were empty.

## Automated verification

Production Vite build and Sites packaging passed. All 21 Node tests passed: analytics (5), shared store (8), seller segmentation (4), hosting worker (4). Shared-store coverage includes CRM migration, bidirectional linked edits, delivery revenue, selected-only bulk changes, returns versus warehouse arrival, requests versus edit history, manager propagation, and one-time shipment creation after confirmation.

## Practical limits

This is a frontend prototype with synthetic data and sessionStorage persistence. Data survives refresh in the same browser tab session. No API or live system was modified. Missing contact, stock and wallet integration data is explicitly unavailable. Validation saves local decisions; operational reshipping/cancellation and financial execution require integration. Existing build chunk-size warning remains nonblocking. Browser checks are representative interaction checks, not a certification of full accessibility or production business rules.

## Wallet requests QA — 2026-11-10
- #wallet-withdrawals: 5 سجلات سحب، الشيب «البائع» مع اسم الطالب والجهة المستهدفة «الشركة»، كروت الملخص والمراحل تعمل بالنقر للتصفية.
- #wallet-deposits: 4+1 سجلات إيداع صادرة من «الشركة» مع توجيهها للبائع، إنشاء DP-2005 بنموذج الإضافة ظهر أول الجدول في المرحلة الجديدة.
- نافذة التفاصيل تعرض شريط المراحل (منجز/حالي/معلق + مرفوض بالأحمر)، بطاقة الطالب وبياناته، المبلغ والطريقة والمرجع والسبب، صورة التحويل (نموذج تجريبي SVG للمكتملين)، وسجل أحداث موقّت.
- الإقفال بدون صورة مرفوقة يظهر تنبيهًا ولا يغير المرحلة. الرفض يتطلب سببًا + تفصيلًا ≥10 أحرف، ويحول الصف وشريط المراحل للأحمر مع سبب مسجل في الصف والسجل.
- الانتقالات new→review→proof تعمل مع تسجيل حدث لكل انتقال في سجل مراحل الطلب.
- npm run build (dist كامل) وnode --test tests/*.test.mjs — 24 اختبارًا ناجحًا.
- موبايل غير مختبر يدويًا في هذا الفحص؛ القاعدة media queries مضافة للشريط والجداول.

## Unified wallet requests (simplified) — 2026-11-11
- #wallet-requests: عنوان «إدارة طلبات السحب والإيداع»، 9 طلبات في «الكل»، تبويب السحب 5، تبويب الإيداع 4، فلتر «مرفوض» 2، أعمدة الجدول الثمانية كلها بعرض صحيح (لا يوجد td بعرض 0).
- نموذج الإضافة: اختيار نوع (سحب/إيداع) يغيّر حقل البائع تلقائيًا، إنشاء DP-2005 ينقل مباشرة لشاشة المعالجة المبسطة.
- دورة الطلب: إرسال للبائع ← تأكيد وصول التحويل ← محاولة إقفال بدون صورة تُرفض برسالة ← إرفاق نموذج إيصال تجريبي ← إقفال بنجاح مع سجل أحداث.
- العمودان في شاشة المعالجة (بيانات الطلب / صورة التحويل والقرار) يعملان بشكل صحيح؛ أشرطة المراحل تتقدم done/current.
- node --test tests/*.test.mjs: 24 ناجح.

## Order filters rework — 2026-11-11
- Orders advanced filters: removed «النشاط من/إلى»; added «المدينة» (linked to selected country, options built from real order cities) and «حالة الدفع» (COD / مدفوع).
- Country change resets city when it no longer belongs to the new country; chips render as «المدينة: …» and «حالة الدفع: …» and «مسح الكل» clears both.
- Payment tag (COD amber / مدفوع green) beside the amount cell; CSV export includes حالة الدفع column; new local orders default to COD.
- Verified: COD filter → only COD rows (15/15 tags COD), مدفوع → only مدفوع tags, Saudi cities list shows جدة/الدمام/الرياض, city reset on switching to الكويت, مسح الكل works. Build ✓, node --test 24 pass.

## Standalone fast order confirmation — 2026-11-11
- #order-confirmation-fast renders three adjacent cards (customer/order/products) plus a separate actions column; existing #orders/:id workspace remains unchanged.
- Confirmed HL-24439 after review: status becomes مؤكد, activity +1 and linked shipment +1, while the opened order ID stays stable. Next navigation opens HL-24446; edit opens the existing order workspace.
- Call modal saved an attempt on HL-24415: attempts incremented, activity and call tabs updated. No browser console errors after reload.
- npm run build ✓; node --test tests/*.test.mjs: 24 pass.
