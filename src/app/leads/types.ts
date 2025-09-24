// Shared types for leads
export interface Lead {
  id: string;
  sourcer_id: string;
  title: string;
  purchase_price: number;
  notes: string;
  created_at: string;
  pickup_time?: string;
}