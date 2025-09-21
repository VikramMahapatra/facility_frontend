export interface AssetCategory {
  id: string;
  orgId: string;
  name: string;
  code: string;
  parentId?: string;
  attributes?: any;
}

export interface Asset {
  id: string;
  orgId: string;
  siteId: string;
  spaceId?: string;
  categoryId: string;
  categoryName: string;
  tag: string;
  name: string;
  serialNo: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  warrantyExpiry: string;
  cost: number;
  attributes?: any;
  status: 'active' | 'retired' | 'in_repair';
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  orgId: string;
  siteId: string;
  assetId?: string;
  assetName?: string;
  spaceId?: string;
  spaceName?: string;
  requestId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'corrective' | 'preventive' | 'inspection' | 'project';
  status: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  dueAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  sla?: any;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceRequest {
  id: string;
  orgId: string;
  siteId: string;
  spaceId?: string;
  spaceName?: string;
  requesterKind: 'resident' | 'merchant' | 'guest' | 'staff' | 'visitor';
  requesterId?: string;
  requesterName: string;
  category: string;
  channel: 'portal' | 'app' | 'kiosk' | 'phone' | 'whatsapp';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  sla?: any;
  linkedWorkOrderId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PMTemplate {
  id: string;
  orgId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  checklist: Array<{
    step: number;
    instruction: string;
    type: string;
  }>;
  frequency: string;
  sla: {
    response_hrs: number;
    resolve_hrs: number;
    priority: string;
  };
}

export const mockAssetCategories: AssetCategory[] = [
  {
    id: "cat-1",
    orgId: "org-1",
    name: "HVAC Systems",
    code: "HVAC"
  },
  {
    id: "cat-2",
    orgId: "org-1",
    name: "Electrical Systems",
    code: "ELEC"
  },
  {
    id: "cat-3",
    orgId: "org-1",
    name: "Plumbing Systems",
    code: "PLMB"
  }
];

export const mockAssets: Asset[] = [
  {
    id: 'asset-001',
    orgId: 'org-1',
    siteId: 'site-1',
    spaceId: 'space-101',
    categoryId: 'cat-1',
    categoryName: 'HVAC Systems',
    tag: 'HVAC-001',
    name: 'Central Air Conditioning Unit',
    serialNo: 'CAC-2023-001',
    model: 'CoolMaster 5000',
    manufacturer: 'AirTech Industries',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    cost: 150000,
    status: 'active',
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: 'asset-002',
    orgId: 'org-1',
    siteId: 'site-1',
    spaceId: 'space-102',
    categoryId: 'cat-2',
    categoryName: 'Electrical Systems',
    tag: 'ELEC-001',
    name: 'Main Distribution Panel',
    serialNo: 'MDP-2023-002',
    model: 'PowerGrid Pro',
    manufacturer: 'ElectroSafe Corp',
    purchaseDate: '2023-02-10',
    warrantyExpiry: '2028-02-10',
    cost: 75000,
    status: 'active',
    createdAt: '2023-02-10T09:30:00Z'
  }
];

export const mockWorkOrders: WorkOrder[] = [
  {
    id: "wo-001",
    orgId: "org-1",
    siteId: "site-1",
    assetId: "asset-001",
    assetName: "Central AC Unit #1",
    spaceId: "space-201",
    spaceName: "Apartment A-201",
    title: "AC not cooling properly",
    description: "Central AC unit is running but not providing adequate cooling. Room temperature remains at 28°C despite setting to 22°C.",
    priority: "high",
    type: "corrective",
    status: "open",
    dueAt: "2024-02-25T16:00:00Z",
    assignedTo: "tech-001",
    assignedToName: "Mike Johnson",
    createdBy: "admin-1",
    createdAt: "2024-02-22T10:30:00Z"
  },
  {
    id: "wo-002",
    orgId: "org-1",
    siteId: "site-1",
    assetId: "asset-002",
    assetName: "Elevator #2",
    spaceId: "lobby",
    spaceName: "Main Lobby",
    title: "Elevator maintenance - Monthly service",
    description: "Routine monthly maintenance and safety inspection of elevator #2 as per manufacturer guidelines.",
    priority: "medium",
    type: "preventive",
    status: "in_progress",
    dueAt: "2024-02-28T14:00:00Z",
    assignedTo: "tech-002",
    assignedToName: "Sarah Wilson",
    createdBy: "admin-1",
    createdAt: "2024-02-20T08:00:00Z"
  }
];

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: "sr-001",
    orgId: "org-1",
    siteId: "site-1",
    spaceId: "space-201",
    spaceName: "Apartment A-201",
    requesterKind: "resident",
    requesterId: "resident-1",
    requesterName: "John Smith",
    category: "Plumbing",
    channel: "app",
    description: "Kitchen sink tap is leaking continuously. Water wastage is significant.",
    priority: "medium",
    status: "open",
    createdAt: "2024-02-20T09:15:00Z"
  },
  {
    id: "sr-002",
    orgId: "org-1",
    siteId: "site-1",
    spaceId: "space-105",
    spaceName: "Shop #105",
    requesterKind: "merchant",
    requesterId: "merchant-1",
    requesterName: "ABC Electronics",
    category: "Electrical",
    channel: "portal",
    description: "Power outlet not working in the back section of the store. Affecting POS system.",
    priority: "high",
    status: "assigned",
    linkedWorkOrderId: "wo-001",
    createdAt: "2024-02-19T14:30:00Z"
  }
];

export const mockPMTemplates: PMTemplate[] = [
  {
    id: "pm-001",
    orgId: "org-1",
    name: "HVAC Monthly Maintenance",
    categoryId: "cat-1",
    categoryName: "HVAC Systems",
    checklist: [
      { step: 1, instruction: "Check air filter condition", type: "boolean" },
      { step: 2, instruction: "Inspect refrigerant levels", type: "numeric" },
      { step: 3, instruction: "Clean condenser coils", type: "boolean" },
      { step: 4, instruction: "Test thermostat calibration", type: "numeric" },
      { step: 5, instruction: "Check electrical connections", type: "boolean" }
    ],
    frequency: "monthly",
    sla: {
      response_hrs: 4,
      resolve_hrs: 24,
      priority: "medium"
    }
  },
  {
    id: "pm-002",
    orgId: "org-1",
    name: "Electrical Safety Inspection",
    categoryId: "cat-2",
    categoryName: "Electrical Systems",
    checklist: [
      { step: 1, instruction: "Test GFCI outlets", type: "boolean" },
      { step: 2, instruction: "Check panel connections", type: "boolean" },
      { step: 3, instruction: "Measure voltage levels", type: "numeric" },
      { step: 4, instruction: "Inspect wiring condition", type: "boolean" }
    ],
    frequency: "quarterly",
    sla: {
      response_hrs: 2,
      resolve_hrs: 12,
      priority: "high"
    }
  }
];