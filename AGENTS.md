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
- `src/design-system.css`: production design tokens and reusable `ds-` component contracts.
- `src/style.css`: Betterbuy-specific mobile-first layout and composition.
- `src/demo.css` and `demo.html`: local design-system catalog only.
- `docs/design-system.md`: design-system usage guidance.
- `tests/`: Vitest coverage for calculation, persistence, and browser flows.

## Change and validation rules

- Use strict TypeScript; keep logic small and dependency-free.
- Update focused tests whenever calculation, history, or UI behavior changes.
- Preserve installable/offline PWA behavior.
- Use semantic tokens and `ds-` component contracts for UI work. Bootstrap Grid
  (`bootstrap/dist/css/bootstrap-grid.min.css`) is approved for layout only;
  do not add other Bootstrap CSS/JS, Tailwind, or UI dependencies without an
  explicit request.
- Add a design-system component only when a Betterbuy product flow needs it;
  document its variants, states, accessibility, and production use.
- Run `npm run typecheck`, `npm test`, and `npm run build`; also run
  `npm run format:check` for formatting-relevant changes.
- Do not commit generated `dist/` or `coverage/` output unless explicitly
  requested.
