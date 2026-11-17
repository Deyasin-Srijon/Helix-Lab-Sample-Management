/**
 * FILE: src/components/Toast.jsx
 *
 * PURPOSE:
 * Renders a transient floating alert notification in the top-right corner of the viewport.
 * Provides immediate visual feedback to the administrator following data operations
 * (e.g., successful update, successful deletion, or operation errors).
 *
 * RESPONSIBILITIES:
 * - Automatically schedules its own dismissal after 3.5 seconds (3500ms) using a timer.
 * - Cleans up active timers when the component re-renders or unmounts, preventing memory leaks.
 * - Allows immediate manual dismissal via an "X" close button.
 * - Displays success (green with CheckCircle2) or error (red with CircleAlert) visual styling.
 * - Ensures accessibility via `role="status"` and `aria-live="polite"`.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / User Feedback Component.
 *
 * DATA FLOW:
 * SampleContext.jsx
 *   → updateSample() or deleteSample() succeeds
 *   → calls showToast('Sample updated successfully.')
 *   → sets toast = { message, type, id: Date.now() }
 *   → AdminDashboardPage / EditSamplePage renders <Toast toast={toast} onClose={clearToast} />
 *   → useEffect registers 3500ms setTimeout
 *   → After 3.5s (or upon user clicking X), onClose() is called
 *   → clearToast() resets toast state to null
 *   → Toast unmounts.
 *
 * TOAST PAYLOAD SHAPE:
 * {
 *   id: number,              // Unique timestamp identifier
 *   message: string,         // User-facing text message
 *   type: 'success' | 'error'// Style variant
 * }
 *
 * DEPENDENCIES / IMPORTS:
 * - `react`: `useEffect` hook for timeout lifecycle management.
 * - `lucide-react`: `CheckCircle2` (success), `CircleAlert` (error), `X` (close icon).
 *
 * CONSUMED BY:
 * - `src/pages/AdminDashboardPage.jsx`
 * - `src/pages/EditSamplePage.jsx`
 *
 * EXPORTS:
 * - `default function Toast({ toast, onClose })`: The toast notification component.
 */

import { useEffect } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';

/**
 * Toast Component
 *
 * @param {Object} props
 * @param {Object|null} props.toast - Active toast object containing `{ message, type }`, or null.
 * @param {function(): void} props.onClose - Dismissal callback invoked on timeout or manual close.
 * @returns {JSX.Element | null} Floating alert banner, or null if no toast is active.
 */
export default function Toast({ toast, onClose }) {
  /**
   * Automatically dismisses the toast after 3500 milliseconds.
   *
   * WHY THE CLEANUP FUNCTION IS ESSENTIAL:
   * If a new toast is shown before the previous one times out, or if the user
   * navigates away, the returned `clearTimeout(timer)` function cancels the old timer.
   * This prevents stale callbacks from firing against unmounted or updated state.
   */
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  // If no toast is currently active in state, render nothing
  if (!toast) {
    return null;
  }

  const isError = toast.type === 'error';

  return (
    /* aria-live="polite" instructs assistive technologies to announce the message without interrupting */
    <div
      className="fixed right-4 top-4 z-50 w-[min(100%-2rem,24rem)]"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg ${
          isError ? 'border-red-200' : 'border-green-200'
        }`}
      >
        {/* Render icon corresponding to success or error state */}
        {isError ? (
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
        )}

        {/* Message body */}
        <p className="flex-1 text-sm font-medium text-slate-800">{toast.message}</p>

        {/* Manual dismissal close button */}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded p-1 text-slate-400 transition-colors duration-200 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
