
export interface Lease {
    id: string;
    org_id: string;
    site_id?: string;
    space_id?: string;
    kind?: LeaseKind
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
    frequency?: string;
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
    site_id?: string;
    name: string;
    email: string;
    phone: string;
    tenant_type: "individual" | "commercial";
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
}

export interface TenantOverview {
    totalTenants: number;
    activeTenants: number;
    commercialTenants: number;
    individualTenants: number;
}
