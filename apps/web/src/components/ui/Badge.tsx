interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'amber' | 'blue' | 'gray' | 'red'
}
const variants = {
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  blue:  'bg-blue-100 text-blue-800',
  gray:  'bg-slate-100 text-slate-600',
  red:   'bg-red-100 text-red-700',
}
export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${variants[variant]}`}>
      {children}
    </span>
  )
}
