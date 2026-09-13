import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'success') => { const id = crypto.randomUUID(); setToasts((current) => [...current, { id, message, type }]); window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500); }, []);
  return <ToastContext.Provider value={{ showToast }}>{children}<div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">{toasts.map((toast) => <div key={toast.id} role="status" className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-200 bg-white text-slate-900'}`}>{toast.type === 'error' ? <XCircle className="shrink-0 text-red-600" size={20} /> : <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />}<p className="flex-1 text-sm font-medium">{toast.message}</p><button onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification"><X size={18} /></button></div>)}</div></ToastContext.Provider>;
}
export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error('useToast must be used inside ToastProvider.'); return context; }
