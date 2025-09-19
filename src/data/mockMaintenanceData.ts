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

export interface WorkOrderTask {
  id: string;
  workOrderId: string;
  stepNo: number;
  instruction: string;
  checklist?: any;
  required: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  result?: any;
  completedAt?: string;
}

export interface ServiceRequest {
  id: string;
  orgId: string;
  siteId: string;
  spaceId?: string;
  spaceName?: string;
  requesterKind: 'resident' | 'guest' | 'merchant' | 'staff' | 'visitor';
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
  checklist: any[];
  frequency: string;
  meterMetric?: string;
  threshold?: number;
  sla?: any;
}

// Mock Data
export const mockAssetCategories: AssetCategory[] = [
  {
    id: "cat-001",
    orgId: "org-1",
    name: "HVAC Systems",
    code: "HVAC"
  },
  {
    id: "cat-002",
    orgId: "org-1",
    name: "Chillers",
    code: "CHILLER",
    parentId: "cat-001"
  },
  {
    id: "cat-003",
    orgId: "org-1",
    name: "Air Handling Units",
    code: "AHU",
    parentId: "cat-001"
  },
  {
    id: "cat-004",
    orgId: "org-1",
    name: "Electrical Systems",
    code: "ELEC"
  },
  {
    id: "cat-005",
    orgId: "org-1",
    name: "Diesel Generators",
    code: "DG",
    parentId: "cat-004"
  },
  {
    id: "cat-006",
    orgId: "org-1",
    name: "Fire Safety",
    code: "FIRE"
  },
  {
    id: "cat-007",
    orgId: "org-1",
    name: "Elevators",
    code: "LIFT"
  },
  {
    id: "cat-008",
    orgId: "org-1",
    name: "Water Systems",
    code: "WATER"
  }
];

export const mockAssets: Asset[] = [
  {
    id: "asset-001",
    orgId: "org-1",
    siteId: "site-1",
    spaceId: "space-001",
    categoryId: "cat-002",
    categoryName: "Chillers",
    tag: "CHILLER-001",
    name: "Central Chiller Unit 1",
    serialNo: "CH123456789",
    model: "Carrier 30XA",
    manufacturer: "Carrier",
    purchaseDate: "2023-06-15",
    warrantyExpiry: "2026-06-15",
    cost: 2500000,
    attributes: {
      capacity_ton: 120,
      voltage: 415,
      refrigerant: "R134a"
    },
    status: "active",
    createdAt: "2023-06-15T10:00:00Z"
  },
  {
    id: "asset-002",
    orgId: "org-1",
    siteId: "site-1",
    categoryId: "cat-005",
    categoryName: "Diesel Generators",
    tag: "DG-001",
    name: "Emergency Generator 1",
    serialNo: "DG987654321",
    model: "Cummins C500",
    manufacturer: "Cummins",
    purchaseDate: "2023-03-20",
    warrantyExpiry: "2025-03-20",
    cost: 1800000,
    attributes: {
      capacity_kva: 500,
      fuel_type: "Diesel",
      voltage: 415
    },
    status: "active",
    createdAt: "2023-03-20T09:00:00Z"
  },
  {
    id: "asset-003",
    orgId: "org-1",
    siteId: "site-2",
    categoryId: "cat-007",
    categoryName: "Elevators",
    tag: "LIFT-001",
    name: "Passenger Elevator 1",
    serialNo: "LIFT456789123",
    model: "Otis Gen2",
    manufacturer: "Otis",
    purchaseDate: "2023-01-10",
    warrantyExpiry: "2028-01-10",
    cost: 3200000,
    attributes: {
      capacity_kg: 1000,
      floors: 15,
      speed_mps: 2.5
    },
    status: "active",
    createdAt: "2023-01-10T11:00:00Z"
  },
  {
    id: "asset-004",
    orgId: "org-1",
    siteId: "site-1",
    categoryId: "cat-003",
    categoryName: "Air Handling Units",
    tag: "AHU-001",
    name: "AHU Ground Floor",
    serialNo: "AHU789123456",
    model: "Voltas VA-2000",
    manufacturer: "Voltas",
    purchaseDate: "2023-08-05",
    warrantyExpiry: "2025-08-05",
    cost: 450000,
    status: "in_repair",
    createdAt: "2023-08-05T14:00:00Z"
  }
];

