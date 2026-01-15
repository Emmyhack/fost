'use client';

import { useToast } from '../auth/toast-context';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg px-4 py-3 font-mono text-sm flex items-center justify-between gap-4 animate-in fade-in slide-in-from-right-4 ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : toast.type === 'warning'
              ? 'bg-orange-50 text-orange-800 border border-orange-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <span>✓</span>}
            {toast.type === 'error' && <span>✗</span>}
            {toast.type === 'warning' && <span>⚠</span>}
            {toast.type === 'info' && <span>ℹ</span>}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-lg leading-none hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
