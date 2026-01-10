'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/types/leads';
import { deleteLeadImage } from '@/lib/supabaseImageHelpers';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function DeleteLeadButton({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    await deleteLeadImage(lead.image_url);

    // Delete the lead from the database
    const { error: leadError } = await supabase
      .from('leads')
      .delete()
      .eq('id', lead.id);

    if (leadError) {
      console.error('Error deleting lead:', leadError);
      setIsDeleting(false);
      return;
    }

    // Only attempt to delete the calendar event if it exists on the calendar
    if (lead.calendar_event_id) {
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
    }

    setIsDeleting(false);
    router.push('/dashboard');
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="destructive"
        className="dark:hover:bg-destructive/45"
      >
        Delete
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this lead? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="dark:hover:bg-destructive/45"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}