-- BugTracker Pro - Complete Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (linked to auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'developer' CHECK (role IN ('admin', 'qa_lead', 'qa_tester', 'developer', 'viewer')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile automatically when user signs up (with error handling)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail signup if profile creation fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for organization slug
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- =====================================================
-- ORGANIZATION MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Index for org members
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for projects by organization
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);

-- =====================================================
-- SPRINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EPICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS epics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BUGS TABLE (Main table)
-- =====================================================
CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_key TEXT UNIQUE DEFAULT ('BUG-' || SUBSTRING(uuid_generate_v4()::TEXT, 1, 8)),
  title TEXT NOT NULL,
  description TEXT,

  -- Status and Priority
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed', 'Reopened')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  severity TEXT DEFAULT 'major' CHECK (severity IN ('minor', 'major', 'critical', 'blocker')),

  -- Issue details
  issue_type TEXT DEFAULT 'Bug' CHECK (issue_type IN ('Bug', 'Task', 'Story', 'Sub-task')),
  steps_to_reproduce TEXT,
  expected_result TEXT,
  actual_result TEXT,

  -- Environment
  environment TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,

  -- Relationships
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Additional fields
  labels TEXT[] DEFAULT '{}',
  story_points INTEGER,
  due_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_priority ON bugs(priority);
CREATE INDEX IF NOT EXISTS idx_bugs_assignee ON bugs(assignee_id);
CREATE INDEX IF NOT EXISTS idx_bugs_reporter ON bugs(reporter_id);
CREATE INDEX IF NOT EXISTS idx_bugs_created_at ON bugs(created_at DESC);

-- =====================================================
-- BUG COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bug_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id UUID NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_bug_id ON bug_comments(bug_id);

-- =====================================================
-- BUG ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bug_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id UUID NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_bug_id ON bug_attachments(bug_id);

-- =====================================================
-- BUG ACTIVITIES TABLE (Audit log)
-- =====================================================
CREATE TABLE IF NOT EXISTS bug_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id UUID NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_bug_id ON bug_activities(bug_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON bug_activities(created_at DESC);

-- =====================================================
-- BUG WATCHERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bug_watchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id UUID NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bug_id, user_id)
);

-- =====================================================
-- SAVED FILTERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, create their own, and edit their own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Organizations: All authenticated users can view and manage
CREATE POLICY "Organizations viewable by authenticated users" ON organizations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Organizations manageable by authenticated users" ON organizations
  FOR ALL TO authenticated USING (true);

-- Organization Members: All authenticated users can view and manage
CREATE POLICY "Org members viewable by authenticated users" ON organization_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Org members manageable by authenticated users" ON organization_members
  FOR ALL TO authenticated USING (true);

-- Projects: All authenticated users can view and manage
CREATE POLICY "Projects viewable by authenticated users" ON projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Projects manageable by authenticated users" ON projects
  FOR ALL TO authenticated USING (true);

-- Sprints: All authenticated users can view and manage
CREATE POLICY "Sprints viewable by authenticated users" ON sprints
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sprints manageable by authenticated users" ON sprints
  FOR ALL TO authenticated USING (true);

-- Epics: All authenticated users can view and manage
CREATE POLICY "Epics viewable by authenticated users" ON epics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Epics manageable by authenticated users" ON epics
  FOR ALL TO authenticated USING (true);

-- Bugs: All authenticated users can view and manage
CREATE POLICY "Bugs viewable by authenticated users" ON bugs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Bugs insertable by authenticated users" ON bugs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Bugs updatable by authenticated users" ON bugs
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Bugs deletable by authenticated users" ON bugs
  FOR DELETE TO authenticated USING (true);

-- Comments: All authenticated users can view and manage
CREATE POLICY "Comments viewable by authenticated users" ON bug_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Comments insertable by authenticated users" ON bug_comments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own comments" ON bug_comments
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON bug_comments
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Attachments: All authenticated users can view and manage
CREATE POLICY "Attachments viewable by authenticated users" ON bug_attachments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Attachments insertable by authenticated users" ON bug_attachments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can delete their own attachments" ON bug_attachments
  FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);

-- Activities: All authenticated users can view, insert
CREATE POLICY "Activities viewable by authenticated users" ON bug_activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Activities insertable by authenticated users" ON bug_activities
  FOR INSERT TO authenticated WITH CHECK (true);

-- Watchers: All authenticated users can manage
CREATE POLICY "Watchers viewable by authenticated users" ON bug_watchers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Watchers manageable by authenticated users" ON bug_watchers
  FOR ALL TO authenticated USING (true);

-- Saved Filters: Users can only see their own
CREATE POLICY "Users can view their own filters" ON saved_filters
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own filters" ON saved_filters
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
-- Run this separately in Supabase Dashboard > Storage
-- Or use the Supabase CLI

-- INSERT INTO storage.buckets (id, name, public) VALUES ('bug-attachments', 'bug-attachments', true);

-- Storage policies (run in SQL editor after creating bucket):
-- CREATE POLICY "Authenticated users can upload attachments"
-- ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'bug-attachments');

-- CREATE POLICY "Anyone can view attachments"
-- ON storage.objects FOR SELECT TO authenticated
-- USING (bucket_id = 'bug-attachments');

-- CREATE POLICY "Users can delete their own attachments"
-- ON storage.objects FOR DELETE TO authenticated
-- USING (bucket_id = 'bug-attachments');

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_epics_updated_at BEFORE UPDATE ON epics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bugs_updated_at BEFORE UPDATE ON bugs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON bug_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment below to insert sample data

-- INSERT INTO projects (name, key, description) VALUES
--   ('Main Product', 'MAIN', 'Our main product development'),
--   ('Mobile App', 'MOB', 'Mobile application project');

-- INSERT INTO sprints (name, project_id, start_date, end_date, status)
-- SELECT 'Sprint 1', id, CURRENT_DATE, CURRENT_DATE + 14, 'active'
-- FROM projects WHERE key = 'MAIN';
