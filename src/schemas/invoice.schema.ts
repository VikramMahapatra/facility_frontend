import * as z from "zod";

export const invoiceSchema = z
  .object({
    site_id: z.string().min(1, "Site is required"),
    customer_kind: z
      .enum(["resident", "merchant", "guest", "staff", "other"])
      .optional(),
    customer_id: z.string().optional(),
    date: z.string().min(1, "Invoice Date is required"),
    due_date: z.string().min(1, "Due date is required"),
    status: z.enum(["draft", "issued", "paid", "partial", "void"]).optional(),
    currency: z.string().optional(),
    billable_item_type: z.enum(["lease_charge", "work_order"], {
      required_error: "Invoice type is required",
    }),
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
    payment_modes: z
      .array(
        z.object({
          payment_type: z.string().optional(),
          amount: z.string().optional(),
        })
      )
      .optional(),
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
    }
  );

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
