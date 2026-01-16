// Type definitions for BugTracker Pro
// These match the database schema in supabase/migrations/001_initial_schema.sql

export type BugStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened'
export type BugPriority = 'low' | 'medium' | 'high' | 'critical'
export type BugSeverity = 'minor' | 'major' | 'critical' | 'blocker'
export type IssueType = 'Bug' | 'Task' | 'Story' | 'Sub-task'
export type UserRole = 'admin' | 'qa_lead' | 'qa_tester' | 'developer' | 'viewer'
export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  owner_id?: string | null
  created_by?: string | null
  created_at: string
  updated_at?: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrgRole
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role: UserRole
  department?: string | null
  created_at: string
  updated_at?: string
}

export interface Project {
  id: string
  name: string
  key: string
  description?: string | null
  organization_id?: string | null
  bug_counter?: number
  created_by?: string | null
  created_at: string
  updated_at?: string
}

export interface Sprint {
  id: string
  name: string
  project_id?: string | null
  start_date?: string | null
  end_date?: string | null
  status: 'planning' | 'active' | 'completed'
  created_at: string
  updated_at?: string
}

export interface Epic {
  id: string
  name: string
  key: string
  description?: string | null
  project_id?: string | null
  created_at: string
  updated_at?: string
}

export interface Bug {
  id: string | number // Support both UUID and number for compatibility
  bug_key?: string
  bug_number?: number // Sequential number within project
  title: string
  description?: string | null

  // Status and Priority
  status: BugStatus | string
  priority: BugPriority | string
  severity?: BugSeverity | string

  // Issue details
  issue_type?: IssueType | string
  steps_to_reproduce?: string | null
  expected_result?: string | null
  actual_result?: string | null

  // Environment
  environment?: string | null
  browser?: string | null
  os?: string | null
  device?: string | null

  // Relationships
  project_id?: string | null
  sprint_id?: string | null
  epic_id?: string | null
  reporter_id?: string | null
  assignee_id?: string | null
  assignee?: string | null // Denormalized for display

  // Additional fields
  labels?: string[]
  story_points?: number | null
  due_date?: string | null

  // Timestamps
  created_at: string
  updated_at?: string | null
  resolved_at?: string | null
  closed_at?: string | null
}

export interface Comment {
  id: string | number
  bug_id: string | number
  author_id?: string | null
  author?: string // Denormalized
  content: string
  created_at: string
  updated_at?: string
}

export interface Attachment {
  id: string | number
  bug_id: string | number
  filename: string
  file_path: string
  file_size?: number | null
  mime_type?: string | null
  uploaded_by?: string | null
  created_at: string
}

export interface Activity {
  id: string | number
  bug_id: string | number
  user_id?: string | null
  actor?: string // Denormalized
  action: string
  field_name?: string | null
  old_value?: string | null
  new_value?: string | null
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Watcher {
  id: string | number
  bug_id: string | number
  user_id: string
  user_email?: string // Denormalized
  created_at: string
}

export interface SavedFilter {
  id: string | number
  user_id: string
  name: string
  filters: Record<string, unknown>
  created_at: string
}

// Helper type for API responses
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

// Helper type for pagination
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
