# Hala Admin — Seller Design Parity

Authoritative user request: use the design and style from **hala kommers seller new desi**. The source is `/Volumes/Work/تصميم هلا /dashboard-heroui`, documented in its `DESIGN.md`.

Imported source: the complete current stylesheet and three IBM Plex Sans Arabic font files, original Hala logo, shared Gravity Icon/IconButton, AnimatedNumber, Metric/MetricRows/Section/TotalChip and BrandLogo.

The runtime uses the same HeroUI 3.2.6, Gravity 2.23.0 and Chart.js 4.5.1. `src/admin.css` adapts admin-specific content without redefining the typography, palette, common metrics, shell or design tokens.

Preserve #270A5E purple, #F1EBFC purple tint, #F7F8FB background, 50px desktop header, clamp(176px,15vw,216px) sidebar, 14px body type, 22px title, compact metrics, thin separators and lightly grouped order/shipment surfaces. The mobile drawer breakpoint is 760px. Use the 400ms shared entrance number component, respecting reduced motion.

The latest request authorizes detailed demo analytics for sellers, employees, stores and account managers. The dashboard now uses 480 explicitly synthetic linked orders across 8 sellers, 6 employees, 12 stores and 3 managers. All cards, charts, exports and details derive from the same filtered dataset. Do not mix the historical screenshot counts with this synthetic dataset or imply a live connection. Preserve the twelve settings categories and admin navigation from the screenshots.

Use seller-native white surfaces, semantic metric icons, purple grouping and compact type for the new filters, trends, manager cards and detailed tables. Keep horizontal table scrolling inside the card on mobile. Clarify that revenue counts delivered orders only and contribution margin excludes fixed overhead.

Latest layout refinement: order summary and shipment summary are adjacent at the top, before charts. The lifecycle section shows all 13 current order statuses and the 8 shipping statuses, with clickable counts and scoped shares. Carrier analysis reconciles to the shipping scope. Distinguish final returned orders from returns in progress. The demo provides current snapshots, so no historical conversion rates or waiting durations should be inferred from the stage distribution.

Lifecycle presentation preference: show each order/shipment status as its own card with count, scoped percentage, semantic icon, progress and click-to-filter. Replace the prior two list panels with full-width responsive card groups.
