interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}
export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-[16px] shadow-[0_2px_16px_rgba(0,43,114,0.08)] border border-[#DDE1EF] overflow-hidden ${padding ? 'p-[22px]' : ''} ${className}`}>
      {children}
    </div>
  )
}
