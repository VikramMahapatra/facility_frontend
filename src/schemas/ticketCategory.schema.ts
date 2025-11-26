import * as z from "zod";

export const ticketCategorySchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
  site_id: z.string().min(1, "Site is required"),
  auto_assign_role: z.string().min(1, "Auto-Assign Role is required"),
  sla_hours: z.coerce.number().min(1, "SLA hours must be at least 1").optional(),
  sla_id: z.string().min(1, "SLA Policy is required"),
  is_active: z.boolean().default(true),
  status: z.string().optional(),
});

export type TicketCategoryFormValues = z.infer<typeof ticketCategorySchema>;

