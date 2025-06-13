'use client'
import { FC, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface AttachmentUploadProps {
  bugId: number
  onUploaded: () => void
}

export const AttachmentUpload: FC<AttachmentUploadProps> = ({ bugId, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const upload = async () => {
    if (!file) return
    setLoading(true)
    // Upload to Supabase Storage
    const { data, error: upErr } = await supabase.storage
      .from('bug-attachments')
      .upload(`${bugId}/${file.name}`, file)
    if (upErr) {
      console.error(upErr)
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from('bug-attachments').getPublicUrl(data.path)
      await supabase.from('attachments').insert({
        bug_id: bugId,
        file_url: publicUrl,
        file_name: file.name,
      })
      onUploaded()
    }
    setLoading(false)
    setFile(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Add Attachment</label>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:text-black file:cursor-pointer hover:file:bg-[var(--accent-hover)]"
      />
      <button
        disabled={!file || loading}
        onClick={upload}
        className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? 'Uploading…' : 'Upload'}
      </button>
    </div>
  )
}
