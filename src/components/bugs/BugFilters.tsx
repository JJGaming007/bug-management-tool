'use client';

import { useBugStore } from '@/stores/bugStore';

const statusOptions = ['Open', 'Todo', 'In Progress', 'Dev Complete', 'QA Verified', 'Closed', 'Reopened'];
const priorityOptions = ['Low', 'Medium', 'High'];
const assigneeOptions = []; // If you have user data, populate it dynamically

export function BugFilters() {
  const { filters, setFilters, clearFilters } = useBugStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleSelectChange = (field: 'status' | 'priority', values: string[]) => {
    setFilters({ ...filters, [field]: values });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <input
        type="text"
        placeholder="Search bugs..."
        value={filters.search || ''}
        onChange={handleInputChange}
        className="border rounded px-3 py-2"
      />

      <select
        multiple
        value={filters.status || []}
        onChange={(e) => handleSelectChange('status', Array.from(e.target.selectedOptions, o => o.value))}
        className="border rounded px-3 py-2"
      >
        {statusOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <select
        multiple
        value={filters.priority || []}
        onChange={(e) => handleSelectChange('priority', Array.from(e.target.selectedOptions, o => o.value))}
        className="border rounded px-3 py-2"
      >
        {priorityOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <button onClick={clearFilters} className="bg-gray-200 text-sm px-3 py-2 rounded hover:bg-gray-300">
        Clear Filters
      </button>
    </div>
  );
}
