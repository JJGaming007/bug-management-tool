'use client'

import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import type { Organization } from '@/types'
import toast from 'react-hot-toast'

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

const BuildingIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
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

export default function OrganizationsPage() {
  const authContext = useAuth() as { user: { id?: string } | null } | null
  const user = authContext?.user ?? null

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
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
    fetchOrganizations()
  }, [])

  async function fetchOrganizations() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('Database not configured')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: supError } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true })

      if (supError) {
        // Table might not exist yet
        if (supError.message.includes('does not exist')) {
          setError('Organizations table not found. Please run the migration.')
        } else {
          setError(supError.message)
        }
      } else {
        setOrganizations((data as Organization[]) || [])
      }
    } catch (ex: unknown) {
      const errorMessage = ex instanceof Error ? ex.message : 'Failed to load organizations'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingOrg(null)
    setName('')
    setSlug('')
    setDescription('')
    setModalOpen(true)
  }

  function openEditModal(org: Organization) {
    setEditingOrg(org)
    setName(org.name)
    setSlug(org.slug)
    setDescription(org.description || '')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingOrg(null)
    setName('')
    setSlug('')
    setDescription('')
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    const orgSlug = slug.trim() || generateSlug(name)

    setBusy(true)
    try {
      if (editingOrg) {
        // Update
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            name: name.trim(),
            slug: orgSlug,
            description: description.trim() || null,
          })
          .eq('id', editingOrg.id)

        if (updateError) throw updateError
        toast.success('Organization updated')
      } else {
        // Create
        const { error: insertError } = await supabase.from('organizations').insert({
          name: name.trim(),
          slug: orgSlug,
          description: description.trim() || null,
          created_by: user?.id || null,
        })

        if (insertError) throw insertError
        toast.success('Organization created')
      }

      closeModal()
      fetchOrganizations()
    } catch (ex: unknown) {
      const errorMessage = ex instanceof Error ? ex.message : 'Operation failed'
      toast.error(errorMessage)
    } finally {
      setBusy(false)
    }
  }

  async function deleteOrganization(org: Organization) {
    if (!confirm(`Delete organization "${org.name}"? This will affect all associated projects.`)) return

    try {
      const { error: deleteError } = await supabase.from('organizations').delete().eq('id', org.id)
      if (deleteError) throw deleteError
      toast.success('Organization deleted')
      fetchOrganizations()
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
          <h1 className="page-title">Organizations</h1>
          <p className="page-subtitle">Manage your organizations and teams</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <PlusIcon />
          <span>New Organization</span>
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
        ) : organizations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BuildingIcon />
            </div>
            <div className="empty-state-title">No organizations yet</div>
            <div className="empty-state-description">
              Create your first organization to start managing projects and bugs.
            </div>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <PlusIcon />
              <span>Create Organization</span>
            </button>
          </div>
        ) : (
          <div style={{ padding: 0 }}>
            {organizations.map((org, index) => (
              <div
                key={org.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: index < organizations.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {org.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {org.slug}
                  </div>
                  {org.description && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {org.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openEditModal(org)}
                    title="Edit"
                  >
                    <EditIcon /> {!isMobile && 'Edit'}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteOrganization(org)}
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
                {editingOrg ? 'Edit Organization' : 'Create Organization'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Name *</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!editingOrg) setSlug(generateSlug(e.target.value))
                    }}
                    placeholder="My Organization"
                    disabled={busy}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Slug</label>
                  <input
                    className="input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-organization"
                    disabled={busy}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    URL-friendly identifier (auto-generated if empty)
                  </span>
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea
                    className="input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the organization"
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
                  {busy ? 'Saving...' : editingOrg ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
