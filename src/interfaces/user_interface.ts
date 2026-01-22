
export interface User {
    id: string;
    org_id: string;
    full_name: string;
    email: string;
    phone?: string;
    status: string;
    created_at: string;
    updated_at: string;
    accounts: UserAccount[]
}

export interface TenantSpace {
    site_id: string;
    site_name?: string;
    building_block_id?: string;
    building_block_name?: string;
    space_id: string;
    space_name?: string;
    status?: string;
}

export interface UserAccount {
    id: string;
    account_type: "owner" | "tenant" | "staff" | "admin";
    status: "active" | "inactive";
    roles: Role[];
    tenant_spaces?: TenantSpace[];
    tenant_type?: string;
    staff_role?: string;
    is_default: boolean;
    site_ids: [];
    sites: [];
}

export interface Role {
    id: string;
    org_id: string;
    name: string;
    description: string;
}




