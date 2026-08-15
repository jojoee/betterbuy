# Betterbuy design system

## Purpose

Betterbuy is a decision aid: its visual language is calm, factual, and quick to
scan. Navy identifies the primary action, blue-gray provides neutral structure,
green communicates a better value or safe action, and red is reserved for
deletion.

## Source of truth

`src/design-system.css` is production CSS, not demo-only styling. It has three
layers:

1. **Primitive tokens** are raw named values, such as `--ds-blue-950` and
   `--ds-space-4`.
2. **Semantic tokens** assign a purpose, such as `--ds-color-primary` and
   `--ds-color-success`.
3. **Component contracts** map those purposes to reusable UI, such as
   `--ds-card-background` and `.ds-button`.

Use semantic tokens or `ds-` component contracts in product UI. Bootstrap Grid
is the sole approved layout dependency: use its `container`, `row`, `col-*`,
and `g-*` classes while keeping all visual styling in Betterbuy tokens and
components. Do not add raw colors, spacing, radii, shadows, other Bootstrap
CSS/JS, Tailwind, or another UI dependency without an explicit product need.

## Foundations

| Area          | Rule                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------- |
| Type          | Use `--ds-font-sans`; write direct, sentence-case interface copy.                             |
| Spacing       | Use the 4px-based `--ds-space-*` scale.                                                       |
| Surfaces      | Use page, surface, and alert roles instead of introducing new gray values.                    |
| Feedback      | Green means better/safe; red means destructive; neutral remains blue-gray.                    |
| Accessibility | Touch controls are at least 44px; keyboard focus is visible; motion respects user preference. |

## V1 component contracts

| Component                                | Variants                                                 | Use                                          |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `.ds-card`                               | default                                                  | Focused content surface.                     |
| `.ds-fieldset`, `.ds-field`, `.ds-input` | default                                                  | A labeled comparison input.                  |
| `.ds-button`                             | primary, secondary, subtle-success, subtle-danger, block | Actions, with one primary action per task.   |
| `.ds-alert`                              | default, success                                         | Comparison guidance and results.             |
| `.ds-badge`                              | neutral, success                                         | Compact saved-count or value status.         |
| `.ds-list`, `.ds-list-item`              | default                                                  | Restorable saved comparison and its actions. |

Dialogs, popups, toasts, navigation, selects, checkboxes, tables, tabs, and
menus are intentionally not part of V1. Add a component only when Betterbuy has
a real flow that needs it; document its variants, states, accessibility, and
production use at the same time.

## Preview

Run `npm run dev`, then open `/demo.html` to inspect the local component
catalog. The calculator uses the same CSS contracts in production.
