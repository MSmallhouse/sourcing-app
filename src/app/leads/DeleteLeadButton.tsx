'use client';

import { supabase } from '@/lib/supabaseClient';
import type { Lead } from './types';

export function DeleteLeadButton({ lead }: { lead: Lead }) {
  const handleDelete = async () => {
    const { error } = await supabase.from('leads').delete().eq('id', lead.id);

    if (error) {
      console.error('Error deleting lead:', error);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-2 py-1 rounded"
    >
      Delete
    </button>
  );
}