import * as z from "zod";

const checklistItemSchema = z.object({
  step: z.number().min(1, "Step must be at least 1"),
  pass_fail: z.boolean(),
  instruction: z.string().optional(),
});

const slaConfigSchema = z.object({
  priority: z.string().optional(),
  resolve_hrs: z.coerce.number().min(0, "Resolve hours must be greater than 0").optional(),
  response_hrs: z.coerce.number().min(0, "Response hours must be greater than 0").optional(),
}).optional();

export const pmTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category_id: z.string().min(1, "Asset category is required"),
  frequency: z.string().min(1, "Frequency is required"),
  status: z.string().min(1, "Status is required"),
  start_date: z.string().optional().nullable(),
  checklist: z.array(checklistItemSchema).min(1, "At least one checklist item is required"),
  meter_metric: z.string().optional(),
  threshold: z.coerce.number().min(1, "Threshold must be greater than 0").optional(),
  sla: slaConfigSchema,
});

export type PMTemplateFormValues = z.infer<typeof pmTemplateSchema>;

