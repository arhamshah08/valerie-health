import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export function Card({ className, children, hover }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hover && 'hover:shadow-md hover:border-violet-100 transition-all cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5 pb-0', className)}>{children}</div>
}

export function CardContent({ className, children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) {
  return <div className={cn('p-5', className)} onClick={onClick}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('font-bold text-gray-900 text-base', className)}>{children}</h3>
}
