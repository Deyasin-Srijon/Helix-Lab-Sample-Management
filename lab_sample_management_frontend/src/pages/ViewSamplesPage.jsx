import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import SampleTable from '../components/SampleTable';
import StatusFilter from '../components/StatusFilter';
import { useSamples } from '../context/SampleContext';
import { useToast } from '../context/ToastContext';
import {
  ITEMS_PER_PAGE,
  STATUS_FILTER,
  TOAST_MESSAGES,
  TOAST_TYPES,
} from '../utils/constants';
import {
  clampPage,
  filterByStatus,
  getPageRange,
  getTotalPages,
  paginate,
} from '../utils/pagination';

export default function ViewSamplesPage() {
  const {
    samples,
    deleteSample,
    isReady,
  } = useSamples();

  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState(
    STATUS_FILTER.ALL
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filteredSamples = useMemo(
    () =>
      filterByStatus(
        samples,
        selectedStatus
      ),
    [samples, selectedStatus]
  );

  const totalPages = getTotalPages(
    filteredSamples.length,
    ITEMS_PER_PAGE
  );

  const safePage = clampPage(
    currentPage,
    totalPages
  );

  const pageItems = paginate(
    filteredSamples,
    safePage,
    ITEMS_PER_PAGE
  );

  const range = getPageRange(
    safePage,
    ITEMS_PER_PAGE,
    filteredSamples.length
  );

  const handleFilterChange = (nextStatus) => {
    setSelectedStatus(nextStatus);
    setCurrentPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    const sampleId = pendingDelete.id;

    try {
      const result = await deleteSample(sampleId);

      setPendingDelete(null);

      if (!result.success) {
        showToast(
          result.error || 'Unable to delete sample.',
          TOAST_TYPES.ERROR
        );
        return;
      }

      showToast(
        TOAST_MESSAGES.sampleDeleted,
        TOAST_TYPES.SUCCESS
      );
    } catch {
      setPendingDelete(null);

      showToast(
        'Unable to delete sample.',
        TOAST_TYPES.ERROR
      );
    }
  };

  const emptyTitle =
    samples.length === 0
      ? 'No samples yet'
      : 'No samples match this filter';

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">
            View Samples
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Filter by status, then page through results.
          </p>
        </div>

        <StatusFilter
          value={selectedStatus}
          onChange={handleFilterChange}
        />
      </div>

      {!isReady ? (
        <LoadingSpinner label="Loading samples" />
      ) : filteredSamples.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <>
          <SampleTable
            samples={pageItems}
            onEdit={(id) =>
              navigate(
                `/edit-sample/${encodeURIComponent(id)}`
              )
            }
            onDelete={setPendingDelete}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredSamples.length}
              start={range.start}
              end={range.end}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete sample"
        message={
          pendingDelete
            ? `Delete sample ${pendingDelete.id}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onCancel={() =>
          setPendingDelete(null)
        }
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}