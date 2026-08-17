import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Design system/Catalog",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function CatalogFrame({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <main className="min-w-80 bg-bb-page p-5 font-sans text-bb-navy">
      <section className="mx-auto grid max-w-5xl gap-4">
        <header>
          <h1 className="text-2xl font-bold tracking-[-0.035em]">{title}</h1>
        </header>
        {children}
      </section>
    </main>
  );
}

export const Foundations: Story = {
  render: () => (
    <CatalogFrame title="Foundations">
      <p className="text-bb-text-muted">
        Use semantic Betterbuy theme utilities instead of raw values.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Page", "bg-bb-page"],
          ["Surface", "bg-bb-surface"],
          ["Primary", "bg-bb-navy"],
          ["Warning", "bg-bb-warning-surface"],
          ["Danger", "bg-bb-danger-surface"],
        ].map(([name, color]) => (
          <div
            key={name}
            className="overflow-hidden rounded-bb-lg border border-bb-border"
          >
            <div className={`h-12 ${color}`}></div>
            <div className="bg-bb-surface p-2 text-sm">{name}</div>
          </div>
        ))}
      </div>
      <p>
        A{" "}
        <a className="text-bb-navy underline underline-offset-2" href="#">
          semantic link
        </a>{" "}
        and{" "}
        <code className="rounded-bb-sm border border-bb-border bg-bb-info-surface px-1 font-mono text-sm">
          inline code
        </code>
        .
      </p>
    </CatalogFrame>
  ),
};

export const ActionsAndForms: Story = {
  render: () => (
    <CatalogFrame title="Actions and forms">
      <article className="grid gap-3 rounded-bb-xl border border-bb-border bg-bb-surface p-4">
        <div className="flex flex-wrap gap-2">
          <button className="min-h-12 rounded-bb-lg bg-bb-navy px-4 py-2 font-bold text-white focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2">
            Primary
          </button>
          <button className="min-h-12 rounded-bb-lg border border-bb-border-input bg-bb-surface px-4 py-2 font-bold">
            Secondary
          </button>
          <button
            className="min-h-12 rounded-bb-lg border border-bb-border-input bg-bb-surface px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-45"
            disabled
          >
            Disabled
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 font-bold">
            Unit
            <select className="min-h-12 rounded-bb-md border border-bb-border-input bg-bb-surface p-3 font-normal">
              <option>Per item</option>
              <option>Per pack</option>
            </select>
          </label>
          <label className="grid gap-1 font-bold">
            Cost
            <input
              className="rounded-bb-md border border-bb-danger bg-bb-surface p-3 font-normal"
              aria-describedby="catalog-cost-error"
              aria-invalid="true"
            />
            <span
              id="catalog-cost-error"
              className="text-sm font-normal text-bb-danger"
            >
              Enter a valid cost.
            </span>
          </label>
        </div>
      </article>
    </CatalogFrame>
  ),
};

export const FeedbackAndLoading: Story = {
  render: () => (
    <CatalogFrame title="Feedback and loading">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1 rounded-bb-xl bg-bb-info-surface p-3 text-bb-text-muted">
          <strong>Guidance</strong>
          <span>Enter positive values to compare.</span>
        </div>
        <div className="grid gap-1 rounded-bb-xl bg-bb-success-surface p-3 text-bb-success">
          <strong>Saved locally</strong>
          <span>Your comparison is ready to restore.</span>
        </div>
        <div className="grid gap-1 rounded-bb-xl border border-bb-warning-border bg-bb-warning-surface p-3 text-bb-warning">
          <strong>Check the values</strong>
          <span>One value may need attention.</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="size-6 animate-spin rounded-full border-[3px] border-bb-border-strong border-r-bb-navy motion-reduce:animate-none"
            aria-hidden="true"
          ></span>
          <span>Loading comparison</span>
        </div>
      </div>
    </CatalogFrame>
  ),
};

function Overlays() {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <CatalogFrame title="Overlays">
      <div className="flex flex-wrap items-start gap-2">
        <span className="relative">
          <button
            className="min-h-12 rounded-bb-lg border border-bb-border-input bg-bb-surface px-4 py-2 font-bold"
            aria-describedby="catalog-tooltip"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
          >
            Why local?
          </button>
          <span
            className="absolute top-[calc(100%+0.5rem)] left-0 z-10 max-w-72 rounded-bb-sm bg-bb-navy p-2 text-sm text-white"
            id="catalog-tooltip"
            role="tooltip"
            hidden={!tooltipVisible}
          >
            Saved comparisons stay in this browser.
          </span>
        </span>
        <button
          className="min-h-12 rounded-bb-lg bg-bb-navy px-4 py-2 font-bold text-white"
          onClick={() => dialogRef.current?.showModal()}
        >
          Open dialog
        </button>
      </div>
      <dialog
        className="max-w-[min(24rem,calc(100vw-2rem))] rounded-bb-xl border border-bb-border-strong bg-bb-surface p-4 text-bb-navy shadow-bb-card backdrop:bg-bb-navy/40"
        ref={dialogRef}
        aria-labelledby="catalog-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          dialogRef.current?.close();
        }}
      >
        <div className="grid gap-3">
          <h2 id="catalog-dialog-title">Example dialog</h2>
          <p>
            Use a dialog only when the user must make a decision before
            returning to the page.
          </p>
          <button
            className="min-h-12 rounded-bb-lg border border-bb-border-input bg-bb-surface px-4 py-2 font-bold"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </button>
        </div>
      </dialog>
    </CatalogFrame>
  );
}

export const OverlaysInteraction: Story = {
  render: () => <Overlays />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Why local?" });
    await userEvent.tab();
    await expect(canvas.getByRole("tooltip")).toBeVisible();
    await userEvent.tab();
    await expect(canvas.queryByRole("tooltip")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    await expect(canvas.getByRole("dialog")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByRole("dialog")).toBeNull();
    trigger.blur();
  },
};
