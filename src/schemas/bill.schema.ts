import * as z from "zod";

const paymentSchema = z.object({
  method: z.enum(["upi", "card", "bank", "cash", "cheque", "gateway"], {
    required_error: "Payment method is required",
  }),
  paid_at: z.string().min(1, "Payment date is required"),
  amount: z.coerce
    .number()
    .positive("Payment amount must be greater than zero"),
});

const billLineSchema = z.object({
  item: z.string().min(1, "Period is required"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
  tax: z.coerce.number().min(0, "Tax percentage cannot be negative").default(5),
});

export const billSchema = z
  .object({
    bill_no: z.string().optional(),
    site_id: z.string().min(1, "Site is required"),
    building_id: z.string().optional(),
    space_id: z.string().optional(),
    vendor_id: z.string().min(1, "Vendor is required"),
    vendor_name: z.string().optional(),
    vendor_email: z.string().optional(),
    vendor_phone: z.string().optional(),
    date: z.string().min(1, "Bill Date is required"),
    status: z
      .enum(["draft", "approved", "paid", "partial"])
      .optional(),
    currency: z.string().optional(),
    billable_item_type: z.string().optional(),
    billable_item_id: z.string().optional(),
    code: z.string().optional(), // For work order type
    items: z.array(billLineSchema).min(1, "At least one item is required"),
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

export type BillFormValues = z.infer<typeof billSchema>;
