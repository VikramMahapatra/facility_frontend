import * as z from "zod";

const checklistItemSchema = z.object({
  step: z.number().min(1, "Step must be at least 1"),
  pass_fail: z.boolean(),
  instruction: z.string().min(1, "Instruction is required"),
});

const slaConfigSchema = z.object({
  priority: z.string().optional(),
  resolve_hrs: z.coerce.number().min(0, "Resolve hours cannot be negative").optional(),
  response_hrs: z.coerce.number().min(0, "Response hours cannot be negative").optional(),
}).optional();

export const pmTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category_id: z.string().optional().nullable(),
  frequency: z.string().min(1, "Frequency is required"),
  status: z.string().min(1, "Status is required"),
  next_due: z.string().optional().nullable(),
  checklist: z.array(checklistItemSchema).min(1, "At least one checklist item is required"),
  meter_metric: z.string().optional(),
  threshold: z.coerce.number().min(0, "Threshold cannot be negative").optional(),
  sla: slaConfigSchema,
});

export type PMTemplateFormValues = z.infer<typeof pmTemplateSchema>;

