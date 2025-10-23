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
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  roles?: Role[];
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