export const mockWorkOrders: WorkOrder[] = [
  {
    id: "wo-001",
    orgId: "org-1",
    siteId: "site-1",
    assetId: "asset-001",
    assetName: "Central Chiller Unit 1",
    title: "Quarterly Maintenance - Chiller Unit 1",
    description: "Perform quarterly preventive maintenance including filter cleaning, refrigerant level check, and performance analysis.",
    priority: "medium",
    type: "preventive",
    status: "assigned",
    dueAt: "2024-03-15T09:00:00Z",
    assignedTo: "user-1",
    assignedToName: "Rajesh Kumar",
    sla: {
      response_hrs: 4,
      resolve_hrs: 24
    },
    createdBy: "user-admin",
    createdAt: "2024-03-01T10:00:00Z"
  },
  {
    id: "wo-002",
    orgId: "org-1",
    siteId: "site-1",
    spaceId: "space-105",
    spaceName: "Office 105",
    title: "AC Not Cooling - Office 105",
    description: "Tenant complaint about air conditioning not cooling properly. Need immediate inspection.",
    priority: "high",
    type: "corrective",
    status: "in_progress",
    dueAt: "2024-02-20T16:00:00Z",
    assignedTo: "user-2",
    assignedToName: "Suresh Patel",
    createdBy: "user-admin",
    createdAt: "2024-02-20T11:30:00Z"
  },
  {
    id: "wo-003",
    orgId: "org-1",
    siteId: "site-2",
    assetId: "asset-003",
    assetName: "Passenger Elevator 1",
    title: "Elevator Safety Inspection",
    description: "Annual safety inspection and certification for elevator as per government regulations.",
    priority: "critical",
    type: "inspection",
    status: "completed",
    dueAt: "2024-02-01T10:00:00Z",
    assignedTo: "user-3",
    assignedToName: "Amit Sharma",
    createdBy: "user-admin",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-02-01T15:30:00Z"
  },
  {
    id: "wo-004",
    orgId: "org-1",
    siteId: "site-1",
    assetId: "asset-004",
    assetName: "AHU Ground Floor",
    title: "AHU Motor Replacement",
    description: "Replace faulty motor in AHU unit. Motor burning smell reported.",
    priority: "high",
    type: "corrective",
    status: "open",
    dueAt: "2024-02-25T12:00:00Z",
    createdBy: "user-admin",
    createdAt: "2024-02-22T14:15:00Z"
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
    spaceName: "Shop S-105",
    requesterKind: "merchant",
    requesterId: "partner-1",
    requesterName: "Tech Solutions Pvt Ltd",
    category: "Electrical",
    channel: "portal",
    description: "Power fluctuation causing equipment damage. Need electrical inspection.",
    priority: "high",
    status: "assigned",
    linkedWorkOrderId: "wo-002",
    createdAt: "2024-02-19T16:30:00Z"
  },
  {
    id: "sr-003",
    orgId: "org-1",
    siteId: "site-2",
    requesterKind: "guest",
    requesterId: "guest-1",
    requesterName: "Sarah Wilson",
    category: "Housekeeping",
    channel: "phone",
    description: "Room cleaning not done properly. Bathroom needs attention.",
    priority: "low",
    status: "resolved",
    createdAt: "2024-02-18T12:45:00Z",
    updatedAt: "2024-02-19T10:00:00Z"
  },
  {
    id: "sr-004",
    orgId: "org-1",
    siteId: "site-1",
    requesterKind: "staff",
    requesterId: "user-1",
    requesterName: "Security Guard",
    category: "Security",
    channel: "kiosk",
    description: "CCTV camera in parking area not working. Blind spot created.",
    priority: "high",
    status: "in_progress",
    createdAt: "2024-02-21T20:00:00Z"
  }
];

