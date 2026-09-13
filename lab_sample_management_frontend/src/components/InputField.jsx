export default function InputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  readOnly = false,
  required = false,
  autoComplete,
  rightSlot,
  ...props
}) {
  const describedBy = [
    error ? `${id}-error` : null,
    hint ? `${id}-hint` : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="ml-0.5 text-danger" aria-hidden="true">*</span> : null}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-readonly={readOnly || undefined}
          aria-describedby={describedBy}
          className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm ${
            error
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:border-primary focus:ring-primary'
          } ${readOnly ? 'cursor-default bg-slate-50 text-slate-600' : ''} ${rightSlot ? 'pr-11' : ''}`}
          {...props}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {rightSlot}
          </div>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">{error}</p>
      ) : null}
    </div>
  );
}
