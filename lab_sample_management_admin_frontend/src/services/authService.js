/**
 * FILE: src/services/authService.js
 *
 * PURPOSE:
 * Provides backend-driven authentication service methods for administrator sign-in,
 * sign-out, and active session verification.
 * Communicates exclusively with the Spring Boot user/session endpoints via `apiClient`.
 *
 * SPRING BOOT BACKEND CONTRACT:
 * - GET  /api/users/me    -> Validates active session via JSESSIONID cookie. Returns { userId, username }.
 * - POST /api/users/login -> Validates credentials. Sets HttpOnly JSESSIONID session cookie. Returns LoginResponse.
 * - POST /api/users/logout-> Invalidates active session on the backend.
 *
 * ARCHITECTURAL LAYER:
 * Service Layer / Authentication Data Access.
 *
 * DATA FLOW:
 * AuthContext.jsx
 *   → authService.login(username, password)
 *   → apiClient.post('/users/login', { email: username, password })
 *   → Spring Boot establishes server-side session (HttpSession)
 *   → Returns LoginResponse { userId, username, message }
 *
 * DEPENDENCIES / IMPORTS:
 * - `./apiClient.js`: Shared HTTP client with `credentials: 'include'`.
 *
 * CONSUMED BY:
 * - `src/context/AuthContext.jsx` (maintains React Context authentication state).
 *
 * EXPORTS:
 * - `authService`: Service object exposing `getCurrentUser`, `login`, and `logout`.
 */

import { apiClient } from './apiClient';

export const authService = {
  /**
   * Checks whether the current browser session has an active authenticated user.
   * HTTP: GET /api/users/me
   *
   * @returns {Promise<{ userId: number, username: string }>} User session data if active.
   * @throws {Error} Throws with status 401 if session is not authenticated.
   */
  async getCurrentUser() {
    return apiClient.get('/users/me');
  },

  /**
   * Authenticates administrator credentials against the backend.
   * HTTP: POST /api/users/login
   *
   * @param {string} username - Administrator username or email.
   * @param {string} password - Administrator password.
   * @returns {Promise<{ userId: number, username: string, message: string }>} Server response.
   */
  async login(username, password) {
    const identifier = (username || '').trim();
    return apiClient.post('/users/login', {
      email: identifier,
      password,
    });
  },

  /**
   * Terminates the current administrator session on the backend.
   * HTTP: POST /api/users/logout
   *
   * @returns {Promise<any>} Server logout response.
   */
  async logout() {
    return apiClient.post('/users/logout');
  },
};
