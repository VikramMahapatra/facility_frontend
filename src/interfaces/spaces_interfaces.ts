import { ParkingSlot } from "./parking_access_interface";

export interface Space {
    id: string;
    org_id: string;
    site_id: string;
    site_name?: string;
    name?: string;
    kind: SpaceKind;
    sub_kind?: SpaceSubKind;
    category?: "residential" | "commercial";
    floor?: string;
    building_block_id?: string;
    building_block?: string;
    area_sqft?: number;
    beds?: number;
    baths?: number;
    balconies?: number;
    attributes: Record<string, any>;
    accessories?: Array<{
        accessory_id: string;
        quantity: number;
    }>;
    parking_slots?: ParkingSlot[];
    parking_slot_ids?: string[];
    status: "available" | "occupied" | "out_of_service";
    created_at: string;
    updated_at: string;
    owner_name: string;
    maintenance_template_id?: string;
    maintenance_amount?: number;
    tax_rate?: number
}

export interface SpaceOverview {
    totalSpaces: number;
    availableSpaces: number;
    occupiedSpaces: number;
    outOfServices: number;
}

export interface HandoverInfo {
    occupancy_id: string;
    handover_date: string;
    handover_by: string;
    handover_to?: string | null;
    condition_notes?: string | null;
    keys_returned: boolean;
    accessories_returned: boolean;
    inspection_completed: boolean;
    status: string;
}

export interface OccupancyRecord {

    // Core status
    status: "vacant" | "occupied" | "move_out_scheduled" | "handover_awaited" | "recently_vacated";

    // Current occupant details (if occupied)
    occupant_type?: string;
    occupant_name?: string;
    move_in_date?: string;
    move_out_date?: string;
    time_slot?: string;
    heavy_items?: boolean;
    elevator_required?: boolean;
    parking_required?: boolean;
    reference_no?: string;
    can_request_move_in?: boolean;
    can_request_move_out?: boolean;
    // Optional handover info
    handover?: HandoverInfo;
}

export interface UpcomingMoveIn {
    occupant_type: string;
    occupant_name: string;
    move_in_date: string;
    move_out_date?: string;
    time_slot?: string;
    heavy_items?: boolean;
    elevator_required?: boolean;
    parking_required?: boolean;
    status: string; // "pending" | "active"
    reference_no?: string;
}

export interface PendingMoveOut {
    occupant_type: string;
    occupant_name: string;
    move_out_date?: string;
    status: string; // "pending"
    reference_no?: string;
}

export interface OccupancyResponse {
    current: OccupancyRecord;
    upcoming: UpcomingMoveIn[];
    pending_move_outs: PendingMoveOut[];
    history: any[]; // Keep as any for now, can be typed if you have a timeline interface
}

export interface HistoryRecord {
    id: string;
    occupant_type: string;
    occupant_name: string;
    move_in_date: string;
    move_out_date?: string;
}

export type TimelineEvent = {
    event: string;              // moved_in, moved_out, tenant_requested...
    occupant_type?: "owner" | "tenant";
    occupant_user_id?: string;
    occupant_name?: string;
    date: string;               // ISO
    notes?: string;
};


export const getKindIcon = (kind: SpaceKind) => {
    const icons = {
        room: "🏨",
        apartment: "🏠",
        shop: "🏪",
        office: "🏢",
        warehouse: "🏭",
        meeting_room: "🏛️",
        hall: "🎭",
        common_area: "🌳",
        parking: "🚗",
    };
    return icons[kind] || "📍";
};

export const getKindColor = (kind: SpaceKind) => {
    const colors = {
        room: "bg-purple-100 text-purple-800",
        apartment: "bg-blue-100 text-blue-800",
        shop: "bg-green-100 text-green-800",
        office: "bg-orange-100 text-orange-800",
        warehouse: "bg-gray-100 text-gray-800",
        meeting_room: "bg-indigo-100 text-indigo-800",
        hall: "bg-pink-100 text-pink-800",
        common_area: "bg-teal-100 text-teal-800",
        parking: "bg-yellow-100 text-yellow-800",
    };
    return colors[kind] || "bg-gray-100 text-gray-800";
};

