import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import type { HistoryEntry } from "../history";
import { HistorySection } from "./history";
import { pinnedEntries, savedEntries } from "../stories/fixtures";

const meta = {
  title: "Betterbuy/History",
  component: HistorySection,
  tags: ["autodocs"],
  args: {
    history: [],
    expanded: false,
    onRestore: () => undefined,
    onPin: () => undefined,
    onUnpin: () => undefined,
    onDelete: () => undefined,
    onToggleExpanded: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-[38.75rem] p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HistorySection>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveHistory({
  initialHistory,
}: {
  initialHistory: HistoryEntry[];
}) {
  const [history, setHistory] = useState(initialHistory);
  const [expanded, setExpanded] = useState(false);
  const [restored, setRestored] = useState<string>();
  return (
    <>
      <HistorySection
        history={history}
        expanded={expanded}
        onRestore={(entry) => setRestored(entry.id)}
        onPin={(id) =>
          setHistory(
            history.map((entry) =>
              entry.id === id
                ? { ...entry, pinnedAt: "2026-08-17T00:00:00.000Z" }
                : entry,
            ),
          )
        }
        onUnpin={(id) =>
          setHistory(
            history.map((entry) => {
              if (entry.id !== id) return entry;
              const { pinnedAt: _pinnedAt, ...unpinned } = entry;
              return unpinned;
            }),
          )
        }
        onDelete={(id) =>
          setHistory(history.filter((entry) => entry.id !== id))
        }
        onToggleExpanded={() => setExpanded(!expanded)}
      />
      {restored && <p role="status">Restored {restored}</p>}
    </>
  );
}

export const Empty: Story = {
  render: () => <InteractiveHistory initialHistory={[]} />,
};
export const Saved: Story = {
  render: () => (
    <InteractiveHistory initialHistory={savedEntries.slice(0, 3)} />
  ),
};
export const PinLimitReached: Story = {
  render: () => <InteractiveHistory initialHistory={pinnedEntries} />,
};

export const ExpandPinRestoreAndDelete: Story = {
  render: () => <InteractiveHistory initialHistory={savedEntries} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show more" }));
    await expect(
      canvas.getByRole("button", { name: "Show less" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Pin saved comparison" })[0]!,
    );
    await expect(canvas.getByText("Pinned (1)")).toBeVisible();
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Restore saved comparison" })[0]!,
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Restored");
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Delete saved comparison" })[0]!,
    );
    await expect(canvas.getByText("4/50")).toBeVisible();
  },
};
