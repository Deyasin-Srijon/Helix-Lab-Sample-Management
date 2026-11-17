/**
 * FILE: src/components/StatusBadge.jsx
 *
 * PURPOSE:
 * Renders a color-coded pill badge representing the current lifecycle status of a sample.
 * Uses distinct, high-contrast color tokens to allow laboratory staff to quickly scan
 * and differentiate sample states in tables and lists.
 *
 * RESPONSIBILITIES:
 * - Maps domain status values ('Created', 'In Progress', 'Completed') to Tailwind color classes.
 * - Provides a safe neutral fallback style for unrecognized or missing status strings.
 * - Displays the status text (or 'Unknown' if falsy).
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Reusable Presentation Badge.
 *
 * STATUS COLOR MAPPINGS:
 * - 'Created'     -> Light Blue pill (initial submission).
 * - 'In Progress' -> Light Orange pill (actively undergoing processing).
 * - 'Completed'   -> Light Green pill (test complete, validated).
 * - Default       -> Light Slate pill (unknown or unexpected status).
 *
 * DATA FLOW:
 * SampleTable.jsx (inside each row)
 *   → renders <StatusBadge status={sample.status} />
 *   → StatusBadge looks up style in STATUS_STYLES
 *   → returns styled <span> badge element.
 *
 * DEPENDENCIES / IMPORTS:
 * - None (pure functional presentation component).
 *
 * CONSUMED BY:
 * - `src/components/SampleTable.jsx`
 *
 * EXPORTS:
 * - `default function StatusBadge({ status })`: The status pill component.
 */

/**
 * Lookup dictionary mapping sample lifecycle states to Tailwind CSS styling classes.
 */
const STATUS_STYLES = {
  Created: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  Completed: 'bg-green-100 text-green-800',
};

/**
 * StatusBadge Component
 *
 * @param {Object} props
 * @param {string} props.status - The current sample status string ('Created' | 'In Progress' | 'Completed').
 * @returns {JSX.Element} A stylized inline rounded pill span.
 */
export default function StatusBadge({ status }) {
  // Look up matching Tailwind CSS class string, or fall back to neutral gray
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {status || 'Unknown'}
    </span>
  );
}
