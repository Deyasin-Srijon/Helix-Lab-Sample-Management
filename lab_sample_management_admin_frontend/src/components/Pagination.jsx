/**
 * FILE: src/components/Pagination.jsx
 *
 * PURPOSE:
 * Renders the pagination footer bar displayed at the bottom of data tables.
 * Shows the current page index, total page count, and total record count, along with
 * accessible "Previous" and "Next" action buttons.
 *
 * RESPONSIBILITIES:
 * - Hides itself completely if the item count is zero (`totalItems === 0`).
 * - Displays page summary: "Page X of Y (Z records)".
 * - Disables navigation buttons when at boundary limits (`hasPrevious` or `hasNext` is false).
 * - Fires `onPrevious` and `onNext` callback events to notify parent page controller.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Controlled UI Component.
 *
 * DATA FLOW:
 * AdminDashboardPage.jsx
 *   → calls paginate(filteredSamples, page) from utils/pagination.js
 *   → receives pagination metadata
 *   → renders <Pagination
 *       page={pagination.page}
 *       totalPages={pagination.totalPages}
 *       totalItems={pagination.totalItems}
 *       hasPrevious={pagination.hasPrevious}
 *       hasNext={pagination.hasNext}
 *       onPrevious={() => setPage(curr => curr - 1)}
 *       onNext={() => setPage(curr => curr + 1)}
 *     />
 *   → Clicking "Next" updates page state in AdminDashboardPage
 *   → Re-slices samples for next page.
 *
 * DEPENDENCIES / IMPORTS:
 * - `lucide-react`: `ChevronLeft` and `ChevronRight` directional icons.
 *
 * CONSUMED BY:
 * - `src/pages/AdminDashboardPage.jsx`
 *
 * EXPORTS:
 * - `default function Pagination(props)`: The pagination navigation component.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component
 *
 * @param {Object} props
 * @param {number} props.page - Current active page number (1-based).
 * @param {number} props.totalPages - Total calculated pages.
 * @param {number} props.totalItems - Total items matching current filter criteria.
 * @param {boolean} props.hasPrevious - True if a previous page can be navigated to.
 * @param {boolean} props.hasNext - True if a subsequent page exists.
 * @param {function(): void} props.onPrevious - Callback to decrement page.
 * @param {function(): void} props.onNext - Callback to increment page.
 * @returns {JSX.Element | null} Pagination navigation element, or null if totalItems is 0.
 */
export default function Pagination({ page, totalPages, totalItems, hasPrevious, hasNext, onPrevious, onNext }) {
  // If there are no records, do not render an empty pagination bar
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      {/* Information text: shows current page and total records count */}
      <p className="text-sm text-slate-500">
        Page {page} of {totalPages}
        <span className="ml-2 text-slate-400">({totalItems} records)</span>
      </p>

      {/* Button navigation group */}
      <div className="flex items-center gap-2">
        {/* Previous page button: disabled when on page 1 */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>

        {/* Next page button: disabled when on final page */}
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
