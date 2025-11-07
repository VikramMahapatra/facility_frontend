export interface SLAPolicy {
  sla_id: number;
  service_category: string;
  default_contact: number;
  escalation_contact: number;
  response_time_mins: number;
  resolution_time_mins: number;
  escalation_time_mins: number;
  active: boolean;
}

export interface TicketCategory {
  category_id: number;
  category_name: string;
  auto_assign_role: string;
  sla_hours: number;
  is_active: boolean;
  sla_id: number;
}

export interface Ticket {
  ticket_id: number;
  org_id: number;
  site_id: number;
  space_id?: number;
  tenant_id?: number;
  category_id: number;
  category_name?: string;
  title: string;
  description: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'CLOSED' | 'REOPENED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_by: number;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  request_type: 'UNIT' | 'COMMUNITY';
}

export interface TicketWorkflow {
  workflow_id: number;
  ticket_id: number;
  action_by: number;
  old_status: string;
  new_status: string;
  action_taken: string;
  action_time: string;
}

export interface TicketAssignment {
  assignment_id: number;
  ticket_id: number;
  assigned_from: number;
  assigned_to: number;
  assigned_at: string;
  reason: string;
}

export interface TicketComment {
  comment_id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  comment_text: string;
  created_at: string;
  reactions: TicketReaction[];
}

export interface TicketReaction {
  reaction_id: number;
  comment_id: number;
  user_id: number;
  emoji: string;
  created_at: string;
}

export interface TicketFeedback {
  feedback_id: number;
  ticket_id: number;
  rating: number;
  feedback_text: string;
  created_at: string;
}

export interface TicketWorkOrder {
  work_order_id: number;
  ticket_id: number;
  description: string;
  assigned_to: number;
  created_at: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
}

export const mockSLAPolicies: SLAPolicy[] = [
  {
    sla_id: 1,
    service_category: 'Electrical',
    default_contact: 101,
    escalation_contact: 102,
    response_time_mins: 60,
    resolution_time_mins: 240,
    escalation_time_mins: 300,
    active: true,
  },
  {
    sla_id: 2,
    service_category: 'Plumbing',
    default_contact: 103,
    escalation_contact: 104,
    response_time_mins: 90,
    resolution_time_mins: 360,
    escalation_time_mins: 420,
    active: true,
  },
];

export const mockTicketCategories: TicketCategory[] = [
  {
    category_id: 1,
    category_name: 'Electrical Issues',
    auto_assign_role: 'electrician',
    sla_hours: 24,
    is_active: true,
    sla_id: 1,
  },
  {
    category_id: 2,
    category_name: 'Plumbing',
    auto_assign_role: 'plumber',
    sla_hours: 48,
    is_active: true,
    sla_id: 2,
  },
  {
    category_id: 3,
    category_name: 'HVAC',
    auto_assign_role: 'hvac_tech',
    sla_hours: 24,
    is_active: true,
    sla_id: 1,
  },
  {
    category_id: 4,
    category_name: 'General Maintenance',
    auto_assign_role: 'maintenance',
    sla_hours: 72,
    is_active: true,
    sla_id: 1,
  },
];

