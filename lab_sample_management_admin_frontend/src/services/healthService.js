import { apiClient } from './apiClient';

// Checks the same /api/health endpoint used by the user frontend.
export async function checkBackend() {
  return apiClient.get('/health');
}
