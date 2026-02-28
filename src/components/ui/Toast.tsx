import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = nextId++;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const icons: Record<ToastType, string> = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
    };

    const colors: Record<ToastType, string> = {
        success: 'border-green-500/30 bg-green-500/10 text-green-300',
        error: 'border-red-500/30 bg-red-500/10 text-red-300',
        info: 'border-primary/30 bg-primary/10 text-primary',
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl animate-fade-in-up cursor-pointer min-w-[300px] max-w-[420px] ${colors[t.type]}`}
                        style={{ animationDuration: '0.3s' }}
                        onClick={() => removeToast(t.id)}
                    >
                        <span className="material-symbols-outlined text-lg shrink-0">{icons[t.type]}</span>
                        <p className="text-sm font-medium leading-snug">{t.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
