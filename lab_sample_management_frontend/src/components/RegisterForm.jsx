import { useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import { EyeIcon, EyeOffIcon } from './icons';
import { hasErrors, validateRegisterForm } from '../utils/validation';

export default function RegisterForm({ onSubmit, submitting }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegisterForm({ username, email, password, phone });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      const first = ['username', 'email', 'password', 'phone'].find((key) => nextErrors[key]);
      document.getElementById(`register-${first}`)?.focus();
      return;
    }
    await onSubmit({ username, email, password, phone });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <InputField
        id="register-username"
        label="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        error={errors.username}
        required
        autoComplete="username"
      />
      <InputField
        id="register-email"
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        required
        autoComplete="email"
      />
      <InputField
        id="register-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        required
        autoComplete="new-password"
        rightSlot={(
          <button
            type="button"
            className="inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-md text-slate-500 hover:text-slate-800"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      />
      <InputField
        id="register-phone"
        label="Phone"
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={errors.phone}
        required
        autoComplete="tel"
      />
      <Button type="submit" loading={submitting} className="mt-2 w-full">
        Create account
      </Button>
    </form>
  );
}
