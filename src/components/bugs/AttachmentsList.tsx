// src/components/bugs/AttachmentsList.tsx
'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import type { Attachment } from '@/types'
import { supabase } from '@/lib/supabase/client'

interface AttachmentsListProps {
  bugId: number
}

export const AttachmentsList: FC<AttachmentsListProps> = ({ bugId }) => {
  const [files, setFiles] = useState<Attachment[]>([])

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('bug_id', bugId)
      .order('uploaded_at', { ascending: false })
    if (!error && data) setFiles(data)
  }, [bugId])

  useEffect(() => {
    load()
  }, [load])

  if (files.length === 0) {
    return <p className="text-sm text-[var(--subtext)]">No attachments</p>
  }

  return (
    <div className="space-y-2">
      {files.map((f) => (
        <a
          key={f.id}
          href={f.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[var(--accent)] hover:underline"
        >
          {f.file_name}
        </a>
      ))}
    </div>
  )
}
