export const ITEMS_PER_PAGE = 10;

export const TOAST_DURATION = 3000;

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
};

export const STATUS_OPTIONS = {
  ALL: 'ALL',
  CREATED: 'Created',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const STATUS_FILTER = {
  ALL: 'ALL',
  CREATED: 'Created',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const STORAGE_KEYS = {
  USERS: 'lab_users',
  AUTH_USER: 'lab_auth_user',
  SAMPLES: 'lab_samples',
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/users/login`,
  LOGOUT: `${API_BASE_URL}/users/logout`,
  ME: `${API_BASE_URL}/users/me`,
  SAMPLES: `${API_BASE_URL}/samples`,
  SAMPLE_BY_ID: (id) =>
    `${API_BASE_URL}/samples/${encodeURIComponent(id)}`,
};

export const TOAST_MESSAGES = {
  registerSuccess: (username) =>
    `Account created successfully! Welcome, ${username}.`,
  loginSuccess: (username) =>
    `Welcome back, ${username}!`,
  loginFailed:
    'Invalid email or password.',
  backendUnavailable:
    'Backend is not connected. Please start the Spring Boot server and try again.',
  sampleAdded: (sampleId) =>
    `Sample ${sampleId} added successfully.`,
  sampleUpdated: (sampleId) =>
    `Sample ${sampleId} updated successfully.`,
  sampleDeleted:
    'Sample deleted successfully.',
};