export interface ServiceRequest {
  id: string;
  requester_name: string;
  location: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
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
    location: 'Tower A - 12th Floor',
    category: 'Maintenance',
    description: 'Air conditioning not working in conference room',
    priority: 'high',
    status: 'open',
    created_at: '2024-03-20T09:30:00Z'
  },
  {
    id: 'SR002',
    requester_name: 'Sarah Johnson',
    location: 'Tower B - 5th Floor',
    category: 'Housekeeping',
    description: 'Coffee machine needs cleaning',
    priority: 'low',
    status: 'in_progress',
    created_at: '2024-03-19T14:15:00Z'
  },
  {
    id: 'SR003',
    requester_name: 'Mike Chen',
    location: 'Ground Floor - Lobby',
    category: 'Security',
    description: 'Access card reader malfunctioning',
    priority: 'medium',
    status: 'resolved',
    created_at: '2024-03-18T11:20:00Z'
  },
  {
    id: 'SR004',
    requester_name: 'Lisa Wang',
    location: 'Tower A - 8th Floor',
    category: 'Utilities',
    description: 'Water pressure low in restroom',
    priority: 'medium',
    status: 'open',
    created_at: '2024-03-17T16:45:00Z'
  },
  {
    id: 'SR005',
    requester_name: 'David Brown',
    location: 'Parking Level B1',
    category: 'Maintenance',
    description: 'Elevator making unusual noise',
    priority: 'high',
    status: 'in_progress',
    created_at: '2024-03-16T08:30:00Z'
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