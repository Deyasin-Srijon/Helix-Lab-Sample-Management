/**
 * FILE: src/pages/AdminDashboardPage.jsx
 *
 * PURPOSE:
 * Central dashboard page for laboratory administrators. It displays summary metric cards,
 * status filter toggles, a paginated sample data table, and modal confirmation dialogs
 * for destructive actions.
 *
 * RESPONSIBILITIES:
 * - Initiates data loading on mount by invoking `refreshSamples()` from `SampleContext`.
 * - Displays 4 metric summary cards: Total Samples, Created, In Progress, and Completed.
 * - Manages filter state (`statusFilter`) and automatically resets pagination to page 1 upon filtering.
 * - Computes paginated data slices using `paginate()` from `utils/pagination.js`.
 * - Orchestrates editing by navigating to `/samples/:id/edit`.
 * - Orchestrates record deletion via a secure confirmation dialog (`ConfirmDialog`).
 * - Displays loading spinners, error retry alerts, empty states, and toast notifications.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Dashboard Controller Page.
 *
 * COMPLETE FEATURE FLOWS:
 * 1. Initial Dashboard Data Loading Flow:
 *    AdminDashboardPage mounts
 *      → useEffect triggers refreshSamples()
 *      → SampleContext sets loading = true
 *      → sampleService.getAllSamples()
 *      → reads from Spring Boot GET /api/samples
 *      → updates `samples` array in SampleContext
 *      → sets loading = false
 *      → useMemo recalculates `stats`, `filteredSamples`, and `pagination`
 *      → Dashboard renders metric cards and SampleTable.
 * 2. Status Filtering Flow:
 *    User clicks status filter pill (e.g. 'In Progress')
 *      → handleFilterChange('In Progress')
 *      → setStatusFilter('In Progress'), setPage(1)
 *      → filteredSamples recalculates (only samples with status === 'In Progress')
 *      → paginate recalculates with page 1
 *      → SampleTable updates with filtered records.
 * 3. Delete Sample Flow:
 *    User clicks "Delete" on a table row
 *      → SampleTable calls onDelete(sample)
 *      → AdminDashboardPage sets `sampleToDelete` to the sample object
 *      → ConfirmDialog opens with sample ID in prompt
 *      → User clicks "Confirm Delete"
 *      → handleConfirmDelete() runs
 *      → setDeleting(true)
 *      → calls deleteSample(sampleToDelete.id) [SampleContext -> sampleService -> Spring Boot API]
 *      → refreshSamples() reloads the master list
 *      → setSampleToDelete(null), setPage(1)
 *      → Success toast is displayed: 'Sample deleted successfully.'
 *
 * DEPENDENCIES / IMPORTS:
 * - `react`: `useEffect`, `useMemo`, `useState`.
 * - `react-router-dom`: `useNavigate` for programmatic routing.
 * - `lucide-react`: Dashboard metric card icons (`Beaker`, `CircleCheck`, `ClipboardList`, `Loader`).
 * - `../components/*`: Sub-components (`ConfirmDialog`, `LoadingSpinner`, `Navbar`, `Pagination`, `SampleTable`, `StatusFilter`, `Toast`).
 * - `../context/SampleContext.jsx`: Provides sample state and actions via `useSamples`.
 * - `../utils/pagination.js`: Provides array pagination helper.
 *
 * CONSUMED BY:
 * - `src/App.jsx` (mounted on the root `/` route within `<ProtectedRoute>`).
 *
 * EXPORTS:
 * - `default function AdminDashboardPage()`: The dashboard page component.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, CircleCheck, ClipboardList, Loader } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import SampleTable from '../components/SampleTable';
import StatusFilter from '../components/StatusFilter';
import Toast from '../components/Toast';
import { useSamples } from '../context/SampleContext';
import { paginate } from '../utils/pagination';

/**
 * Metric card definitions displaying aggregate statistics.
 * Maps stat keys to display titles, icons, and background badge styles.
 */
const STAT_CARDS = [
  { key: 'total', label: 'Total Samples', icon: ClipboardList, accent: 'text-slate-700 bg-slate-100' },
  { key: 'created', label: 'Created Samples', icon: Beaker, accent: 'text-blue-700 bg-blue-50' },
  { key: 'inProgress', label: 'In Progress Samples', icon: Loader, accent: 'text-orange-700 bg-orange-50' },
  { key: 'completed', label: 'Completed Samples', icon: CircleCheck, accent: 'text-green-700 bg-green-50' },
];

/**
 * AdminDashboardPage Component
 *
 * @returns {JSX.Element} The rendered dashboard interface.
 */
