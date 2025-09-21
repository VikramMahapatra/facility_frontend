export interface Invoice {
  id: string;
  orgId: string;
  siteId: string;
  customerKind: 'resident' | 'partner' | 'guest';
  customerId: string;
  customerName: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'issued' | 'paid' | 'partial' | 'void';
  currency: string;
  totals: {
    subtotal: number;
    tax: number;
    grand: number;
  };
  metadata?: any;
  lines?: InvoiceLine[];
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  code: string;
  description: string;
  qty: number;
  price: number;
  taxPct: number;
}

export interface Payment {
  id: string;
  orgId: string;
  invoiceId: string;
  invoiceNo: string;
  customerName: string;
  method: 'upi' | 'card' | 'bank' | 'cash' | 'cheque' | 'gateway';
  refNo: string;
  amount: number;
  paidAt: string;
  metadata?: any;
}

export interface TaxCode {
  id: string;
  orgId: string;
  code: string;
  rate: number;
  jurisdiction: string;
  accounts?: any;
}

export interface RevenueReport {
  month: string;
  rent: number;
  cam: number;
  utilities: number;
  penalties: number;
  total: number;
  collected: number;
  outstanding: number;
}

// Mock Data
export const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    orgId: "org-1",
    siteId: "site-1",
    customerKind: "partner",
    customerId: "partner-1",
    customerName: "Tech Solutions Pvt Ltd",
    invoiceNo: "INV-2024-001",
    date: "2024-01-01",
    dueDate: "2024-01-15",
    status: "paid",
    currency: "INR",
    totals: {
      subtotal: 50000,
      tax: 9000,
      grand: 59000
    }
  },
  {
    id: "inv-002",
    orgId: "org-1",
    siteId: "site-1",
    customerKind: "resident",
    customerId: "resident-1",
    customerName: "John Smith",
    invoiceNo: "INV-2024-002",
    date: "2024-01-01",
    dueDate: "2024-01-10",
    status: "issued",
    currency: "INR",
    totals: {
      subtotal: 25000,
      tax: 4500,
      grand: 29500
    }
  },
  {
    id: "inv-003",
    orgId: "org-1",
    siteId: "site-2",
    customerKind: "guest",
    customerId: "guest-1",
    customerName: "Sarah Wilson",
    invoiceNo: "INV-2024-003",
    date: "2024-02-01",
    dueDate: "2024-02-05",
    status: "partial",
    currency: "INR",
    totals: {
      subtotal: 8000,
      tax: 960,
      grand: 8960
    }
  },
  {
    id: "inv-004",
    orgId: "org-1",
    siteId: "site-1",
    customerKind: "partner",
    customerId: "partner-2",
    customerName: "Food Court Express",
    invoiceNo: "INV-2024-004",
    date: "2024-02-15",
    dueDate: "2024-03-01",
    status: "draft",
    currency: "INR",
    totals: {
      subtotal: 75000,
      tax: 13500,
      grand: 88500
    }
  }
];

export const mockInvoiceLines: InvoiceLine[] = [
  {
    id: "line-001",
    invoiceId: "inv-001",
    code: "RENT",
    description: "Monthly Rent - Office Space SH-101",
    qty: 1,
    price: 40000,
    taxPct: 18
  },
  {
    id: "line-002",
    invoiceId: "inv-001",
    code: "CAM",
    description: "Common Area Maintenance",
    qty: 1,
    price: 10000,
    taxPct: 18
  },
  {
    id: "line-003",
    invoiceId: "inv-002",
    code: "RENT",
    description: "Monthly Rent - Apartment A-1201",
    qty: 1,
    price: 25000,
    taxPct: 18
  },
  {
    id: "line-004",
    invoiceId: "inv-003",
    code: "ROOM",
    description: "Hotel Room - Deluxe King (3 nights)",
    qty: 3,
    price: 2500,
    taxPct: 12
  },
  {
    id: "line-005",
    invoiceId: "inv-003",
    code: "SERVICE",
    description: "Room Service",
    qty: 1,
    price: 500,
    taxPct: 18
  }
];

