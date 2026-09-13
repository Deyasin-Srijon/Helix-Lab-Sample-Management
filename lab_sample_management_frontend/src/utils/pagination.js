import { ITEMS_PER_PAGE } from './constants';

export function filterByStatus(samples, selectedStatus) {
  if (!Array.isArray(samples)) return [];
  return selectedStatus === 'ALL'
    ? samples
    : samples.filter((s) => s.status === selectedStatus);
}

export function paginate(items, currentPage, itemsPerPage = ITEMS_PER_PAGE) {
  const page = Math.max(1, currentPage);
  const start = (page - 1) * itemsPerPage;
  return items.slice(start, start + itemsPerPage);
}

export function getTotalPages(itemCount, itemsPerPage = ITEMS_PER_PAGE) {
  if (itemCount <= 0) return 1;
  return Math.ceil(itemCount / itemsPerPage);
}

export function clampPage(currentPage, totalPages) {
  return Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
}

export function getPageRange(currentPage, itemsPerPage, total) {
  if (total === 0) {
    return { start: 0, end: 0, total };
  }
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, total);
  return { start, end, total };
}

export function getVisiblePages(currentPage, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const innerCount = maxVisible - 2;
  let start = Math.max(2, currentPage - Math.floor(innerCount / 2));
  let end = start + innerCount - 1;

  if (end > totalPages - 1) {
    end = totalPages - 1;
    start = Math.max(2, end - innerCount + 1);
  }

  pages.push(1);
  if (start > 2) pages.push('ellipsis-start');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis-end');
  pages.push(totalPages);

  return pages;
}
