export interface Role {
  id: string;
  org_id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  phone_e164?: string;
  picture_url?: string;
  status: 'active' | 'inactive' | 'pending_approval';
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export interface ApprovalRule {
  id: string;
  org_id: string;
  approver_role_id: string;
  can_approve_role_id: string;
  created_at: string;
}

export interface RolePolicy {
  id: string;
  org_id: string;
  role_id: string;
  resource: string;
  action: string;
  condition?: any;
}

export const mockRoles: Role[] = [
  {
    id: "role-1",
    org_id: "org-1",
    name: "admin",
    description: "Full system access"
  },
  {
    id: "role-2",
    org_id: "org-1",
    name: "manager",
    description: "Site and operations management"
  },
  {
    id: "role-3",
    org_id: "org-1",
    name: "accountant",
    description: "Financial operations access"
  },
  {
    id: "role-4",
    org_id: "org-1",
    name: "frontdesk",
    description: "Guest services and bookings"
  }
];

export const mockUsers: User[] = [
  {
    id: "user-1",
    org_id: "org-1",
    full_name: "John Administrator",
    email: "john@example.com",
    phone_e164: "+1234567890",
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    roles: [mockRoles[0]]
  },
  {
    id: "user-2",
    org_id: "org-1",
    full_name: "Sarah Manager",
    email: "sarah@example.com",
    phone_e164: "+1234567891",
    status: "active",
    created_at: "2024-01-16T10:00:00Z",
    updated_at: "2024-01-16T10:00:00Z",
    roles: [mockRoles[1]]
  },
  {
    id: "user-3",
    org_id: "org-1",
    full_name: "Mike Accountant",
    email: "mike@example.com",
    phone_e164: "+1234567892",
    status: "pending_approval",
    created_at: "2024-01-17T10:00:00Z",
    updated_at: "2024-01-17T10:00:00Z",
    roles: [mockRoles[2]]
  },
  {
    id: "user-4",
    org_id: "org-1",
    full_name: "Emily FrontDesk",
    email: "emily@example.com",
    phone_e164: "+1234567893",
    status: "pending_approval",
    created_at: "2024-01-18T10:00:00Z",
    updated_at: "2024-01-18T10:00:00Z",
    roles: [mockRoles[3]]
  }
];

export const availableResources = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "organizations", label: "Organizations" },
  { id: "sites", label: "Sites" },
  { id: "buildings", label: "Buildings" },
  { id: "spaces", label: "Spaces" },
  { id: "leases", label: "Leases" },
  { id: "tenants", label: "Tenants" },
  { id: "invoices", label: "Invoices" },
  { id: "assets", label: "Assets" },
  { id: "work_orders", label: "Work Orders" },
  { id: "bookings", label: "Bookings" },
  { id: "guests", label: "Guests" },
  { id: "vendors", label: "Vendors" },
  { id: "parking_zones", label: "Parking Zones" },
  { id: "visitors", label: "Visitors" }
];

export const availableActions = [
  { id: "read", label: "View/Read" },
  { id: "write", label: "Create/Edit" },
  { id: "delete", label: "Delete" },
  { id: "approve", label: "Approve" },
  { id: "export", label: "Export" }
];

export const mockRolePolicies: RolePolicy[] = [
  {
    id: "policy-1",
    org_id: "org-1",
    role_id: "role-1",
    resource: "dashboard",
    action: "read"
  },
  {
    id: "policy-2",
    org_id: "org-1",
    role_id: "role-1",
    resource: "organizations",
    action: "write"
  },
  {
    id: "policy-3",
    org_id: "org-1",
    role_id: "role-2",
    resource: "dashboard",
    action: "read"
  },
  {
    id: "policy-4",
    org_id: "org-1",
    role_id: "role-2",
    resource: "sites",
    action: "write"
  }
];

export const mockApprovalRules: ApprovalRule[] = [
  {
    id: "approval-1",
    org_id: "org-1",
    approver_role_id: "role-1", // admin
    can_approve_role_id: "role-1", // can approve admin
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "approval-2",
    org_id: "org-1",
    approver_role_id: "role-1", // admin
    can_approve_role_id: "role-2", // can approve manager
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "approval-3",
    org_id: "org-1",
    approver_role_id: "role-1", // admin
    can_approve_role_id: "role-3", // can approve accountant
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "approval-4",
    org_id: "org-1",
    approver_role_id: "role-1", // admin
    can_approve_role_id: "role-4", // can approve frontdesk
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "approval-5",
    org_id: "org-1",
    approver_role_id: "role-2", // manager
    can_approve_role_id: "role-4", // can approve frontdesk
    created_at: "2024-01-15T10:00:00Z"
  }
];
