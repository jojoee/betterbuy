# Betterbuy agent guide

## Product constraints

- Betterbuy compares two manually entered offers by cost per comparable size.
- Do not add unit conversion, network/API calls, accounts, analytics, tracking,
  retailer data, or cloud sync.
- Keep saved history local-only, explicitly user-controlled, capped at 50
  entries, with up to 5 pinned entries.

## Code ownership

- `src/calculator.ts`: input validation, unit-cost comparison, and formatting.
- `src/history.ts`: localStorage persistence and history-cap behavior.
- `src/main.ts`: DOM rendering, user interactions, and service-worker setup.
- `src/tailwind.css`: Tailwind v4 entry stylesheet and Betterbuy theme tokens.
- `src/main.tsx`: calculator composition with Tailwind utilities.
- `src/demo.tsx` and `demo.html`: local Tailwind utility catalog only.
- `docs/design-system.md`: design-system usage guidance.
- `tests/`: Vitest coverage for calculation, persistence, and browser flows.

## Change and validation rules

- Use strict TypeScript; keep logic small and dependency-free.
- Update focused tests whenever calculation, history, or UI behavior changes.
- Preserve installable/offline PWA behavior.
- Use Betterbuy's semantic Tailwind theme utilities for UI work; do not add
  raw colors, spacing, radii, shadows, Bootstrap, Tailwind plugins, or another
  UI dependency without an explicit request.
- Prefer utility composition in markup. Add a shared React component only when
  a Betterbuy product flow needs it; document its accessibility and production
  use.
- Run `npm run typecheck`, `npm test`, and `npm run build`; also run
  `npm run format:check` for formatting-relevant changes.
- Do not commit generated `dist/` or `coverage/` output unless explicitly
  requested.
