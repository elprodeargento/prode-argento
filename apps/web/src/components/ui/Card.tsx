interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}
export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
