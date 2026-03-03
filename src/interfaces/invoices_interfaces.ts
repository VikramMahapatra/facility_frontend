import { BackendAttachment } from "@/helpers/attachmentHelper";

export interface Invoice {
  id?: string;
  org_id?: string;
  site_id: string;
  site_name?: string;
  building_id?: string;
  building_name?: string;
  space_id?: string;
  space_name?: string;
  customer_kind: "resident" | "merchant" | "guest" | "staff" | "other"; // ✅ Match service request types
  user_id?: string;
  user_name?: string;
  code?: string;
  invoice_no: string;
  date: string;
  due_date: string;
  status: "draft" | "issued" | "paid" | "partial" | "void" | "overdue";
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
  attachments?: BackendAttachment[];
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  item_id: string;
  code: string;
  description: string;
  item_no?: string;
  item_label?: string;
  amount: number;
  tax_pct: number;
}

export interface PaymentInput {
  method?: "upi" | "card" | "bank" | "cash" | "cheque" | "gateway";
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
  method: "upi" | "card" | "bank" | "cash" | "cheque" | "gateway";
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

export interface Bill {
  id?: string;
  org_id?: string;
  site_id: string;
  site_name?: string;
  building_id?: string;
  building_name?: string;
  space_id?: string;
  space_name?: string;
  vendor_id?: string;
  vendor_name?: string;
  billable_item_name?: string;
  billable_item_type?: string;
  billable_item_id?: string;
  bill_no: string;
  date: string;
  status: "draft" | "approved" | "paid" | "partial";
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
  attachments?: BackendAttachment[];
}

export interface BillOverview {
  totalBills: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}
