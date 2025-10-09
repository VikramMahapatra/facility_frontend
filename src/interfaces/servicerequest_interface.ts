export type ServiceRequestPriority = "low" | "medium" | "high" | "urgent";
export type ServiceRequestStatus   = "open" | "in_progress" | "on_hold" | "resolved" | "closed" | "cancelled";
export type ServiceRequestChannel  = "portal" | "email" | "phone" | "walkin" | "api";
export type ServiceRequesterKind   = "resident" | "merchant" | "guest" | "staff" | "other";
export type Category = "Maintenance" | "Housekeeping" | "Security" | "Utilities" | string;


export interface ServiceRequest {
  id: string;
  org_id?: string;
  site_id: string;
  space_id?: string | null;
  space_name?: string | null;
  requester_kind:ServiceRequesterKind
  requester_id?: string | null;
  requester_name: string;
  category: string;
  channel:ServiceRequestChannel
  description: string;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  sla?: { duration?: string } | null;
  linked_work_order_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRequestOverview {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}