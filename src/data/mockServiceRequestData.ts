export interface Comment {
  id: string;
  user_name: string;
  user_role: string;
  content: string;
  created_at: string;
  reactions: { emoji: string; count: number; users: string[] }[];
}

export interface ServiceRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  location: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  assigned_to_email?: string;
  attachments?: string[];
  work_order_id?: string;
  comments: Comment[];
  closed_at?: string;
  resolved_at?: string;
  reopened_count: number;
}

export interface PMTemplate {
  id: string;
  name: string;
  category: string;
  frequency: string;
  next_due: string;
  checklist_items: number;
  sla_response: number;
  sla_resolve: number;
  status: 'active' | 'inactive';
}

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'SR001',
    requester_name: 'John Smith',
    requester_email: 'john.smith@company.com',
    location: 'Tower A - 12th Floor',
    category: 'Maintenance',
    description: 'Air conditioning not working in conference room',
    priority: 'high',
    status: 'in_progress',
    created_at: '2024-03-20T09:30:00Z',
    updated_at: '2024-03-20T11:15:00Z',
    assigned_to: 'Mike Johnson',
    assigned_to_email: 'mike.j@company.com',
    attachments: ['ac-unit-photo.jpg'],
    work_order_id: 'WO-2024-034',
    reopened_count: 0,
    comments: [
      {
        id: 'C001',
        user_name: 'Mike Johnson',
        user_role: 'Technician',
        content: 'Inspected the unit. Compressor needs replacement. Ordering parts now.',
        created_at: '2024-03-20T10:15:00Z',
        reactions: [
          { emoji: '👍', count: 2, users: ['John Smith', 'Admin'] }
        ]
      },
      {
        id: 'C002',
        user_name: 'John Smith',
        user_role: 'Requester',
        content: 'Thank you for the quick response. When can we expect the repair?',
        created_at: '2024-03-20T11:00:00Z',
        reactions: []
      }
    ]
  },
  {
    id: 'SR002',
    requester_name: 'Sarah Johnson',
    requester_email: 'sarah.j@company.com',
    location: 'Tower B - 5th Floor',
    category: 'Housekeeping',
    description: 'Coffee machine needs cleaning',
    priority: 'low',
    status: 'resolved',
    created_at: '2024-03-19T14:15:00Z',
    updated_at: '2024-03-19T16:30:00Z',
    assigned_to: 'Lisa Chen',
    assigned_to_email: 'lisa.c@company.com',
    reopened_count: 0,
    resolved_at: '2024-03-19T16:30:00Z',
    comments: [
      {
        id: 'C003',
        user_name: 'Lisa Chen',
        user_role: 'Housekeeping Staff',
        content: 'Coffee machine has been thoroughly cleaned and descaled.',
        created_at: '2024-03-19T16:30:00Z',
        reactions: [
          { emoji: '⭐', count: 5, users: ['Sarah Johnson', 'Mark Lee', 'Amy Wong', 'Tom Brown', 'Jane Doe'] },
          { emoji: '👍', count: 3, users: ['Sarah Johnson', 'Mark Lee', 'Amy Wong'] }
        ]
      }
    ]
  },
  {
    id: 'SR003',
    requester_name: 'Mike Chen',
    requester_email: 'mike.chen@company.com',
    location: 'Ground Floor - Lobby',
    category: 'Security',
    description: 'Access card reader malfunctioning',
    priority: 'medium',
    status: 'closed',
    created_at: '2024-03-18T11:20:00Z',
    updated_at: '2024-03-18T15:45:00Z',
    assigned_to: 'David Park',
    assigned_to_email: 'david.p@company.com',
    work_order_id: 'WO-2024-031',
    reopened_count: 0,
    resolved_at: '2024-03-18T15:00:00Z',
    closed_at: '2024-03-18T15:45:00Z',
    comments: [
      {
        id: 'C004',
        user_name: 'David Park',
        user_role: 'Security Technician',
        content: 'Card reader replaced. System is now functioning properly.',
        created_at: '2024-03-18T15:00:00Z',
        reactions: [
          { emoji: '✅', count: 1, users: ['Mike Chen'] }
        ]
      }
    ]
  },
  {
    id: 'SR004',
    requester_name: 'Lisa Wang',
    requester_email: 'lisa.w@company.com',
    location: 'Tower A - 8th Floor',
    category: 'Utilities',
    description: 'Water pressure low in restroom',
    priority: 'medium',
    status: 'open',
    created_at: '2024-03-17T16:45:00Z',
    updated_at: '2024-03-17T16:45:00Z',
    reopened_count: 0,
    comments: []
  },
  {
    id: 'SR005',
    requester_name: 'David Brown',
    requester_email: 'david.b@company.com',
    location: 'Parking Level B1',
    category: 'Maintenance',
    description: 'Elevator making unusual noise',
    priority: 'high',
    status: 'on_hold',
    created_at: '2024-03-16T08:30:00Z',
    updated_at: '2024-03-17T09:00:00Z',
    assigned_to: 'Robert Lee',
    assigned_to_email: 'robert.l@company.com',
    work_order_id: 'WO-2024-028',
    reopened_count: 1,
    comments: [
      {
        id: 'C005',
        user_name: 'Robert Lee',
        user_role: 'Elevator Technician',
        content: 'Waiting for specialized parts from manufacturer. ETA 3-5 business days.',
        created_at: '2024-03-17T09:00:00Z',
        reactions: []
      }
    ]
  }
];

export const mockPMTemplates: PMTemplate[] = [
  {
    id: 'PM001',
    name: 'HVAC Monthly Inspection',
    category: 'hvac',
    frequency: 'monthly',
    next_due: '2024-04-01',
    checklist_items: 15,
    sla_response: 4,
    sla_resolve: 24,
    status: 'active'
  },
  {
    id: 'PM002',
    name: 'Electrical Panel Check',
    category: 'electrical',
    frequency: 'quarterly',
    next_due: '2024-04-15',
    checklist_items: 8,
    sla_response: 2,
    sla_resolve: 12,
    status: 'active'
  },
  {
    id: 'PM003',
    name: 'Elevator Safety Inspection',
    category: 'elevators',
    frequency: 'monthly',
    next_due: '2024-03-25',
    checklist_items: 20,
    sla_response: 1,
    sla_resolve: 8,
    status: 'active'
  },
  {
    id: 'PM004',
    name: 'Water System Maintenance',
    category: 'plumbing',
    frequency: 'weekly',
    next_due: '2024-03-22',
    checklist_items: 12,
    sla_response: 2,
    sla_resolve: 16,
    status: 'active'
  },
  {
    id: 'PM005',
    name: 'Fire Safety Check',
    category: 'safety',
    frequency: 'monthly',
    next_due: '2024-04-10',
    checklist_items: 25,
    sla_response: 1,
    sla_resolve: 4,
    status: 'active'
  }
];