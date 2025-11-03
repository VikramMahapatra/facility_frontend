import * as z from "zod";

export const visitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  site_id: z.string().min(1, "Site is required"),
  space_id: z.string().min(1, "Visiting location is required"),
  purpose: z.string().optional(),
  status: z.enum(["expected", "checked_in", "checked_out"], {
    required_error: "Status is required",
  }),
  vehicle_no: z.string().optional(),
  entry_time: z.string().optional(),
  exit_time: z.string().optional().nullable(),
  is_expected: z.boolean().optional(),
});

export type VisitorFormValues = z.infer<typeof visitorSchema>;