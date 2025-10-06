/*
 * DeleteLeadButton Component
 *
 * This component handles the deletion of an individual lead.
 * When the user clicks the "Delete" button, it removes the lead from Supabase
 * and then calls the /api/delete-event endpoint to delete the corresponding
 * Google Calendar event associated with that lead.
 *
 * The component relies on Supabase's real-time subscriptions to update the UI,
 * ensuring that deletion is reflected across all clients.
 */

'use client';

import { supabase } from '@/lib/supabaseClient';
import type { Lead } from './types';

type DeleteLeadButtonProps = {
  lead: Lead;
};

export function DeleteLeadButton({ lead }: DeleteLeadButtonProps) {
  const handleDelete = async () => {
    // Delete the lead from the database
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', lead.id);

    if (error) {
      console.error('Error deleting lead:', error);
      return;
    }

    // Only attempt to delete the calendar event if it exists on the calendar
    if (!lead.calendar_event_id) return;

    // Delete the corresponding Google Calendar event
    try {
      const res = await fetch('/api/delete-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarEventId: lead.calendar_event_id }),
      });

      const result = await res.json();
      if (!result.success) {
        console.error('Error deleting calendar event:', result.error);
      }
    } catch (err) {
      console.error('Error calling delete-event API:', err);
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