export default function AdminDashboardPage() {
  /** React Router hook for programmatic navigation */
  const navigate = useNavigate();

  /** Extract sample state, metric counters, and CRUD actions from SampleContext */
  const {
    samples,
    loading,
    error,
    toast,
    stats,
    refreshSamples,
    deleteSample,
    clearToast,
    showToast,
  } = useSamples();

  /** State: Selected status filter ('All', 'Created', 'In Progress', 'Completed') */
  const [statusFilter, setStatusFilter] = useState('All');

  /** State: Current active pagination page number */
  const [page, setPage] = useState(1);

  /** State: Sample object pending deletion in ConfirmDialog (or null when dialog is closed) */
  const [sampleToDelete, setSampleToDelete] = useState(null);

  /** State: Flag indicating whether an asynchronous delete request is in progress */
  const [deleting, setDeleting] = useState(false);

  /**
   * Effect: Load sample records on initial mount.
   *
   * WHY THIS EFFECT RUNS:
   * When the administrator enters the dashboard, we trigger `refreshSamples()`
   * to ensure the UI displays the latest data from the backend.
   */
  useEffect(() => {
    refreshSamples();
  }, [refreshSamples]);

  /**
   * Filter samples based on the selected status button.
   * Memoized to prevent recalculation unless `samples` or `statusFilter` changes.
   */
  const filteredSamples = useMemo(() => {
    if (statusFilter === 'All') {
      return samples;
    }
    return samples.filter((sample) => sample.status === statusFilter);
  }, [samples, statusFilter]);

  /**
   * Compute pagination slice and metadata from filtered samples.
   * Memoized so slicing only runs when `filteredSamples` or `page` changes.
   */
  const pagination = useMemo(
    () => paginate(filteredSamples, page),
    [filteredSamples, page]
  );

  /**
   * Updates active status filter and resets page view to 1.
   *
   * @param {string} nextFilter - Selected status filter ('All', 'Created', etc.).
   */
  const handleFilterChange = (nextFilter) => {
    setStatusFilter(nextFilter);
    setPage(1);
  };

  /**
   * Navigates to the Edit Sample screen for the given sample record.
   *
   * @param {Object} sample - The target sample record object.
   */
  const handleEdit = (sample) => {
    navigate(`/samples/${sample.id}/edit`);
  };

  /**
   * Executes deletion of the selected sample after confirmation in ConfirmDialog.
   */
  const handleConfirmDelete = async () => {
    if (!sampleToDelete) {
      return;
    }

    setDeleting(true);
    try {
      await deleteSample(sampleToDelete.id);
      setSampleToDelete(null);
      setPage(1);
    } catch (err) {
      showToast(err.message || 'Unable to delete sample.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Top navigation banner */}
      <Navbar />

      {/* Floating toast notification banner */}
      <Toast toast={toast} onClose={clearToast} />

      {/* Main dashboard content container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy">Sample Management</h1>
          <p className="mt-1 text-sm text-slate-500">Review, update, and remove laboratory sample records.</p>
        </div>

        {/* 1. Statistics Cards Section */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <span className={`rounded-lg p-2 ${card.accent}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">{stats[card.key]}</p>
              </div>
            );
          })}
        </section>

        {/* 2. Samples Table & Filter Section */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Table Header: Title and Status Filter Pills */}
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-800">Samples</h2>
            <StatusFilter value={statusFilter} onChange={handleFilterChange} />
          </div>

          {/* Loading state: Displayed while awaiting data fetch */}
          {loading && <LoadingSpinner />}

          {/* Error state: Displayed if data fetch encounters a network or server failure */}
          {!loading && error && (
            <div className="px-4 py-16 text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button
                type="button"
                onClick={refreshSamples}
                className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state: Displayed when no sample records exist or match the filter */}
          {!loading && !error && pagination.items.length === 0 && (
            <div className="px-4 py-16 text-center">
              <p className="text-sm font-medium text-slate-700">No samples found.</p>
              <p className="mt-1 text-sm text-slate-500">
                {samples.length === 0
                  ? 'Sample records will appear here once users submit them.'
                  : 'No samples match the selected status filter.'}
              </p>
            </div>
          )}

          {/* Data grid and pagination: Displayed when samples exist */}
          {!loading && !error && pagination.items.length > 0 && (
            <>
              <SampleTable
                samples={pagination.items}
                onEdit={handleEdit}
                onDelete={setSampleToDelete}
              />
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                hasPrevious={pagination.hasPrevious}
                hasNext={pagination.hasNext}
                onPrevious={() => setPage((current) => current - 1)}
                onNext={() => setPage((current) => current + 1)}
              />
            </>
          )}
        </section>
      </main>

      {/* 3. Modal Confirmation Dialog for sample deletion */}
      <ConfirmDialog
        open={Boolean(sampleToDelete)}
        title="Delete sample"
        message={
          sampleToDelete
            ? `Are you sure you want to delete sample ${sampleToDelete.id}? This action cannot be undone.`
            : ''
        }
        onCancel={() => setSampleToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
