# Seller CRM verification — 2026-10-24

Implemented in `src/components/sellers/SellersCRM.jsx`; routed from seller list, follow-up queue, and add-seller navigation. Shared sessionStorage state keeps local records through navigation and refresh. Existing seller/order identity mapping drives filtered performance.

Verified in the local browser:
- Seller detail reconciles with list: seller s3 has 83 orders, 24 delivered, USD 1,278 delivered sales; average order value rounded to USD 52.75.
- CRM stage update saves and appears back in list.
- New task appears in seller workspace; completing it decreases the open count and places it in the completed queue.
- Contact note saves with type, author and Cairo timestamp.
- New seller appears in list with zero-safe analytics.
- Bulk assignment changes the selected seller's account manager.
- Seller name search returns one expected row; clearing restores the list.
- Mobile viewport 390 × 844: document scrollWidth equals viewport width; table overflow stays within its card.
- Production build succeeds. Existing analytics and Sites worker tests: 9 passed.

Limitations: synthetic records; no backend, actual message sending, authentication/impersonation or live wallet balances. CRM changes remain in the current browser tab's session. Dates in task inputs use the device timezone as labelled. Performance filters apply to order creation dates; tasks and notes are all-time. Build has the existing >500 KB chunk advisory.

## Independent cards and marketer filters — 2026-10-24
- Replaced the common metrics surface with six individual cards and reduced the heading/date area to a compact bar.
- Added synthetic source/group attributes with session migration that preserves saved edits; editable in seller add/edit and visible in detail, table and CSV.
- Verified source + Pro Plan + group intersection returns 3 expected records. Uses-Hala-Share includes the 2 mixed-source records (5 total); exact source selection excludes mixed records.
- Default shipment ordering begins with seller s1 (50 departed shipments), while delivered-sales ordering begins with s3 (USD 1,278).
- Departure totals reconcile to pickup, transit, out for delivery, delivery failure, delivered, returning and final returned statuses; ready-to-ship excluded. Total is 250 for the seeded 480 orders.
- Mobile 390 × 844: separate cards, compact dates and contained table scrolling; document width equals 390px.
- Production build succeeded; 4 marketer segmentation/ranking tests and 4 Sites packaging tests passed.

## Selection toolbar and seller identity — 2026-10-25
- Selection, eye/CRM and open-account buttons now lead each row. Name, ID, code and current account status remain visible in the identity cell regardless of optional columns.
- Floating purple selection toolbar provides plan, account manager, password action, activate/deactivate and clear/count. Supported local actions update selected sellers only and append per-seller history; existing shared-store propagation keeps manager ownership linked.
- Verified in browser: changing two selected plans, account preview showing the updated plan, activating then stopping seller s8, password action accurately explaining absent delivery/auth service, and 390px mobile toolbar without page overflow.
- Account button opens an explicitly local account preview. No authentication, credential reset, email delivery or impersonation occurs.
- Production build and 7 selected bulk-action/Sites tests passed. Screenshot: seller-selection-preview.png.
