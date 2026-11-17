/**
 * FILE: src/components/SampleTable.jsx
 *
 * PURPOSE:
 * Renders the data grid of laboratory samples on the administrator dashboard.
 * Presents key sample attributes (ID, description, creator, status, date) and
 * provides row-level actions for editing and deleting records.
 *
 * RESPONSIBILITIES:
 * - Formats sample attributes into structured, accessible table columns.
 * - Embeds `<StatusBadge />` for visual lifecycle indicators.
 * - Formats dates using `formatDate()` utility.
 * - Wraps table in an `overflow-x-auto` container to guarantee horizontal responsiveness on mobile.
 * - Delegates row interactions to parent callbacks (`onEdit` and `onDelete`).
 * - Ensures accessibility with semantic `scope="col"` headers and descriptive `aria-label` tags.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Presentation Data Grid Component.
 *
 * DATA FLOW:
 * AdminDashboardPage.jsx
 *   → receives samples from SampleContext
 *   → filters and slices into current page items via paginate()
 *   → passes items as `samples` prop to <SampleTable />
 *   → Row Action: Click "Edit"
 *       → invokes onEdit(sample)
 *       → AdminDashboardPage calls navigate(`/samples/${sample.id}/edit`)
 *   → Row Action: Click "Delete"
 *       → invokes onDelete(sample)
 *       → AdminDashboardPage sets `sampleToDelete` state, opening ConfirmDialog.
 *
 * SAMPLE RECORD DATA SHAPE:
 * Each item in `samples` contains:
 * - `id`: Numeric unique identifier.
 * - `description`: Sample test description string.
 * - `createdBy`: Username of requester / creator.
 * - `status`: 'Created' | 'In Progress' | 'Completed'.
 * - `createdDate`: Creation timestamp or date string.
 *
 * DEPENDENCIES / IMPORTS:
 * - `lucide-react`: `Pencil` (edit action) and `Trash2` (delete action) icons.
 * - `./StatusBadge.jsx`: Color-coded pill component.
 * - `../utils/formatDate.js`: Date localization formatter.
 *
 * CONSUMED BY:
 * - `src/pages/AdminDashboardPage.jsx`
 *
 * EXPORTS:
 * - `default function SampleTable({ samples, onEdit, onDelete })`: The data table component.
 */

import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatDate';

/**
 * SampleTable Component
 *
 * @param {Object} props
 * @param {Array<Object>} props.samples - Paginated array of sample records to display.
 * @param {function(Object): void} props.onEdit - Callback invoked when the Edit button is clicked on a row.
 * @param {function(Object): void} props.onDelete - Callback invoked when the Delete button is clicked on a row.
 * @returns {JSX.Element} The rendered HTML table structure.
 */
export default function SampleTable({ samples, onEdit, onDelete }) {
  return (
    /* Enables smooth horizontal scrolling on mobile viewports */
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        {/* Table header with semantic scope="col" for screen readers */}
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              ID
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Requested By
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Created Date
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table body mapping each sample record to a row */}
        <tbody className="divide-y divide-slate-100 bg-white">
          {samples.map((sample) => (
            <tr key={sample.id} className="hover:bg-slate-50">
              {/* Sample ID: Monospaced for tabular readability */}
              <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-medium text-slate-900">
                {sample.id}
              </td>

              {/* Description: Clamped to 2 lines to preserve uniform row height */}
              <td className="max-w-xs px-4 py-3 text-sm text-slate-700">
                <span className="line-clamp-2">{sample.description}</span>
              </td>

              {/* Creator / Requester username */}
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {sample.createdBy || '—'}
              </td>

              {/* Lifecycle Status Pill Badge */}
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={sample.status} />
              </td>

              {/* Formatted Creation Date */}
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {formatDate(sample.createdDate)}
              </td>

              {/* Action buttons (Edit & Delete) */}
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => onEdit(sample)}
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    aria-label={`Edit sample ${sample.id}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onDelete(sample)}
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    aria-label={`Delete sample ${sample.id}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
