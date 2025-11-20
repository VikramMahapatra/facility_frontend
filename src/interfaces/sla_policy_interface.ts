export interface SLAPolicy {
  id: string;
  organization_name?: string;
  service_category: string;
  site_name?: string;
  site_id?: string;
  default_contact?: number;
  escalation_contact?: number;
  response_time_mins: number;
  resolution_time_mins: number;
  escalation_time_mins: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

