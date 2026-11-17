/**
 * FILE: src/utils/formatDate.js
 *
 * PURPOSE:
 * Formats date timestamps or date strings into standardized, human-readable strings.
 * Provides defensive fallbacks for missing, null, or malformed date inputs.
 *
 * RESPONSIBILITIES:
 * - Converts raw ISO date strings (e.g. "2026-09-13") or timestamps into localized strings
 *   (e.g. "Sep 13, 2026").
 * - Returns an em dash character ('—') if the input is falsy or missing.
 * - Gracefully falls back to raw string conversion if the date value cannot be parsed by `Date`.
 *
 * ARCHITECTURAL LAYER:
 * Utilities Layer (Data Presentation / Formatting).
 *
 * DATA FLOW:
 * - SampleTable.jsx -> calls formatDate(sample.createdDate) for the table cell.
 * - EditSamplePage.jsx -> calls formatDate(original.createdDate) for the read-only audit panel.
 *
 * DEPENDENCIES / IMPORTS:
 * - None (uses native JavaScript `Intl` / `Date.prototype.toLocaleDateString`).
 *
 * CONSUMED BY:
 * - `src/components/SampleTable.jsx`
 * - `src/pages/EditSamplePage.jsx`
 *
 * EXPORTS:
 * - `formatDate(value)`
 */

/**
 * Formats a date value into 'MMM D, YYYY' format (e.g., 'Sep 13, 2026').
 *
 * @param {string|number|Date|null|undefined} value - Raw date input value.
 * @returns {string} Formatted localized date string or fallback em-dash.
 */
export function formatDate(value) {
  // Gracefully handle absent or empty values
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  // If the parsed date is invalid (NaN), return raw string instead of 'Invalid Date'
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  // Format to standard laboratory report date style (e.g., 'Oct 14, 2026')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
