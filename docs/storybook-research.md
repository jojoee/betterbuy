# Storybook implementation references

Betterbuy uses Storybook's React/Vite framework as the local component catalog.
Storybook stories document visual states; a `play` function makes a state
transition executable as a component test.

- [React/Vite framework](https://storybook.js.org/docs/get-started/frameworks/react-vite/)
- [Storybook installation](https://storybook.js.org/docs/get-started/install/)
- [Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/)
- [Interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- [Zustand DevTools middleware](https://zustand.docs.pmnd.rs/reference/middlewares/devtools)

The Vitest addon executes Storybook component tests in Playwright Chromium.
This is distinct from Betterbuy's `test:e2e` suite, which exercises the complete
application. Zustand DevTools supports manual action inspection and time-travel
debugging; stories use explicit fresh stores instead of DevTools state.
