import { BackendAttachment } from "@/helpers/attachmentHelper";

export interface Lease {
  id: string;
  org_id: string;
  lease_number?: string;
  site_id?: string;
  building_id?: string;
  building_block_id?: string;
  space_id?: string;
  space_name?: string;
  kind?: LeaseKind;
  partner_id?: string;
  tenant_id?: string;
  tenant_name: string;
  start_date?: string;
  end_date?: string;
  rent_amount?: number;
  deposit_amount?: number;
  cam_rate?: number;
  utilities?: Record<string, any>;
  status?: "active" | "expired" | "terminated" | "draft";
  created_at?: string;
  updated_at?: string;
  space_code?: string;
  site_name?: string;
  building_name?: string;
  frequency?: string;
  default_payer?: string;
  is_system?: boolean;
  auto_move_in_space_occupancy?: boolean;
  lease_term_duration?: number;
  lease_frequency?: string;
  number_of_installments?: number;
  payment_terms?: PaymentTerm[];
  attachments?: BackendAttachment[];
}


export interface PaymentTerm {
  id?: string;
  description?: string;
  payment_method?: string;
  reference_no?: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
}


export interface LeaseOverview {
  activeLeases: number;
  monthlyRentValue: number;
  expiringSoon: number;
  avgLeaseTermMonths: number;
}

export type LeaseKind = "commercial" | "residential" | undefined;

export interface Tenant {
  id?: string;
  org_id?: string;
  name: string;
  email: string;
  phone: string;
  kind: "residential" | "commercial";
  status: "active" | "inactive" | "suspended";
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  legal_name?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
  tenant_leases?: Lease[];
  tenant_spaces?: SpaceTenants[];
  family_info?: Array<{
    member?: string;
    relation?: string;
  }>;
  vehicle_info?: Array<{
    type?: string;
    number?: string;
  }>;
}

export interface SpaceTenants {
  site_id?: string;
  site_name?: string;
  building_block_id?: string;
  building_block_name?: string;
  space_id?: string;
  space_name?: string;
  status: string;
}

export interface TenantOverview {
  totalTenants: number;
  activeTenants: number;
  commercialTenants: number;
  individualTenants: number;
}


export interface LeaseCharge {
  id: string;
  lease_id: string;
  charge_code_id: string;
  charge_code: string;
  period_start: string; // ISO date
  period_end: string; // ISO date
  amount: number;
  tax_pct: number;
  invoice_status?: string;
  lease_start?: string;
  lease_end?: string;
  rent_amount?: number;
  period_days?: number;
  tax_amount?: number;
  total_amount?: number;
  metadata?: any;
  created_at?: string;
  tenant_name: string;
  site_id: string;
  building_block_id?: string;
  site_name: string;
  space_name: string;
  building_block: string;
  tax_code_id?: string;
  payer_type?: string;
}