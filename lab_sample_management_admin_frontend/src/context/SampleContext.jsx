/**
 * FILE: src/context/SampleContext.jsx
 *
 * PURPOSE:
 * Central state management layer for laboratory sample data, metrics calculation,
 * and user toast feedback notifications across the application.
 * All sample data originates exclusively from the Spring Boot REST API.
 *
 * RESPONSIBILITIES:
 * - Maintains the primary collection of sample records in memory (`samples`).
 * - Tracks asynchronous operation states: `loading` and `error`.
 * - Manages temporary user feedback alerts via `toast` state.
 * - Computes real-time aggregate sample statistics (`total`, `created`, `inProgress`, `completed`).
 * - Coordinates CRUD data operations by invoking `sampleService.js` and refreshing state from the backend.
 * - Exposes the `useSamples()` custom hook for clean consumer access.
 *
 * ARCHITECTURAL LAYER:
 * State Management Layer (React Context API).
 *
 * DATA FLOW:
 * 1. Read / Refresh Flow:
 *    AdminDashboardPage.jsx (on mount)
 *      → calls refreshSamples()
 *      → sets loading = true, error = null
 *      → invokes sampleService.getAllSamples()
 *      → receives sample array from Spring Boot API (GET /api/samples)
 *      → updates `samples` state
 *      → sets loading = false
 *      → recalculates `stats` through `useMemo`
 *      → React re-renders dashboard cards and SampleTable.
 * 2. Update Flow:
 *    EditSamplePage.jsx
 *      → calls updateSample(id, data)
 *      → invokes sampleService.updateSample(id, data) -> PUT /api/samples/:id
 *      → triggers refreshSamples() to sync master list from backend
 *      → calls showToast('Sample updated successfully.')
 *      → navigates back to dashboard.
 * 3. Delete Flow:
 *    AdminDashboardPage.jsx (via ConfirmDialog)
 *      → calls deleteSample(id)
 *      → invokes sampleService.deleteSample(id) -> DELETE /api/samples/:id
 *      → triggers refreshSamples()
 *      → calls showToast('Sample deleted successfully.')
 *      → updates UI table and statistics.
 *
 * DEPENDENCIES / IMPORTS:
 * - `react` (`createContext`, `useCallback`, `useContext`, `useMemo`, `useState`): Core React APIs.
 * - `../services/sampleService.js`: Business service providing backend data access.
 *
 * CONSUMED BY:
 * - `src/App.jsx` (mounts `<SampleProvider>` within the app hierarchy).
 * - `src/pages/AdminDashboardPage.jsx` (consumes samples, stats, refresh, delete, toast).
 * - `src/pages/EditSamplePage.jsx` (consumes samples, getSampleById, updateSample, toast).
 *
 * EXPORTS:
 * - `SampleProvider({ children })`: Context provider component.
 * - `useSamples()`: Custom hook to consume the SampleContext values and actions.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { sampleService } from '../services/sampleService';

/**
 * React Context definition for samples.
 * Initialized to `null` to facilitate guard checking in `useSamples()`.
 */
const SampleContext = createContext(null);

/**
 * SampleProvider Component
 *
 * Wraps application components that require access to sample records and operations.
 * Holds state, dispatches service calls, and maintains synchronization between UI and backend.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nested components that consume SampleContext.
 * @returns {JSX.Element} The SampleContext.Provider enclosing child components.
 */
