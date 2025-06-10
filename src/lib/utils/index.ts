import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getStatusColor(status: string) {
  const colors = {
    new: 'bg-yellow-500',
    assigned: 'bg-blue-500',
    'in_progress': 'bg-purple-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500',
    reopened: 'bg-red-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-500'
}

export function getPriorityColor(priority: string) {
  const colors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  }
  return colors[priority as keyof typeof colors] || 'text-gray-400'
}