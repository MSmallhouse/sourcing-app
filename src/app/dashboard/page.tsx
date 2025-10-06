'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Lead } from '@/app/leads/types';
import { EditableLead } from '@/app/leads/EditableLead';
import useCurrentUser from '@/hooks/useCurrentUser';


export default function dashboardPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);

  const { userId, session } = useCurrentUser();

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
          const oldLead = payload.old as Lead;
          const newLead = payload.new as Lead;
          // verify lead was submitted by current user
          if (newLead.sourcer_id !== userId) return;

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

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">My Leads</h2>
      {loading ? ( <p>Loading...</p> ) :
        leads.length === 0 ? ( <p>No leads yet.</p> ) : (
          <ul className="space-y-2">
            {leads.map((lead) => (
              <EditableLead key={lead.id} lead={lead} />
            ))}
          </ul>
      )}
    </div>
  )
}