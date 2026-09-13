import { API_BASE_URL } from '../utils/constants';
import { request } from './httpClient';

export async function checkBackend() {
  const response = await request(
    `${API_BASE_URL}/health`,
    {
      method: 'GET',
      notifyOnBackendUnavailable: true,
    }
  );

  return response;
}