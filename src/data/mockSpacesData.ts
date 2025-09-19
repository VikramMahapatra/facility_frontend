// Mock data for spaces & sites management

export interface Organization {
  id: string;
  name: string;
  legal_name: string;
  gst_vat_id: string;
  billing_email: string;
  contact_phone: string;
  plan: 'free' | 'pro' | 'enterprise';
  locale: string;
  timezone: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  org_id: string;
  name: string;
  code: string;
  kind: 'residential' | 'commercial' | 'hotel' | 'mall' | 'mixed' | 'campus';
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  geo: {
    lat: number;
    lng: number;
  };
  opened_on: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type SpaceKind = 'room' | 'apartment' | 'shop' | 'office' | 'warehouse' | 'meeting_room' | 'hall' | 'common_area' | 'parking';

export interface Space {
  id: string;
  org_id: string;
  site_id: string;
  code: string;
  name: string;
  kind: SpaceKind;
  floor: string;
  building_block: string;
  area_sqft: number;
  beds?: number;
  baths?: number;
  attributes: Record<string, any>;
  status: 'available' | 'occupied' | 'out_of_service';
  created_at: string;
  updated_at: string;
}

export interface SpaceGroup {
  id: string;
  org_id: string;
  site_id: string;
  name: string;
  kind: SpaceKind;
  specs: Record<string, any>;
}

export interface SpaceGroupMember {
  group_id: string;
  space_id: string;
}

// Mock organization
export const mockOrganization: Organization = {
  id: 'org-1',
  name: 'FacilityOS Properties',
  legal_name: 'FacilityOS Properties Private Limited',
  gst_vat_id: '29ABCDE1234F1Z5',
  billing_email: 'billing@facilityos.com',
  contact_phone: '+91 9876543210',
  plan: 'enterprise',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-09-16T00:00:00Z'
};

// Mock sites
export const mockSites: Site[] = [
  {
    id: 'site-1',
    org_id: 'org-1',
    name: 'Grand Plaza Complex',
    code: 'GPC_MUM_BKC',
    kind: 'mixed',
    address: {
      line1: 'Plot 123, Bandra Kurla Complex',
      line2: 'Near Trident Hotel',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400051'
    },
    geo: { lat: 19.0596, lng: 72.8656 },
    opened_on: '2020-03-15',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  {
    id: 'site-2',
    org_id: 'org-1',
    name: 'Tech Park Bangalore',
    code: 'TPB_BLR_EGL',
    kind: 'commercial',
    address: {
      line1: 'Electronic City Phase 1',
      line2: 'Hosur Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560100'
    },
    geo: { lat: 12.8456, lng: 77.6603 },
    opened_on: '2019-08-20',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  {
    id: 'site-3',
    org_id: 'org-1',
    name: 'Luxury Hotel Goa',
    code: 'LHG_GOA_CAN',
    kind: 'hotel',
    address: {
      line1: 'Candolim Beach Road',
      line2: 'Near Fort Aguada',
      city: 'Candolim',
      state: 'Goa',
      country: 'India',
      pincode: '403515'
    },
    geo: { lat: 15.5197, lng: 73.7629 },
    opened_on: '2018-12-01',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  }
];

// Mock spaces
export const mockSpaces: Space[] = [
  // Grand Plaza Complex - Mixed spaces
  {
    id: 'space-1',
    org_id: 'org-1',
    site_id: 'site-1',
    code: 'A-101',
    name: 'Corner Apartment 101',
    kind: 'apartment',
    floor: 'Ground',
    building_block: 'Tower A',
    area_sqft: 1200,
    beds: 2,
    baths: 2,
    attributes: { view: 'garden', parking: true, furnished: 'semi' },
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  {
    id: 'space-2',
    org_id: 'org-1',
    site_id: 'site-1',
    code: 'S-G01',
    name: 'Retail Shop Ground 01',
    kind: 'shop',
    floor: 'Ground',
    building_block: 'Retail Block',
    area_sqft: 800,
    attributes: { frontage: 'street', category: 'retail', ac: true },
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  {
    id: 'space-3',
    org_id: 'org-1',
    site_id: 'site-1',
    code: 'P-001',
    name: 'Parking Bay 001',
    kind: 'parking',
    floor: 'Basement',
    building_block: 'Parking Block',
    area_sqft: 180,
    attributes: { covered: true, size: 'standard', ev_charging: false },
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  // Tech Park Bangalore - Office spaces
  {
    id: 'space-4',
    org_id: 'org-1',
    site_id: 'site-2',
    code: 'OFF-201',
    name: 'Corner Office 201',
    kind: 'office',
    floor: '2nd',
    building_block: 'Block B',
    area_sqft: 1500,
    attributes: { workstations: 12, cabin: true, conference_room: true, view: 'city' },
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  {
    id: 'space-5',
    org_id: 'org-1',
    site_id: 'site-2',
    code: 'MR-301',
    name: 'Meeting Room Bangalore',
    kind: 'meeting_room',
    floor: '3rd',
    building_block: 'Block A',
    area_sqft: 400,
    attributes: { capacity: 10, projector: true, whiteboard: true, videoconf: true },
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  // Luxury Hotel Goa - Hotel rooms
  {
    id: 'space-6',
    org_id: 'org-1',
    site_id: 'site-3',
    code: 'DLX-101',
    name: 'Deluxe Ocean View 101',
    kind: 'room',
    floor: '1st',
    building_block: 'Main Block',
    area_sqft: 450,
    beds: 1,
    baths: 1,
    attributes: { view: 'ocean', balcony: true, king_bed: true, star_rating: 5 },
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  {
    id: 'space-7',
    org_id: 'org-1',
    site_id: 'site-3',
    code: 'STE-201',
    name: 'Presidential Suite 201',
    kind: 'room',
    floor: '2nd',
    building_block: 'Main Block',
    area_sqft: 800,
    beds: 1,
    baths: 2,
    attributes: { view: 'ocean', suite: true, jacuzzi: true, star_rating: 5 },
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  },
  {
    id: 'space-8',
    org_id: 'org-1',
    site_id: 'site-3',
    code: 'HALL-001',
    name: 'Grand Ballroom',
    kind: 'hall',
    floor: 'Ground',
    building_block: 'Events Block',
    area_sqft: 2500,
    attributes: { capacity: 200, stage: true, sound_system: true, catering: true },
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-16T00:00:00Z'
  }
];

// Mock space groups
export const mockSpaceGroups: SpaceGroup[] = [
  {
    id: 'group-1',
    org_id: 'org-1',
    site_id: 'site-1',
    name: '2BHK Apartments',
    kind: 'apartment',
    specs: { 
      base_rate: 45000, 
      security_deposit: 90000, 
      maintenance: 5000,
      amenities: ['parking', 'gym', 'swimming_pool'],
      typical_beds: 2,
      typical_baths: 2
    }
  },
  {
    id: 'group-2',
    org_id: 'org-1',
    site_id: 'site-1',
    name: 'Retail Shops',
    kind: 'shop',
    specs: { 
      base_rate: 150, 
      cam_charges: 25,
      maintenance: 15,
      amenities: ['parking', 'security', 'power_backup'],
      category: 'retail'
    }
  },
  {
    id: 'group-3',
    org_id: 'org-1',
    site_id: 'site-2',
    name: 'IT Offices',
    kind: 'office',
    specs: { 
      base_rate: 80, 
      cam_charges: 20,
      maintenance: 10,
      amenities: ['parking', 'cafeteria', '24x7_security', 'power_backup'],
      fit_out: 'warm_shell'
    }
  },
  {
    id: 'group-4',
    org_id: 'org-1',
    site_id: 'site-3',
    name: 'Deluxe Rooms',
    kind: 'room',
    specs: { 
      base_rate: 8500, 
      occupancy: 2,
      amenities: ['ocean_view', 'balcony', 'minibar', 'wifi'],
      star_rating: 5,
      room_type: 'deluxe'
    }
  },
  {
    id: 'group-5',
    org_id: 'org-1',
    site_id: 'site-3',
    name: 'Presidential Suites',
    kind: 'room',
    specs: { 
      base_rate: 25000, 
      occupancy: 4,
      amenities: ['ocean_view', 'jacuzzi', 'butler_service', 'private_dining'],
      star_rating: 5,
      room_type: 'suite'
    }
  }
];

// Mock space group members
export const mockSpaceGroupMembers: SpaceGroupMember[] = [
  { group_id: 'group-1', space_id: 'space-1' },
  { group_id: 'group-2', space_id: 'space-2' },
  { group_id: 'group-3', space_id: 'space-4' },
  { group_id: 'group-4', space_id: 'space-6' },
  { group_id: 'group-5', space_id: 'space-7' }
];

// Utility functions
export const getSpacesByKind = (kind: SpaceKind) => 
  mockSpaces.filter(space => space.kind === kind);

export const getSpacesBySite = (siteId: string) => 
  mockSpaces.filter(space => space.site_id === siteId);

export const getSpaceGroupsBySite = (siteId: string) => 
  mockSpaceGroups.filter(group => group.site_id === siteId);

export const getSpaceGroupMembers = (groupId: string) => 
  mockSpaceGroupMembers
    .filter(member => member.group_id === groupId)
    .map(member => mockSpaces.find(space => space.id === member.space_id))
    .filter(Boolean);

export const getBuildingBlocks = (siteId: string) => {
  const spaces = getSpacesBySite(siteId);
  const blocks = [...new Set(spaces.map(space => space.building_block))];
  
  return blocks.map(block => ({
    name: block,
    floors: [...new Set(spaces.filter(s => s.building_block === block).map(s => s.floor))],
    totalSpaces: spaces.filter(s => s.building_block === block).length,
    occupiedSpaces: spaces.filter(s => s.building_block === block && s.status === 'occupied').length
  }));
};

export const getOccupancyStats = () => {
  const totalSpaces = mockSpaces.length;
  const occupiedSpaces = mockSpaces.filter(s => s.status === 'occupied').length;
  const availableSpaces = mockSpaces.filter(s => s.status === 'available').length;
  const outOfServiceSpaces = mockSpaces.filter(s => s.status === 'out_of_service').length;
  
  return {
    totalSpaces,
    occupiedSpaces,
    availableSpaces,
    outOfServiceSpaces,
    occupancyRate: totalSpaces > 0 ? (occupiedSpaces / totalSpaces) * 100 : 0
  };
};