'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Lead } from './types';

type EditLeadButtonProps = {
  lead: Lead;
  // The edited values that the user has entered
  editValues: Partial<Lead>;
  // Callback to signal that editing is complete (e.g. to exit edit mode)
  onEditComplete: () => void;
};

export function EditLeadButton({ lead, editValues, onEditComplete }: EditLeadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    // Update the lead in Supabase
    const { error } = await supabase
      .from('leads')
      .update({
        title: editValues.title,
        purchase_price: editValues.purchase_price,
        notes: editValues.notes,
      })
      .eq('id', lead.id);

    if (error) {
      console.error('Error updating lead:', error);
      setLoading(false);
      return;
    }

    // If the lead has an associated Google Calendar event, update that as well
    if (lead.calendar_event_id) {
      try {
        const res = await fetch('/api/edit-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calendarEventId: lead.calendar_event_id,
            title: editValues.title,
            notes: editValues.notes,
          }),
        });
        const result = await res.json();
        if (!result.success) {
          console.error('Error updating calendar event:', result.error);
        }
      } catch (err) {
        console.error('Error calling edit-event API:', err);
      }
    }

    setLoading(false);
    onEditComplete();
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className="bg-green-500 text-white px-2 py-1 rounded"
    >
      {loading ? 'Saving...' : 'Save'}
    </button>
  );
}