export const getStatusColor = (status: string) => {
    const colors = {
        available: "bg-green-100 text-green-800",
        occupied: "bg-blue-100 text-blue-800",
        out_of_service: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

export const getSpaceOwnershipStatusColor = (status: string) => {
    switch (status) {
        case "leased":
            return "bg-blue-100 text-blue-700";
        case "approved":
            return "bg-green-100 text-green-700";
        case "pending":
            return "bg-yellow-100 text-yellow-700";
        case "ended":
            return "bg-red-100 text-red-700";
        case "rejected":
            return "bg-red-100 text-red-700";
        case "revoked":
            return "bg-red-100 text-red-700";
        default:
            return "bg-blue-100 text-blue-700";
    }
};

export const spaceCategories = [
    'residential',
    'commercial'
] as const;


export const CALCULATION_TYPE_LABELS: Record<string, string> = {
    flat: "Flat",
    per_sqft: "Per Sqft",
};

export const spaceKinds = [
    'apartment',
    'shop',
    'office',
    'warehouse',
    'meeting_room',
    'hall',
    'common_area',
    'parking',
    'villa',
    'row_house',
    'bungalow',
    'duplex',
    'penthouse',
    'farm_house',

] as const;

export type SpaceKind = typeof spaceKinds[number];

export const spaceSubKinds = [
    "studio",
    "1bhk",
    "2bhk",
    "3bhk",
    "4bhk",
    "5bhk",
] as const;

export type SpaceSubKind = typeof spaceSubKinds[number];

export const SUB_KIND_TO_BEDS: Record<SpaceSubKind, number> = {
    studio: 0,   // or 1 depending your logic
    "1bhk": 1,
    "2bhk": 2,
    "3bhk": 3,
    "4bhk": 4,
    "5bhk": 5,
};

export const kindToCategory: Record<SpaceKind, "residential" | "commercial"> = {
    apartment: "residential",
    villa: "residential",
    row_house: "residential",
    bungalow: "residential",
    duplex: "residential",
    penthouse: "residential",
    farm_house: "residential",
    shop: "commercial",
    office: "commercial",
    warehouse: "commercial",
    meeting_room: "commercial",
    hall: "commercial",
    common_area: "commercial",
    parking: "commercial",
};

export const getKindsByCategory = (
    category?: "residential" | "commercial",
): readonly SpaceKind[] => {
    if (!category) return spaceKinds;
    return spaceKinds.filter((kind) => kindToCategory[kind] === category);
};

export type SpaceAmenities =
    | 'parking'
    | 'club_access'
    | 'pool'
    | 'terrace'
    | 'private_lift'
    | 'private_garden'
    | 'garage'
    | 'balcony'
    | 'security'
    | 'gym'
    | 'power_backup'
    | 'wifi'
    | 'elevator'
    | 'cctv'
    | 'intercom'
    | 'garden'
    | 'barbecue_area'
    | 'rooftop_access'
    | 'solar_power'
    | 'fireplace'
    | 'storage_room'
    | 'lobby'
    | 'conference_room'
    | 'cafeteria'
    | 'restrooms'
    | 'playground'
    | 'laundry_room'
    | 'visitor_parking'
    | 'projector'
    | 'air_conditioning'
    | 'lighting';

export type AmenitiesByKind = { [K in SpaceKind]: SpaceAmenities[] };

export const amenitiesByKind: AmenitiesByKind = {
    apartment: [
        'parking',
        'balcony',
        'security',
        'gym',
        'power_backup',
        'wifi',
        'elevator',
        'cctv',
        'intercom',
        'club_access',
        'pool',
        'terrace',
        'private_lift',
    ],
    common_area: [
        'visitor_parking',
        'lobby',
        'conference_room',
        'cafeteria',
        'restrooms',
        'playground',
        'laundry_room',
        'security',
        'cctv',
    ],
    shop: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'cctv',
        'intercom',
    ],
    office: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'cctv',
        'elevator',
        'conference_room',
        'restrooms',
        'intercom',
    ],
    warehouse: [
        'parking',
        'security',
        'power_backup',
        'cctv',
        'storage_room',
        'solar_power',
    ],
    meeting_room: [
        'wifi',
        'projector',
        'conference_room',
        'intercom',
        'air_conditioning',
    ],
    hall: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'cctv',
        'elevator',
        'lobby',
        'restrooms',
        'air_conditioning',
    ],
    parking: [
        'security',
        'cctv',
        'visitor_parking',
        'solar_power',
        'lighting',
    ],
    // Add the new space kinds
    villa: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'cctv',
        'garden',
        'pool',
        'private_garden',
        'garage',
        'balcony',
        'terrace',
    ],
    row_house: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'cctv',
        'garden',
        'private_garden',
        'garage',
        'balcony',
    ],
    bungalow: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'cctv',
        'garden',
        'private_garden',
        'garage',
        'balcony',
        'terrace',
    ],
    duplex: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'cctv',
        'elevator',
        'balcony',
        'private_lift',
    ],
    penthouse: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'elevator',
        'cctv',
        'terrace',
        'private_lift',
        'balcony',
        'club_access',
        'pool',
        'rooftop_access',
    ],
    farm_house: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'cctv',
        'garden',
        'private_garden',
        'barbecue_area',
        'solar_power',
        'storage_room',
        'fireplace',
    ],
};

export interface MaintenanceTemplate {
    id?: string;
    org_id?: string;
    name: string;
    calculation_type: "flat" | "per_sqft" | "per_bed" | "custom";
    amount: number;
    category?: "residential" | "commercial";
    kind?: SpaceKind;
    site_id?: string;
    site_name?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    tax_code_id?: string;
    tax_rate?: string;
}