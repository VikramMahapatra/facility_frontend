export interface Vendor {
  id: string;
  org_id: string;
  name: string;
  gst_vat_id?: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  categories: string[];
  rating: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Contract {
  id: string;
  org_id: string;
  vendor_id: string;
  vendor_name: string;
  site_id: string;
  title: string;
  type: 'AMC' | 'SLA' | 'Rent Share' | 'Cleaning' | 'Security';
  start_date: string;
  end_date: string;
  terms: {
    sla?: {
      response_hrs: number;
    };
    penalty?: {
      type: string;
      amount: number;
    };
  };
  documents: Array<{
    name: string;
    url: string;
  }>;
  status: 'active' | 'expired' | 'terminated';
  value: number;
}

export interface InventoryItem {
  id: string;
  org_id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  tracking: 'none' | 'batch' | 'serial';
  reorder_level: number;
  current_stock: number;
  unit_cost: number;
  attributes: Record<string, any>;
}

export interface PurchaseOrder {
  id: string;
  org_id: string;
  vendor_id: string;
  vendor_name: string;
  site_id: string;
  po_no: string;
  status: 'draft' | 'submitted' | 'approved' | 'partial' | 'received' | 'closed';
  currency: string;
  expected_date: string;
  total_amount: number;
  created_by: string;
  created_at: string;
  items: Array<{
    item_name: string;
    qty: number;
    price: number;
    tax_pct: number;
  }>;
}

export const mockVendors: Vendor[] = [
  {
    id: '1',
    org_id: 'org1',
    name: 'ABC Maintenance Services',
    gst_vat_id: 'GST123456789',
    contact: {
      email: 'contact@abcmaintenance.com',
      phone: '+91-9876543210',
      address: '123 Business Park, Mumbai, MH 400001'
    },
    categories: ['HVAC', 'Electrical', 'Plumbing'],
    rating: 4.5,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    org_id: 'org1',
    name: 'SecureGuard Security',
    gst_vat_id: 'GST987654321',
    contact: {
      email: 'info@secureguard.com',
      phone: '+91-9876543211',
      address: '456 Security Plaza, Delhi, DL 110001'
    },
    categories: ['Security', 'Surveillance'],
    rating: 4.2,
    status: 'active',
    created_at: '2024-02-10T09:30:00Z'
  },
  {
    id: '3',
    org_id: 'org1',
    name: 'CleanPro Services',
    gst_vat_id: 'GST456789123',
    contact: {
      email: 'hello@cleanpro.com',
      phone: '+91-9876543212',
      address: '789 Service Center, Bangalore, KA 560001'
    },
    categories: ['Housekeeping', 'Waste Management'],
    rating: 4.0,
    status: 'active',
    created_at: '2024-01-20T14:15:00Z'
  },
  {
    id: '4',
    org_id: 'org1',
    name: 'TechFix IT Solutions',
    gst_vat_id: 'GST789123456',
    contact: {
      email: 'support@techfix.com',
      phone: '+91-9876543213',
      address: '321 Tech Hub, Pune, MH 411001'
    },
    categories: ['IT Support', 'Network'],
    rating: 4.7,
    status: 'active',
    created_at: '2024-03-05T11:45:00Z'
  }
];

export const mockContracts: Contract[] = [
  {
    id: '1',
    org_id: 'org1',
    vendor_id: '1',
    vendor_name: 'ABC Maintenance Services',
    site_id: 'site1',
    title: 'HVAC Annual Maintenance Contract',
    type: 'AMC',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    terms: {
      sla: {
        response_hrs: 4
      },
      penalty: {
        type: 'percentage',
        amount: 2
      }
    },
    documents: [
      {
        name: 'AMC Agreement.pdf',
        url: '/documents/amc-agreement-1.pdf'
      }
    ],
    status: 'active',
    value: 500000
  },
  {
    id: '2',
    org_id: 'org1',
    vendor_id: '2',
    vendor_name: 'SecureGuard Security',
    site_id: 'site1',
    title: 'Security Services Contract',
    type: 'Security',
    start_date: '2024-02-01',
    end_date: '2025-01-31',
    terms: {
      sla: {
        response_hrs: 1
      }
    },
    documents: [
      {
        name: 'Security Contract.pdf',
        url: '/documents/security-contract-1.pdf'
      }
    ],
    status: 'active',
    value: 1200000
  },
  {
    id: '3',
    org_id: 'org1',
    vendor_id: '3',
    vendor_name: 'CleanPro Services',
    site_id: 'site1',
    title: 'Housekeeping Services Agreement',
    type: 'Cleaning',
    start_date: '2024-01-15',
    end_date: '2024-07-14',
    terms: {
      sla: {
        response_hrs: 2
      }
    },
    documents: [
      {
        name: 'Cleaning Agreement.pdf',
        url: '/documents/cleaning-agreement-1.pdf'
      }
    ],
    status: 'active',
    value: 300000
  }
];

export const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    org_id: 'org1',
    sku: 'HVAC-001',
    name: 'Air Filter - HEPA Grade',
    category: 'HVAC Parts',
    uom: 'ea',
    tracking: 'batch',
    reorder_level: 10,
    current_stock: 25,
    unit_cost: 500,
    attributes: {
      size: '20x25x1',
      efficiency: '99.97%'
    }
  },
  {
    id: '2',
    org_id: 'org1',
    sku: 'ELEC-001',
    name: 'LED Bulb - 12W',
    category: 'Electrical',
    uom: 'ea',
    tracking: 'none',
    reorder_level: 50,
    current_stock: 120,
    unit_cost: 150,
    attributes: {
      wattage: '12W',
      color_temp: '4000K'
    }
  },
  {
    id: '3',
    org_id: 'org1',
    sku: 'PLMB-001',
    name: 'PVC Pipe - 4 inch',
    category: 'Plumbing',
    uom: 'mtr',
    tracking: 'none',
    reorder_level: 100,
    current_stock: 250,
    unit_cost: 80,
    attributes: {
      diameter: '4 inch',
      pressure: '6 kg/cm²'
    }
  },
  {
    id: '4',
    org_id: 'org1',
    sku: 'CLEAN-001',
    name: 'Disinfectant Spray',
    category: 'Cleaning Supplies',
    uom: 'ltr',
    tracking: 'batch',
    reorder_level: 20,
    current_stock: 35,
    unit_cost: 200,
    attributes: {
      volume: '1 liter',
      type: 'Multi-surface'
    }
  }
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    org_id: 'org1',
    vendor_id: '1',
    vendor_name: 'ABC Maintenance Services',
    site_id: 'site1',
    po_no: 'PO-2024-001',
    status: 'approved',
    currency: 'INR',
    expected_date: '2024-04-15',
    total_amount: 25000,
    created_by: 'Jaganath Gera',
    created_at: '2024-03-15T10:00:00Z',
    items: [
      {
        item_name: 'Air Filter - HEPA Grade',
        qty: 20,
        price: 500,
        tax_pct: 18
      },
      {
        item_name: 'Motor Oil - 5W30',
        qty: 10,
        price: 800,
        tax_pct: 18
      }
    ]
  },
  {
    id: '2',
    org_id: 'org1',
    vendor_id: '2',
    vendor_name: 'SecureGuard Security',
    site_id: 'site1',
    po_no: 'PO-2024-002',
    status: 'partial',
    currency: 'INR',
    expected_date: '2024-04-20',
    total_amount: 15000,
    created_by: 'Jane Smith',
    created_at: '2024-03-18T14:30:00Z',
    items: [
      {
        item_name: 'Security Camera',
        qty: 5,
        price: 2500,
        tax_pct: 18
      }
    ]
  },
  {
    id: '3',
    org_id: 'org1',
    vendor_id: '3',
    vendor_name: 'CleanPro Services',
    site_id: 'site1',
    po_no: 'PO-2024-003',
    status: 'draft',
    currency: 'INR',
    expected_date: '2024-04-25',
    total_amount: 8000,
    created_by: 'Mike Johnson',
    created_at: '2024-03-20T09:15:00Z',
    items: [
      {
        item_name: 'Disinfectant Spray',
        qty: 30,
        price: 200,
        tax_pct: 18
      },
      {
        item_name: 'Toilet Paper',
        qty: 50,
        price: 50,
        tax_pct: 5
      }
    ]
  }
];