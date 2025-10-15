'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation'
import { PickupTimeSelect } from '@/components/PickupTimeSelect';

export default function SubmitLeadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  const { userId } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadLeadImage(file: File, leadId: string) {
    const filePath = `leads/${leadId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('lead-images')
      .upload(filePath, file);
  
    if (error) throw error;
  
    const { data: urlData } = supabase.storage
      .from('lead-images')
      .getPublicUrl(filePath);
  
    return urlData.publicUrl;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupTime || !userId) return;
  
    const [startISO, endISO] = pickupTime.split('|');
  
    // Insert the lead into Supabase
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        sourcer_id: userId,
        title,
        purchase_price: parseFloat(purchasePrice),
        notes,
        pickup_start: startISO,
        pickup_end: endISO,
        status: 'submitted',
      })
      .select()
      .single();
  
    if (error) {
      console.error('Error inserting lead:', error);
      return;
    }

    // Upload image
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadLeadImage(image, lead.id);
      await supabase
      .from('leads')
      .update({ image_url: imageUrl })
      .eq('id', lead.id);
    }

    // Clear the form fields
    setTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImage(null);
    setPurchasePrice('');
    setNotes('');
    setPickupTime('');

    router.push('/dashboard');
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit a Lead</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          className="border p-2 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => setImage(e.target.files?.[0] || null)}
          required
        />
        <button
          type="button"
          className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? "Change File" : "Choose File"}
        </button>
        <span className="ml-2 text-gray-600">
          {image ? image.name : "No file chosen"}
        </span>
        <input
          className="border p-2 w-full"
          placeholder="Purchase Price"
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          required
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <PickupTimeSelect
          value={pickupTime}
          onChange={setPickupTime}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}