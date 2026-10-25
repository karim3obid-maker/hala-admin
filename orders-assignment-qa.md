# Assignment filter verification

Added four quick controls immediately below order status tabs: all assignments, assigned to an agent, unassigned, and assigned to me. Each displays a filtered count. The last control exposes an explicit preview-agent selector because this local app has no authenticated agent identity.

Browser checks: initial assigned=480, unassigned=0, e1=78. Unassign HL-24452 through bulk transfer: assigned becomes 479, unassigned becomes 1 and its row shows غير معيّنة. Unassigned filter returns exactly that record. Assigned-to-me shows only أحمد سامي; switching the preview agent to e2 returns سارة محمود rows and count 68. Metrics/status counts follow the assignment scope. Filter changes clear selections and reset pagination. Applied assignment chip can be removed; clear-all resets assignment too.

Desktop: orders-assignment-filters.png. Mobile: orders-assignment-mobile.png at 390×844; no document overflow (scrollWidth=innerWidth=390). Shared font, colors, compact outlined controls and active purple styling match the existing design baseline. No browser console errors. Vite build passes; nine existing tests pass.

All seed records are initially assigned; unassigned records appear when assignment is cleared. No synthetic ownership is silently changed.