export const mockPMTemplates: PMTemplate[] = [
  {
    id: "pm-001",
    orgId: "org-1",
    name: "Monthly HVAC PM",
    categoryId: "cat-001",
    categoryName: "HVAC Systems",
    checklist: [
      { step: 1, instruction: "Check and clean air filters", type: "boolean" },
      { step: 2, instruction: "Inspect refrigerant levels", type: "numeric" },
      { step: 3, instruction: "Check thermostat calibration", type: "boolean" },
      { step: 4, instruction: "Inspect electrical connections", type: "boolean" },
      { step: 5, instruction: "Take performance readings", type: "photo" }
    ],
    frequency: "monthly",
    sla: {
      response_hrs: 2,
      resolve_hrs: 8,
      priority: "medium"
    }
  },
  {
    id: "pm-002",
    orgId: "org-1",
    name: "Quarterly Generator PM",
    categoryId: "cat-005",
    categoryName: "Diesel Generators",
    checklist: [
      { step: 1, instruction: "Check fuel levels", type: "numeric" },
      { step: 2, instruction: "Test battery voltage", type: "numeric" },
      { step: 3, instruction: "Inspect oil level and quality", type: "boolean" },
      { step: 4, instruction: "Run load test", type: "boolean" },
      { step: 5, instruction: "Check exhaust system", type: "boolean" }
    ],
    frequency: "quarterly",
    sla: {
      response_hrs: 4,
      resolve_hrs: 24,
      priority: "high"
    }
  },
  {
    id: "pm-003",
    orgId: "org-1",
    name: "Annual Elevator Inspection",
    categoryId: "cat-007",
    categoryName: "Elevators",
    checklist: [
      { step: 1, instruction: "Safety brake test", type: "boolean" },
      { step: 2, instruction: "Door mechanism inspection", type: "boolean" },
      { step: 3, instruction: "Cable and pulley check", type: "boolean" },
      { step: 4, instruction: "Emergency phone test", type: "boolean" },
      { step: 5, instruction: "Load capacity test", type: "boolean" },
      { step: 6, instruction: "Certificate documentation", type: "photo" }
    ],
    frequency: "annual",
    sla: {
      response_hrs: 24,
      resolve_hrs: 48,
      priority: "critical"
    }
  }
];

export const mockWorkOrderTasks: WorkOrderTask[] = [
  {
    id: "task-001",
    workOrderId: "wo-001",
    stepNo: 1,
    instruction: "Check and clean air filters",
    required: true,
    status: "completed",
    result: { value: true, notes: "Filters cleaned and replaced" },
    completedAt: "2024-03-15T10:30:00Z"
  },
  {
    id: "task-002",
    workOrderId: "wo-001",
    stepNo: 2,
    instruction: "Inspect refrigerant levels",
    required: true,
    status: "completed",
    result: { value: 85, unit: "psi", notes: "Within normal range" },
    completedAt: "2024-03-15T11:00:00Z"
  },
  {
    id: "task-003",
    workOrderId: "wo-001",
    stepNo: 3,
    instruction: "Check thermostat calibration",
    required: true,
    status: "in_progress"
  },
  {
    id: "task-004",
    workOrderId: "wo-002",
    stepNo: 1,
    instruction: "Inspect AC unit for visible issues",
    required: true,
    status: "completed",
    result: { value: true, notes: "Found dirty evaporator coil" },
    completedAt: "2024-02-20T14:15:00Z"
  },
  {
    id: "task-005",
    workOrderId: "wo-002",
    stepNo: 2,
    instruction: "Clean evaporator coil",
    required: true,
    status: "pending"
  }
];