/**
 * FILE: src/components/ConfirmDialog.jsx
 *
 * PURPOSE:
 * A modal confirmation dialog designed to safeguard against accidental destructive actions
 * (specifically deleting laboratory sample records). Forces explicit user confirmation before proceeding.
 *
 * RESPONSIBILITIES:
 * - Mounts a semi-transparent dark backdrop overlay over the entire application viewport.
 * - Displays a modal card with a title, descriptive confirmation message, and action buttons.
 * - Adheres to accessibility standards using `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
 * - Disables user interaction and shows a "Deleting..." label when `loading` is true to prevent double-clicks.
 * - Dismisses on backdrop click (unless an asynchronous deletion is actively in progress).
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Reusable Modal Component.
 *
 * DATA FLOW:
 * AdminDashboardPage.jsx
 *   → User clicks "Delete" on a row in SampleTable
 *   → sets `sampleToDelete` to target sample object
 *   → ConfirmDialog receives `open={Boolean(sampleToDelete)}`
 *   → User clicks "Confirm Delete" button
 *   → triggers `onConfirm` callback (`handleConfirmDelete` in AdminDashboardPage)
 *   → sets `loading = true`
 *   → awaits `deleteSample(id)`
 *   → clears `sampleToDelete` to null (dialog unmounts).
 *
 * DEPENDENCIES / IMPORTS:
 * - None (pure React component with Tailwind CSS).
 *
 * CONSUMED BY:
 * - `src/pages/AdminDashboardPage.jsx`
 *
 * EXPORTS:
 * - `default function ConfirmDialog(props)`: The modal confirmation dialog component.
 */

/**
 * ConfirmDialog Component
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is currently visible.
 * @param {string} props.title - Heading title for the dialog (e.g. 'Delete sample').
 * @param {string} props.message - Descriptive text explaining the consequences of the action.
 * @param {string} [props.confirmLabel='Confirm Delete'] - Label for the primary destructive button.
 * @param {string} [props.cancelLabel='Cancel'] - Label for the dismissal button.
 * @param {function(): void} props.onConfirm - Callback fired when user confirms the destructive action.
 * @param {function(): void} props.onCancel - Callback fired when user cancels or dismisses the dialog.
 * @param {boolean} [props.loading=false] - When true, disables buttons and shows in-progress state.
 * @returns {JSX.Element | null} Modal dialog overlay, or null if open is false.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  // If not open, render nothing to maintain minimal DOM footprint
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop overlay; clicking dismisses unless a delete request is in-flight */}
      <div className="absolute inset-0 bg-slate-900/50" onClick={loading ? undefined : onCancel} />

      {/* Accessible modal dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>

        {/* Action buttons: Cancel (neutral) and Confirm (destructive red) */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-11 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="min-h-11 cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
