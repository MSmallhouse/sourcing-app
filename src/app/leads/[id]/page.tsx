'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Lead } from '../types';

type LeadWithProfile = Lead & { profiles?: { email: string, first_name: string, last_name: string, } };

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<LeadWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Unwrap params using React.use()
  const { id } = React.use(params);

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
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!lead) return <div className="p-8">Lead not found.</div>;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">{lead.title}</h1>
      <p>Status: {lead.status}</p>
      <p>Purchase Price: ${lead.purchase_price}</p>
      <p>Notes: {lead.notes}</p>
      <p>Sourcer Email: {lead.profiles?.email ?? 'Unknown'}</p>
      <p>Sourcer Name: {lead.profiles?.first_name ?? 'Unknown'} {lead.profiles?.last_name ?? ''}</p>
      {lead.rejection_reason && (
        <p>Reason for Rejection: {lead.rejection_reason}</p>
      )}
      {lead.sale_date && (
        <p>Sold On: {new Date(lead.sale_date).toLocaleDateString()}</p>
      )}
      {lead.sale_price && (
        <p>Sale Price: ${lead.sale_price}</p>
      )}
      <button className="mt-4 text-blue-600 cursor-pointer" onClick={() => router.back()}>
        Back
      </button>
    </div>
  );
}