/**
 * FILE: src/pages/EditSamplePage.jsx
 *
 * PURPOSE:
 * Provides the administrator interface for viewing and editing an existing laboratory
 * sample. It reads the sample identifier from the URL route parameters, loads the record,
 * populates a controlled form, validates modifications, dispatches the update, and returns
 * the administrator to the dashboard.
 *
 * RESPONSIBILITIES:
 * - Extracts the dynamic `:id` parameter from the current route using React Router's `useParams()`.
 * - Fetches sample details via `getSampleById(id)` while concurrently refreshing the sample catalog.
 * - Prevents state-update memory leaks on unmounted components using a cancellation token flag (`cancelled`).
 * - Manages controlled form state (`form`) for mutable attributes (`id`, `description`, `status`).
 * - Displays immutable audit metadata (`createdBy`, `createdDate`) in a read-only audit block.
 * - Executes client-side validation (`validateSample`) before allowing form submission.
 * - Dispatches updates through `updateSample()` from `SampleContext`.
 * - Redirects back to the dashboard upon successful update or when clicking "Back to samples".
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Form Controller Page.
 *
 * COMPLETE EDIT SAMPLE FLOW:
 * SampleTable.jsx (click "Edit")
 *   → React Router navigates to /samples/:id/edit
 *   → EditSamplePage mounts
 *   → useParams() extracts `id`
 *   → useEffect triggers loadSample()
 *       → Promise.all([getSampleById(id), refreshSamples()])
 *       → Populates form state: { id, description, status }
 *       → Saves `original` sample snapshot for audit fields and change tracking
 *   → User modifies inputs (e.g. changes status to 'In Progress')
 *   → handleChange() updates `form` state in real-time
 *   → User submits form -> handleSubmit(event)
 *   → event.preventDefault() stops browser form submission
 *   → validateSample(form, samples, original.id)
 *       ├─ If errors found -> setFieldErrors(errors), halts submission
 *       └─ If valid:
 *            → setSaving(true)
 *            → updateSample(original.id, payload)
 *            → sampleService.updateSample() -> PUT /api/samples/:id
 *            → refreshSamples() synchronizes in-memory catalog
 *            → showToast('Sample updated successfully.')
 *            → navigate('/') redirects back to dashboard.
 *
 * DEPENDENCIES / IMPORTS:
 * - `react`: `useEffect`, `useState`.
 * - `react-router-dom`: `useNavigate`, `useParams`.
 * - `lucide-react`: `ArrowLeft` navigation icon.
 * - `../components/*`: Sub-components (`LoadingSpinner`, `Navbar`, `Toast`).
 * - `../config/apiConfig.js`: Imports `SAMPLE_STATUSES`.
 * - `../context/SampleContext.jsx`: Provides `useSamples` hook.
 * - `../utils/formatDate.js`: Formats sample creation date.
 * - `../utils/validation.js`: Provides `validateSample` and `hasErrors`.
 *
 * CONSUMED BY:
 * - `src/App.jsx` (mounted on `/samples/:id/edit` inside `<ProtectedRoute>`).
 *
 * EXPORTS:
 * - `default function EditSamplePage()`: The sample editing page component.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { SAMPLE_STATUSES } from '../config/apiConfig';
import { useSamples } from '../context/SampleContext';
import { formatDate } from '../utils/formatDate';
import { hasErrors, validateSample } from '../utils/validation';

/** Initial blank form template */
const EMPTY_FORM = {
  id: '',
  description: '',
  status: 'Created',
};

/**
 * EditSamplePage Component
 *
 * @returns {JSX.Element} The sample editing form interface.
 */
