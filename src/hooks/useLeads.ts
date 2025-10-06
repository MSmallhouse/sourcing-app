import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Lead } from '@/app/leads/types';

export function useLeads(userId: string | null, isAdmin: boolean) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all relevant leads
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    let query = supabase.from('leads').select('*');

    // Admins should see all leads, sourcers should see only their own leads
    if (!isAdmin) {
      query = query.eq('sourcer_id', userId);
    }
    query.order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) setLeads(data);
      setLoading(false);
    });
  }, [userId, isAdmin]);

  // Subscribe to real-time changes
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

          // Only update if relevant to user (unless admin)
          if (!isAdmin && newLead?.sourcer_id !== userId && oldLead?.sourcer_id !== userId) return;

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
      void channel.unsubscribe();
    };
  }, [userId, isAdmin]);

  return { leads, loading };
}