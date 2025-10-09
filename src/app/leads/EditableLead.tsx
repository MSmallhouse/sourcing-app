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
  const REJECTION_REASONS = [
    "Too expensive",
    "Too low quality",
    "Too far away",
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<Lead>>({});
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [saleDate, setSaleDate] = useState<string>(lead.sale_date || '');
  const [salePrice, setSalePrice] = useState<string>(lead.sale_price?.toString() || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleEditSave = async () => {
    updateLeadInDB({
      title: editValues.title,
      purchase_price: editValues.purchase_price,
      notes: editValues.notes,
    });

    await syncCalendarEvent(lead, lead.status, lead.status, editValues);
    setIsEditing(false);
    setEditValues({});
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    let updatedData: any = { status: newStatus };

    // Render the sold dialogue
    if (newStatus === 'sold') {
      setPendingStatus('sold');
      setIsEditing(false);
      return;
    }

    // Render the rejected dialogue
    if (newStatus === 'rejected' ) {
      setPendingStatus('rejected');
      setIsEditing(false);
      return;
    }

    // Since status isn't sold or rejected, we can clear this info
    updatedData.sale_date = null;
    updatedData.sale_price = null;
    updatedData.rejection_reason = '';
    syncCalendarEvent(lead, lead.status, newStatus);
    await updateLeadInDB( updatedData )
  }

  const handleConfirmSold = async () => {
    if (!saleDate || !salePrice) {
      alert('Please enter both sale date and sale price.');
      return;
    }

    await updateLeadInDB({
      status: 'sold',
      sale_date: saleDate,
      sale_price: parseFloat(salePrice),
    });

    await syncCalendarEvent(lead, lead.status, 'sold');
    setPendingStatus(null);
  }

  const handleConfirmRejected = async() => {
    if (!rejectionReason) {
      alert('Please select a rejection reason.');
      return;
    }

    await updateLeadInDB({
        status: 'rejected',
        rejection_reason: rejectionReason + (rejectionNotes ? `: ${rejectionNotes}` : ''),
    });

    await syncCalendarEvent(lead, lead.status, 'rejected');
    setPendingStatus(null);
    setRejectionReason('');
    setRejectionNotes('');
  }

  async function syncCalendarEvent(lead: Lead, oldStatus: LeadStatus, newStatus: LeadStatus, editValues?: Partial<Lead>) {
    const wasOnCalendar = ON_CALENDAR_STATUSES.includes(oldStatus);
    const willBeOnCalendar = ON_CALENDAR_STATUSES.includes(newStatus);
    try {
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
          await updateLeadInDB({ calendar_event_id: result.eventId });
        }

      } else if (wasOnCalendar && !willBeOnCalendar) {
        // Delete calendar event
        const res = await fetch('/api/delete-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ calendarEventId: lead.calendar_event_id }),
        });
        const result = await res.json();
        if (result.success) {
          await updateLeadInDB({ calendar_event_id: null });
        }

      } else if (lead.calendar_event_id && editValues) {
        // Edit calendar event
        const res = await fetch('/api/edit-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calendarEventId: lead.calendar_event_id,
            title: editValues.title ?? lead.title,
            notes: editValues.notes ?? lead.notes,
          }),
        });
      }
    } catch (error) {
      console.error('Error syncing calenar event:', error);
    }
  }

  async function updateLeadInDB(updatedData: any) {
    const { error } = await supabase
      .from('leads')
      .update(updatedData)
      .eq('id', lead.id)

    if (error) {
      console.error('Error updating lead in database', error);
      return;
    }
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
      ) : pendingStatus === 'rejected' ? (
        <div className="flex flex-col space-y-2">
          <label>
            Rejection Reason:
            <select
              className="border p-1 ml-2"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              required
            >
              <option value="">Select reason</option>
              {REJECTION_REASONS.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </label>
          <label>
            Extra Notes (optional):
            <input
              type="text"
              className="border p-1 ml-2"
              value={rejectionNotes}
              onChange={e => setRejectionNotes(e.target.value)}
            />
          </label>
          <div className="flex space-x-2 mt-2">
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={handleConfirmRejected}
            >
              Confirm Rejection
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
              onClick={handleEditSave}
            >
              Save
            </button>
            <button
              className="bg-gray-300 px-2 py-1 rounded"
              onClick={handleEditCancel}
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