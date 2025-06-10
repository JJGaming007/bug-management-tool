'use client';

import { useEffect } from 'react';
import { useBugStore } from '@/stores/bugStore';
import { BugCard } from './BugCard';
import { BugFilters } from './BugFilters';
import { CreateBugModal } from './CreateBugModal';
import { BugDetailModal } from './BugDetailModal';

export function BugList() {
  const {
    bugs,
    fetchBugs,
    filters,
    selectedBug,
    isCreateModalOpen,
    setSelectedBug,
    setCreateModalOpen,
  } = useBugStore();

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const filteredBugs = bugs?.filter((bug) => {
    if (filters.status?.length && !filters.status.includes(bug.status)) return false;
    if (filters.priority?.length && !filters.priority.includes(bug.priority)) return false;
    if (filters.search &&
      !bug.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !bug.description.toLowerCase().includes(filters.search.toLowerCase())
    ) return false;
    return true;
  }) || [];


  return (
  <div className="px-4 py-6 space-y-6 bg-white dark:bg-gray-900 rounded shadow-md">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">All Bugs</h2>
      <CreateBugModal />
    </div>

    <BugFilters />

    <div className="grid gap-4">
      {filteredBugs.map((bug) => (
        <BugCard key={bug.id} bug={bug} onClick={() => setSelectedBug(bug)} />
      ))}
    </div>

    {filteredBugs.length === 0 && (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        No bugs found matching your filters.
      </div>
    )}

    {selectedBug && (
      <BugDetailModal
        bug={selectedBug}
        isOpen={!!selectedBug}
        onClose={() => setSelectedBug(null)}
      />
    )}
  </div>
);
}
