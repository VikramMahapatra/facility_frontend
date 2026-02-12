export interface User {
    id: string;
    org_id: string;
    full_name: string;
    email: string;
    phone?: string;
    picture_url?: string;
    account_type: string;
    default_account_type: string;
    status: 'active' | 'inactive' | 'pending_approval' | 'rejected' | 'pending';
    created_at: string;
    updated_at: string;
    roles?: Role[];
}

export interface Role {
    id: string;
    org_id: string;
    name: string;
    description: string;
}

export interface ApprovalRule {
    id: string;
    org_id: string;
    approver_type: string;
    can_approve_type: string;
    created_at: string;
}