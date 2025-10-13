'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import type { Lead } from '../types';
import { formatDatestring } from '@/lib/formatDatestring'

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
      <div className="w-full aspect-square overflow-hidden flex mb-6">
        <Image
          src={lead.image_url}
          alt={lead.title}
          width={400}
          height={400}
          className='object-cover object-center'
        />
      </div>
      <h1 className="text-2xl font-bold mb-4">{lead.title}</h1>
      <p><span className="font-bold">Status:</span> {lead.status}</p>
      <p><span className="font-bold">Purchase Price:</span> ${lead.purchase_price}</p>
      <p><span className="font-bold">Notes:</span> {lead.notes}</p>
      <p><span className="font-bold">Pickup Start:</span> {formatDatestring(lead.pickup_start)}</p>
      <p><span className="font-bold">Pickup End:</span> {formatDatestring(lead.pickup_end)}</p>
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
      <button className="mt-4 text-blue-600 cursor-pointer" onClick={() => router.back()}>
        Back
      </button>
    </div>
  );
}