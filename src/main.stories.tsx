import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { App } from "./main";
import { createBetterbuyStore } from "./store";
import { pinnedEntries, savedEntries, validValues } from "./stories/fixtures";

const meta = {
  title: "Betterbuy/App",
  component: App,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderApp =
  (overrides: Parameters<typeof createBetterbuyStore>[0] = {}) =>
  () => <App store={createBetterbuyStore(overrides)} />;

export const Pristine: Story = { render: renderApp() };
export const ComparisonReady: Story = {
  render: renderApp({ values: validValues }),
};
export const SavedHistory: Story = {
  render: renderApp({ history: savedEntries }),
};
export const PinLimitReached: Story = {
  render: renderApp({ history: pinnedEntries }),
};

export const SavePinRestoreAndDelete: Story = {
  render: renderApp({ values: validValues, history: savedEntries.slice(0, 1) }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Save into history" }),
    );
    await expect(canvas.getByText("2/50")).toBeVisible();
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Pin saved comparison" })[0]!,
    );
    await expect(canvas.getByText("Pinned (1)")).toBeVisible();
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Restore saved comparison" })[0]!,
    );
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Delete saved comparison" })[0]!,
    );
    await expect(canvas.getByText("1/50")).toBeVisible();
  },
};
