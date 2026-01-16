-- Migration: Add Organizations and Project-based Bug Keys
-- This migration adds organization support and sequential project-based bug IDs

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- =====================================================
-- UPDATE PROJECTS TABLE
-- =====================================================
-- Add organization_id to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Add bug_counter to projects for sequential bug IDs
ALTER TABLE projects ADD COLUMN IF NOT EXISTS bug_counter INTEGER DEFAULT 0;

-- =====================================================
-- UPDATE BUGS TABLE
-- =====================================================
-- Add bug_number for sequential numbering within project
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS bug_number INTEGER;

-- Create index for faster bug lookups
CREATE INDEX IF NOT EXISTS idx_bugs_project_id ON bugs(project_id);
CREATE INDEX IF NOT EXISTS idx_bugs_bug_key ON bugs(bug_key);

-- =====================================================
-- FUNCTION: Generate Sequential Bug Key
-- =====================================================
CREATE OR REPLACE FUNCTION generate_bug_key()
RETURNS TRIGGER AS $$
DECLARE
  project_key TEXT;
  next_number INTEGER;
BEGIN
  -- If project_id is provided, use project key
  IF NEW.project_id IS NOT NULL THEN
    -- Get project key
    SELECT key INTO project_key FROM projects WHERE id = NEW.project_id;

    -- Increment bug counter and get next number
    UPDATE projects
    SET bug_counter = bug_counter + 1
    WHERE id = NEW.project_id
    RETURNING bug_counter INTO next_number;

    -- Set bug_key and bug_number
    NEW.bug_key := project_key || '-' || next_number;
    NEW.bug_number := next_number;
  ELSE
    -- No project, use generic BUG prefix with random suffix
    IF NEW.bug_key IS NULL THEN
      NEW.bug_key := 'BUG-' || SUBSTRING(uuid_generate_v4()::TEXT, 1, 8);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS generate_bug_key_trigger ON bugs;

-- Create trigger for generating bug keys
CREATE TRIGGER generate_bug_key_trigger
  BEFORE INSERT ON bugs
  FOR EACH ROW
  WHEN (NEW.bug_key IS NULL)
  EXECUTE FUNCTION generate_bug_key();

-- =====================================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- =====================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicate policy errors)
DROP POLICY IF EXISTS "Organizations viewable by authenticated users" ON organizations;
DROP POLICY IF EXISTS "Organizations manageable by authenticated users" ON organizations;
DROP POLICY IF EXISTS "Org members viewable by authenticated users" ON organization_members;
DROP POLICY IF EXISTS "Org members manageable by authenticated users" ON organization_members;

-- Organizations: Viewable by all authenticated users
CREATE POLICY "Organizations viewable by authenticated users" ON organizations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Organizations manageable by authenticated users" ON organizations
  FOR ALL TO authenticated USING (true);

-- Organization members: Viewable by all authenticated users
CREATE POLICY "Org members viewable by authenticated users" ON organization_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Org members manageable by authenticated users" ON organization_members
  FOR ALL TO authenticated USING (true);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SAMPLE DEFAULT ORGANIZATION AND PROJECT
-- =====================================================
-- Create a default organization and project for existing bugs
DO $$
DECLARE
  default_org_id UUID;
  default_project_id UUID;
  bug_rec RECORD;
  counter INTEGER := 0;
BEGIN
  -- Check if default org exists
  SELECT id INTO default_org_id FROM organizations WHERE slug = 'default';

  IF default_org_id IS NULL THEN
    -- Create default organization
    INSERT INTO organizations (name, slug, description)
    VALUES ('Default Organization', 'default', 'Default organization for existing bugs')
    RETURNING id INTO default_org_id;
  END IF;

  -- Check if default project exists
  SELECT id INTO default_project_id FROM projects WHERE key = 'BUG';

  IF default_project_id IS NULL THEN
    -- Create default project
    INSERT INTO projects (name, key, description, organization_id)
    VALUES ('Bug Tracker', 'BUG', 'Default project for bug tracking', default_org_id)
    RETURNING id INTO default_project_id;
  END IF;

  -- Update existing bugs without project_id to use default project
  -- and generate sequential bug keys
  FOR bug_rec IN
    SELECT id FROM bugs
    WHERE project_id IS NULL
    ORDER BY created_at ASC
  LOOP
    counter := counter + 1;
    UPDATE bugs
    SET project_id = default_project_id,
        bug_number = counter,
        bug_key = 'BUG-' || counter
    WHERE id = bug_rec.id;
  END LOOP;

  -- Update project bug counter
  IF counter > 0 THEN
    UPDATE projects SET bug_counter = counter WHERE id = default_project_id;
  END IF;
END $$;
