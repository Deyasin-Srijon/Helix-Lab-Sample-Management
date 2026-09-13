import { STATUS_FILTER } from '../utils/constants';

const OPTIONS = [
  { value: STATUS_FILTER.ALL, label: 'All' },
  { value: STATUS_FILTER.CREATED, label: 'Created' },
  { value: STATUS_FILTER.IN_PROGRESS, label: 'In Progress' },
  { value: STATUS_FILTER.COMPLETED, label: 'Completed' },
];

export default function StatusFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter samples by status">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`min-h-11 cursor-pointer rounded-full px-4 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              selected
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-slate-700 ring-1 ring-border hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
