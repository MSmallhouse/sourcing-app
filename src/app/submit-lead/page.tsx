'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function SubmitLeadPage() {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);

  const { userId } = useCurrentUser();

  // Fetch available slots from Google Calendar with periodic polling
  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch('/api/available-slots');
        const slots = await res.json();
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error fetching available slots:', error);
      }
    }

    // Initial fetch
    fetchSlots();

    // Set up periodic polling every 1 minute
    const interval = setInterval(() => {
      fetchSlots();
    }, 60 * 1000); // 1 minute

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

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

    // Fetch updated available slots
    try {
      const slotsRes = await fetch('/api/available-slots');
      const slots = await slotsRes.json();
      setAvailableSlots(slots);
    } catch (fetchError) {
      console.error('Error fetching updated available slots:', fetchError);
    }
  
    // Clear the form fields
    setTitle('');
    setImage(null);
    setPurchasePrice('');
    setNotes('');
    setPickupTime('');
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
         className="border p-2 w-full"
         type="file"
         accept="image/*"
         onChange={(e) => setImage(e.target.files?.[0] || null)}
         required
        />
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
        <select
          className="border p-2 w-full"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
        >
          <option value="">Select pickup time</option>
          {availableSlots.map((slot, idx) => {
            const start = new Date(slot.start);
            const end = new Date(slot.end);
            const day = start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
            const time = `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            return (
              <option key={idx} value={`${slot.start}|${slot.end}`}>
                {day}, {time}
              </option>
            );
          })}
        </select>
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