'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { useAuth } from '@/hooks/useAuth'

export function CreateBugModal({ isOpen, onClose, onCreate }: any) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('bugs').insert({
      title,
      description,
      reporter: user?.email,
    })
    setTitle('')
    setDescription('')
    onCreate()
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Create Bug
          </Dialog.Title>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">Title</label>
              <Input value={title} onChange={setTitle} required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">Description</label>
              <TextArea value={description} onChange={setDescription} rows={3} required />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Create</Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
