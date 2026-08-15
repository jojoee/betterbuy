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
| Feedback      | Blue means information, amber means warning, green means better/safe, red means destructive.  |
| Accessibility | Touch controls are at least 44px; keyboard focus is visible; motion respects user preference. |

### Headings

Use semantic heading elements for document structure. The compact scale is
defined by `--ds-font-size-heading-1` through `--ds-font-size-heading-6`:

| Element | Size |
| ------- | ---- |
| `h1`    | 1.25rem |
| `h2`    | 1.05rem |
| `h3`    | 1rem |
| `h4`    | 0.875rem |
| `h5`    | 0.82rem |
| `h6`    | 0.75rem |

Choose heading levels by hierarchy, not visual preference; every level is
smaller than the one above it. The design system resets heading margins, so
apply spacing with the token scale in the layout that owns the heading.

## Component contracts

| Component                                | Variants                                                 | Use                                          |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `.ds-card`, `.ds-surface`                | default                                                  | Focused content or a lighter structural panel. |
| `.ds-page-header`, `.ds-section-header`  | default                                                  | Page identity and the heading/actions for a section. |
| `.ds-stack`, `.ds-inline`, `.ds-cluster` | default                                                  | Token-spaced vertical, inline, and wrapping layouts. |
| `.ds-divider`, `.ds-empty-state`         | default                                                  | Separate related content; explain an empty collection. |
| `.ds-code`, `.ds-code-block`, `.ds-link` | default                                                  | Code snippets and navigation links. |
| `.ds-fieldset`, `.ds-field`, `.ds-input` | default                                                  | Existing comparison inputs. |
| `.ds-label`, `.ds-select`, `.ds-textarea` | default, invalid, disabled                               | Standard labelled text and choice controls. |
| `.ds-check`, `.ds-radio`, `.ds-switch`   | default, checked, disabled                               | Boolean and single-choice controls. |
| `.ds-field-hint`, `.ds-field-message`    | default                                                   | Supplementary and validation copy. |
| `.ds-button`, `.ds-button-group`         | primary, secondary, subtle-success, subtle-danger, block | Actions, with one primary action per task. |
| `.ds-icon-button`, `.ds-icon`            | default                                                   | Compact action with an inline SVG icon. |
| `.ds-alert`                              | default/info, success, warning, danger                  | Status and result feedback. |
| `.ds-badge`                              | neutral, success                                         | Compact saved-count or value status. |
| `.ds-spinner`, `.ds-skeleton`            | default                                                   | Short loading states. |
| `.ds-tooltip`, `.ds-popover`, `.ds-dialog` | default                                                 | Supplemental, contextual, and blocking overlays. |
| `.ds-list`, `.ds-list-item`              | default                                                   | Restorable saved comparison and its actions. |

### Accessibility and behavior

- Use native semantic elements first: `button`, `label`, `fieldset`, `legend`,
  `select`, `textarea`, and checkbox/radio `input`s.
- Every icon button needs an accessible name. Inline SVG is decorative unless it
  is the label itself, in which case it must not be `aria-hidden`.
- Pair help and error copy with an input through `aria-describedby`; apply
  `aria-invalid="true"` only to an invalid control. Do not rely on color alone.
- Tooltips supplement a visible label and are revealed on keyboard focus as well
  as pointer hover. They are not a place for interactive controls.
- Use native `<dialog>` for blocking decisions. Focus the least destructive
  action first, support Escape, and return focus to the trigger on close.
- A popover trigger exposes its state with `aria-expanded`; Escape and the
  close control dismiss it and return focus to that trigger. Keep a popover
  non-modal and use a dialog when focus must not leave the decision.
- Popovers and dialogs are catalog-only contracts until Betterbuy has a product
  flow that needs them. Do not introduce a product interaction solely to use one.

### Deferred components

Tabs, breadcrumbs, pagination, menus, drawers, tables, date/time controls,
avatars, and progress trackers are intentionally out of scope. Add them only
when a real local Betterbuy flow requires them.

## Preview

Run `npm run dev`, then open `/demo.html` to inspect the local component
catalog. The calculator uses the same CSS contracts in production.
