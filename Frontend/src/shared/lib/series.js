/**
 * Categorical series assignment for charts.
 *
 * Lives outside the chart component so that file only exports a component
 * (anything else there breaks React Fast Refresh).
 *
 * The ramp is assigned in fixed order and NEVER cycled — reusing a hue would
 * make two different categories look like the same one. Past the last slot,
 * the tail folds into a single grey "Other" bucket instead.
 */

const SERIES = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const OTHER = "var(--color-chart-other)";

export const MAX_SLICES = SERIES.length;

/**
 * @param {{label: string, value: number}[]} entries
 * @returns entries sorted by value, colour-assigned, tail folded into "Other"
 */
export const foldSeries = (entries, max = MAX_SLICES) => {
  const sorted = [...entries].sort((a, b) => b.value - a.value);

  if (sorted.length <= max) {
    return sorted.map((entry, i) => ({ ...entry, color: SERIES[i] }));
  }

  const head = sorted.slice(0, max - 1).map((entry, i) => ({
    ...entry,
    color: SERIES[i],
  }));

  const tail = sorted.slice(max - 1);

  return [
    ...head,
    {
      label: "Other",
      value: tail.reduce((sum, entry) => sum + entry.value, 0),
      color: OTHER,
      isOther: true,
      count: tail.length,
    },
  ];
};
