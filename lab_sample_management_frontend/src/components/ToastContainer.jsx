import Toast from './Toast';
import {
  useToast,
  useToastState,
} from '../context/ToastContext';

export default function ToastContainer() {
  const { dismissToast } = useToast();
  const toasts = useToastState();

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-100 flex w-[min(calc(100%-2rem),24rem)] flex-col gap-3"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}