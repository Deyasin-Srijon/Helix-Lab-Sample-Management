import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-primary text-on-primary shadow-sm hover:bg-primary-dark focus-visible:ring-primary',
  secondary:
    'bg-white text-slate-800 border border-border shadow-sm hover:bg-slate-50 focus-visible:ring-secondary',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-secondary',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-700 focus-visible:ring-danger',
};

const sizes = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

const Button = forwardRef(function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});

export default Button;
