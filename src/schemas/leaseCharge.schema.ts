import * as z from "zod";

export const leaseChargeSchema = z.object({
  lease_id: z.string().min(1, "Lease is required"),
  charge_code: z.enum(["RENT","CAM","ELEC","WATER","PARK","PENALTY","MAINTENANCE"], {
    required_error: "Charge Code is required",
  }),
  period_start: z.string().min(1, "Start date is required"),
  period_end: z.string().min(1, "End date is required"),
  amount: z.coerce.number({ invalid_type_error: "Expected number" }).min(0, "Amount cannot be negative"),
  tax_pct: z.coerce.number({ invalid_type_error: "Expected number" }).min(0, "Tax cannot be negative").optional(),
});

export type LeaseChargeFormValues = z.infer<typeof leaseChargeSchema>;


