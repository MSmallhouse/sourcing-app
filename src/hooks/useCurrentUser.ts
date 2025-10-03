'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function useCurrentUser() {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session }}) => {
      setSession(session);
      setUserId(session?.user?.id ?? null);
    });

    // Listen for session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, userId }
}