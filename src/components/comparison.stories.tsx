import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import type { ComparisonInput } from "../calculator";
import { ComparisonForm, ComparisonResult } from "./comparison";
import { validValues } from "../stories/fixtures";

const meta = {
  title: "Betterbuy/Comparison form",
  component: ComparisonForm,
  tags: ["autodocs"],
  args: {
    values: validValues,
    onSetField: () => undefined,
    onSave: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-[38.75rem] p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ComparisonForm>;

export default meta;
type Story = StoryObj<typeof meta>;

function EditableComparison({
  initialValues,
}: {
  initialValues: ComparisonInput;
}) {
  const [values, setValues] = useState(initialValues);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <ComparisonForm
        values={values}
        onSetField={(field, value) => setValues({ ...values, [field]: value })}
        onSave={() => setSaved(true)}
      />
      {saved && <p role="status">Saved comparison</p>}
    </>
  );
}

export const Invalid: Story = {
  render: () => (
    <EditableComparison
      initialValues={{ costA: NaN, sizeA: NaN, costB: NaN, sizeB: NaN }}
    />
  ),
};

export const OptionAWins: Story = {
  render: () => (
    <EditableComparison
      initialValues={{ costA: 30, sizeA: 500, costB: 80, sizeB: 1000 }}
    />
  ),
};

export const OptionBWins: Story = {
  render: () => <EditableComparison initialValues={validValues} />,
};

export const SameCost: Story = {
  render: () => (
    <ComparisonResult
      values={{ costA: 10, sizeA: 100, costB: 20, sizeB: 200 }}
    />
  ),
};

export const CompleteAndSave: Story = {
  render: () => (
    <EditableComparison
      initialValues={{ costA: NaN, sizeA: NaN, costB: NaN, sizeB: NaN }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("A Cost"), "40");
    await userEvent.type(canvas.getByLabelText("A Size"), "500");
    await userEvent.type(canvas.getByLabelText("B Cost"), "70");
    await userEvent.type(canvas.getByLabelText("B Size"), "1000");
    await expect(canvas.getByText("B is 12.5% cheaper")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Save into history" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Saved comparison",
    );
  },
};
