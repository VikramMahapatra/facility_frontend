// ==========================
// Interfaces
// ==========================
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
  geo: { lat: number; lng: number };
  opened_on: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  site_id: string;
  name: string;
  floors: number;
  attributes: Record<string, any>;
}

export type SpaceKind = 'apartment' | 'row_house' | 'common_area';

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

// ==========================
// Organization
// ==========================
export const mockOrganization: Organization = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Gera',
  legal_name: 'Gera Developments Pvt Ltd',
  gst_vat_id: 'GSTIN-GERA-1234',
  billing_email: 'billing@gera.com',
  contact_phone: '+91-2022221111',
  plan: 'pro',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-09-16T00:00:00Z'
};

// ==========================
// Sites
// ==========================
export const mockSites: Site[] = [
  { id: '10000000-0000-0000-0000-000000000001', org_id: mockOrganization.id, name: 'Gera World of Joy', code: 'RES_PUNE_WOJ', kind: 'residential', address: { line1: 'Kharadi', city: 'Pune', state: 'MH', country: 'India', pincode: '411014' }, geo: { lat: 18.5601, lng: 73.9496 }, opened_on: '2020-01-01', status: 'active', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },
  { id: '10000000-0000-0000-0000-000000000002', org_id: mockOrganization.id, name: 'Gera Planet of Joy', code: 'RES_PUNE_POJ', kind: 'residential', address: { line1: 'Hinjewadi', city: 'Pune', state: 'MH', country: 'India', pincode: '411057' }, geo: { lat: 18.5911, lng: 73.7381 }, opened_on: '2019-01-01', status: 'active', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },
  { id: '10000000-0000-0000-0000-000000000003', org_id: mockOrganization.id, name: 'Gera Island of Joy', code: 'RES_PUNE_IOJ', kind: 'residential', address: { line1: 'Wagholi', city: 'Pune', state: 'MH', country: 'India', pincode: '412207' }, geo: { lat: 18.5802, lng: 73.9822 }, opened_on: '2021-06-01', status: 'active', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },
  { id: '10000000-0000-0000-0000-000000000004', org_id: mockOrganization.id, name: 'Gera Song of Joy', code: 'RES_PUNE_SOJ', kind: 'residential', address: { line1: 'Baner', city: 'Pune', state: 'MH', country: 'India', pincode: '411045' }, geo: { lat: 18.5643, lng: 73.7768 }, opened_on: '2018-05-01', status: 'active', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' }
];

// ==========================
// Buildings
// ==========================
export const mockBuildings: Building[] = [
  // WOJ
  { id: '20000000-0000-0000-0000-000000000001', site_id: mockSites[0].id, name: 'Tower A', floors: 22, attributes: { lifts: 4, fire_safety: true } },
  { id: '20000000-0000-0000-0000-000000000002', site_id: mockSites[0].id, name: 'Tower B', floors: 18, attributes: { lifts: 3, fire_safety: true } },
  { id: '20000000-0000-0000-0000-000000000003', site_id: mockSites[0].id, name: 'Clubhouse', floors: 2, attributes: { amenity_type: 'clubhouse' } },

  // POJ
  { id: '20000000-0000-0000-0000-000000000004', site_id: mockSites[1].id, name: 'Tower C', floors: 20, attributes: { lifts: 4, fire_safety: true } },
  { id: '20000000-0000-0000-0000-000000000005', site_id: mockSites[1].id, name: 'Tower D', floors: 16, attributes: { lifts: 3, fire_safety: true } },

  // IOJ
  { id: '20000000-0000-0000-0000-000000000006', site_id: mockSites[2].id, name: 'Row Houses Block', floors: 3, attributes: { fire_safety: true } },
  { id: '20000000-0000-0000-0000-000000000007', site_id: mockSites[2].id, name: 'Tower E', floors: 15, attributes: { lifts: 2, fire_safety: true } },

  // SOJ
  { id: '20000000-0000-0000-0000-000000000008', site_id: mockSites[3].id, name: 'Tower F', floors: 18, attributes: { lifts: 3, fire_safety: true } },
  { id: '20000000-0000-0000-0000-000000000009', site_id: mockSites[3].id, name: 'Clubhouse', floors: 2, attributes: { amenity_type: 'clubhouse' } }
];

// ==========================
// Spaces
// ==========================
export const mockSpaces: Space[] = [
  // WOJ
  { id: '30000000-0000-0000-0000-000000000001', org_id: mockOrganization.id, site_id: mockSites[0].id, code: 'A-1203', name: '3BHK Apartment', kind: 'apartment', floor: '12', building_block: mockBuildings[0].id, area_sqft: 1450, beds: 3, baths: 3, attributes: { furn: 'semi', view: 'garden' }, status: 'occupied', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },
  { id: '30000000-0000-0000-0000-000000000002', org_id: mockOrganization.id, site_id: mockSites[0].id, code: 'B-905', name: '2BHK Apartment', kind: 'apartment', floor: '9', building_block: mockBuildings[1].id, area_sqft: 980, beds: 2, baths: 2, attributes: { furn: 'unfurnished', view: 'city' }, status: 'available', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },
  { id: '30000000-0000-0000-0000-000000000003', org_id: mockOrganization.id, site_id: mockSites[0].id, code: 'Club-1', name: 'Club House', kind: 'common_area', floor: 'G', building_block: mockBuildings[2].id, area_sqft: 5000, attributes: { sports: ['swimming','tennis'] }, status: 'available', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },

  // POJ
  { id: '30000000-0000-0000-0000-000000000004', org_id: mockOrganization.id, site_id: mockSites[1].id, code: 'C-707', name: '2.5BHK Apartment', kind: 'apartment', floor: '7', building_block: mockBuildings[3].id, area_sqft: 1150, beds: 2, baths: 2, attributes: { study_room: true, balcony: 'large' }, status: 'occupied', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },
  { id: '30000000-0000-0000-0000-000000000005', org_id: mockOrganization.id, site_id: mockSites[1].id, code: 'D-1501', name: 'Duplex', kind: 'apartment', floor: '15', building_block: mockBuildings[4].id, area_sqft: 1800, beds: 3, baths: 3, attributes: { duplex: true, terrace: 'private' }, status: 'occupied', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },

  // IOJ
  { id: '30000000-0000-0000-0000-000000000006', org_id: mockOrganization.id, site_id: mockSites[2].id, code: 'RH-01', name: 'Row House', kind: 'row_house', floor: 'G', building_block: mockBuildings[5].id, area_sqft: 2200, beds: 4, baths: 4, attributes: { private_garden: true }, status: 'occupied', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },
  { id: '30000000-0000-0000-0000-000000000007', org_id: mockOrganization.id, site_id: mockSites[2].id, code: 'E-803', name: '2BHK Apartment', kind: 'apartment', floor: '8', building_block: mockBuildings[6].id, area_sqft: 950, beds: 2, baths: 2, attributes: { furn: 'semi' }, status: 'available', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },

  // SOJ
  { id: '30000000-0000-0000-0000-000000000008', org_id: mockOrganization.id, site_id: mockSites[3].id, code: 'F-1101', name: '3BHK Apartment', kind: 'apartment', floor: '11', building_block: mockBuildings[7].id, area_sqft: 1400, beds: 3, baths: 3, attributes: { furn: 'furnished' }, status: 'occupied', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' },
  { id: '30000000-0000-0000-0000-000000000009', org_id: mockOrganization.id, site_id: mockSites[3].id, code: 'Club-2', name: 'Club House', kind: 'common_area', floor: 'G', building_block: mockBuildings[8].id, area_sqft: 4000, attributes: { gym: true, indoor_games: true }, status: 'available', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-16T00:00:00Z' }
];

// ==========================
// Space Groups
// ==========================
export const mockSpaceGroups: SpaceGroup[] = [
  { id: '40000000-0000-0000-0000-000000000001', org_id: mockOrganization.id, site_id: mockSites[0].id, name: '2BHK', kind: 'apartment', specs: { base_rate: 7500000, amenities: ['parking', 'club_access'] } },
  { id: '40000000-0000-0000-0000-000000000002', org_id: mockOrganization.id, site_id: mockSites[0].id, name: '3BHK', kind: 'apartment', specs: { base_rate: 9500000, amenities: ['pool', 'club_access'] } },
  { id: '40000000-0000-0000-0000-000000000003', org_id: mockOrganization.id, site_id: mockSites[1].id, name: 'Duplex', kind: 'apartment', specs: { base_rate: 12000000, amenities: ['terrace', 'private_lift'] } },
  { id: '40000000-0000-0000-0000-000000000004', org_id: mockOrganization.id, site_id: mockSites[2].id, name: 'Row House', kind: 'row_house', specs: { base_rate: 18000000, amenities: ['private_garden', 'garage'] } }
];

// ==========================
// Space Group Members
// ==========================
export const mockSpaceGroupMembers: SpaceGroupMember[] = [
  { group_id: '40000000-0000-0000-0000-000000000002', space_id: '30000000-0000-0000-0000-000000000001' },
  { group_id: '40000000-0000-0000-0000-000000000001', space_id: '30000000-0000-0000-0000-000000000002' },
  { group_id: '40000000-0000-0000-0000-000000000003', space_id: '30000000-0000-0000-0000-000000000005' },
  { group_id: '40000000-0000-0000-0000-000000000004', space_id: '30000000-0000-0000-0000-000000000006' }
];

// Utility functions
export const getSpacesByKind = (kind: SpaceKind) => mockSpaces.filter(space => space.kind === kind);
export const getSpacesBySite = (siteId: string) => mockSpaces.filter(space => space.site_id === siteId);
export const getBuildingsBySite = (siteId: string) => mockBuildings.filter(building => building.site_id === siteId);
export const getSpaceGroupsBySite = (siteId: string) => mockSpaceGroups.filter(group => group.site_id === siteId);
export const getSpaceGroupMembers = (groupId: string) =>
  mockSpaceGroupMembers
    .filter(member => member.group_id === groupId)
    .map(member => mockSpaces.find(space => space.id === member.space_id))
    .filter(Boolean);

export const getBuildingBlocks = (siteId: string) => {
  const buildings = getBuildingsBySite(siteId);
  const spaces = getSpacesBySite(siteId);
  return buildings.map(building => ({
    id: building.id,
    name: building.name,
    floors: building.floors,
    totalSpaces: spaces.filter(s => s.building_block === building.id).length,
    occupiedSpaces: spaces.filter(s => s.building_block === building.id && s.status === 'occupied').length
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