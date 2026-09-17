import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  as = 'input',
  options = [],
  className = '',
  containerClassName = '',
  id,
  required,
  disabled,
  children,
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const baseFieldStyles = 'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed';
  const normalStyles = 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500';
  const errorStyles = 'border-rose-300 bg-rose-50/20 focus:ring-rose-500 focus:border-rose-500 text-rose-900';

  const fieldClass = `${baseFieldStyles} ${error ? errorStyles : normalStyles} ${Icon ? 'pl-10' : ''} ${className}`;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {as === 'select' ? (
          <select
            id={inputId}
            disabled={disabled}
            required={required}
            className={fieldClass}
            {...rest}
          >
            {options.map((opt) => {
              if (typeof opt === 'string') {
                return <option key={opt} value={opt}>{opt}</option>;
              }
              return <option key={opt.value} value={opt.value}>{opt.label}</option>;
            })}
            {children}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            id={inputId}
            disabled={disabled}
            required={required}
            className={fieldClass}
            {...rest}
          />
        ) : (
          <input
            id={inputId}
            disabled={disabled}
            required={required}
            className={fieldClass}
            {...rest}
          />
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
