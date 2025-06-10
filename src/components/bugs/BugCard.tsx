import { formatRelativeTime, getStatusColor, getPriorityColor } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { BugWithDetails } from '@/lib/types'

interface BugCardProps {
  bug: BugWithDetails
  onClick: () => void
}

export function BugCard({ bug, onClick }: BugCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {bug.bug_key}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {bug.title}
          </h3>
        </div>
        <Badge
          className={`${getStatusColor(bug.status)} text-white`}
        >
          {bug.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {bug.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span className={getPriorityColor(bug.priority)}>
            Priority: {bug.priority.toUpperCase()}
          </span>
          <span>Severity: {bug.severity}</span>
          {bug.component && (
            <span>Component: {bug.component.name}</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {bug.assignee && (
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                {bug.assignee.full_name?.[0] || bug.assignee.email[0]}
              </div>
              <span>{bug.assignee.full_name || bug.assignee.email}</span>
            </div>
          )}
          <span>{formatRelativeTime(bug.updated_at)}</span>
        </div>
      </div>
    </div>
  )
}