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
    }
  );

export const billSchema = z
  .object({
    site_id: z.string().min(1, "Site is required"),
    building_id: z.string().optional(),
    space_id: z.string().optional(),
    vendor_id: z.string().min(1, "Vendor is required"),
    date: z.string().min(1, "Bill Date is required"),
    due_date: z.string().min(1, "Due date is required"),
    status: z
      .enum(["draft", "issued", "paid", "partial", "void", "overdue"])
      .optional(),
    currency: z.string().optional(),
    billable_item_type: z.string().min(1, "Billable item type is required"),
    billable_item_id: z.string().min(1, "Billable item is required"),
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
  })
  .refine(
    (data) => {
      if (!data.due_date || !data.date) return true;
      const purchaseDate = new Date(data.date);
      const dueDate = new Date(data.due_date);
      return dueDate >= purchaseDate;
    },
    {
      message: "Due date must be on or after the bill date",
      path: ["due_date"],
    }
  );

export type BillFormValues = z.infer<typeof billSchema>;
