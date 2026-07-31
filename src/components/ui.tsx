import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-5 h-5 animate-spin ${className}`} />;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: {
  label?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="block mb-1.5 text-sm font-500 text-slate-700">{label}</span>}
      <input
        className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="block mt-1 text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Textarea({
  label,
  error,
  className = '',
  ...props
}: {
  label?: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && <span className="block mb-1.5 text-sm font-500 text-slate-700">{label}</span>}
      <textarea
        className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="block mt-1 text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Select({
  label,
  error,
  className = '',
  children,
  ...props
}: {
  label?: string;
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && <span className="block mb-1.5 text-sm font-500 text-slate-700">{label}</span>}
      <select
        className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="block mt-1 text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Alert({ type, children }: { type: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-leaf-50 text-leaf-700 border-leaf-200',
    info: 'bg-brand-50 text-brand-700 border-brand-200',
  };
  return (
    <div className={`px-4 py-3 rounded-lg border text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <h3 className="font-display font-600 text-lg text-slate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md mb-4">{description}</p>}
      {action}
    </div>
  );
}
