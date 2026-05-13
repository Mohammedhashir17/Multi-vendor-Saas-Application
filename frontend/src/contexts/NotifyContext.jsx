import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MaterialIcon } from '../common/shared';

const Ctx = createContext(null);

let toastId = 0;

const variantStyles = {
  error: {
    accent: 'border-l-red-600',
    icon: 'cancel',
    iconWrap: 'bg-red-50',
    title: 'text-red-600',
    iconColor: 'text-red-600',
    close: 'text-red-600 hover:bg-red-50',
  },
  success: {
    accent: 'border-l-emerald-600',
    icon: 'check_circle',
    iconWrap: 'bg-emerald-50',
    title: 'text-emerald-700',
    iconColor: 'text-emerald-600',
    close: 'text-emerald-600 hover:bg-emerald-50',
  },
  info: {
    accent: 'border-l-sky-600',
    icon: 'info',
    iconWrap: 'bg-sky-50',
    title: 'text-sky-700',
    iconColor: 'text-sky-600',
    close: 'text-sky-600 hover:bg-sky-50',
  },
  warning: {
    accent: 'border-l-amber-500',
    icon: 'warning',
    iconWrap: 'bg-amber-50',
    title: 'text-amber-700',
    iconColor: 'text-amber-600',
    close: 'text-amber-600 hover:bg-amber-50',
  },
};

function Toast({ toast, onDismiss }) {
  const v = variantStyles[toast.type] || variantStyles.info;
  return (
    <div
      role="alert"
      className={`relative rounded-2xl bg-white shadow-lg shadow-gray-900/10 min-w-[min(100vw-2rem,360px)] max-w-md border border-gray-200/90 border-l-[6px] ${v.accent} pl-3 pr-10 py-3`}
    >
      <button
        type="button"
        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none opacity-90 ${v.close}`}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        ×
      </button>
      <div className="flex gap-3 items-start">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${v.iconWrap}`}>
          <MaterialIcon name={v.icon} className={`text-[22px] ${v.iconColor}`} />
        </div>
        <div className="min-w-0 pt-0.5">
          {toast.title ? (
            <h4 className={`font-bold text-sm sm:text-base leading-tight ${v.title}`}>{toast.title}</h4>
          ) : null}
          {toast.message ? (
            <p className={`text-sm text-gray-500 ${toast.title ? 'mt-1' : ''} leading-snug`}>{toast.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function NotifyProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback(
    (opts) => {
      const id = ++toastId;
      const type = opts.type || 'info';
      const duration = opts.duration ?? 5500;
      const entry = {
        id,
        type,
        title: opts.title || '',
        message: opts.message || '',
      };
      setToasts((t) => [...t, entry]);
      if (duration > 0) {
        window.setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const value = useMemo(() => ({ notify, dismiss: remove }), [notify, remove]);

  const portal =
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="fixed bottom-28 right-4 sm:right-5 md:bottom-6 md:right-8 z-[998] flex flex-col justify-end gap-3 items-end pointer-events-none max-w-[min(100vw-1rem,380px)]"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto animate-toastIn">
            <Toast toast={t} onDismiss={remove} />
          </div>
        ))}
      </div>,
      document.body
    );

  return (
    <Ctx.Provider value={value}>
      {children}
      {portal}
    </Ctx.Provider>
  );
}

export function useNotify() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNotify requires NotifyProvider');
  return v;
}
