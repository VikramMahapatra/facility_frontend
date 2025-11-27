import * as z from "zod";

export const ticketWorkOrderSchema = z.object({
  ticket_id: z.string().min(1, "Ticket is required"),
  description: z.string().min(1, "Description is required"),
  assigned_to: z.string().optional(),
  status: z.string().min(1, "Status is required"),
});

export type TicketWorkOrderFormValues = z.infer<typeof ticketWorkOrderSchema>;

