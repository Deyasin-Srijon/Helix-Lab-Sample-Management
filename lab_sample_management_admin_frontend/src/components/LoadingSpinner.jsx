/**
 * FILE: src/components/LoadingSpinner.jsx
 *
 * PURPOSE:
 * A reusable loading indicator component displayed when the application is awaiting
 * asynchronous data operations (such as fetching samples from the backend).
 *
 * RESPONSIBILITIES:
 * - Renders a smoothly animated circular CSS spinner.
 * - Displays a customizable status label beneath the spinner.
 * - Adheres to web accessibility (a11y) standards by using `role="status"` to announce
 *   asynchronous loading to assistive technologies.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Reusable Feedback Component.
 *
 * DATA FLOW:
 * - AdminDashboardPage.jsx: Rendered conditionally while `loading === true` from `useSamples()`.
 * - EditSamplePage.jsx: Rendered conditionally while `loading === true` while fetching sample by ID.
 *
 * DEPENDENCIES / IMPORTS:
 * - None (pure React component with Tailwind CSS utility classes).
 *
 * CONSUMED BY:
 * - `src/pages/AdminDashboardPage.jsx`
 * - `src/pages/EditSamplePage.jsx`
 *
 * EXPORTS:
 * - `default function LoadingSpinner({ label })`: The loading spinner component.
 */

/**
 * LoadingSpinner Component
 *
 * @param {Object} props
 * @param {string} [props.label='Loading samples...'] - Accessible message text shown below the spinner.
 * @returns {JSX.Element} An accessible loading status indicator.
 */
export default function LoadingSpinner({ label = 'Loading samples...' }) {
  return (
    /* role="status" tells screen readers that this area provides real-time status updates */
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500" role="status">
      {/* Decorative spinning ring, hidden from screen readers via aria-hidden */}
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
        aria-hidden="true"
      />
      {/* Textual description of what is loading */}
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
