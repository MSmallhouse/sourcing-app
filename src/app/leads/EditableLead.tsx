'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Lead } from './types';
import { uploadLeadImage, deleteLeadImage } from '@/lib/supabaseImageHelpers';
import { updateLeadAndSync } from '@/lib/updateLeadAndSync';

type EditableLeadProps = {
  lead: Lead;
  isAdmin: boolean;
};

export function EditableLead({ lead, isAdmin }: EditableLeadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<Lead>>({});
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValues({});
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setEditImageFile(null);
  };

  const handleEditSave = async () => {
    // If a new image is selected, delete the old image and upload the new one
    let newImageUrl = lead.image_url;
    if (editImageFile) {
      if (lead.image_url) await deleteLeadImage(lead.image_url);
      newImageUrl = await uploadLeadImage(editImageFile, lead.id);
    }

    await updateLeadAndSync({
      lead,
      updatedData: {
        title: editValues.title,
        purchase_price: editValues.purchase_price,
        notes: editValues.notes,
        image_url: newImageUrl,
      },
      newStatus: lead.status,
      editValues,
    });

    setIsEditing(false);
    setEditValues({});
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setEditImageFile(null);
  };

  return (
    <li className='border p-2 rounded space-y-1 flex flex-row'>
      <div className="w-[100px] h-[100px] overflow-hidden flex items-center justify-center">
        <Image
          src={lead.image_url}
          alt={lead.title}
          width={100}
          height={100}
          className='object-cover object-center'
        />
      </div>
      { isEditing ? (
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
            ref={editFileInputRef}
            type="file"
            accept="image/*"
            onChange={e => setEditImageFile(e.target.files?.[0] || null)}
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
            <button
              className="bg-yellow-500 text-white px-2 py-1 rounded cursor-pointer"
              onClick={() => {
                setIsEditing(true);
                setEditValues(lead);
              }}
            >
              Edit
            </button>
          </div>
        </>
      )}
    </li>
  );
}