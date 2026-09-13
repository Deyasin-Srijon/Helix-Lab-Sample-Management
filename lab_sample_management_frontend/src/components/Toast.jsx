import {
  AlertIcon,
  CheckIcon,
  InfoIcon,
} from './icons';

import { TOAST_TYPES } from '../utils/constants';

const styles = {
  [TOAST_TYPES.SUCCESS]:
    'border-emerald-200 bg-white',
  [TOAST_TYPES.ERROR]:
    'border-red-200 bg-white',
  [TOAST_TYPES.INFO]:
    'border-sky-200 bg-white',
};

const iconStyles = {
  [TOAST_TYPES.SUCCESS]: 'text-emerald-700',
  [TOAST_TYPES.ERROR]: 'text-red-700',
  [TOAST_TYPES.INFO]: 'text-sky-700',
};

const icons = {
  [TOAST_TYPES.SUCCESS]: CheckIcon,
  [TOAST_TYPES.ERROR]: AlertIcon,
  [TOAST_TYPES.INFO]: InfoIcon,
};

export default function Toast({ toast, onDismiss }) {
  const Icon =
    icons[toast.type] || InfoIcon;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition duration-200 ease-out ${
        styles[toast.type] ||
        styles[TOAST_TYPES.INFO]
      } ${
        toast.visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-4 opacity-0'
      }`}
    >
      <span
        className={`mt-0.5 shrink-0 ${
          iconStyles[toast.type] ||
          iconStyles[TOAST_TYPES.INFO]
        }`}
      >
        <Icon />
      </span>

      <p className="flex-1 text-sm font-medium text-slate-800">
        {toast.message}
      </p>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label="Dismiss notification"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}