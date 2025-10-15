import { syncCalendarEvent } from '@/lib/syncCalendarEvent';
import { updateLeadInDB } from '@/lib/updateLeadInDB';
import { supabase } from '@/lib/supabaseClient';
import { type LeadWithProfile, LeadStatus } from '@/app/leads/types';

export async function updateLeadAndSync({
  lead,
  updatedData,
  newStatus,
}: {
  lead: LeadWithProfile;
  updatedData: any;
  newStatus: LeadStatus;
}): Promise<LeadWithProfile | null> {
  await syncCalendarEvent(lead, lead.status, newStatus);
  await updateLeadInDB(lead, updatedData);

  // Refetch the full lead with profile info
  const { data } = await supabase
    .from('leads')
    .select('*, profiles(email, first_name, last_name)')
    .eq('id', lead.id)
    .single();

  return data ?? null;
}