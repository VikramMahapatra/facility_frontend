export interface TicketPMTemplate {
  id: string;
  template_name: string;
  pm_no?: string;
  category_id: string;
  category_name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  description: string;
  assigned_to?: string;
  assigned_to_name?: string;
  priority: 'low' | 'medium' | 'high';
  estimated_duration?: number;
  status: 'active' | 'inactive';
  instructions?: string;
  checklist?: Array<{ step: number; instruction: string }>;
  sla?: {
    priority?: string;
    response_hrs?: number;
    resolve_hrs?: number;
  };
  next_due?: string;
  created_at?: string;
  updated_at?: string;
}

export const mockTicketPMTemplates: TicketPMTemplate[] = [
  {
    id: '1',
    template_name: 'HVAC Filter Replacement',
    pm_no: 'PM001',
    category_id: '1',
    category_name: 'HVAC Maintenance',
    frequency: 'monthly',
    description: 'Replace air filters in all HVAC units to maintain air quality and system efficiency.',
    assigned_to: 'user_1',
    assigned_to_name: 'John Smith',
    priority: 'medium',
    estimated_duration: 120,
    status: 'active',
    instructions: 'Check filter size before replacement. Dispose of old filters properly.',
    checklist: [
      { step: 1, instruction: 'Turn off HVAC unit' },
      { step: 2, instruction: 'Remove old filter' },
      { step: 3, instruction: 'Install new filter' },
      { step: 4, instruction: 'Test system operation' }
    ],
    sla: {
      priority: 'medium',
      response_hrs: 6,
      resolve_hrs: 24
    },
    next_due: '2025-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    template_name: 'Elevator Safety Inspection',
    pm_no: 'PM002',
    category_id: '2',
    category_name: 'Elevator Maintenance',
    frequency: 'quarterly',
    description: 'Comprehensive safety inspection of all elevators including cables, brakes, and emergency systems.',
    assigned_to: 'user_2',
    assigned_to_name: 'Sarah Johnson',
    priority: 'high',
    estimated_duration: 240,
    status: 'active',
    instructions: 'Requires certified elevator technician. Document all findings.',
    checklist: [
      { step: 1, instruction: 'Inspect cables and pulleys' },
      { step: 2, instruction: 'Test brake system' },
      { step: 3, instruction: 'Check emergency systems' },
      { step: 4, instruction: 'Test door operation' }
    ],
    sla: {
      priority: 'high',
      response_hrs: 2,
      resolve_hrs: 48
    },
    next_due: '2025-04-10',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z',
  },
  {
    id: '3',
    template_name: 'Fire Safety System Check',
    pm_no: 'PM003',
    category_id: '3',
    category_name: 'Fire Safety',
    frequency: 'monthly',
    description: 'Inspect fire alarms, sprinklers, and emergency exits to ensure compliance with safety regulations.',
    assigned_to: 'user_3',
    assigned_to_name: 'Mike Davis',
    priority: 'high',
    estimated_duration: 180,
    status: 'active',
    instructions: 'Test all alarms. Check sprinkler pressure. Verify exit signs are illuminated.',
    checklist: [
      { step: 1, instruction: 'Test fire alarms' },
      { step: 2, instruction: 'Check sprinkler pressure' },
      { step: 3, instruction: 'Verify exit signs' },
      { step: 4, instruction: 'Inspect emergency exits' }
    ],
    sla: {
      priority: 'high',
      response_hrs: 1,
      resolve_hrs: 12
    },
    next_due: '2025-01-05',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-05T08:00:00Z',
  },
  {
    id: '4',
    template_name: 'Plumbing System Inspection',
    pm_no: 'PM004',
    category_id: '4',
    category_name: 'Plumbing',
    frequency: 'monthly',
    description: 'Check for leaks, water pressure issues, and ensure all fixtures are functioning properly.',
    assigned_to: 'user_1',
    assigned_to_name: 'John Smith',
    priority: 'medium',
    estimated_duration: 90,
    status: 'active',
    instructions: 'Check all restrooms, kitchens, and common areas. Document any leaks.',
    checklist: [
      { step: 1, instruction: 'Check for leaks' },
      { step: 2, instruction: 'Test water pressure' },
      { step: 3, instruction: 'Inspect fixtures' }
    ],
    sla: {
      priority: 'medium',
      response_hrs: 6,
      resolve_hrs: 48
    },
    next_due: '2025-01-20',
    created_at: '2024-01-20T11:00:00Z',
    updated_at: '2024-01-20T11:00:00Z',
  },
  {
    id: '5',
    template_name: 'Electrical Panel Inspection',
    pm_no: 'PM005',
    category_id: '5',
    category_name: 'Electrical',
    frequency: 'quarterly',
    description: 'Inspect electrical panels for signs of wear, overheating, or loose connections.',
    assigned_to: 'user_4',
    assigned_to_name: 'Emily Chen',
    priority: 'high',
    estimated_duration: 150,
    status: 'active',
    instructions: 'Requires licensed electrician. Check all panels and document findings.',
    checklist: [
      { step: 1, instruction: 'Inspect panel for wear' },
      { step: 2, instruction: 'Check for overheating' },
      { step: 3, instruction: 'Test connections' }
    ],
    sla: {
      priority: 'high',
      response_hrs: 2,
      resolve_hrs: 24
    },
    next_due: '2025-04-12',
    created_at: '2024-01-12T10:30:00Z',
    updated_at: '2024-01-12T10:30:00Z',
  },
  {
    id: '6',
    template_name: 'Landscaping Maintenance',
    pm_no: 'PM006',
    category_id: '6',
    category_name: 'Landscaping',
    frequency: 'weekly',
    description: 'Regular maintenance of gardens, lawns, and outdoor areas including mowing, pruning, and watering.',
    assigned_to: 'user_5',
    assigned_to_name: 'Robert Wilson',
    priority: 'low',
    estimated_duration: 300,
    status: 'active',
    instructions: 'Check weather conditions. Adjust schedule based on season.',
    checklist: [
      { step: 1, instruction: 'Mow lawns' },
      { step: 2, instruction: 'Prune shrubs' },
      { step: 3, instruction: 'Water plants' }
    ],
    sla: {
      priority: 'low',
      response_hrs: 24,
      resolve_hrs: 72
    },
    next_due: '2025-01-08',
    created_at: '2024-01-08T07:00:00Z',
    updated_at: '2024-01-08T07:00:00Z',
  },
];