export const mockPayments: Payment[] = [
  {
    id: "pay-001",
    orgId: "org-1",
    invoiceId: "inv-001",
    invoiceNo: "INV-2024-001",
    customerName: "Tech Solutions Pvt Ltd",
    method: "bank",
    refNo: "TXN123456789",
    amount: 59000,
    paidAt: "2024-01-10T10:30:00Z"
  },
  {
    id: "pay-002",
    orgId: "org-1",
    invoiceId: "inv-003",
    invoiceNo: "INV-2024-003",
    customerName: "Sarah Wilson",
    method: "upi",
    refNo: "UPI987654321",
    amount: 5000,
    paidAt: "2024-02-03T14:15:00Z"
  },
  {
    id: "pay-003",
    orgId: "org-1",
    invoiceId: "inv-002",
    invoiceNo: "INV-2024-002",
    customerName: "John Smith",
    method: "card",
    refNo: "CARD456789123",
    amount: 15000,
    paidAt: "2024-01-08T16:45:00Z"
  }
];

export const mockTaxCodes: TaxCode[] = [
  {
    id: "tax-001",
    orgId: "org-1",
    code: "GST_18",
    rate: 18,
    jurisdiction: "IN"
  },
  {
    id: "tax-002",
    orgId: "org-1",
    code: "GST_12",
    rate: 12,
    jurisdiction: "IN"
  },
  {
    id: "tax-003",
    orgId: "org-1",
    code: "GST_5",
    rate: 5,
    jurisdiction: "IN"
  },
  {
    id: "tax-004",
    orgId: "org-1",
    code: "CGST_SGST",
    rate: 9,
    jurisdiction: "IN"
  }
];

export const mockRevenueReports: RevenueReport[] = [
  {
    month: "2024-01",
    rent: 450000,
    cam: 85000,
    utilities: 65000,
    penalties: 5000,
    total: 605000,
    collected: 580000,
    outstanding: 25000
  },
  {
    month: "2024-02",
    rent: 475000,
    cam: 90000,
    utilities: 70000,
    penalties: 8000,
    total: 643000,
    collected: 615000,
    outstanding: 28000
  },
  {
    month: "2024-03",
    rent: 485000,
    cam: 92000,
    utilities: 72000,
    penalties: 3000,
    total: 652000,
    collected: 640000,
    outstanding: 12000
  },
  {
    month: "2024-04",
    rent: 495000,
    cam: 95000,
    utilities: 75000,
    penalties: 6000,
    total: 671000,
    collected: 658000,
    outstanding: 13000
  },
  {
    month: "2024-05",
    rent: 510000,
    cam: 98000,
    utilities: 78000,
    penalties: 4000,
    total: 690000,
    collected: 675000,
    outstanding: 15000
  },
  {
    month: "2024-06",
    rent: 525000,
    cam: 100000,
    utilities: 80000,
    penalties: 7000,
    total: 712000,
    collected: 695000,
    outstanding: 17000
  }
];

// Helper functions for lease invoice generation
export const generateLeaseInvoices = (lease: any) => {
  const invoices = [];
  const startDate = new Date(lease.startDate);
  const endDate = new Date(lease.endDate);
  
  let currentDate = new Date(startDate);
  let invoiceCounter = 1;
  
  while (currentDate <= endDate) {
    const invoice: Invoice = {
      id: `lease-inv-${lease.id}-${invoiceCounter}`,
      orgId: lease.orgId,
      siteId: lease.siteId,
      customerKind: lease.partnerId ? 'partner' : 'resident',
      customerId: lease.partnerId || lease.residentId,
      customerName: `Customer ${invoiceCounter}`,
      invoiceNo: `LEASE-${lease.id}-${String(invoiceCounter).padStart(3, '0')}`,
      date: currentDate.toISOString().split('T')[0],
      dueDate: new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: currentDate <= new Date() ? 'issued' : 'draft',
      currency: 'INR',
      totals: {
        subtotal: lease.rentAmount,
        tax: lease.rentAmount * 0.18,
        grand: lease.rentAmount * 1.18
      }
    };
    
    invoices.push(invoice);
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    invoiceCounter++;
  }
  
  return invoices;
};