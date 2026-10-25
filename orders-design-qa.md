# Orders page design QA

final result: passed

Source visual truth: supplied Screenshot 2026-10-24 at 11.09.00 PM.png (3566 × 2018), plus AGENTS.md / DESIGN.md seller styling baseline. User screenshot defines content; the existing seller system defines visual styling.
Implementation: orders-desktop.png (1440 × 1000), orders-mobile.png (390 × 844). Browser CSS viewport matches screenshot dimensions. Light theme, #orders, default demo records. Source proportionally normalized in orders-comparison.jpg; different viewport aspect ratios are intentional. Reference counts, customer contact information and unsupported states are not copied into the synthetic dataset.

Comparison evidence: orders-comparison.jpg puts reference and implementation together. Six summary metrics, RTL sidebar, status strip, entity filters, applied date chips, selection controls and order table preserve the reference hierarchy. Intentional differences: shared seller typography, logo, rounded grouped surfaces; actual synthetic status counts; USD data; CSV export; working create form; advanced dates/country disclosure. Missing source-only labels such as postponed/upsell are not fabricated.

Required surfaces:
- Typography: existing local IBM Plex Sans Arabic 400/500/600, compact labels and numeric amounts retained. Arabic text is readable without clipping.
- Layout: existing shell, six desktop metrics, two-column mobile metrics; filter grid adapts. Table scroll stays inside its card. At 390px document scrollWidth equals innerWidth (390).
- Tokens: shared purple, neutral surfaces, subtle separators and semantic badges. No independent palette introduced.
- Assets: original project logo and Gravity icon library. No generated or approximated image assets.
- Content: all records explicitly marked synthetic; status counts and filtered totals agree. Customer phones and addresses not invented.

Focused review: reference table/filter region and corresponding implementation reviewed in comparison at native image resolution; input labels, badges, identifiers, checkboxes, row rhythm and amounts are legible. Mobile separately inspected in browser.

Comparison history:
- P2: navigation originally also highlighted import orders because of a duplicate child label. Restricted child matching for the standalone Orders page. Revised desktop screenshot shows only the Orders item active.
- No remaining actionable P0/P1/P2 visual findings.

Interactions verified in in-app browser: search ID yields exactly one order; detail modal shows matching product, staff, amount and status; status changes to confirmed; page selection shows 15 selected; cancellation clears selection; create form produces new local order and opens details; advanced filters open; optional product column appears; CSV download completes. Console checked: no runtime errors; existing HeroUI PressResponder warnings remain non-blocking.
Build: Vite production build succeeds. Sites packaging prepared. Existing worker/data checks: 9 passed.

Follow-up polish (P3): status strip uses horizontal scrolling for the full lifecycle. Production backend, persistent data and Excel import are outside this frontend preview.