// Helper function to generate dates within last 30 days
const getRecentDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockTickets: Ticket[] = [
  {
    ticket_id: 1,
    org_id: 1,
    site_id: 1,
    space_id: 101,
    tenant_id: 201,
    category_id: 1,
    category_name: 'Electrical Issues',
    title: 'Power outlet not working in Unit 301',
    description: 'The power outlet in the bedroom is not functioning. Tested with multiple devices.',
    status: 'ESCALATED',
    priority: 'HIGH',
    created_by: 1001,
    assigned_to: 101,
    created_at: getRecentDate(2),
    updated_at: getRecentDate(1),
    request_type: 'UNIT',
  },
  {
    ticket_id: 2,
    org_id: 1,
    site_id: 1,
    space_id: 102,
    category_id: 2,
    category_name: 'Plumbing',
    title: 'Leaking faucet in common area bathroom',
    description: 'The faucet in the 2nd floor common bathroom has been leaking for 2 days.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    created_by: 1002,
    assigned_to: 103,
    created_at: getRecentDate(5),
    updated_at: getRecentDate(3),
    request_type: 'COMMUNITY',
  },
  {
    ticket_id: 3,
    org_id: 1,
    site_id: 1,
    category_id: 3,
    category_name: 'HVAC',
    title: 'AC not cooling properly',
    description: 'Air conditioning in unit 405 is running but not cooling effectively.',
    status: 'OPEN',
    priority: 'HIGH',
    created_by: 1003,
    created_at: getRecentDate(1),
    updated_at: getRecentDate(1),
    request_type: 'UNIT',
  },
  {
    ticket_id: 4,
    org_id: 1,
    site_id: 2,
    category_id: 4,
    category_name: 'General Maintenance',
    title: 'Broken tile in lobby',
    description: 'Cracked floor tile near the entrance needs replacement.',
    status: 'CLOSED',
    priority: 'LOW',
    created_by: 1004,
    assigned_to: 105,
    created_at: getRecentDate(20),
    updated_at: getRecentDate(17),
    closed_at: getRecentDate(17),
    request_type: 'COMMUNITY',
  },
  {
    ticket_id: 5,
    org_id: 1,
    site_id: 1,
    space_id: 103,
    category_id: 1,
    category_name: 'Electrical Issues',
    title: 'Flickering lights in hallway',
    description: 'Corridor lights on 3rd floor are flickering intermittently.',
    status: 'ASSIGNED',
    priority: 'MEDIUM',
    created_by: 1005,
    assigned_to: 101,
    created_at: getRecentDate(7),
    updated_at: getRecentDate(6),
    request_type: 'COMMUNITY',
  },
  {
    ticket_id: 6,
    org_id: 1,
    site_id: 1,
    space_id: 104,
    category_id: 2,
    category_name: 'Plumbing',
    title: 'Clogged drain in Unit 502',
    description: 'Kitchen sink drain is completely blocked.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    created_by: 1006,
    assigned_to: 103,
    created_at: getRecentDate(3),
    updated_at: getRecentDate(2),
    request_type: 'UNIT',
  },
  {
    ticket_id: 7,
    org_id: 1,
    site_id: 1,
    category_id: 3,
    category_name: 'HVAC',
    title: 'Thermostat not responding',
    description: 'Thermostat in Unit 303 is unresponsive to temperature adjustments.',
    status: 'OPEN',
    priority: 'MEDIUM',
    created_by: 1007,
    created_at: getRecentDate(4),
    updated_at: getRecentDate(4),
    request_type: 'UNIT',
  },
  {
    ticket_id: 8,
    org_id: 1,
    site_id: 1,
    space_id: 105,
    category_id: 4,
    category_name: 'General Maintenance',
    title: 'Peeling paint in stairwell',
    description: 'Paint is peeling off walls in the main stairwell.',
    status: 'CLOSED',
    priority: 'LOW',
    created_by: 1008,
    assigned_to: 105,
    created_at: getRecentDate(25),
    updated_at: getRecentDate(20),
    closed_at: getRecentDate(20),
    request_type: 'COMMUNITY',
  },
  {
    ticket_id: 9,
    org_id: 1,
    site_id: 1,
    space_id: 106,
    category_id: 1,
    category_name: 'Electrical Issues',
    title: 'Circuit breaker keeps tripping',
    description: 'Main circuit breaker in Unit 601 trips every few hours.',
    status: 'ESCALATED',
    priority: 'HIGH',
    created_by: 1009,
    assigned_to: 101,
    created_at: getRecentDate(8),
    updated_at: getRecentDate(7),
    request_type: 'UNIT',
  },
  {
    ticket_id: 10,
    org_id: 1,
    site_id: 1,
    category_id: 2,
    category_name: 'Plumbing',
    title: 'Low water pressure',
    description: 'Water pressure is very low in all bathrooms on 4th floor.',
    status: 'OPEN',
    priority: 'MEDIUM',
    created_by: 1010,
    created_at: getRecentDate(6),
    updated_at: getRecentDate(6),
    request_type: 'COMMUNITY',
  },
  {
    ticket_id: 11,
    org_id: 1,
    site_id: 2,
    space_id: 201,
    category_id: 3,
    category_name: 'HVAC',
    title: 'Noisy ventilation system',
    description: 'Ventilation making loud rattling noise in conference room.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    created_by: 1011,
    assigned_to: 104,
    created_at: getRecentDate(10),
    updated_at: getRecentDate(9),
    request_type: 'COMMUNITY',
  },
  {
    ticket_id: 12,
    org_id: 1,
    site_id: 2,
    category_id: 4,
    category_name: 'General Maintenance',
    title: 'Damaged door lock',
    description: 'Main entrance door lock is jammed and difficult to open.',
    status: 'ASSIGNED',
    priority: 'HIGH',
    created_by: 1012,
    assigned_to: 105,
    created_at: getRecentDate(12),
    updated_at: getRecentDate(11),
    request_type: 'COMMUNITY',
  },
];

export const mockTicketWorkflows: TicketWorkflow[] = [
  {
    workflow_id: 1,
    ticket_id: 1,
    action_by: 1001,
    old_status: '',
    new_status: 'OPEN',
    action_taken: 'Ticket created',
    action_time: '2025-01-15T09:30:00Z',
  },
  {
    workflow_id: 2,
    ticket_id: 1,
    action_by: 101,
    old_status: 'OPEN',
    new_status: 'ASSIGNED',
    action_taken: 'Assigned to electrician',
    action_time: '2025-01-15T10:00:00Z',
  },
  {
    workflow_id: 3,
    ticket_id: 1,
    action_by: 101,
    old_status: 'ASSIGNED',
    new_status: 'ESCALATED',
    action_taken: 'SLA breach - escalated to supervisor',
    action_time: '2025-01-16T14:20:00Z',
  },
];

export const mockTicketComments: TicketComment[] = [
  {
    comment_id: 1,
    ticket_id: 1,
    user_id: 101,
    user_name: 'John Smith',
    comment_text: 'Inspected the outlet. Found a wiring issue that requires immediate attention.',
    created_at: '2025-01-15T11:30:00Z',
    reactions: [
      { reaction_id: 1, comment_id: 1, user_id: 1001, emoji: '👍', created_at: '2025-01-15T12:00:00Z' },
    ],
  },
  {
    comment_id: 2,
    ticket_id: 2,
    user_id: 103,
    user_name: 'Mike Johnson',
    comment_text: 'Working on replacing the faucet cartridge. Should be done by end of day.',
    created_at: '2025-01-15T14:00:00Z',
    reactions: [],
  },
];

export const mockTicketWorkOrders: TicketWorkOrder[] = [
  {
    work_order_id: 1,
    ticket_id: 1,
    description: 'Replace faulty outlet and check circuit breaker',
    assigned_to: 101,
    created_at: '2025-01-15T10:30:00Z',
    status: 'IN_PROGRESS',
  },
  {
    work_order_id: 2,
    ticket_id: 2,
    description: 'Replace bathroom faucet cartridge',
    assigned_to: 103,
    created_at: '2025-01-15T11:00:00Z',
    status: 'IN_PROGRESS',
  },
];
