/**
 * FILE: src/config/apiConfig.js
 *
 * PURPOSE:
 * Central configuration settings for backend API communication,
 * domain constants, and pagination limits.
 *
 * RESPONSIBILITIES:
 * - Configures the REST API base endpoint URL (`API_BASE_URL`), reading from Vite's
 *   `import.meta.env.VITE_API_BASE_URL` with a fallback to `http://localhost:8080/api`.
 * - Defines the canonical domain list of allowable laboratory sample statuses (`SAMPLE_STATUSES`).
 * - Defines the default page item size (`PAGE_SIZE`) for tabular pagination.
 *
 * ARCHITECTURAL LAYER:
 * Configuration Layer.
 *
 * DATA FLOW & INTEGRATION:
 * - `API_BASE_URL`: Read by `services/apiClient.js` to construct absolute network request URLs.
 * - `SAMPLE_STATUSES`: Consumed by `utils/validation.js` to validate input, by `components/StatusFilter.jsx`
 *   to generate filter buttons, and by `pages/EditSamplePage.jsx` for the status dropdown.
 * - `PAGE_SIZE`: Consumed by `utils/pagination.js` to partition arrays of sample records into pages.
 *
 * DEPENDENCIES / IMPORTS:
 * - None (reads Vite environment variables via `import.meta.env`).
 *
 * CONSUMED BY:
 * - `src/services/apiClient.js`
 * - `src/utils/validation.js`
 * - `src/utils/pagination.js`
 * - `src/components/StatusFilter.jsx`
 * - `src/pages/EditSamplePage.jsx`
 *
 * EXPORTS:
 * - `API_BASE_URL`: Base URL string for HTTP calls.
 * - `SAMPLE_STATUSES`: Array of valid status strings.
 * - `PAGE_SIZE`: Number of rows displayed per page.
 */

/**
 * The base URL for the Spring Boot backend REST API.
 * Reads environment variable `VITE_API_BASE_URL` if defined; otherwise defaults
 * to the local Spring Boot development server port (`http://localhost:8080/api`).
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Valid lifecycle states that a laboratory sample may hold.
 * These match both frontend validation and backend entity constraints:
 * - 'Created': Initial state when a sample request is registered.
 * - 'In Progress': Sample is currently undergoing laboratory processing/testing.
 * - 'Completed': Testing is finalized and results have been validated.
 */
export const SAMPLE_STATUSES = ['Created', 'In Progress', 'Completed'];

/**
 * Default number of sample records displayed per page on the dashboard table.
 */
export const PAGE_SIZE = 10;
