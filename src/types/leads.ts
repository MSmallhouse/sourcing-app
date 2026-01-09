// Shared types for leads
export type LeadStatus = 'submitted' | 'approved' | 'rejected' | 'picked up' | 'pending sold' | 'sold';

// Lead plus information about who submitted it
export type LeadWithProfile = Lead & { profiles?: { email: string, first_name: string, last_name: string, } };

// support updates to all columns in lead table other than id
type UpdatableLeadColumns = Omit<Lead, 'id'>;
export type UpdatedLeadData = Partial<UpdatableLeadColumns>;

export interface Lead {
  id: string;
  sourcer_id: string;
  title: string;
  purchase_price: number;
  retail_price?: number;
  condition?: string;
  address: string;
  phone: string;
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
  commission_amount?: number | null;
  commission_paid: boolean;
  dev_commission_amount?: number | null;
  dev_commission_paid: boolean;
}