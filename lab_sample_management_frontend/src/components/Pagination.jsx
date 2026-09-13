import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { getVisiblePages } from '../utils/pagination';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  start,
  end,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Sample pagination">
      <p className="text-sm text-slate-600">
        Showing {start}–{end} of {totalItems} results
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-white px-3 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
          Previous
        </button>
        {pages.map((page) => {
          if (typeof page !== 'number') {
            return (
              <span key={page} className="px-2 text-slate-400" aria-hidden="true">
                …
              </span>
            );
          }
          const active = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition duration-200 ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-border bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          );
        })}
        <button
          type="button"
          disabled={isLast}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-white px-3 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          Next
          <ChevronRightIcon />
        </button>
      </div>
    </nav>
  );
}
