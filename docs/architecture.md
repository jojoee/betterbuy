# React architecture

Betterbuy is a single-page React application. It has no router, remote data,
accounts, analytics, or Tailwind dependency.

## Ownership

| Concern | Owner |
| --- | --- |
| Rendering and component composition | React |
| Shared application state | Zustand |
| Store subscriptions | `useBetterbuyStore(selector)` React hook |
| Named state transitions | Zustand Redux middleware and `betterbuyReducer` |
| Comparison result | `compare()` during render |
| Service worker | React `useEffect` |
| DOM scroll/focus | React event callbacks and refs when needed |
| Saved history | Existing localStorage adapter and `betterbuy.history.v1` |

The application flow is: user event → typed action → pure reducer → Zustand
state → React selector render. History commands then explicitly write the
resulting snapshot to localStorage.

## Debugging

Development builds enable Zustand's Redux DevTools middleware. It records
named actions such as `history/save` and `history/pin`, so developers can
inspect and rewind in-memory application state. Rewinding is never persisted
and does not replay ID generation, timestamps, service-worker work, or browser
storage writes.

Zustand was chosen over Context/reducer because the app explicitly requires
Redux-DevTools-style action history. Redux Toolkit would also provide that
workflow, but its provider/slice conventions are disproportionate for this
small, synchronous, local-only application.
