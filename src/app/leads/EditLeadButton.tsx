'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Lead } from './types';

export function EditLeadButton({ lead }: { lead: Lead }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(lead.title);
  const [price, setPrice] = useState(lead.purchase_price.toString());
  const [notes, setNotes] = useState(lead.notes ?? '');

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('leads')
      .update({
        title,
        purchase_price: parseFloat(price),
        notes,
      })
      .eq('id', lead.id);

    if (error) {
      console.error('Error updating lead:', error);
    } else {
      setIsOpen(false); // close modal on success
    }
  };

  return (
    <>
      <button
        className="text-blue-500 hover:underline"
        onClick={() => setIsOpen(true)}
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Lead</h2>
            <div className="space-y-3">
              <input
                className="border p-2 w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="border p-2 w-full"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <textarea
                className="border p-2 w-full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}