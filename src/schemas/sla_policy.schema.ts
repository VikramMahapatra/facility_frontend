import * as z from "zod";

export const slaPolicySchema = z.object({
  service_category: z.string().min(1, "Service Category is required"),
  site_name: z.string().min(1, "Site Name is required"),
  default_contact: z.string().min(1, "Default Contact is required"),
  escalation_contact: z.string().min(1, "Escalation Contact is required"),
  response_time_mins: z.coerce.number({
    required_error: "Response Time is required",
    invalid_type_error: "Response Time must be a number",
  }).min(1, "Response Time must be at least 1 minute"),
  resolution_time_mins: z.coerce.number({
    required_error: "Resolution Time is required",
    invalid_type_error: "Resolution Time must be a number",
  }).min(1, "Resolution Time must be at least 1 minute"),
  escalation_time_mins: z.coerce.number({
    required_error: "Escalation Time is required",
    invalid_type_error: "Escalation Time must be a number",
  }).min(1, "Escalation Time must be at least 1 minute"),
  reopen_time_mins: z.coerce.number({
    required_error: "Reopen Time is required",
    invalid_type_error: "Reopen Time must be a number",
  }).min(1, "Reopen Time must be at least 1 minute"),
  active: z.boolean().default(true),
});

export type SLAPolicyFormValues = z.infer<typeof slaPolicySchema>;

