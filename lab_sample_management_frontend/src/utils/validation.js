const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

const SAMPLE_ID_PATTERN = /^\d+$/;

export function validateUsername(username) {
  const value = (username || '').trim();

  if (!value) return 'Username is required.';

  if (value.length < 3) {
    return 'Username must be at least 3 characters.';
  }

  if (value.length > 32) {
    return 'Username must be 32 characters or fewer.';
  }

  return '';
}

export function validateEmail(email) {
  const value = (email || '').trim();

  if (!value) return 'Email is required.';

  if (!EMAIL_PATTERN.test(value)) {
    return 'Enter a valid email address.';
  }

  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password must contain at least one special character.';
  }

  return '';
}

export function validateLoginPassword(password) {
  if (!password) return 'Password is required.';

  return '';
}

export function validatePhone(phone) {
  const value = (phone || '').trim();

  if (!value) return '';

  if (!PHONE_PATTERN.test(value)) {
    return 'Enter a valid phone number.';
  }

  return '';
}

export function validateSampleId(sampleId) {
  const value = String(sampleId ?? '').trim();

  if (!value) return 'Sample ID is required.';

  if (!SAMPLE_ID_PATTERN.test(value)) {
    return 'Sample ID must contain numbers only.';
  }

  return '';
}

export function validateDescription(description) {
  const value = (description || '').trim();

  if (!value) return 'Description is required.';

  if (value.length > 500) {
    return 'Description must be 500 characters or fewer.';
  }

  return '';
}

export function validateStatus(status, allowed) {
  if (!status) return 'Status is required.';

  if (allowed && !Object.values(allowed).includes(status)) {
    return 'Select a valid status.';
  }

  return '';
}

export function validateRegisterForm({
  username,
  email,
  password,
  phone,
}) {
  return {
    username: validateUsername(username),
    email: validateEmail(email),
    password: validatePassword(password),
    phone: validatePhone(phone),
  };
}

export function validateLoginForm({
  email,
  password,
}) {
  return {
    email: validateEmail(email),
    password: validateLoginPassword(password),
  };
}

export function validateSampleForm(
  {
    id,
    description,
    status,
  },
  statusOptions
) {
  return {
    id: validateSampleId(id),
    description: validateDescription(description),
    status: validateStatus(status, statusOptions),
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}