// Mock data for Parking & Access management
import { mockSites } from "@/data/mockSpacesData";

export { mockSites };

export interface ParkingZone {
  id: string;
  org_id: string;
  site_id: string;
  name: string;
  capacity: number;
}

export interface ParkingPass {
  id: string;
  org_id: string;
  site_id: string;
  vehicle_no: string;
  resident_id?: string;
  partner_id?: string;
  valid_from: string;
  valid_to: string;
  status: 'active' | 'expired' | 'suspended';
}

export interface AccessEvent {
  id: string;
  org_id: string;
  site_id: string;
  gate: string;
  vehicle_no?: string;
  card_id?: string;
  ts: string;
  direction: 'in' | 'out';
}

export const mockParkingZones: ParkingZone[] = [
  {
    id: "pz-1",
    org_id: "org-1",
    site_id: "site-1",
    name: "Underground Garage A",
    capacity: 150
  },
  {
    id: "pz-2",
    org_id: "org-1",
    site_id: "site-1",
    name: "Surface Parking B",
    capacity: 80
  },
  {
    id: "pz-3",
    org_id: "org-1",
    site_id: "site-2",
    name: "Visitor Parking",
    capacity: 50
  },
  {
    id: "pz-4",
    org_id: "org-1",
    site_id: "site-2",
    name: "Staff Parking",
    capacity: 120
  }
];

export const mockParkingPasses: ParkingPass[] = [
  {
    id: "pp-1",
    org_id: "org-1",
    site_id: "site-1",
    vehicle_no: "KA01AB1234",
    resident_id: "res-1",
    valid_from: "2024-01-01",
    valid_to: "2024-12-31",
    status: "active"
  },
  {
    id: "pp-2",
    org_id: "org-1",
    site_id: "site-1",
    vehicle_no: "KA02CD5678",
    partner_id: "vendor-1",
    valid_from: "2024-09-01",
    valid_to: "2024-09-30",
    status: "active"
  },
  {
    id: "pp-3",
    org_id: "org-1",
    site_id: "site-2",
    vehicle_no: "KA03EF9012",
    resident_id: "res-2",
    valid_from: "2024-06-01",
    valid_to: "2024-11-30",
    status: "active"
  },
  {
    id: "pp-4",
    org_id: "org-1",
    site_id: "site-1",
    vehicle_no: "KA04GH3456",
    resident_id: "res-3",
    valid_from: "2024-01-01",
    valid_to: "2024-08-31",
    status: "expired"
  }
];

export const mockAccessEvents: AccessEvent[] = [
  {
    id: "ae-1",
    org_id: "org-1",
    site_id: "site-1",
    gate: "Main Gate",
    vehicle_no: "KA01AB1234",
    ts: "2024-09-20T08:30:00Z",
    direction: "in"
  },
  {
    id: "ae-2",
    org_id: "org-1",
    site_id: "site-1",
    gate: "Main Gate",
    card_id: "CARD001",
    ts: "2024-09-20T09:15:00Z",
    direction: "in"
  },
  {
    id: "ae-3",
    org_id: "org-1",
    site_id: "site-1",
    gate: "Service Gate",
    vehicle_no: "KA02CD5678",
    ts: "2024-09-20T10:45:00Z",
    direction: "in"
  },
  {
    id: "ae-4",
    org_id: "org-1",
    site_id: "site-1",
    gate: "Main Gate",
    vehicle_no: "KA01AB1234",
    ts: "2024-09-20T17:30:00Z",
    direction: "out"
  },
  {
    id: "ae-5",
    org_id: "org-1",
    site_id: "site-2",
    gate: "Entrance A",
    card_id: "CARD045",
    ts: "2024-09-20T11:20:00Z",
    direction: "in"
  }
];

// Utility functions
export function getParkingZonesBySite(siteId: string): ParkingZone[] {
  return mockParkingZones.filter(zone => zone.site_id === siteId);
}

export function getParkingPassesBySite(siteId: string): ParkingPass[] {
  return mockParkingPasses.filter(pass => pass.site_id === siteId);
}

export function getAccessEventsBySite(siteId: string): AccessEvent[] {
  return mockAccessEvents.filter(event => event.site_id === siteId);
}

export function getActivePassesCount(): number {
  return mockParkingPasses.filter(pass => pass.status === 'active').length;
}

export function getTodayAccessEventsCount(): number {
  const today = new Date().toDateString();
  return mockAccessEvents.filter(event => 
    new Date(event.ts).toDateString() === today
  ).length;
}