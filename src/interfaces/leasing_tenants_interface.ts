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
  contact_info?: {
    name: string;
    email: string;
    phone: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  legal_name?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
  tenant_leases?: Lease[];
  tenant_spaces?: SpaceTenants[];
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
