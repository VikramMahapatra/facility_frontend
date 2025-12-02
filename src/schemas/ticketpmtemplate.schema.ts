import * as z from "zod";

export const ticketPMTemplateSchema = z.object({
  template_name: z.string().min(1, "Template name is required"),
  category_id: z.string().min(1, "Category is required"),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], {
    required_error: "Frequency is required",
  }),
  description: z.string().min(1, "Description is required"),
  assigned_to: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: "Priority is required",
  }),
  estimated_duration: z.coerce.number({
    invalid_type_error: "Expected number"
  }).min(1, "Duration must be at least 1 minute").int("Duration must be a whole number").optional(),
  status: z.enum(['active', 'inactive'], {
    required_error: "Status is required",
  }),
  instructions: z.string().optional(),
});

export type TicketPMTemplateFormValues = z.infer<typeof ticketPMTemplateSchema>;



