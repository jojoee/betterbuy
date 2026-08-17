# Betterbuy

## Find the better deal in seconds

Compare two offers by cost per comparable size and immediately see which one gives you more for your money. Betterbuy is private, local-first, and works offline.

![Betterbuy showing a completed comparison where Option B is 25% cheaper](docs/images/betterbuy-iphone-17-pro.png)

## Install Betterbuy on iPhone

1. Open Betterbuy in Chrome on your iPhone.
2. Tap the **Share** icon (the square with an upward arrow).
3. Scroll down and tap **Add to Home Screen**.
4. Optionally rename the app, then tap **Add**.

Betterbuy will appear on your Home Screen and open like a native app. If **Add to Home Screen** is unavailable in Chrome, update Chrome or use Safari and follow the same steps.

## Development

```sh
npm install
npm run dev
```

The app uses React with a small Zustand reducer store. Development builds name
each state action in Redux DevTools so developers can inspect and rewind
in-memory state; rewinding does not modify saved browser history.

## Design system preview

The calculator uses Tailwind CSS with Betterbuy theme utilities. While the dev
server is running, open `/demo.html` to view its local Tailwind catalog.

## Checks

```sh
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

## Privacy and saved comparisons

Enter offers using comparable sizes—Betterbuy does not convert units or collect data. Saved comparisons stay in local browser storage, can be restored, pinned or unpinned (up to 5 pins), or deleted, and are capped at 50 entries.
