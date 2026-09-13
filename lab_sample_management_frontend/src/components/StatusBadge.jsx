import { STATUS_OPTIONS } from '../utils/constants';

const styles = {
  [STATUS_OPTIONS.CREATED]: 'bg-sky-50 text-sky-800 ring-sky-200',
  [STATUS_OPTIONS.IN_PROGRESS]: 'bg-amber-50 text-amber-800 ring-amber-200',
  [STATUS_OPTIONS.COMPLETED]: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {status}
    </span>
  );
}
