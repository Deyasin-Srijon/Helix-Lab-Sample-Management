/**
 * FILE: src/utils/pagination.js
 *
 * PURPOSE:
 * Provides client-side array pagination calculations and slice extraction.
 * Given an array of records and a requested page number, it computes total pages,
 * clamps the page within valid bounds, extracts the sub-array slice, and sets up
 * navigation flags for Previous / Next buttons.
 *
 * RESPONSIBILITIES:
 * - Computes total number of pages based on total records and page size.
 * - Enforces boundary safety (clamping `page` to at least 1 and at most `totalPages`).
 * - Computes zero-based start and end array indices.
 * - Slices the target item array to produce the current page's visible items.
 * - Returns directional navigation booleans (`hasPrevious`, `hasNext`).
 *
 * ARCHITECTURAL LAYER:
 * Utilities Layer (Data Partitioning).
 *
 * DATA FLOW:
 * AdminDashboardPage.jsx
 *   → filters samples by status ('All', 'Created', etc.)
 *   → calls paginate(filteredSamples, page)
 *   → receives pagination object
 *   → passes pagination.items to <SampleTable />
 *   → passes page, totalPages, totalItems, hasPrevious, hasNext to <Pagination />.
 *
 * PAGINATION RESULT OBJECT SHAPE:
 * {
 *   page: number,         // Clamped current active page number (1-based)
 *   pageSize: number,     // Number of items per page
 *   totalItems: number,   // Total count of items in the filtered list
 *   totalPages: number,   // Total pages available (minimum 1)
 *   items: Array<any>,    // Sub-array slice for the current page
 *   hasPrevious: boolean, // Whether a previous page exists (page > 1)
 *   hasNext: boolean      // Whether a subsequent page exists (page < totalPages)
 * }
 *
 * DEPENDENCIES / IMPORTS:
 * - `../config/apiConfig.js`: Imports default `PAGE_SIZE` (10).
 *
 * CONSUMED BY:
 * - `src/pages/AdminDashboardPage.jsx`
 *
 * EXPORTS:
 * - `paginate(items, currentPage, pageSize)`
 */

import { PAGE_SIZE } from '../config/apiConfig';

/**
 * Partitions an array of items into a paginated subset with metadata.
 *
 * @param {Array<any>} items - The full list of items to paginate.
 * @param {number} currentPage - The requested page number (1-based index).
 * @param {number} [pageSize=PAGE_SIZE] - Number of items displayed per page.
 * @returns {Object} Pagination metadata and the current page's item slice.
 */
export function paginate(items, currentPage, pageSize = PAGE_SIZE) {
  const totalItems = items.length;
  // Ensure at least 1 page is reported even if items array is empty
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // Clamp page between 1 and totalPages to avoid empty slices or negative offsets
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    items: items.slice(startIndex, endIndex),
    hasPrevious: page > 1,
    hasNext: page < totalPages && totalItems > 0,
  };
}
