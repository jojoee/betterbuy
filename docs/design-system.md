# Betterbuy Tailwind design system

## Purpose

Betterbuy is a decision aid: its visual language is calm, factual, and quick
to scan. Navy identifies primary actions, green communicates better value or a
safe action, and red is reserved for deletion.

## Source of truth

`src/tailwind.css` is the production Tailwind v4 entry stylesheet. Its
`@theme` block exposes Betterbuy's semantic color, radius, shadow, and font
utilities, such as `bg-bb-navy`, `text-bb-success`, and `rounded-bb-xl`.

Use those theme utilities in product markup instead of raw color, spacing,
radius, or shadow values. Compose layouts with Tailwind grid and flex utilities
directly in JSX or HTML; do not recreate a `ds-*` component-class layer.

## Foundations

| Area | Rule |
| --- | --- |
| Type | Use the configured `font-sans` family and direct, sentence-case interface copy. |
| Spacing | Prefer Tailwind's 4px-based spacing scale. |
| Surfaces | Use `bb-page`, `bb-surface`, alert, and border theme roles. |
| Feedback | Use blue for information, amber for warning, green for better/safe, and red for destructive actions. |
| Accessibility | Touch controls are at least 44px; keyboard focus is visible; motion respects `motion-reduce`. |

## Utility patterns

- Buttons: use `min-h-12`, an appropriate `bg-*` or border treatment, disabled
  state utilities, and visible `focus-visible` outlines.
- Inputs: retain native labels and validation attributes; use `focus:border-bb-focus`
  and the shared focus outline utilities.
- Responsive layout: use mobile-first `grid`, `flex`, and breakpoint variants
  such as `sm:grid-cols-2`.
- Overlays: use native `<dialog>` for blocking decisions and keep tooltips
  supplemental to visible labels.

## Preview

Run `npm run dev`, then open `/demo.html` to inspect the local Tailwind catalog.
The calculator uses the same theme utilities in production.
