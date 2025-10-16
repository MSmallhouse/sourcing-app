'use client';

import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { type LeadWithProfile, type Lead } from '../types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { DeleteLeadButton } from '../DeleteLeadButton';
import { updateLeadsTableAndCalendar } from '@/lib/updateLeadsTableAndCalendar';
import { uploadLeadImage, deleteLeadImage } from '@/lib/supabaseImageHelpers';
import { formatDatestring } from '@/lib/formatDatestring'
import { PickupTimeSelect } from '@/components/PickupTimeSelect';
import { StatusChangeButton } from '../StatusChangeButton';

type LeadEditValues = Partial<Omit<Lead, 'purchase_price' | 'projected_sale_price'>>
  & {
    purchase_price?: string;
    projected_sale_price?: string;
  };

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<LeadWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<LeadEditValues>({});
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { userId, isAdmin } = useCurrentUser();
  const router = useRouter();
  const { id } = React.use(params);

  // grab the lead as well as profile info attached to who submitted it
  useEffect(() => {
    async function fetchLead() {
      const { data, error } = await supabase
        .from('leads')
        .select('*, profiles(email, first_name, last_name)')
        .eq('id', id)
        .single();
      if (error) {
        setLead(null);
      } else {
        setLead(data);
      }
      setLoading(false);
    }
    fetchLead();
  
    // Subscribe to changes for this lead
    const channel = supabase
      .channel('lead-single')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${id}`,
        },
        payload => {
          fetchLead();
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValues({});
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setEditImageFile(null);
  };

  const handleEditSave = async () => {
    if (!lead) return;
    // If a new image is selected, delete the old image and upload the new one
    let newImageUrl = lead.image_url;
    if (editImageFile) {
      if (lead.image_url) await deleteLeadImage(lead.image_url);
      newImageUrl = await uploadLeadImage(editImageFile, lead.id);
    }

    const freshLead = await updateLeadsTableAndCalendar({
      lead,
      updatedData: {
        title: editValues.title,
        purchase_price:
          editValues.purchase_price === undefined
            ? 0
            : Number(editValues.purchase_price),
        projected_sale_price:
          editValues.projected_sale_price === undefined
            ? 0
            : Number(editValues.projected_sale_price),
        address: editValues.address,
        phone: editValues.phone,
        notes: editValues.notes,
        image_url: newImageUrl,
        pickup_start: editValues.pickup_start ?? lead.pickup_start,
        pickup_end: editValues.pickup_end ?? lead.pickup_end,
      },
    });

    if (freshLead) setLead(freshLead);
    setIsEditing(false);
    setEditValues({});
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setEditImageFile(null);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!lead) return <div className="p-8">Lead not found.</div>;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <div className="w-full aspect-square overflow-hidden flex mb-6 relative">
        <Image
          src={lead.image_url}
          alt={lead.title}
          className='object-cover object-center'
          fill
          priority
        />
      </div>

      {isEditing && (
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            ref={editFileInputRef}
            style={{ display: 'none' }}
            onChange={e => setEditImageFile(e.target.files?.[0] || null)}
            id="edit-image-input"
          />
          <label htmlFor="edit-image-input">
            <button
              type="button"
              className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => editFileInputRef.current?.click()}
            >
              {"Change Image File"}
            </button>
          </label>
          <span className="ml-2 text-gray-600">
            {editImageFile ? editImageFile.name : ''}
          </span>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? (
          <input
            className="border p-1"
            value={editValues.title ?? lead.title}
            onChange={ e =>setEditValues(prev => ({ ...prev, title: e.target.value })) }
            style={{ width: 200 }}
          />
        ) : (
          lead.title
        )}
      </h1>

      {isAdmin ? (
        <StatusChangeButton lead={lead} setLead={setLead} />
      ) : (
        <p><span className="font-bold">Status:</span> {lead.status}</p>
      )}

      <p>
        <span className="font-bold">Purchase Price: </span>
        {isEditing ? (
          <input
            className="border p-1"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={editValues.purchase_price ?? ''}
            onChange={e => {
              // Only allow numbers or empty string
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setEditValues(prev => ({ ...prev, purchase_price: val }));
              }
            }}
          />
        ) : (
          <>${lead.purchase_price}</>
        )}
      </p>

      <p>
        <span className="font-bold">Projected Sale Price: </span>
        {isEditing ? (
          <input
            className="border p-1"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={editValues.projected_sale_price ?? ''}
            onChange={e => {
              // Only allow numbers or empty string
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setEditValues(prev => ({ ...prev, projected_sale_price: val }));
              }
            }}
          />
        ) : (
          <>${lead.projected_sale_price}</>
        )}
      </p>

      <p>
        <span className="font-bold">Address: </span>
        {isEditing ? (
          <input
            className="border p-1"
            value={editValues.address?? lead.address}
            onChange={ e =>setEditValues(prev => ({ ...prev, address: e.target.value })) }
            style={{ width: 200 }}
          />
        ) : (
          lead.address
        )}
      </p>

      <p>
        <span className="font-bold">Phone Number: </span>
        {isEditing ? (
          <input
            className="border p-1"
            value={editValues.phone?? lead.phone}
            type="tel"
            pattern="[\d\s\-\+\(\)]*"
            onChange={e => {
              // Only allow numbers
              const val = e.target.value;
              if (/^[\d\s\-+()]*$/.test(val)) {
                setEditValues(prev => ({ ...prev, phone: val }));
              }
            }}
            style={{ width: 200 }}
          />
        ) : (
          lead.phone
        )}
      </p>

      <p>
        <span className="font-bold">Notes: </span>
        {isEditing ? (
          <input
            className="border p-1"
            value={editValues.notes ?? lead.notes}
            onChange={ e =>setEditValues(prev => ({ ...prev, notes: e.target.value })) }
            style={{ width: 200 }}
          />
        ) : (
          lead.notes
        )}
      </p>

      {isEditing ? (
        <PickupTimeSelect
          value={
            editValues.pickup_start && editValues.pickup_end
              ? `${editValues.pickup_start}|${editValues.pickup_end}`
              : `${lead.pickup_start}|${lead.pickup_end}`
          }
          onChange={val => {
            const [start, end] = val.split('|');
            setEditValues(prev => ({
              ...prev,
              pickup_start: start,
              pickup_end: end,
            }));
          }}
          lead={lead}
        />
      ) : (
        <>
          <p><span className="font-bold">Pickup Start:</span> {formatDatestring(lead.pickup_start)}</p>
          <p><span className="font-bold">Pickup End:</span> {formatDatestring(lead.pickup_end)}</p>
        </>
      )}
      <p><span className="font-bold">Sourcer Email:</span> {lead.profiles?.email ?? 'Unknown'}</p>
      <p><span className="font-bold">Sourcer Name:</span> {lead.profiles?.first_name ?? 'Unknown'} {lead.profiles?.last_name ?? ''}</p>
      {lead.rejection_reason && (
        <p><span className="font-bold">Reason for Rejection:</span> {lead.rejection_reason}</p>
      )}
      {lead.sale_date && (
        <p><span className="font-bold">Sold On:</span> {new Date(lead.sale_date).toLocaleDateString()}</p>
      )}
      {lead.sale_price && (
        <p><span className="font-bold">Sale Price:</span> ${lead.sale_price}</p>
      )}
      <p><span className="font-bold">Submission Timestamp:</span> {formatDatestring(lead.created_at)}</p>

      <div>
        {isEditing ? (
          <>
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
          <div className="flex space-x-2 mt-2">
            <button
              className="bg-yellow-500 text-white px-2 py-1 rounded cursor-pointer"
              onClick={() => {
                setIsEditing(true);
                setEditValues({
                  ...lead,
                  purchase_price: lead.purchase_price?.toString() ?? '',
                  projected_sale_price: lead.projected_sale_price?.toString() ?? '',
                });
              }}
            >
              Edit
            </button>
            <DeleteLeadButton lead={lead} />
          </div>
        )}
        <button className="mt-4 text-blue-600 cursor-pointer" onClick={() => router.back()}>
          Back
        </button>
      </div>
  </div>
  );
}