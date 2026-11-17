/**
 * FILE: src/components/StatusFilter.jsx
 *
 * PURPOSE:
 * Provides an interactive row of filter pills that allows the administrator to filter
 * the sample list on the dashboard by its lifecycle state ('All', 'Created', 'In Progress', 'Completed').
 *
 * RESPONSIBILITIES:
 * - Dynamically constructs the available filter choices by prepending 'All' to `SAMPLE_STATUSES`.
 * - Highlights the currently active filter button with high-contrast styling.
 * - Dispatches selection changes to the parent component via the `onChange` callback.
 * - Follows WAI-ARIA standards for button groups (`role="group"` and `aria-pressed`).
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Controlled UI Control.
 *
 * CONTROLLED COMPONENT PATTERN:
 * This component does NOT manage its own state internally. Instead, it follows React's
 * controlled component pattern:
 * - Receives current active filter string via the `value` prop.
 * - Informs parent when the user selects a different filter via the `onChange` prop.
 *
 * DATA FLOW:
 * AdminDashboardPage.jsx
 *   → manages `const [statusFilter, setStatusFilter] = useState('All')`
 *   → passes `value={statusFilter}` and `onChange={handleFilterChange}` to <StatusFilter />
 *   → User clicks e.g. "Completed"
 *   → StatusFilter invokes `onChange('Completed')`
 *   → AdminDashboardPage updates `statusFilter` to 'Completed' and resets `page` to 1
 *   → `filteredSamples` recomputes via `useMemo` and the dashboard re-renders.
 *
 * DEPENDENCIES / IMPORTS:
 * - `../config/apiConfig.js`: Imports `SAMPLE_STATUSES` domain list.
 *
 * CONSUMED BY:
 * - `src/pages/AdminDashboardPage.jsx`
 *
 * EXPORTS:
 * - `default function StatusFilter({ value, onChange })`: The status filter button group.
 */

import { SAMPLE_STATUSES } from '../config/apiConfig';

/**
 * Filter list composed of 'All' followed by every registered sample status.
 * Evaluates to: ['All', 'Created', 'In Progress', 'Completed']
 */
const FILTERS = ['All', ...SAMPLE_STATUSES];

/**
 * StatusFilter Component
 *
 * @param {Object} props
 * @param {string} props.value - Currently selected filter string ('All' | 'Created' | 'In Progress' | 'Completed').
 * @param {function(string): void} props.onChange - Callback fired when a filter button is clicked.
 * @returns {JSX.Element} Group of accessible filter buttons.
 */
export default function StatusFilter({ value, onChange }) {
  return (
    /* role="group" informs screen readers that these buttons belong to a coordinated filter control */
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter samples by status">
      {FILTERS.map((filter) => {
        const isActive = value === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={`cursor-pointer rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
            /* aria-pressed communicates toggle/active state to screen readers */
            aria-pressed={isActive}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
