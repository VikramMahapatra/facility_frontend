import * as z from "zod";

export const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category_id: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high"]).default("low"),
  request_type: z.enum(["unit", "community"]).default("unit"),
  site_id: z.string().min(1, "Site is required"),
  space_id: z.string().min(1, "Space is required"),
  tenant_id: z.string().optional(),
  preferred_time: z.string().optional(),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

