export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          owner_id?: string | null
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          created_at: string
        }
        Insert: {
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
        }
        Update: {
          role?: 'owner' | 'admin' | 'member' | 'viewer'
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'qa_lead' | 'qa_tester' | 'developer' | 'viewer'
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'qa_lead' | 'qa_tester' | 'developer' | 'viewer'
          department?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'qa_lead' | 'qa_tester' | 'developer' | 'viewer'
          department?: string | null
        }
      }
      bugs: {
        Row: {
          id: string
          bug_key: string
          title: string
          description: string
          status: 'Open' | 'Todo' | 'In Progress' | 'Dev Complete' | 'QA Verified' | 'Closed' | 'Reopened'
          priority: 'low' | 'medium' | 'high' | 'critical'
          severity: 'minor' | 'major' | 'critical' | 'blocker'
          steps_to_reproduce: string | null
          expected_result: string | null
          actual_result: string | null
          environment: string | null
          browser: string | null
          os: string | null
          device: string | null
          project_id: string
          component_id: string | null
          reporter_id: string
          assignee_id: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
          closed_at: string | null
        }
        Insert: {
          bug_key?: string
          title: string
          description: string
          status?: 'Open' | 'Todo' | 'In Progress' | 'Dev Complete' | 'QA Verified' | 'Closed' | 'Reopened'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          severity?: 'minor' | 'major' | 'critical' | 'blocker'
          steps_to_reproduce?: string | null
          expected_result?: string | null
          actual_result?: string | null
          environment?: string | null
          browser?: string | null
          os?: string | null
          device?: string | null
          project_id: string
          component_id?: string | null
          reporter_id: string
          assignee_id?: string | null
        }
        Update: {
          title?: string
          description?: string
          status?: 'Open' | 'Todo' | 'In Progress' | 'Dev Complete' | 'QA Verified' | 'Closed' | 'Reopened'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          severity?: 'minor' | 'major' | 'critical' | 'blocker'
          steps_to_reproduce?: string | null
          expected_result?: string | null
          actual_result?: string | null
          environment?: string | null
          browser?: string | null
          os?: string | null
          device?: string | null
          component_id?: string | null
          assignee_id?: string | null
          resolved_at?: string | null
          closed_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          key: string
          organization_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          key: string
          organization_id?: string | null
          created_by: string
        }
        Update: {
          name?: string
          description?: string | null
          organization_id?: string | null
        }
      }
      components: {
        Row: {
          id: string
          name: string
          description: string | null
          project_id: string
          created_at: string
        }
        Insert: {
          name: string
          description?: string | null
          project_id: string
        }
        Update: {
          name?: string
          description?: string | null
        }
      }
      bug_comments: {
        Row: {
          id: string
          bug_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          bug_id: string
          author_id: string
          content: string
        }
        Update: {
          content?: string
        }
      }
      bug_activities: {
        Row: {
          id: string
          bug_id: string
          user_id: string
          action: string
          field_name: string | null
          old_value: string | null
          new_value: string | null
          created_at: string
        }
        Insert: {
          bug_id: string
          user_id: string
          action: string
          field_name?: string | null
          old_value?: string | null
          new_value?: string | null
        }
      }
    }
  }
}
