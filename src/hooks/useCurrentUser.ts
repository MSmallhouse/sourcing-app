'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useCurrentUser() {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user role from profiles table when userId changes
  useEffect(() => {
    if (!userId) {
      setUserRole(null);
      return;
    }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        setUserRole(data?.role ?? null);
      });
  }, [userId]);

  const isAdmin = userRole === 'admin';
  return { userId, isAdmin };
}