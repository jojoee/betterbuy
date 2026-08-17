# Zustand DevTools time travel

Betterbuy enables Zustand's Redux DevTools middleware only in development
builds. Production builds do not expose the `Betterbuy` DevTools store.

## Use it in development

1. Install the Redux DevTools browser extension, run `npm run dev`, and open
   Betterbuy in that browser.
2. Open the extension and select the `Betterbuy` store.
3. Inspect named actions such as `comparison/setField`, `history/save`, and
   `history/pin` to review the state transition that produced them.
4. Select an earlier state to rewind the live application. Use the DevTools
   controls to return to the latest state, or reload the page to start from
   the persisted history snapshot.

## Time-travel boundary

Time travel changes only the in-memory Zustand store. Selecting an earlier
state does not write `localStorage`, regenerate IDs or timestamps, or replay
service-worker and other browser side effects.

Reloading after time travel restores the saved-history snapshot from browser
storage. Avoid saving, pinning, unpinning, or deleting history after rewinding
unless you intentionally want that current in-memory history to become the
next persisted snapshot.
