'use client'

import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Organization } from '@/types'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
)

const ProjectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
  </svg>
)

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')
  const [organizationId, setOrganizationId] = useState<string>('')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [keyTouched, setKeyTouched] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadOrganizations()
      getCurrentUser()
    }
  }, [isOpen])

  // Auto-generate project key from name
  useEffect(() => {
    if (!keyTouched && name) {
      const autoKey = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join('')
        .slice(0, 4) || name.toUpperCase().slice(0, 4).replace(/[^A-Z0-9]/g, '')
      setKey(autoKey)
    }
  }, [name, keyTouched])

  async function getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser()
      setCurrentUserId(data?.user?.id ?? null)
    } catch {
      setCurrentUserId(null)
    }
  }

  async function loadOrganizations() {
    if (!isSupabaseConfigured) return
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true })
      if (!error && data) {
        setOrganizations(data as Organization[])
      }
    } catch (e) {
      console.error('Failed to load organizations:', e)
    }
  }

  function resetForm() {
    setName('')
    setKey('')
    setDescription('')
    setOrganizationId('')
    setKeyTouched(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Project name is required')
      return
    }

    if (!key.trim()) {
      toast.error('Project key is required')
      return
    }

    if (!currentUserId) {
      toast.error('You must be logged in to create a project')
      return
    }

    if (!isSupabaseConfigured) {
      toast.error('Database not configured')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('projects').insert({
        name: name.trim(),
        key: key.toUpperCase().trim(),
        description: description.trim() || null,
        organization_id: organizationId || null,
        created_by: currentUserId,
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('A project with this key already exists')
        } else {
          throw error
        }
        return
      }

      toast.success('Project created successfully!')
      resetForm()
      onSuccess?.()
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create project'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ProjectIcon />
            <h2 className="modal-title">Create Project</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group">
              <label className="input-label">
                Project Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Mobile App, Backend API"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Project Key <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., MOB, API"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value.toUpperCase())
                  setKeyTouched(true)
                }}
                maxLength={10}
                disabled={submitting}
                style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Short identifier for bugs (e.g., MOB-123). Auto-generated from name.
              </p>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea
                className="input"
                placeholder="Brief description of the project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={submitting}
              />
            </div>

            {organizations.length > 0 && (
              <div className="input-group">
                <label className="input-label">Organization</label>
                <select
                  className="input"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">No organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                resetForm()
                onClose()
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !name.trim() || !key.trim()}
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
