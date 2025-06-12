export interface Bug {
  id: number
  title: string
  description: string
  issue_type: 'Bug' | 'Task' | 'Story' | 'Sub-task'
  labels: string[]
  story_points?: number
  due_date?: string
  sprint_id?: number
  epic_id?: number
  parent_id?: number
  status: 'open' | 'in-progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  created_at: string
}

export interface Epic {
  id: number
  name: string
  key: string
  description?: string
  created_at: string
}

export interface Comment {
  id: number
  bug_id: number
  author: string
  content: string
  created_at: string
}

export interface Activity {
  id: number
  bug_id: number
  action: string
  actor: string
  created_at: string
}

export interface SavedFilter {
  id: number
  user_email: string
  name: string
  search: string
  status_filter: string[]
  priority_filter: string[]
  created_at: string
}

export interface Attachment {
  id: number
  bug_id: number
  file_name: string
  file_url: string
  uploaded_at?: string | null
}

export interface Watcher {
  id: number
  bug_id: number
  user_email: string
  added_at?: string | null
}

export interface Sprint {
  id: number
  name: string
  start_date: string
  end_date: string
}
