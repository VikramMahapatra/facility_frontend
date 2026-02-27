import * as z from "zod";

const paymentSchema = z
  .object({
    method: z.enum(["upi", "card", "bank", "cash", "cheque", "gateway"], {
      required_error: "Payment method is required",
    }),

    ref_no: z.string().optional(),

    paid_at: z.string().min(1, "Payment date is required"),

    amount: z.coerce
      .number()
      .positive("Payment amount must be greater than zero"),
  })
  .refine(
    (data) => {
      // Reference number required for non-cash payments
      if (data.method === "cash") return true;
      return !!data.ref_no && data.ref_no.trim().length > 0;
    },
    {
      message: "Reference number is required for this payment method",
      path: ["ref_no"],
    },
  );

const invoiceLineSchema = z.object({
  item_id: z.string().min(1, "Period is required"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
  tax_pct: z.coerce.number().min(0, "Tax percentage cannot be negative").default(5),
});

export const invoiceSchema = z
  .object({
    invoice_no: z.string().optional(),
    site_id: z.string().min(1, "Site is required"),
    building_id: z.string().optional(),
    space_id: z.string().optional(),
    user_id: z.string().optional(),
    lines: z
      .array(invoiceLineSchema)
      .min(1, "At least one line item is required"),
    code: z.string().min(1, "Invoice type is required"),
    customer_email: z
      .string()
      .optional()
      .or(z.literal("")),
    customer_phone: z.string().optional(),
    customer_kind: z
      .enum(["resident", "merchant", "guest", "staff", "other"])
      .optional(),
    customer_id: z.string().optional(),
    date: z.string().min(1, "Invoice Date is required"),
    due_date: z.string().min(1, "Due date is required"),
    status: z
      .enum(["draft", "issued", "paid", "partial", "void", "overdue"])
      .optional(),
    currency: z.string().optional(),
    billable_item_type: z.string().optional(),
    billable_item_id: z.string().optional(),
    customer_name: z.string().optional(),
    //items: z.array(invoiceLineSchema).min(1, "At least one item is required"),
    totals: z
      .object({
        sub: z.coerce.number().min(0, "Subtotal cannot be negative").optional(),
        tax: z.coerce.number().min(0, "Tax cannot be negative").optional(),
        grand: z.coerce
          .number()
          .min(0, "Grand total cannot be negative")
          .optional(),
      })
      .optional(),
    payments: z.array(paymentSchema).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.due_date || !data.date) return true;
      const purchaseDate = new Date(data.date);
      const dueDate = new Date(data.due_date);
      return dueDate >= purchaseDate;
    },
    {
      message: "Due date must be on or after the invoice date",
      path: ["due_date"],
    },
  );

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
