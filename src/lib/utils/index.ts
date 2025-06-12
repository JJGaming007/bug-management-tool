import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

/** Merge Tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Shorten a long ID to 8 uppercase chars (JIRA style) */
export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

/** Format date */
export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy')
}

/** Format date + time */
export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

/** Map bug status to a background color */
export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    'in progress': 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    critical: 'bg-red-100 text-red-700',
  }
  return colors[status.toLowerCase()] ?? 'bg-gray-100 text-gray-700'
}

/** Map bug priority to a text color */
export function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  }
  return colors[priority.toLowerCase()] ?? 'text-gray-500'
}
