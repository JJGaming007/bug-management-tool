'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const supabase = createClient();

export function CreateBugModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('low');
  const [status, setStatus] = useState('Open');
  const [component, setComponent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('❌ Unable to get current user.');
      setLoading(false);
      return;
    }

    const bugKey = `BUG-${Date.now()}`;

    const { data, error } = await supabase
      .from('bugs')
      .insert({
        bug_key: bugKey,
        title,
        description,
        severity,
        status,
        component: component || null,
        reporter_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error('Bug creation failed:', error);
      alert('❌ Failed to create bug: ' + error.message);
      return;
    }

    if (data) {
      alert('✅ Bug created successfully!');
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setSeverity('low');
      setStatus('Open');
      setComponent('');
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ New Bug</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Bug">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            label="Component (optional)"
            value={component}
            onChange={(e) => setComponent(e.target.value)}
          />
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Open">Open</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Dev Complete">Dev Complete</option>
              <option value="QA Verified">QA Verified</option>
              <option value="Closed">Closed</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Bug'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
