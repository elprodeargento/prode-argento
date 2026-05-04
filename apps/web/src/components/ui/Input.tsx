import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-slate-900 bg-slate-50
            placeholder:text-slate-400 placeholder:font-normal
            focus:outline-none focus:border-[#002B72] focus:bg-white
            transition-colors duration-150
            ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}
            ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
