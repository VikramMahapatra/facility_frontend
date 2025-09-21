// Mock data for leasing and tenants functionality
import { mockSpaces, mockSites } from "./mockSpacesData";

export interface Contact {
  id: string;
  org_id: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'company';
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  created_at: string;
}

export interface CommercialPartner {
  id: string;
  org_id: string;
  site_id: string;
  space_id?: string;
  type: 'merchant' | 'brand' | 'kiosk';
  legal_name: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    };
  };
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export interface Lease {
  id: string;
  org_id: string;
  site_id: string;
  partner_id?: string;
  resident_id?: string;
  space_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount?: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  escalation?: {
    pct: number;
    every_months: number;
  };
  revenue_share?: {
    pct: number;
    min_guarantee: number;
  };
  cam_method: 'area_share' | 'fixed' | 'metered';
  cam_rate?: number;
  utilities?: {
    electricity: 'submeter' | 'fixed' | 'excluded';
    water: 'submeter' | 'fixed' | 'excluded';
    gas?: 'submeter' | 'fixed' | 'excluded';
  };
  status: 'active' | 'expired' | 'terminated' | 'draft';
  documents?: string[];
  created_at: string;
}

export interface Sublease {
  id: string;
  lease_id: string;
  subtenant_partner_id?: string;
  subtenant_resident_id?: string;
  space_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount?: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  escalation?: {
    pct: number;
    every_months: number;
  };
  revenue_share?: {
    pct: number;
    min_guarantee: number;
  };
  cam_method: 'area_share' | 'fixed' | 'metered';
  cam_rate?: number;
  utilities?: {
    electricity: 'submeter' | 'fixed' | 'excluded';
    water: 'submeter' | 'fixed' | 'excluded';
  };
  status: 'active' | 'expired' | 'terminated' | 'draft';
  documents?: string[];
  created_at: string;
}

export interface LeaseTenant {
  lease_id: string;
  contact_id: string;
  is_primary: boolean;
}

export interface LeaseCharge {
  id: string;
  lease_id: string;
  charge_code: 'RENT' | 'CAM' | 'ELEC' | 'WATER' | 'PARK' | 'PENALTY' | 'MAINTENANCE';
  period_start: string;
  period_end: string;
  amount: number;
  tax_pct: number;
  metadata?: {
    description?: string;
    units?: number;
    rate?: number;
  };
  created_at: string;
}

// Mock Contacts
export const mockContacts: Contact[] = [
  {
    id: "contact-1",
    org_id: "org-1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+91-9876543210",
    type: "individual",
    address: {
      line1: "123 Green Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "400001"
    },
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "contact-2",
    org_id: "org-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+91-9876543211",
    type: "individual",
    created_at: "2024-02-20T11:30:00Z"
  },
  {
    id: "contact-3",
    org_id: "org-1",
    name: "Tech Solutions Pvt Ltd",
    email: "info@techsolutions.com",
    phone: "+91-9876543212",
    type: "company",
    address: {
      line1: "456 Business Park",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      pincode: "560001"
    },
    created_at: "2024-03-10T09:15:00Z"
  }
];

// Mock Commercial Partners
export const mockCommercialPartners: CommercialPartner[] = [
  {
    id: "partner-1",
    org_id: "org-1",
    site_id: "site-1",
    space_id: "space-shop-1",
    type: "merchant",
    legal_name: "McDonald's India Pvt Ltd",
    contact: {
      name: "Rajesh Kumar",
      email: "rajesh@mcdonalds.in",
      phone: "+91-9876543220",
      address: {
        line1: "Corporate Office, Block A",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        pincode: "400070"
      }
    },
    status: "active",
    created_at: "2024-01-20T08:00:00Z"
  },
  {
    id: "partner-2",
    org_id: "org-1",
    site_id: "site-1",
    space_id: "space-shop-2",
    type: "brand",
    legal_name: "Starbucks Coffee Company",
    contact: {
      name: "Priya Sharma",
      email: "priya@starbucks.in",
      phone: "+91-9876543221"
    },
    status: "active",
    created_at: "2024-02-15T10:30:00Z"
  },
  {
    id: "partner-3",
    org_id: "org-1",
    site_id: "site-2",
    space_id: "space-shop-3",
    type: "kiosk",
    legal_name: "Mobile Accessories Hub",
    contact: {
      name: "Amit Patel",
      email: "amit@mobilehub.com",
      phone: "+91-9876543222"
    },
    status: "active",
    created_at: "2024-03-01T14:20:00Z"
  }
];

