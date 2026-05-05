import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MaterialIcon } from '../common/shared';

const Ctx = createContext(null);

let toastId = 0;

const variantStyles = {
  error: {
    wrap: 'bg-gradient-to-r from-rose-800 via-rose-600 to-red-500 shadow-red-900/30',
    icon: 'cancel',
    iconWrap: 'bg-white/25',
  },
  success: {
    wrap: 'bg-gradient-to-r from-emerald-700 via-green-600 to-teal-500 shadow-emerald-900/25',
    icon: 'check_circle',
    iconWrap: 'bg-white/25',
  },
  info: {
    wrap: 'bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 shadow-blue-900/25',
    icon: 'info',
    iconWrap: 'bg-white/25',
  },
  warning: {
    wrap: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 shadow-amber-900/25',
    icon: 'warning',
    iconWrap: 'bg-white/25',
  },
};

function Toast({ toast, onDismiss }) {
  const v = variantStyles[toast.type] || variantStyles.info;
  return (
    <div
      role="alert"
      className={`relative rounded-2xl shadow-xl px-4 py-3 pr-10 text-white min-w-[min(100vw-2rem,360px)] max-w-md border border-white/10 ${v.wrap}`}
    >
      <button
        type="button"
        className="absolute top-2 right-2 w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/90 text-lg leading-none"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        ×
      </button>
      <div className="flex gap-3 items-start">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${v.iconWrap}`}>
          <MaterialIcon name={v.icon} className="text-[22px] text-white" />
        </div>
        <div className="min-w-0 pt-0.5">
          {toast.title ? <h4 className="font-bold text-sm sm:text-base leading-tight">{toast.title}</h4> : null}
          {toast.message ? (
            <p className={`text-sm text-white/95 ${toast.title ? 'mt-1' : ''} leading-snug`}>{toast.message}</p>
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
