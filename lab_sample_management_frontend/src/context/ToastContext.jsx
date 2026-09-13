import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  TOAST_DURATION,
  TOAST_MESSAGES,
  TOAST_TYPES,
} from '../utils/constants';

const ToastApiContext = createContext(null);
const ToastStateContext = createContext([]);

function createToastId() {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const backendToastShownRef = useRef(false);
  const backendToastResetTimerRef = useRef(null);

  const dismissToast = useCallback((id) => {
    const existing = timersRef.current.get(id) || {};

    if (existing.hide) {
      window.clearTimeout(existing.hide);
    }

    if (existing.remove) {
      window.clearTimeout(existing.remove);
    }

    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id
          ? { ...toast, visible: false }
          : toast
      )
    );

    const remove = window.setTimeout(() => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id)
      );

      timersRef.current.delete(id);
    }, 200);

    timersRef.current.set(id, {
      hide: null,
      remove,
    });
  }, []);

  const showToast = useCallback(
    (message, type = TOAST_TYPES.INFO) => {
      const id = createToastId();

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          visible: true,
        },
      ]);

      const hide = window.setTimeout(
        () => dismissToast(id),
        TOAST_DURATION
      );

      timersRef.current.set(id, {
        hide,
        remove: null,
      });

      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    const handleBackendUnavailable = () => {
      if (backendToastShownRef.current) {
        return;
      }

      backendToastShownRef.current = true;

      showToast(
        TOAST_MESSAGES.backendUnavailable,
        TOAST_TYPES.ERROR
      );

      if (backendToastResetTimerRef.current) {
        window.clearTimeout(
          backendToastResetTimerRef.current
        );
      }

      backendToastResetTimerRef.current =
        window.setTimeout(() => {
          backendToastShownRef.current = false;
          backendToastResetTimerRef.current = null;
        }, TOAST_DURATION);
    };

    window.addEventListener(
      'backend:unavailable',
      handleBackendUnavailable
    );

    return () => {
      window.removeEventListener(
        'backend:unavailable',
        handleBackendUnavailable
      );
    };
  }, [showToast]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timers) => {
        if (timers.hide) {
          window.clearTimeout(timers.hide);
        }

        if (timers.remove) {
          window.clearTimeout(timers.remove);
        }
      });

      timersRef.current.clear();

      if (backendToastResetTimerRef.current) {
        window.clearTimeout(
          backendToastResetTimerRef.current
        );
      }

      backendToastResetTimerRef.current = null;
      backendToastShownRef.current = false;
    },
    []
  );

  const api = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastApiContext.Provider value={api}>
      <ToastStateContext.Provider value={toasts}>
        {children}
      </ToastStateContext.Provider>
    </ToastApiContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastApiContext);

  if (!context) {
    throw new Error(
      'useToast must be used within ToastProvider'
    );
  }

  return context;
}

export function useToastState() {
  return useContext(ToastStateContext);
}