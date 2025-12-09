import * as z from "zod";

export const leaseChargeSchema = z
  .object({
    lease_id: z.string().min(1, "Lease is required"),
    charge_code: z.string().min(1, "Charge Code is required"),
    period_start: z.string().min(1, "Start date is required"),
    period_end: z.string().min(1, "End date is required"),
    amount: z.coerce.number({ invalid_type_error: "Expected number" }).min(0, "Amount cannot be negative"),
    tax_pct: z.coerce.number({ invalid_type_error: "Expected number" }).min(0, "Tax cannot be negative").optional(),
  })
  .superRefine((val, ctx) => {
    if (val.period_start && val.period_end) {
      const start = new Date(val.period_start);
      const end = new Date(val.period_end);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        ctx.addIssue({ 
          code: z.ZodIssueCode.custom, 
          path: ["period_end"], 
          message: "Period End cannot be before Period Start" 
        });
      }
    }
  });

export type LeaseChargeFormValues = z.infer<typeof leaseChargeSchema>;


