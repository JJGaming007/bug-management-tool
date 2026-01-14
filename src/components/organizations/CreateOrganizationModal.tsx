'use client'

import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
)

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
  </svg>
)

export default function CreateOrganizationModal({ isOpen, onClose, onSuccess }: CreateOrganizationModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (isOpen) {
      getCurrentUser()
    }
  }, [isOpen])

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugTouched && name) {
      const autoSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50)
      setSlug(autoSlug)
    }
  }, [name, slugTouched])

  async function getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser()
      setCurrentUserId(data?.user?.id ?? null)
    } catch {
      setCurrentUserId(null)
    }
  }

  function resetForm() {
    setName('')
    setSlug('')
    setDescription('')
    setSlugTouched(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Organization name is required')
      return
    }

    if (!slug.trim()) {
      toast.error('Organization slug is required')
      return
    }

    if (!currentUserId) {
      toast.error('You must be logged in to create an organization')
      return
    }

    if (!isSupabaseConfigured) {
      toast.error('Database not configured')
      return
    }

    setSubmitting(true)
    try {
      // Create the organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: name.trim(),
          slug: slug.toLowerCase().trim(),
          description: description.trim() || null,
          owner_id: currentUserId,
        })
        .select()
        .single()

      if (orgError) {
        if (orgError.code === '23505') {
          toast.error('An organization with this slug already exists')
        } else {
          throw orgError
        }
        return
      }

      // Add the creator as owner member
      if (orgData) {
        await supabase.from('organization_members').insert({
          organization_id: orgData.id,
          user_id: currentUserId,
          role: 'owner',
        })
      }

      toast.success('Organization created successfully!')
      resetForm()
      onSuccess?.()
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create organization'
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
            <BuildingIcon />
            <h2 className="modal-title">Create Organization</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group">
              <label className="input-label">
                Organization Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Acme Inc, My Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Slug <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., acme-inc, my-team"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  setSlugTouched(true)
                }}
                maxLength={50}
                disabled={submitting}
                style={{ fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                URL-friendly identifier. Auto-generated from name.
              </p>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea
                className="input"
                placeholder="Brief description of the organization..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={submitting}
              />
            </div>
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
              disabled={submitting || !name.trim() || !slug.trim()}
            >
              {submitting ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
