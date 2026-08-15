# Betterbuy

A private, local-first PWA for comparing the cost per size of two offers.

## Development

```sh
npm install
npm run dev
```

## Checks

```sh
npm run typecheck
npm test
npm run test:coverage
npm run build
```

Users must enter comparable sizes. Betterbuy does not convert units or collect
data. Comparisons are explicitly saved to local browser storage, can be
restored, pinned or unpinned (up to 5 pins), or deleted, and are capped at 50
entries.
