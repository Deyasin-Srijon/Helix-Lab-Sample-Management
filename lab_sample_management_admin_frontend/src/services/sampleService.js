/**
 * FILE: src/services/sampleService.js
 *
 * PURPOSE:
 * Provides a backend-only data access service for laboratory sample records.
 * All sample persistence and querying is handled exclusively by the Spring Boot REST API
 * via `apiClient`.
 *
 * SPRING BOOT BACKEND CONTRACT:
 * - GET    /api/samples       -> Retrieves all samples belonging to the authenticated user / lab.
 * - GET    /api/samples/{id}  -> Retrieves a single sample by its ID.
 * - PUT    /api/samples/{id}  -> Updates description and status for the given sample ID.
 * - DELETE /api/samples/{id}  -> Deletes the specified sample record.
 *
 * ARCHITECTURAL LAYER:
 * Service & Data Access Layer.
 *
 * DATA FLOW:
 * SampleContext.jsx
 *   → sampleService.getAllSamples()
 *   → apiClient.get('/admin/samples')
 *   → HTTP GET to Spring Boot: ${API_BASE_URL}/samples
 *   → returns parsed List<SampleResponse>
 *
 * DEPENDENCIES / IMPORTS:
 * - `./apiClient.js`: Provides HTTP client for backend network requests.
 *
 * CONSUMED BY:
 * - `src/context/SampleContext.jsx` (the sole consumer in the state management layer).
 *
 * EXPORTS:
 * - `sampleService`: Service object exposing `getAllSamples`, `getSampleById`, `updateSample`, and `deleteSample`.
 */

import { apiClient } from './apiClient';

/**
 * Public service facade consumed by the application's React Context layer.
 * Communicates exclusively with the Spring Boot backend REST API.
 */
export const sampleService = {
  /**
   * Fetches all sample records from the Spring Boot backend.
   * HTTP: GET /api/samples
   *
   * @returns {Promise<Array<Object>>} List of SampleResponse objects from Spring Boot.
   */
  async getAllSamples() {
    return apiClient.get('/admin/samples');
  },

  /**
   * Fetches a specific sample by ID from the Spring Boot backend.
   * HTTP: GET /api/samples/{id}
   *
   * @param {number|string} id - Sample numeric ID.
   * @returns {Promise<Object>} SampleResponse object from Spring Boot.
   */
  async getSampleById(id) {
    return apiClient.get(`/admin/samples/${id}`);
  },

  /**
   * Updates description and status for a sample on the Spring Boot backend.
   * HTTP: PUT /api/samples/{id}
   * Payload sent: SampleUpdateRequest JSON (`{ description, status }`).
   *
   * @param {number|string} id - Sample ID.
   * @param {Object} data - Update payload containing description and status.
   * @returns {Promise<Object>} Updated SampleResponse from Spring Boot.
   */
  async updateSample(id, data) {
    const payload = {
      description: data.description,
      status: data.status,
    };
    return apiClient.put(`/admin/samples/${id}`, payload);
  },

  /**
   * Deletes a sample from the Spring Boot backend database.
   * HTTP: DELETE /api/samples/{id}
   *
   * @param {number|string} id - Sample ID.
   * @returns {Promise<any>} Deletion confirmation response.
   */
  async deleteSample(id) {
    return apiClient.delete(`/admin/samples/${id}`);
  },
};
