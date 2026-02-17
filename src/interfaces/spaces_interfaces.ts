
export interface Space {
    id: string;
    org_id: string;
    site_id: string;
    site_name?: string;
    name?: string;
    kind: SpaceKind;
    category?: "residential" | "commercial";
    floor?: string;
    building_block_id?: string;
    building_block?: string;
    area_sqft?: number;
    beds?: number;
    baths?: number;
    attributes: Record<string, any>;
    accessories?: Array<{
        accessory_id: string;
        quantity: number;
    }>;
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

export interface OccupancyRecord {
    status: "vacant" | "occupied";
    occupant_type?: string;
    occupant_name?: string;
    move_in_date?: string;
    reference_no?: string;
};


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

export const spaceKinds = [
    'room',
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
    'studio_apartment',
    'farm_house',

] as const;

export type SpaceKind = typeof spaceKinds[number];

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
    room: [
        'wifi',
        'security',
        'power_backup',
        'elevator',
        'cctv',
        'intercom',
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
    studio_apartment: [
        'parking',
        'security',
        'power_backup',
        'wifi',
        'elevator',
        'cctv',
        'intercom',
        'air_conditioning',
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