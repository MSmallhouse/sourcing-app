'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Lead } from './types';
import { DeleteLeadButton } from './DeleteLeadButton';
import { EditLeadButton } from './EditLeadButton';

const { data: { session } } = await supabase.auth.getSession();

export default function LeadsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Lead>>({});

  // Fetch user ID from session
  useEffect(() => {
    if (session?.user) {
      setUserId(session.user.id);
    }
  }, [session]);

  // Fetch initial leads
  useEffect(() => {
    if (!userId) return;

    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('sourcer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
      } else {
        setLeads(data);
      }
      setLoading(false);
    };
    fetchLeads();
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          const newLead = payload.new as Lead;
          const oldLead = payload.old as Lead;

          setLeads((prev) => {
            switch (payload.eventType) {
              case 'INSERT':
                if (prev.find((l) => l.id === newLead.id)) return prev;
                return [newLead, ...prev];
              case 'UPDATE':
                return prev.map((l) => (l.id === newLead.id ? newLead : l));
              case 'DELETE':
                return prev.filter((l) => l.id !== oldLead.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      // Cleanup subscription
      void channel.unsubscribe();
    };
  }, [userId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupTime || !userId) return;
  
    const [startISO, endISO] = pickupTime.split('|');
  
    // Create a Google Calendar event
    let calendarEventId: string | null = null;
    try {
      const res = await fetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, notes, startISO, endISO }),
      });
  
      const result = await res.json();
      if (result.success) {
        calendarEventId = result.eventId; // Store the calendar event ID
      } else {
        console.error('Error creating calendar event:', result.error);
      }
    } catch (err) {
      console.error('Error calling create-event API:', err);
    }
  
    // Insert the lead into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        sourcer_id: userId,
        title,
        purchase_price: parseFloat(purchasePrice),
        notes,
        pickup_time: startISO,
        calendar_event_id: calendarEventId, // Save the calendar event ID
      })
      .select()
      .single();
  
    if (error) {
      console.error('Error inserting lead:', error);
      return;
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
    setPurchasePrice('');
    setNotes('');
    setPickupTime('');
  };

  const handleEditSave = async (id: string) => {
    const { error } = await supabase
      .from('leads')
      .update({
        title: editValues.title,
        purchase_price: editValues.purchase_price,
        notes: editValues.notes,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating lead:', error);
    } else {
      setEditingId(null);
      setEditValues({});
    }
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

      <h2 className="text-xl font-bold mb-2">My Leads</h2>
      {loading ? (
        <p>Loading...</p>
      ) : leads.length === 0 ? (
        <p>No leads yet.</p>
      ) : (
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="border p-2 rounded flex flex-col space-y-1"
            >
              {editingId === lead.id ? (
                <>
                  <input
                    className="border p-1"
                    value={editValues.title ?? lead.title}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
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
                      setEditValues((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                  <div className="flex space-x-2 mt-2">
                    <EditLeadButton
                      lead={lead}
                      editValues={editValues}
                      onEditComplete={() => {
                        setEditingId(null);
                        setEditValues({});
                      }}
                    />
                    <button
                      className="bg-gray-300 px-2 py-1 rounded"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-semibold">{lead.title}</span>
                  <span>Price: ${lead.purchase_price}</span>
                  <span>Notes: {lead.notes}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(lead.created_at).toLocaleString()}
                  </span>
                  <div className="flex space-x-2 mt-2">
                    <DeleteLeadButton lead={lead} />
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => {
                        setEditingId(lead.id);
                        setEditValues(lead);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}