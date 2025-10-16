'use client';

import { supabase } from '@/lib/supabaseClient';
import { LeadStatus, type Lead } from './types';
import { useState } from 'react';
import { type LeadWithProfile } from '@/app/leads/types';
import { updateLeadsTableAndCalendar } from '@/lib/updateLeadsTableAndCalendar';

type StatusChangeButtonProps = {
  lead: LeadWithProfile;
  setLead?: (updatedLead: LeadWithProfile) => void;
}

export function StatusChangeButton( { lead, setLead }: StatusChangeButtonProps) {
  const REJECTION_REASONS = [
    "Too expensive",
    "Too low quality",
    "Too far away",
  ];
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [saleDate, setSaleDate] = useState<string>(lead.sale_date || '');
  const [salePrice, setSalePrice] = useState<string>(lead.sale_price?.toString() || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!lead) return;
    const newStatus = e.target.value as LeadStatus;
    let updatedData: any = { status: newStatus };

    // Render the sold dialogue
    if (newStatus === 'sold') {
      setPendingStatus('sold');
      return;
    }

    // Render the rejected dialogue
    if (newStatus === 'rejected' ) {
      setPendingStatus('rejected');
      return;
    }

    // Since status isn't sold or rejected, we can clear this info
    updatedData.sale_date = null;
    updatedData.sale_price = null;
    updatedData.rejection_reason = '';

    const freshLead = await updateLeadsTableAndCalendar({ lead, updatedData })
    if (setLead && freshLead) setLead(freshLead);
  }

  const handleConfirmRejected = async() => {
    if (!rejectionReason) {
      alert('Please select a rejection reason.');
      return;
    }

    const freshLead = await updateLeadsTableAndCalendar({
      lead,
      updatedData: {
        status: 'rejected',
        rejection_reason: rejectionReason + (rejectionNotes ? `: ${rejectionNotes}` : ''),
      }
    });
    if (setLead && freshLead) setLead(freshLead);

    setPendingStatus(null);
    setRejectionReason('');
    setRejectionNotes('');
  }

  const handleConfirmSold = async () => {
    if (!saleDate || !salePrice) {
      alert('Please enter both sale date and sale price.');
      return;
    }

    const freshLead = await updateLeadsTableAndCalendar({
      lead,
      updatedData: {
        status: 'sold',
        sale_date: saleDate,
        sale_price: parseFloat(salePrice),
      }
    });
    if (setLead && freshLead) setLead(freshLead);

    setPendingStatus(null);
  }

  return (
    <div className="mb-4">
      {pendingStatus === 'rejected' ? (
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
      ) : pendingStatus === 'sold' ? (
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
      ) : (
        // default Status change UI
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
  )
}