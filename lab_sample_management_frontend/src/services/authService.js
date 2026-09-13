import {
  API_ENDPOINTS,
} from '../utils/constants';

import { request } from './httpClient';

function sanitizeUser(user, fallback = {}) {
  if (!user) {
    return null;
  }

  return {
    id:
      user.userId ??
      user.id ??
      fallback.id ??
      null,

    username:
      user.username ??
      fallback.username ??
      '',

    email:
      user.email ??
      fallback.email ??
      '',

    phone:
      user.phone ??
      fallback.phone ??
      '',
  };
}

const GENERIC_REQUEST_ERROR =
  "We couldn't complete your request right now. Please try again later.";

function getRequestError(response) {
  if (
    response.status === 0 ||
    response.status === 502 ||
    response.status === 503 ||
    response.status === 504
  ) {
    return GENERIC_REQUEST_ERROR;
  }

  return response.error;
}

export async function getCurrentUser() {
  const response = await request(
    API_ENDPOINTS.ME,
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    if (response.status === 401) {
      return null;
    }

    throw new Error(
      getRequestError(response) ||
        GENERIC_REQUEST_ERROR
    );
  }

  return sanitizeUser(response.data);
}

export async function register({
  username,
  email,
  password,
  phone,
}) {
  const response = await request(
    API_ENDPOINTS.REGISTER,
    {
      method: 'POST',
      body: JSON.stringify({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone?.trim() || '',
      }),
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: getRequestError(response),
      status: response.status,
      data: response.data,
    };
  }

  const user = sanitizeUser(
    response.data,
    {
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
    }
  );

  return {
    success: true,
    user,
    message:
      response.data?.message ||
      'Registration successful',
  };
}

export async function login({
  email,
  password,
}) {
  const response = await request(
    API_ENDPOINTS.LOGIN,
    {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    }
  );

  if (!response.success) {
    return {
      success: false,
      error:
        response.status === 401
          ? 'Invalid email or password.'
          : getRequestError(response),
      status: response.status,
      data: response.data,
    };
  }

  const user = sanitizeUser(
    response.data,
    {
      email: email.trim().toLowerCase(),
    }
  );

  return {
    success: true,
    user,
    message:
      response.data?.message ||
      'Login successful',
  };
}

export async function logout() {
  const response = await request(
    API_ENDPOINTS.LOGOUT,
    {
      method: 'POST',
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: getRequestError(response),
      status: response.status,
      data: response.data,
    };
  }

  return {
    success: true,
    message:
      typeof response.data === 'string'
        ? response.data
        : response.data?.message ||
          'Logout successful',
  };
}