'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useBugStore } from '@/stores/bugStore';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const supabase = createClient();

export function BugDetailModal({ bug, isOpen, onClose }: any) {
  const { fetchBugs } = useBugStore();
  const [title, setTitle] = useState(bug.title);
  const [description, setDescription] = useState(bug.description);
  const [status, setStatus] = useState(bug.status);
  const [priority, setPriority] = useState(bug.priority?.toLowerCase() || 'medium');
  const [assigneeId, setAssigneeId] = useState(bug.assignee_id || '');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('id, email');
      if (!error && data) setUsers(data);
      else console.error('Failed to fetch profiles:', error?.message);
    };
    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('bugs')
        .update({
          title,
          description,
          status,
          priority: priority.toLowerCase(),
          assignee_id: assigneeId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bug.id);

      if (error) {
        alert('❌ Failed to update bug: ' + error.message);
        return;
      }

      await fetchBugs();
      alert('✅ Bug updated!');
      onClose();
    } catch (err: any) {
      alert('❌ Save failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this bug?');
    if (!confirmDelete) return;

    try {
      setLoading(true);
      console.log('🔍 Attempting to delete bug with ID:', bug.id);

      const { error } = await supabase
        .from('bugs')
        .delete()
        .eq('id', bug.id);

      if (error) {
        alert('❌ Failed to delete bug: ' + error.message);
        return;
      }

      alert('🗑️ Bug deleted');
      useBugStore.setState({ selectedBug: null });
      await fetchBugs();
      onClose();
    } catch (err: any) {
      alert('❌ Delete failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bug Details">
      <div className="space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div>
          <label className="block text-sm mb-1 font-medium">Status</label>
          <select
            className="w-full border rounded px-2 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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

        <div>
          <label className="block text-sm mb-1 font-medium">Priority</label>
          <select
            className="w-full border rounded px-2 py-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value.toLowerCase())}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Assignee</label>
          <select
            className="w-full border rounded px-2 py-2"
            value={assigneeId || ''}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
