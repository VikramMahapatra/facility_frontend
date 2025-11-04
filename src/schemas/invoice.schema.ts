import * as z from "zod";

export const invoiceSchema = z.object({
    invoice_no: z.string().min(1, "Invoice No is required"),
    site_id: z.string().min(1, "Site is required"),
    customer_kind: z.enum(["resident", "merchant", "guest", "staff", "other"], {
        required_error: "Customer Type is required",
    }),
    customer_id: z.string().min(1, "Customer is required"),
    date: z.string().min(1, "Invoice Date is required"),
    due_date: z.string().optional(),
    status: z.enum(["draft", "issued", "paid", "partial", "void"]).optional(),
    currency: z.string().optional(),
    totals: z.object({
        sub: z.coerce.number().min(0, "Subtotal cannot be negative").optional(),
        tax: z.coerce.number().min(0, "Tax cannot be negative").optional(),
        grand: z.coerce.number().min(0, "Grand total cannot be negative").optional(),
    }).optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