// Mock Leases
export const mockLeases: Lease[] = [
  {
    id: "lease-1",
    org_id: "org-1",
    site_id: "site-1",
    partner_id: "partner-1",
    space_id: "space-shop-1",
    start_date: "2024-01-01",
    end_date: "2026-12-31",
    rent_amount: 150000,
    deposit_amount: 450000,
    frequency: "monthly",
    escalation: {
      pct: 5,
      every_months: 12
    },
    revenue_share: {
      pct: 8,
      min_guarantee: 150000
    },
    cam_method: "area_share",
    cam_rate: 25.50,
    utilities: {
      electricity: "submeter",
      water: "fixed"
    },
    status: "active",
    documents: ["lease_agreement.pdf", "deposit_receipt.pdf"],
    created_at: "2024-01-01T12:00:00Z"
  },
  {
    id: "lease-2",
    org_id: "org-1",
    site_id: "site-1",
    partner_id: "partner-2",
    space_id: "space-shop-2",
    start_date: "2024-02-01",
    end_date: "2027-01-31",
    rent_amount: 200000,
    deposit_amount: 600000,
    frequency: "monthly",
    escalation: {
      pct: 6,
      every_months: 12
    },
    cam_method: "fixed",
    cam_rate: 15000,
    utilities: {
      electricity: "submeter",
      water: "submeter"
    },
    status: "active",
    created_at: "2024-02-01T09:30:00Z"
  },
  {
    id: "lease-3",
    org_id: "org-1",
    site_id: "site-1",
    resident_id: "contact-1",
    space_id: "space-apt-1",
    start_date: "2024-03-01",
    end_date: "2025-02-28",
    rent_amount: 45000,
    deposit_amount: 135000,
    frequency: "monthly",
    cam_method: "area_share",
    cam_rate: 8.75,
    utilities: {
      electricity: "submeter",
      water: "fixed"
    },
    status: "active",
    created_at: "2024-03-01T16:45:00Z"
  }
];

// Mock Subleases
export const mockSubleases: Sublease[] = [
  {
    id: "sublease-1",
    lease_id: "lease-1",
    subtenant_partner_id: "partner-3",
    space_id: "space-shop-1",
    start_date: "2024-06-01",
    end_date: "2024-12-31",
    rent_amount: 80000,
    deposit_amount: 160000,
    frequency: "monthly",
    cam_method: "fixed",
    cam_rate: 5000,
    utilities: {
      electricity: "fixed",
      water: "fixed"
    },
    status: "active",
    created_at: "2024-06-01T11:20:00Z"
  }
];

// Mock Lease Tenants
export const mockLeaseTenants: LeaseTenant[] = [
  {
    lease_id: "lease-3",
    contact_id: "contact-1",
    is_primary: true
  },
  {
    lease_id: "lease-3",
    contact_id: "contact-2",
    is_primary: false
  }
];

// Mock Lease Charges
export const mockLeaseCharges: LeaseCharge[] = [
  {
    id: "charge-1",
    lease_id: "lease-1",
    charge_code: "RENT",
    period_start: "2024-01-01",
    period_end: "2024-01-31",
    amount: 150000,
    tax_pct: 18,
    metadata: {
      description: "Monthly rent for January 2024"
    },
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "charge-2",
    lease_id: "lease-1",
    charge_code: "CAM",
    period_start: "2024-01-01",
    period_end: "2024-01-31",
    amount: 15000,
    tax_pct: 18,
    metadata: {
      description: "Common Area Maintenance - January 2024",
      units: 1000,
      rate: 15
    },
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "charge-3",
    lease_id: "lease-1",
    charge_code: "ELEC",
    period_start: "2024-01-01",
    period_end: "2024-01-31",
    amount: 12500,
    tax_pct: 18,
    metadata: {
      description: "Electricity charges - January 2024",
      units: 250,
      rate: 50
    },
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "charge-4",
    lease_id: "lease-2",
    charge_code: "RENT",
    period_start: "2024-02-01",
    period_end: "2024-02-28",
    amount: 200000,
    tax_pct: 18,
    created_at: "2024-02-01T00:00:00Z"
  },
  {
    id: "charge-5",
    lease_id: "lease-3",
    charge_code: "RENT",
    period_start: "2024-03-01",
    period_end: "2024-03-31",
    amount: 45000,
    tax_pct: 0,
    created_at: "2024-03-01T00:00:00Z"
  }
];

// Helper functions
export const getContactById = (id: string): Contact | null => {
  return mockContacts.find(contact => contact.id === id) || null;
};

export const getPartnerById = (id: string): CommercialPartner | null => {
  return mockCommercialPartners.find(partner => partner.id === id) || null;
};

export const getLeaseById = (id: string): Lease | null => {
  return mockLeases.find(lease => lease.id === id) || null;
};

export const getChargesByLeaseId = (leaseId: string): LeaseCharge[] => {
  return mockLeaseCharges.filter(charge => charge.lease_id === leaseId);
};

export const getTenantsByLeaseId = (leaseId: string): LeaseTenant[] => {
  return mockLeaseTenants.filter(tenant => tenant.lease_id === leaseId);
};

// Re-export from mockSpacesData
export { mockSpaces, mockSites };