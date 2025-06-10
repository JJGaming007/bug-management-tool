// src/lib/utils.ts

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'open': return 'bg-yellow-500 text-white';
    case 'resolved': return 'bg-green-600 text-white';
    case 'in progress': return 'bg-blue-500 text-white';
    case 'closed': return 'bg-gray-500 text-white';
    default: return 'bg-zinc-500 text-white';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'low': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-orange-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-500';
  }
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day ago`;

  return date.toLocaleDateString(); // fallback to full date
}