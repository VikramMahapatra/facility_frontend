export interface User {
    id: string;
    org_id: string;
    full_name: string;
    email: string;
    phone?: string;
    picture_url?: string;
    status: 'active' | 'inactive' | 'pending_approval';
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
    approver_role_id: string;
    approver_role_name: string;
    can_approve_role_id: string;
    can_approve_role_name: string;
    created_at: string;
}