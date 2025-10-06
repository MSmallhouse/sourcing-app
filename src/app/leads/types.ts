// Shared types for leads
export type LeadStatus = 'submitted' | 'approved' | 'rejected' | 'picked up' | 'sold';

export interface Lead {
  id: string;
  sourcer_id: string;
  title: string;
  purchase_price: number;
  notes: string;
  created_at: string;
  pickup_time: string;
  calendar_event_id: string | null;
  status: LeadStatus;
}