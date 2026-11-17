/**
 * FILE: src/utils/validation.js
 *
 * PURPOSE:
 * Provides client-side validation logic for form submissions.
 * It enforces business constraints on user authentication inputs and sample data fields,
 * producing structured error objects that UI components consume to display inline errors.
 *
 * RESPONSIBILITIES:
 * - Validates administrator login fields (ensuring username/email and password are provided).
 * - Validates sample fields (ID format, ID uniqueness, description length, valid status).
 * - Supplies a helper `hasErrors` function to determine whether a validation error map has any entries.
 *
 * ARCHITECTURAL LAYER:
 * Utilities / Business Rules Validation Layer.
 *
 * DATA FLOW:
 * 1. Login Form Validation:
 *    AdminLoginPage.jsx (on form submit)
 *      → calls validateLogin(username, password)
 *      → receives errors object `{ username?: string, password?: string }`
 *      → if hasErrors(errors) is true, halts submission and displays inline field errors.
 * 2. Sample Edit Form Validation:
 *    EditSamplePage.jsx (on form submit)
 *      → calls validateSample(form, samples, original?.id)
 *      → receives errors object `{ id?: string, description?: string, status?: string }`
 *      → if hasErrors(errors) is true, halts submission and displays inline field errors.
 *
 * ERROR OBJECT SHAPE:
 * A plain JavaScript dictionary where keys correspond to field names and values
 * are user-facing localized error strings.
 * Example: `{ id: 'Sample ID must be a positive integer.' }`
 *
 * DEPENDENCIES / IMPORTS:
 * - `../config/apiConfig.js`: Imports `SAMPLE_STATUSES` domain list.
 *
 * CONSUMED BY:
 * - `src/pages/AdminLoginPage.jsx`
 * - `src/pages/EditSamplePage.jsx`
 *
 * EXPORTS:
 * - `validateLogin(username, password)`
 * - `validateSample(data, existingSamples, originalId)`
 * - `hasErrors(errors)`
 */

import { SAMPLE_STATUSES } from '../config/apiConfig';

/**
 * Validates login form input credentials.
 *
 * @param {string} username - Entered username or email string.
 * @param {string} password - Entered password string.
 * @returns {Object} Dictionary of field error messages (empty if valid).
 */
export function validateLogin(username, password) {
  const errors = {};

  if (!username || !username.trim()) {
    errors.username = 'Username or email is required.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

/**
 * Validates sample entity fields before creation or update.
 *
 * RULES ENFORCED:
 * 1. ID Presence & Format:
 *    - Must not be empty, null, or undefined.
 *    - Must be a positive integer (> 0).
 * 2. ID Uniqueness:
 *    - The sample ID must not clash with any other sample in the existing list.
 *    - The check ignores `originalId`, so a sample can keep its existing ID without conflict.
 * 3. Description:
 *    - Must not be blank.
 *    - Cannot exceed 500 characters.
 * 4. Status:
 *    - Must not be blank.
 *    - Must match one of the predefined domain statuses in `SAMPLE_STATUSES`.
 *
 * @param {Object} data - Form state containing `{ id, description, status }`.
 * @param {Array<Object>} existingSamples - Full list of samples for uniqueness checking.
 * @param {number} [originalId] - The existing sample's initial ID (omitted from conflict check).
 * @returns {Object} Dictionary of field error messages (empty if valid).
 */
export function validateSample(data, existingSamples, originalId) {
  const errors = {};
  const sampleId = Number(data.id);

  // 1. Validate Sample ID presence and format
  if (data.id === '' || data.id === null || data.id === undefined) {
    errors.id = 'Sample ID is required.';
  } else if (!Number.isInteger(sampleId) || sampleId <= 0) {
    errors.id = 'Sample ID must be a positive integer.';
  } else {
    // 2. Validate Sample ID uniqueness (excluding self if editing)
    const duplicate = existingSamples.some(
      (sample) => sample.id === sampleId && sample.id !== originalId
    );
    if (duplicate) {
      errors.id = 'Sample ID must be unique.';
    }
  }

  // 3. Validate Description presence and maximum length
  const description = (data.description || '').trim();
  if (!description) {
    errors.description = 'Description is required.';
  } else if (description.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.';
  }

  // 4. Validate Status presence and domain membership
  if (!data.status) {
    errors.status = 'Status is required.';
  } else if (!SAMPLE_STATUSES.includes(data.status)) {
    errors.status = 'Select a valid status.';
  }

  return errors;
}

/**
 * Checks whether a validation errors object contains any recorded errors.
 *
 * @param {Object} errors - Error dictionary returned by a validation function.
 * @returns {boolean} True if one or more errors are present; false otherwise.
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
