// Shared types for leads
export type LeadStatus = 'submitted' | 'approved' | 'rejected' | 'picked up' | 'sold';

// Lead plus information about who submitted it
export type LeadWithProfile = Lead & { profiles?: { email: string, first_name: string, last_name: string, } };

export interface Lead {
  id: string;
  sourcer_id: string;
  title: string;
  purchase_price: number;
  notes: string;
  created_at: string;
  pickup_start: string;
  pickup_end: string;
  calendar_event_id: string | null;
  status: LeadStatus;
  sale_date?: string | null;
  sale_price?: number | null;
  rejection_reason?: string | null;
  image_url: string;
}