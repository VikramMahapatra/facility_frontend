import * as z from "zod";

export const ticketWorkOrderSchema = z.object({
  ticket_id: z.string().min(1, "Ticket is required"),
  description: z.string().min(1, "Description is required"),
  assigned_to: z.string().optional(),
  vendor_name: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  labour_cost: z
    .number()
    .min(0, "Labour cost cannot be negative")
    .optional(),
  material_cost: z
    .number()
    .min(0, "Material cost cannot be negative")
    .optional(),
  other_expenses: z
    .number()
    .min(0, "Other expenses cannot be negative")
    .optional(),
  estimated_time: z
    .coerce
    .number({
      required_error: "Estimated time is required",
      invalid_type_error: "Estimated time is required",
    })
    .min(1, "Estimated time must be at least 1 minute")
    .int("Estimated time must be a whole number"),
  special_instructions: z.string().optional(),
});

export type TicketWorkOrderFormValues = z.infer<typeof ticketWorkOrderSchema>;

