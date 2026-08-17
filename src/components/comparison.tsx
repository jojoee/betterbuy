import { compare, formatNumber, type ComparisonInput } from "../calculator";

const focus =
  "focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2";
const button =
  "inline-flex min-h-12 items-center justify-center rounded-bb-lg px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-45";

function displayValue(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

export function ComparisonResult({ values }: { values: ComparisonInput }) {
  const result = compare(values);
  if (!result)
    return (
      <p
        className="mt-4 grid min-h-17 gap-1 rounded-bb-xl bg-bb-info-surface p-3 text-bb-text-muted"
        aria-live="polite"
      >
        Enter positive Cost and Size values to compare.
      </p>
    );
  const headline = result.winner
    ? `${result.winner} is ${formatNumber(result.savingPercent, 1)}% cheaper`
    : "A and B cost the same per size";
  return (
    <div
      className={`mt-4 grid min-h-17 gap-1 rounded-bb-xl p-3 ${
        result.winner
          ? "bg-bb-success-surface text-bb-success"
          : "bg-bb-info-surface text-bb-text-muted"
      }`}
      aria-live="polite"
    >
      <strong className="text-lg">{headline}</strong>
      <span className="text-sm">
        A: {formatNumber(result.unitCostA)} per size · B:{" "}
        {formatNumber(result.unitCostB)} per size
      </span>
    </div>
  );
}

export interface ComparisonFormProps {
  values: ComparisonInput;
  onSetField: (field: keyof ComparisonInput, value: number) => void;
  onSave: () => void;
}

export function ComparisonForm({
  values,
  onSetField,
  onSave,
}: ComparisonFormProps) {
  const valid = Boolean(compare(values));
  const field = (option: "A" | "B", kind: "Cost" | "Size") => {
    const key = `${kind.toLowerCase()}${option}` as keyof ComparisonInput;
    return (
      <label className="mt-2 grid grid-cols-[3.375rem_1fr] items-center gap-2 text-bb-text-muted">
        <span>{kind}</span>
        <input
          className={`min-w-0 w-full rounded-bb-md border border-bb-border-input bg-bb-surface p-3 font-semibold text-bb-navy transition-[background-color,border-color,color,box-shadow] focus:border-bb-focus disabled:cursor-not-allowed disabled:bg-bb-info-surface disabled:text-bb-text-subtle motion-reduce:transition-none ${focus}`}
          aria-label={`${option} ${kind}`}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0"
          value={displayValue(values[key])}
          onChange={(event) =>
            onSetField(key, event.currentTarget.valueAsNumber)
          }
        />
      </label>
    );
  };
  return (
    <section
      className="rounded-bb-2xl border border-bb-border bg-bb-surface p-5 shadow-bb-card"
      aria-labelledby="compare-title"
    >
      <h2 id="compare-title" className="text-[1.05rem] font-bold">
        Compare by cost per size
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <fieldset className="m-0 rounded-bb-xl border border-bb-border-strong p-3 focus-within:border-bb-focus">
          <legend className="px-2 font-bold">Option A</legend>
          {field("A", "Cost")}
          {field("A", "Size")}
        </fieldset>
        <fieldset className="m-0 rounded-bb-xl border border-bb-border-strong p-3 focus-within:border-bb-focus">
          <legend className="px-2 font-bold">Option B</legend>
          {field("B", "Cost")}
          {field("B", "Size")}
        </fieldset>
      </div>
      <ComparisonResult values={values} />
      <button
        className={`${button} ${focus} mt-4 w-full bg-bb-navy text-white transition-colors hover:bg-bb-navy-hover motion-reduce:transition-none`}
        disabled={!valid}
        onClick={onSave}
      >
        Save into history
      </button>
    </section>
  );
}
