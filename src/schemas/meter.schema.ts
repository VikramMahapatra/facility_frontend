import * as z from "zod";

export const meterSchema = z.object({
  site_id: z.string().min(1, "Site is required"),
  kind: z.enum(["electricity", "water", "gas", "btuh", "people_counter"], {
    required_error: "Meter kind is required",
  }),
  code: z.string().min(3, "Meter code must be at least 3 characters"),
  asset_id: z.string().nullable().optional(),
  space_id: z.string().nullable().optional(),
  unit: z.string().min(1, "Unit is required"),
  multiplier: z.coerce
    .number()
    .min(0.0001, "Multiplier must be greater than 0")
    .default(1),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
});

export type MeterFormValues = z.infer<typeof meterSchema>;
