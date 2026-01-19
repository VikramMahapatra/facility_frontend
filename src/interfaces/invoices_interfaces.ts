export interface Invoice {
    id?: string;
    org_id?: string;
    site_id: string;
    site_name?: string;
    customer_kind: 'resident' | 'merchant' | 'guest' | 'staff' | 'other'; // ✅ Match service request types
    customer_id?: string;
    customer_name?: string;
    billable_item_name?: string;
    billable_item_type?: string;
    billable_item_id?: string;
    invoice_no: string;
    date: string;
    due_date: string;
    status: 'draft' | 'issued' | 'paid' | 'partial' | 'void' | 'overdue';
    currency: string;
    totals: {
        sub: number;
        tax: number;
        grand: number;
    };
    is_paid?: boolean;
    meta?: any;
    lines?: InvoiceLine[];
    created_at?: string;
    updated_at?: string;
    payments?: PaymentInput[];
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

export interface PaymentInput {
    method?: 'upi' | 'card' | 'bank' | 'cash' | 'cheque' | 'gateway';
    ref_no?: string;
    amount?: number;
    paid_at: string;
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