export function SampleProvider({ children }) {
  /**
   * Primary list of laboratory samples from the backend.
   * Shape of each sample object:
   * - `id` (number): Unique sample identifier.
   * - `description` (string): Description of the sample / test request.
   * - `status` (string): 'Created' | 'In Progress' | 'Completed'.
   * - `createdBy` (string): Username of the creator / requester.
   * - `createdDate` (string): ISO date string or formatted date.
   */
  const [samples, setSamples] = useState([]);

  /** Indicates whether an asynchronous data fetch or refresh is currently in progress. */
  const [loading, setLoading] = useState(false);

  /** Holds an error message string if an operation fails, or null when healthy. */
  const [error, setError] = useState(null);

  /**
   * Holds the active toast notification payload, or null if no toast is showing.
   * Shape: `{ message: string, type: 'success' | 'error', id: number }`
   */
  const [toast, setToast] = useState(null);

  /**
   * Displays a temporary toast notification to provide user feedback.
   *
   * @param {string} message - Notification text to display.
   * @param {'success' | 'error'} [type='success'] - Visual variant of the notification.
   */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  /**
   * Dismisses the active toast notification by resetting toast state to null.
   */
  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  /**
   * Asynchronously fetches all samples through the backend service layer and updates state.
   *
   * DATA FLOW:
   * refreshSamples()
   *   → sampleService.getAllSamples()
   *   → apiClient.get('/samples') -> Spring Boot (GET /api/samples)
   *   → setSamples(data)
   *
   * @returns {Promise<void>}
   */
  const refreshSamples = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sampleService.getAllSamples();
      setSamples(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load samples.');
      setSamples([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Asynchronously retrieves a single sample by its unique numeric ID from the backend.
   *
   * DATA FLOW:
   * EditSamplePage.jsx -> getSampleById(id) -> sampleService.getSampleById(id) -> GET /api/samples/:id
   *
   * @param {number|string} id - The sample ID to look up.
   * @returns {Promise<Object>} The retrieved sample record.
   */
  const getSampleById = useCallback(async (id) => {
    return sampleService.getSampleById(id);
  }, []);

  /**
   * Asynchronously updates an existing sample record on the backend.
   *
   * DATA FLOW:
   * updateSample(id, data)
   *   → sampleService.updateSample(id, data) -> PUT /api/samples/:id
   *   → refreshSamples() [synchronizes shared in-memory samples array from backend]
   *   → showToast('Sample updated successfully.')
   *   → returns updated sample object.
   *
   * @param {number|string} id - Original sample ID being updated.
   * @param {Object} data - Updated sample payload (id, description, status).
   * @returns {Promise<Object>} The updated sample object.
   */
  const updateSample = useCallback(async (id, data) => {
    const updated = await sampleService.updateSample(id, data);
    await refreshSamples();
    showToast('Sample updated successfully.');
    return updated;
  }, [refreshSamples, showToast]);

  /**
   * Asynchronously deletes a sample record by its identifier from the backend.
   *
   * DATA FLOW:
   * deleteSample(id)
   *   → sampleService.deleteSample(id) -> DELETE /api/samples/:id
   *   → refreshSamples() [refreshes list and recalculates stats from backend]
   *   → showToast('Sample deleted successfully.')
   *
   * @param {number|string} id - ID of the sample to remove.
   * @returns {Promise<void>}
   */
  const deleteSample = useCallback(async (id) => {
    await sampleService.deleteSample(id);
    await refreshSamples();
    showToast('Sample deleted successfully.');
  }, [refreshSamples, showToast]);

  /**
   * Derived metrics calculation.
   *
   * WHY useMemo IS USED:
   * Recalculates aggregate counts only when the `samples` array reference changes,
   * avoiding redundant array filtering on unrelated component re-renders.
   *
   * STATS SHAPE:
   * - `total` (number): Grand total of samples.
   * - `created` (number): Count with status 'Created'.
   * - `inProgress` (number): Count with status 'In Progress'.
   * - `completed` (number): Count with status 'Completed'.
   */
  const stats = useMemo(() => {
    return {
      total: samples.length,
      created: samples.filter((sample) => sample.status === 'Created').length,
      inProgress: samples.filter((sample) => sample.status === 'In Progress').length,
      completed: samples.filter((sample) => sample.status === 'Completed').length,
    };
  }, [samples]);

  /**
   * Memoized context value bundle.
   * Bundles state properties and action callbacks into a single stable object reference.
   */
  const value = useMemo(
    () => ({
      samples,
      loading,
      error,
      toast,
      stats,
      refreshSamples,
      getSampleById,
      updateSample,
      deleteSample,
      showToast,
      clearToast,
    }),
    [
      samples,
      loading,
      error,
      toast,
      stats,
      refreshSamples,
      getSampleById,
      updateSample,
      deleteSample,
      showToast,
      clearToast,
    ]
  );

  return <SampleContext.Provider value={value}>{children}</SampleContext.Provider>;
}

/**
 * Custom React hook to consume the SampleContext.
 *
 * @returns {Object} SampleContext value containing samples, stats, loading, error, and CRUD operations.
 */
export function useSamples() {
  const context = useContext(SampleContext);
  if (!context) {
    throw new Error('useSamples must be used within SampleProvider.');
  }
  return context;
}
