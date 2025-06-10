import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200': variant === 'default',
          'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200': variant === 'success',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200': variant === 'warning',
          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200': variant === 'danger',
          'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200': variant === 'secondary',
        },
        className
      )}
      {...props}
    />
  )
}
