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
        'projector', // optional, can add new amenities as needed
        'conference_room',
        'intercom',
        'air_conditioning', // optional
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
        'lighting', // optional
    ],
};


