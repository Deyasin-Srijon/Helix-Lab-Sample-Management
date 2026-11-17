/**
 * FILE: src/services/apiClient.js
 *
 * PURPOSE:
 * Provides a standardized HTTP client wrapper around the browser's native `fetch` API.
 * It manages base URL prefixing, default headers, session cookie handling, response parsing,
 * and unified error extraction for communication with the Spring Boot backend.
 *
 * RESPONSIBILITIES:
 * - Appends relative API paths to the configured `API_BASE_URL`.
 * - Injects standard request headers (`Content-Type: application/json`).
 * - Configures `credentials: 'include'` to ensure browser session cookies (e.g. `JSESSIONID`)
 *   are transmitted during cross-origin CORS requests to Spring Boot.
 * - Inspects HTTP responses, automatically parses JSON or text bodies, and handles `204 No Content`.
 * - Normalizes HTTP errors by attaching the status code and parsed error body to thrown Error instances.
 * - Handles connection/network errors gracefully with clear user-friendly messages.
 * - Exposes convenience methods for standard HTTP operations: `get`, `post`, `put`, and `delete`.
 *
 * ARCHITECTURAL LAYER:
 * Data Access / Infrastructure Layer (Network / HTTP Client).
 *
 * DATA FLOW:
 * sampleService.js / authService.js
 *   → apiClient.get('/samples') / post('/users/login', data) / put('/samples/:id', data) / delete('/samples/:id')
 *   → apiRequest(path, options)
 *   → fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ... })
 *   → parseResponse(response)
 *     ├─ If response.ok (200-299) -> returns parsed JSON data or text to caller.
 *     └─ If !response.ok (400, 401, 404, 500) -> throws Error with status & message.
 *
 * DEPENDENCIES / IMPORTS:
 * - `../config/apiConfig.js`: Imports `API_BASE_URL`.
 *
 * CONSUMED BY:
 * - `src/services/sampleService.js` (executes sample CRUD API calls).
 * - `src/services/authService.js` (executes authentication API calls).
 *
 * EXPORTS:
 * - `apiRequest(path, options)`: Low-level async request executor.
 * - `apiClient`: Object with `.get()`, `.post()`, `.put()`, and `.delete()` helper methods.
 */

import { API_BASE_URL } from '../config/apiConfig';

/**
 * Extracts a user-readable error message from the parsed response body.
 * Handles Spring Boot's GlobalExceptionHandler response formats:
 * - `{ message: '...' }`
 * - `{ error: '...' }`
 * - Validation maps: `{ email: 'Please enter a valid email', password: '...' }`
 * - Plain text error strings
 *
 * @param {any} body - Parsed response payload.
 * @param {Response} response - Raw fetch response object.
 * @returns {string} Human-readable error message.
 */
function extractErrorMessage(body, response) {
  if (body) {
    if (typeof body === 'string' && body.trim()) {
      return body.trim();
    }
    if (typeof body === 'object') {
      if (body.message && typeof body.message === 'string') {
        return body.message;
      }
      if (body.error && typeof body.error === 'string') {
        return body.error;
      }
      // For MethodArgumentNotValidException field error maps: { field: "message" }
      const values = Object.values(body).filter((val) => typeof val === 'string');
      if (values.length > 0) {
        return values[0];
      }
    }
  }

  if (response.status === 401) {
    return 'Authentication required. Please sign in.';
  }
  if (response.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (response.status === 404) {
    return 'The requested resource was not found.';
  }
  if (response.status >= 500) {
    return 'Server error occurred. Please try again later.';
  }

  return response.statusText || 'Request failed';
}

/**
 * Parses the HTTP response body and validates the HTTP status.
 *
 * WHY THIS IS NEEDED:
 * 1. The native `fetch` API does NOT reject promises on HTTP 4xx or 5xx responses;
 *    it only rejects on network failures. We must inspect `response.ok` manually.
 * 2. Backend responses may be JSON or plain text. Sniffing the `Content-Type`
 *    prevents JSON syntax errors when reading plain-text error messages.
 * 3. Spring Boot error payloads often include `{ message: '...', error: '...' }`.
 *    Extracting these properties provides meaningful error messages to users.
 *
 * @param {Response} response - The raw Fetch API Response object.
 * @returns {Promise<any>} The parsed JSON object or text string.
 * @throws {Error} Throws an Error with attached `.status` and `.body` if `!response.ok`.
 */
async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let body = null;
  try {
    body = isJson ? await response.json() : await response.text();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = extractErrorMessage(body, response);
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

/**
 * Executes an HTTP network request against the backend REST API.
 *
 * WHY credentials: 'include' IS CRITICAL:
 * The Spring Boot backend uses `HttpSession` to authenticate users. For the browser
 * to send and receive the `JSESSIONID` cookie across different ports (e.g. frontend
 * at port 5173 and backend at port 8080), requests MUST include `credentials: 'include'`
 * and the backend CorsConfig must allow credentials with matching origin.
 *
 * @param {string} path - Relative URL path starting with '/' (e.g. '/samples').
 * @param {RequestInit} [options={}] - Standard Fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} Parsed response data or null if status is 204 No Content.
 */
export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  let response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (networkError) {
    const error = new Error(
      'Unable to connect to the backend server. Please ensure the Spring Boot backend is running.'
    );
    error.status = 0;
    error.originalError = networkError;
    throw error;
  }

  // HTTP 204 indicates success with no response content to parse
  if (response.status === 204) {
    return null;
  }

  return parseResponse(response);
}

/**
 * Convenient facade for executing standard REST API requests.
 */
export const apiClient = {
  /**
   * Performs an HTTP GET request to retrieve data from the backend.
   *
   * @param {string} path - Relative path (e.g. '/samples' or '/samples/101').
   * @returns {Promise<any>} Server response payload.
   */
  get(path) {
    return apiRequest(path, { method: 'GET' });
  },

  /**
   * Performs an HTTP POST request to create resources or execute actions (e.g. login, logout).
   *
   * @param {string} path - Relative path (e.g. '/users/login').
   * @param {Object} [data] - JavaScript payload serialized to JSON in the request body.
   * @returns {Promise<any>} Server response payload.
   */
  post(path, data) {
    return apiRequest(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Performs an HTTP PUT request to update an existing resource.
   *
   * @param {string} path - Relative path including resource ID (e.g. '/samples/101').
   * @param {Object} data - JavaScript payload serialized to JSON in the request body.
   * @returns {Promise<any>} Server response payload.
   */
  put(path, data) {
    return apiRequest(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Performs an HTTP DELETE request to remove a resource by ID.
   *
   * @param {string} path - Relative path including resource ID (e.g. '/samples/101').
   * @returns {Promise<any>} Server response payload.
   */
  delete(path) {
    return apiRequest(path, { method: 'DELETE' });
  },
};
