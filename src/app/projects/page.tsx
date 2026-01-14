'use client'

import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import type { Project, Organization } from '@/types'
import toast from 'react-hot-toast'

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

const FolderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

export default function ProjectsPage() {
  const authContext = useAuth() as { user: { id?: string } | null } | null
  const user = authContext?.user ?? null

  const [projects, setProjects] = useState<Project[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchProjects()
    fetchOrganizations()
  }, [])

  async function fetchProjects() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('Database not configured')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: supError } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true })

      if (supError) {
        setError(supError.message)
      } else {
        setProjects((data as Project[]) || [])
      }
    } catch (ex: unknown) {
      const errorMessage = ex instanceof Error ? ex.message : 'Failed to load projects'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrganizations() {
    try {
      const { data } = await supabase.from('organizations').select('*').order('name', { ascending: true })
      setOrganizations((data as Organization[]) || [])
    } catch {
      // ignore
    }
  }

  function openCreateModal() {
    setEditingProject(null)
    setName('')
    setKey('')
    setDescription('')
    setOrganizationId(organizations.length > 0 ? organizations[0].id : null)
    setModalOpen(true)
  }

  function openEditModal(project: Project) {
    setEditingProject(project)
    setName(project.name)
    setKey(project.key)
    setDescription(project.description || '')
    setOrganizationId(project.organization_id || null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingProject(null)
    setName('')
    setKey('')
    setDescription('')
    setOrganizationId(null)
  }

  function generateKey(name: string): string {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '')
      .slice(0, 6)
  }

  function getOrgName(orgId?: string | null): string {
    if (!orgId) return 'None'
    const org = organizations.find((o) => o.id === orgId)
    return org?.name || 'Unknown'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!key.trim()) {
      toast.error('Project key is required')
      return
    }

    setBusy(true)
    try {
      if (editingProject) {
        // Update
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            name: name.trim(),
            key: key.trim().toUpperCase(),
            description: description.trim() || null,
            organization_id: organizationId || null,
          })
          .eq('id', editingProject.id)

        if (updateError) throw updateError
        toast.success('Project updated')
      } else {
        // Create
        const { error: insertError } = await supabase.from('projects').insert({
          name: name.trim(),
          key: key.trim().toUpperCase(),
          description: description.trim() || null,
          organization_id: organizationId || null,
          created_by: user?.id || null,
        })

        if (insertError) throw insertError
        toast.success('Project created')
      }

      closeModal()
      fetchProjects()
    } catch (ex: unknown) {
      const errorMessage = ex instanceof Error ? ex.message : 'Operation failed'
      toast.error(errorMessage)
    } finally {
      setBusy(false)
    }
  }

  async function deleteProject(project: Project) {
    if (!confirm(`Delete project "${project.name}"? This will affect all associated bugs.`)) return

    try {
      const { error: deleteError } = await supabase.from('projects').delete().eq('id', project.id)
      if (deleteError) throw deleteError
      toast.success('Project deleted')
      fetchProjects()
    } catch (ex: unknown) {
      const errorMessage = ex instanceof Error ? ex.message : 'Failed to delete'
      toast.error(errorMessage)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your projects and their bug tracking</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <PlusIcon />
          <span>New Project</span>
        </button>
      </div>

      {/* Content */}
      <div className="card">
        {loading ? (
          <div className="card-body">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '12px' }} />
            ))}
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="alert alert-error">{error}</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FolderIcon />
            </div>
            <div className="empty-state-title">No projects yet</div>
            <div className="empty-state-description">
              Create your first project to start tracking bugs with organized IDs like PROJ-1.
            </div>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <PlusIcon />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div style={{ padding: 0 }}>
            {projects.map((project, index) => (
              <div
                key={project.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: index < projects.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {project.name}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'monospace',
                    }}>
                      {project.key}
                    </span>
                  </div>
                  {project.organization_id && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Organization: {getOrgName(project.organization_id)}
                    </div>
                  )}
                  {project.description && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {project.description}
                    </div>
                  )}
                  {project.bug_counter !== undefined && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {project.bug_counter} bug{project.bug_counter !== 1 ? 's' : ''} created
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openEditModal(project)}
                    title="Edit"
                  >
                    <EditIcon /> {!isMobile && 'Edit'}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteProject(project)}
                    title="Delete"
                  >
                    <TrashIcon /> {!isMobile && 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            style={{
              maxWidth: isMobile ? '100%' : '500px',
              margin: isMobile ? '0' : '20px',
              borderRadius: isMobile ? '0' : 'var(--radius-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {organizations.length > 0 && (
                  <div className="input-group">
                    <label className="input-label">Organization</label>
                    <select
                      className="input"
                      value={organizationId ?? ''}
                      onChange={(e) => setOrganizationId(e.target.value || null)}
                      disabled={busy}
                    >
                      <option value="">None</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Name *</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!editingProject) setKey(generateKey(e.target.value))
                    }}
                    placeholder="My Project"
                    disabled={busy}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Project Key *</label>
                  <input
                    className="input"
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                    placeholder="PROJ"
                    maxLength={10}
                    disabled={busy}
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Bug IDs will be generated as: {key || 'PROJ'}-1, {key || 'PROJ'}-2, etc.
                  </span>
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea
                    className="input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the project"
                    rows={3}
                    disabled={busy}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving...' : editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
