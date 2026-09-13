import { API_ENDPOINTS } from '../utils/constants';
import { request } from './httpClient';

function mapSample(sample) {
  if (!sample) {
    return null;
  }

  return {
    id: sample.id,
    description: sample.description || '',
    status: sample.status || '',
    createdDate: sample.createdDate || null,
    createdTime: sample.createdTime || null,
    username: sample.createdBy || sample.username || '',
  };
}

export async function getSamples() {
  const response = await request(
    API_ENDPOINTS.SAMPLES,
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error || 'Unable to fetch samples.',
      status: response.status,
      data: response.data,
    };
  }

  const samples = Array.isArray(response.data)
    ? response.data
        .map(mapSample)
        .filter(Boolean)
    : [];

  return {
    success: true,
    samples,
  };
}

export async function getSampleById(id) {
  const response = await request(
    API_ENDPOINTS.SAMPLE_BY_ID(id),
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error || 'Sample not found.',
      status: response.status,
      data: response.data,
    };
  }

  return {
    success: true,
    sample: mapSample(response.data),
  };
}

export async function addSample({
  id,
  description,
  status,
}) {
  const sampleId = Number(id);

  const response = await request(
    API_ENDPOINTS.SAMPLES,
    {
      method: 'POST',
      body: JSON.stringify({
        id: sampleId,
        description: description.trim(),
        status,
      }),
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error || 'Unable to add sample.',
      status: response.status,
      data: response.data,
    };
  }

  return {
    success: true,
    sample: mapSample(response.data),
    message:
      response.data?.message ||
      'Sample added successfully.',
  };
}

export async function updateSample(
  id,
  {
    description,
    status,
  }
) {
  const response = await request(
    API_ENDPOINTS.SAMPLE_BY_ID(id),
    {
      method: 'PUT',
      body: JSON.stringify({
        description: description.trim(),
        status,
      }),
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error || 'Unable to update sample.',
      status: response.status,
      data: response.data,
    };
  }

  return {
    success: true,
    sample: mapSample(response.data),
    message:
      response.data?.message ||
      'Sample updated successfully.',
  };
}

export async function deleteSample(id) {
  const response = await request(
    API_ENDPOINTS.SAMPLE_BY_ID(id),
    {
      method: 'DELETE',
    }
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error || 'Unable to delete sample.',
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
          'Sample deleted successfully.',
  };
}