// src/lib/utils.ts

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

/**
 * Merges Tailwind class names intelligently, deduplicating and resolving conflicts.
 */
export function cn(...inputs: Parameters<typeof clsx>): string {
  return twMerge(clsx(...inputs))
}

/**
 * Converts a long UUID (or any string) into an 8-character uppercase key,
 * similar to JIRA issue keys (e.g. "AB12CD34").
 */
export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

/**
 * Format a date to `MMM dd, yyyy`.
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

/**
 * Format a date to `MMM dd, yyyy HH:mm`.
 */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

/**
 * Returns a Tailwind CSS text color class based on the bug status.
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'open':
      return 'text-yellow-400'
    case 'in progress':
      return 'text-blue-400'
    case 'resolved':
      return 'text-green-400'
    case 'closed':
      return 'text-gray-400'
    case 'critical':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

/**
 * Returns a Tailwind CSS text color class based on the bug priority.
 */
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'low':
      return 'text-green-400'
    case 'medium':
      return 'text-yellow-400'
    case 'high':
      return 'text-orange-400'
    case 'critical':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}
