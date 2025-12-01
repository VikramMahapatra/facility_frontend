import * as z from "zod";

export const ticketWorkOrderSchema = z.object({
  ticket_id: z.string().min(1, "Ticket is required"),
  description: z.string().min(1, "Description is required"),
  assigned_to: z.string().optional(),
  vendor_name: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  labour_cost: z.number().optional(),
  material_cost: z.number().optional(),
  other_expenses: z.number().optional(),
  estimated_time: z.number().optional(),
  special_instructions: z.string().optional(),
});

export type TicketWorkOrderFormValues = z.infer<typeof ticketWorkOrderSchema>;

