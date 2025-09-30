export interface ParkingZone {
    id: string;
    org_id: string;
    site_id: string;
    site_name: string;
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

export interface ParkingZoneOverview {
    totalZones: number;
    totalCapacity: number;
    avgCapacity: number;
}