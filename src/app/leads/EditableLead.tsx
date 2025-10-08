/*
 * EditableLead Component
 *
 * This component displays an individual lead and provides full edit functionality.
 * In view mode, it shows the lead's details along with "Edit" and "Delete" buttons.
 * When editing is activated, it switches to edit mode, displaying input fields for title,
 * purchase price, and notes alongside "Save" and "Cancel" buttons.
 *
 * When the lead is updated, it saves changes to Supabase and, if a Google Calendar event is linked,
 * it also updates the event via the /api/edit-event endpoint.
 *
 * The component leverages the DeleteLeadButton component for handling deletions.
 */

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { LeadStatus, type Lead } from './types';
import { DeleteLeadButton } from './DeleteLeadButton';

const ON_CALENDAR_STATUSES: LeadStatus[] = ['approved', 'picked up', 'sold'];

type EditableLeadProps = {
  lead: Lead;
  isAdmin: boolean;
};

export function EditableLead({ lead, isAdmin }: EditableLeadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<Lead>>({});
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [saleDate, setSaleDate] = useState<string>(lead.sale_date || '');
  const [salePrice, setSalePrice] = useState<string>(lead.sale_price?.toString() || '');

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleSave = async () => {
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
      return;
    }

    // If the lead has an associated Google Calendar event, update it too.
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

    setIsEditing(false);
    setEditValues({});
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    const wasOnCalendar = ON_CALENDAR_STATUSES.includes(lead.status);
    const willBeOnCalendar = ON_CALENDAR_STATUSES.includes(newStatus);

    if (newStatus === 'sold') {
      setPendingStatus('sold');
      setIsEditing(false); // Exit edit mode if open
      return;
    }

    // If changing from sold to any other status, clear sale info
    const updateData: any = { status: newStatus };
    if (lead.status === 'sold') {
      updateData.sale_date = null;
      updateData.sale_price = null;
    }

    // Update the lead in Supabase
    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', lead.id);

    if (error) {
      console.error('Error updating lead:', error);
      return;
    }

    if (!wasOnCalendar && willBeOnCalendar) {
      // Create calendar event
      const res = await fetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lead.title,
          notes: lead.notes,
          startISO: lead.pickup_start,
          endISO: lead.pickup_end,
        }),
      });
      const result = await res.json();
      if (result.success && result.eventId) {
        // Save the calendar event ID to the lead
        await supabase
          .from('leads')
          .update({ calendar_event_id: result.eventId })
          .eq('id', lead.id);
      }

    } else if (wasOnCalendar && !willBeOnCalendar) {
      // Delete calendar event
      await fetch('/api/delete-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarEventId: lead.calendar_event_id }),
      });
      // Remove the calendar_event_id from the lead
      await supabase
        .from('leads')
        .update({ calendar_event_id: null })
        .eq('id', lead.id);
    }
  }

  const handleConfirmSold = async () => {
    if (!saleDate || !salePrice) {
      alert('Please enter both sale date and sale price.');
      return;
    }

    // Update lead in Supabase
    const { error } = await supabase
      .from('leads')
      .update({
        status: 'sold',
        sale_date: saleDate,
        sale_price: parseFloat(salePrice),
      })
      .eq('id', lead.id);

    if (error) {
      console.error('Error updating lead:', error);
      return;
    }
    setPendingStatus(null);
  }

  return (
    <li className='border p-2 rounded space-y-1 flex flex-col'>
      {pendingStatus === 'sold' ? (
        <div className="flex flex-col space-y-2">
          <label>
            Sale Date:
            <input
              type="date"
              className="border p-1 ml-2"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              required
            />
          </label>
          <label>
            Sale Price:
            <input
              type="number"
              className="border p-1 ml-2"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              required
            />
          </label>
          <div className="flex space-x-2 mt-2">
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={handleConfirmSold}
            >
              Confirm Sold
            </button>
            <button
              className="bg-gray-300 px-2 py-1 rounded"
              onClick={() => setPendingStatus(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : isEditing ? (
        <>
          <input
            className="border p-1"
            value={editValues.title ?? lead.title}
            onChange={(e) =>
              setEditValues((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <input
            className="border p-1"
            type="number"
            value={editValues.purchase_price ?? lead.purchase_price}
            onChange={(e) =>
              setEditValues((prev) => ({
                ...prev,
                purchase_price: parseFloat(e.target.value),
              }))
            }
          />
          <textarea
            className="border p-1"
            value={editValues.notes ?? lead.notes}
            onChange={(e) =>
              setEditValues((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
          <div className="flex space-x-2 mt-2">
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="bg-gray-300 px-2 py-1 rounded"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col">
            <Link href={`/leads/${lead.id}`} className='hover:underline flex flex-col'>
              <span className="font-semibold">{lead.title}</span>
            </Link>
            <Link href={`/leads/${lead.id}`} className='hover:underline flex flex-col'>
              <span>Price: ${lead.purchase_price}</span>
            </Link>
            <Link href={`/leads/${lead.id}`} className='hover:underline flex flex-col'>
              <span>Notes: {lead.notes}</span>
            </Link>
            <span className="text-gray-500 text-sm">
              {new Date(lead.created_at).toLocaleString()}
            </span>
            {/* Show sale info if sold */}
            {lead.status === 'sold' && (
              <div className="text-green-700 text-sm mt-1">
                <div>Sold on: {lead.sale_date ? new Date(lead.sale_date).toLocaleDateString() : 'N/A'}</div>
                <div>Sale Price: {lead.sale_price ? `$${lead.sale_price}` : 'N/A'}</div>
              </div>
            )}
          </div>
          <div className="flex space-x-2 mt-2">
            <DeleteLeadButton lead={lead} />
            <button
              className="bg-yellow-500 text-white px-2 py-1 rounded cursor-pointer"
              onClick={() => {
                setIsEditing(true);
                setEditValues(lead);
              }}
            >
              Edit
            </button>
            {isAdmin && (
              <>
                <label>Status:</label>
                <select
                  value={lead.status}
                  onChange={handleStatusChange}
                  className='cursor-pointer'>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="picked up">Picked Up</option>
                  <option value="sold">Sold</option>
                </select>
              </>
            )}
          </div>
        </>
      )}
    </li>
  );
}