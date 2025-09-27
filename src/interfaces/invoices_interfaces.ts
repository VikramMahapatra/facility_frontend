export interface Invoice {
    id: string;
    org_id: string;
    site_id: string;
    customer_kind: 'resident' | 'partner' | 'guest';
    customer_id: string;
    customer_name: string;
    invoice_no: string;
    date: string;
    due_date: string;
    status: 'draft' | 'issued' | 'paid' | 'partial' | 'void';
    currency: string;
    totals: {
        sub: number;
        tax: number;
        grand: number;
    };
    meta?: any;
    lines?: InvoiceLine[];
    created_at?: string;
    updated_at?: string;
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
    org_id: string;
    invoice_id: string;
    invoice_no: string;
    customer_name: string;
    method: 'upi' | 'card' | 'bank' | 'cash' | 'cheque' | 'gateway';
    ref_no: string;
    amount: number;
    paid_at: string;
    meta?: any;
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

export interface InvoiceOverview {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
}