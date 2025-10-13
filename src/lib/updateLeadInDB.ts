import { supabase } from '@/lib/supabaseClient';
import { type Lead } from '@/app/leads/types';

export async function updateLeadInDB(lead: Lead, updatedData: any) {
  const { error } = await supabase
    .from('leads')
    .update(updatedData)
    .eq('id', lead.id)

  if (error) {
    console.error('Error updating lead in database', error);
    return;
  }
}