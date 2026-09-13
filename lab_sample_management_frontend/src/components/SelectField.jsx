export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="ml-0.5 text-danger" aria-hidden="true">*</span> : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition duration-200 focus:outline-none focus:ring-2 sm:text-sm ${
          error
            ? 'border-danger focus:ring-danger'
            : 'border-border focus:border-primary focus:ring-primary'
        } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">{error}</p>
      ) : null}
    </div>
  );
}
