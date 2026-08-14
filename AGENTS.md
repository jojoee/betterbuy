# Betterbuy agent guide

## Product constraints

- Betterbuy compares two manually entered offers by cost per comparable size.
- Do not add unit conversion, network/API calls, accounts, analytics, tracking,
  retailer data, or cloud sync.
- Keep saved history local-only, explicitly user-controlled, and capped at 100
  newest entries.

## Code ownership

- `src/calculator.ts`: input validation, unit-cost comparison, and formatting.
- `src/history.ts`: localStorage persistence and history-cap behavior.
- `src/main.ts`: DOM rendering, user interactions, and service-worker setup.
- `src/style.css`: mobile-first presentation.
- `tests/`: Vitest coverage for calculation, persistence, and browser flows.

## Change and validation rules

- Use strict TypeScript; keep logic small and dependency-free.
- Update focused tests whenever calculation, history, or UI behavior changes.
- Preserve installable/offline PWA behavior.
- Run `npm run typecheck`, `npm test`, and `npm run build`; also run
  `npm run format:check` for formatting-relevant changes.
- Do not commit generated `dist/` or `coverage/` output unless explicitly
  requested.