export default function EditSamplePage() {
  /** Dynamic route parameter from URL path `/samples/:id/edit` */
  const { id } = useParams();

  /** React Router navigation controller */
  const navigate = useNavigate();

  /** Context operations and global state */
  const { samples, getSampleById, updateSample, refreshSamples, toast, clearToast, showToast } = useSamples();

  /** Controlled form state for mutable fields */
  const [form, setForm] = useState(EMPTY_FORM);

  /** Snapshot of the sample record as originally loaded from the backend */
  const [original, setOriginal] = useState(null);

  /** Validation error map: `{ id?: string, description?: string, status?: string }` */
  const [fieldErrors, setFieldErrors] = useState({});

  /** Loading indicator during initial sample data retrieval */
  const [loading, setLoading] = useState(true);

  /** In-flight indicator during sample update submission */
  const [saving, setSaving] = useState(false);

  /** Error message string if loading the sample fails */
  const [loadError, setLoadError] = useState('');

  /**
   * Effect: Asynchronously load the sample record and refresh catalog on mount.
   *
   * WHY THE CANCELLED FLAG IS USED (RACE CONDITION PROTECTION):
   * If the administrator navigates away before the network request resolves,
   * setting state on an unmounted component would cause React warnings and potential
   * memory leaks. Setting `cancelled = true` in the cleanup function guarantees
   * that state setters are skipped if the component has unmounted.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadSample() {
      setLoading(true);
      setLoadError('');
      try {
        // Fetch specific sample and refresh full samples list concurrently
        const [sample] = await Promise.all([getSampleById(id), refreshSamples()]);
        if (cancelled) {
          return;
        }
        setOriginal(sample);
        setForm({
          id: sample.id,
          description: sample.description || '',
          status: sample.status,
        });
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || 'Unable to load sample.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSample();

    return () => {
      cancelled = true;
    };
  }, [getSampleById, id, refreshSamples]);

  /**
   * Universal change handler for controlled form inputs.
   * Updates state dynamically by extracting the input's `name` and `value`.
   *
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} event
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  /**
   * Handles form submission:
   * 1. Validates fields against domain rules and ensures ID uniqueness.
   * 2. Submits payload to updateSample() via SampleContext.
   * 3. Redirects to the dashboard on success.
   *
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form inputs (passing existing samples array and original ID for duplicate check)
    const errors = validateSample(form, samples, original?.id);
    setFieldErrors(errors);

    // Halt submission if validation errors exist or original record is missing
    if (hasErrors(errors) || !original) {
      return;
    }

    setSaving(true);
    try {
      // Dispatch update with sanitized fields and preserved audit metadata
      await updateSample(original.id, {
        id: Number(form.id),
        description: form.description.trim(),
        status: form.status,
        createdBy: original.createdBy,
        createdDate: original.createdDate,
      });

      // Navigate back to the home dashboard
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Unable to update sample.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Top navigation banner */}
      <Navbar />

      {/* Floating toast notification banner */}
      <Toast toast={toast} onClose={clearToast} />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Navigation back button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to samples
        </button>

        {/* Edit form card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-navy">Edit Sample</h1>
          <p className="mt-1 text-sm text-slate-500">Update sample ID, description, and status.</p>

          {/* Loading spinner while fetching sample details */}
          {loading && <LoadingSpinner label="Loading sample..." />}

          {/* Error display if sample could not be found or loaded */}
          {!loading && loadError && (
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-red-600">{loadError}</p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
              >
                Return to dashboard
              </button>
            </div>
          )}

          {/* Form rendered once record is loaded successfully */}
          {!loading && !loadError && original && (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              {/* Sample ID input */}
              <div>
                <label htmlFor="id" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Sample ID
                </label>
                <input
                  id="id"
                  name="id"
                  type="number"
                  min="1"
                  step="1"
                  value={form.id}
                  readOnly
                  aria-describedby="sample-id-help"
                  className="h-11 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none"
                />
                {fieldErrors.id && <p className="mt-1 text-sm text-red-600">{fieldErrors.id}</p>}
                <p id="sample-id-help" className="mt-1 text-xs text-slate-500">
                  Sample ID cannot be changed.
                </p>
              </div>

              {/* Sample Description textarea */}
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  maxLength={500}
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-1 flex items-center justify-between">
                  {fieldErrors.description ? (
                    <p className="text-sm text-red-600">{fieldErrors.description}</p>
                  ) : (
                    <span />
                  )}
                  {/* Real-time character counter */}
                  <p className="text-xs text-slate-400">{form.description.length}/500</p>
                </div>
              </div>

              {/* Sample Status dropdown selector */}
              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {SAMPLE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {fieldErrors.status && <p className="mt-1 text-sm text-red-600">{fieldErrors.status}</p>}
              </div>

              {/* Read-only audit information box */}
              <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Requested By</p>
                  <p className="mt-1 text-sm text-slate-800">{original.createdBy || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Created Date</p>
                  <p className="mt-1 text-sm text-slate-800">{formatDate(original.createdDate)}</p>
                </div>
              </div>

              {/* Form action buttons */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  disabled={saving}
                  className="min-h-11 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-11 cursor-pointer rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
