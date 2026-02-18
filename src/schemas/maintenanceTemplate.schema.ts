import * as z from "zod";

export const maintenanceTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calculation_type: z.enum(["flat", "per_sqft", "per_bed", "custom"], {
    required_error: "Calculation type is required",
  }),
  amount: z.coerce
    .number({
      invalid_type_error: "Amount must be a number",
    })
    .min(0, "Amount cannot be negative"),
  category: z.enum(["residential", "commercial"]).optional(),
  kind: z
    .enum([
      "room",
      "apartment",
      "shop",
      "office",
      "warehouse",
      "meeting_room",
      "hall",
      "common_area",
      "parking",
      "villa",
      "row_house",
      "bungalow",
      "duplex",
      "penthouse",
      "studio_apartment",
      "farm_house",
    ] as const)
    .optional(),
  site_id: z.string().min(1, "Site is required"),
  is_active: z.boolean().default(true),
});

export type MaintenanceTemplateFormValues = z.infer<
  typeof maintenanceTemplateSchema
>;
