export interface ParkingZone {
  id: string;
  org_id: string;
  site_id: string;
  site_name: string;
  name: string;
  slots: number;
}

export interface ParkingSlot {
  id: string;
  zone_name: string;
  space_id?: string;
  space_name?: string;
  slot_no: string;
  slot_type: "covered" | "open" | "visitor" | "handicapped" | "ev";
}

export interface ParkingPass {
  id: string;
  org_id: string;
  site_id: string;
  site_name?: string;
  space_id?: string;
  space_name?: string;
  zone_id?: string;
  zone_name?: string;
  vehicle_no: string;
  tenant_type?: string;
  resident_id?: string;
  partner_id?: string;
  partner_name?: string;
  pass_holder_name?: string;
  valid_from: string;
  valid_to: string;
  status: "active" | "expired" | "suspended" | "revoked";
  pass_no?: string;
  family_info?: Array<{ member: string; relation: string }>;
  created_at?: string;
}

export interface ParkingZoneOverview {
  totalZones: number;
  totalCapacity: number;
  avgCapacity: number;
}

export interface AccessEvent {
  id: string;
  org_id: string;
  site_id: string;
  site_name: string;
  gate: string;
  vehicle_no?: string;
  card_id?: string;
  ts: string;
  direction: "in" | "out";
}

export interface AccessEventOverview {
  todayEvents: number;
  totalEntries: number;
  totalExits: number;
  totalUniqueIDs: number;
}

export interface Visitor {
  id: string;
  org_id: string;
  site_id: string;
  name: string;
  phone: string;
  space_id: string;
  visiting: string;
  purpose: string;
  entry_time: string;
  exit_time?: string;
  status: "checked_in" | "checked_out" | "expected";
  vehicle_no?: string;
  is_expected: boolean;
}

export interface VisitorOverview {
  checkedInToday: number;
  expectedToday: number;
  totalVisitors: number;
  totalVisitorsWithVehicle: number;
}
