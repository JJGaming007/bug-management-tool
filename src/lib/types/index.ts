export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type BugStatus = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'reopened'
export type BugPriority = 'low' | 'medium' | 'high' | 'critical'
export type BugSeverity = 'minor' | 'major' | 'critical' | 'blocker'
export type UserRole = 'admin' | 'qa_lead' | 'qa_tester' | 'developer' | 'viewer'

export interface BugWithDetails {
  id: string
  bug_key: string
  title: string
  description: string
  status: BugStatus
  priority: BugPriority
  severity: BugSeverity
  steps_to_reproduce: string | null
  expected_result: string | null
  actual_result: string | null
  environment: string | null
  browser: string | null
  os: string | null
  device: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  closed_at: string | null
  reporter: {
    id: string
    full_name: string | null
    email: string
  }
  assignee: {
    id: string
    full_name: string | null
    email: string
  } | null
  project: {
    id: string
    name: string
    key: string
  }
  component: {
    id: string
    name: string
  } | null
  comments: Array<{
    id: string
    content: string
    created_at: string
    author: {
      id: string
      full_name: string | null
      email: string
    }
  }>
  activities: Array<{
    id: string
    action: string
    field_name: string | null
    old_value: string | null
    new_value: string | null
    created_at: string
    user: {
      id: string
      full_name: string | null
      email: string
    }
  }>
}
