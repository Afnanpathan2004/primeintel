# UI / UX Design Guidelines

## Visual Language & Ergonomics
- **Role**: Serious, dense, enterprise internal workbench for technical sales and solutions architects.
- **Tone**: Pragmatic, clean, data-dense, crisp typography, neutral slate/zinc palette with PrimeCore blue/indigo accents.
- **Anti-patterns to Avoid**:
  - No cartoonish chat bubbles or conversational AI widgets.
  - No distracting glowing animations or unnecessary decorative gradients.
  - No hidden calculations: every number must link to an explanatory formula.

## Core Screens
1. **Admin Dashboard (`/admin`)**: Metric cards (Total Estimates, Value, Win Rate), Recent Estimates table with filters, Quick Actions.
2. **New Estimate Flow (`/admin/estimates/new`)**:
   - Customer & Lead details panel.
   - Natural language requirement input box with sample scenario shortcuts.
   - Requirement Analysis drawer/view with Fact vs Inference confidence badges and unknown/missing warnings.
   - Interactive Admin Review form (edit workloads, toggle add-ons, adjust complexity).
   - Real-time Deterministic Calculation preview with benchmark comparison side-by-side.
   - Commercial adjustment slider/inputs (discount % with warning, override toggle).
3. **Estimate Detail & Proposal View (`/admin/estimates/[id]`)**:
   - Internal View: Line-item breakdown, multiplier audit, pricing version, edit log.
   - Customer Proposal View: PrimeCore branded, client summary, scope list, assumptions, indicative price band, timeline, disclaimer.
   - Print/PDF export layout.
4. **Pricing Configuration (`/admin/pricing`)**:
   - Services list with base prices.
   - Multipliers editor (environment, scale, complexity, timeline).
   - Add-on catalog.
   - Benchmark manager.
   - Version snapshot manager.
