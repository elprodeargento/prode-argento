import { type InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, type, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const isPassword = type === 'password'
    const [showPassword, setShowPassword] = useState(false)

    const inputEl = (
      <input
        ref={ref}
        id={inputId}
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-slate-900 bg-slate-50
          placeholder:text-slate-400 placeholder:font-normal
          focus:outline-none focus:border-[#002B72] focus:bg-white
          transition-colors duration-150
          ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}
          ${isPassword ? 'pr-11' : ''}
          ${className}`}
        {...props}
      />
    )

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        {isPassword ? (
          <div className="relative">
            {inputEl}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        ) : inputEl}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
