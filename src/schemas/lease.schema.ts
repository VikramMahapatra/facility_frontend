import * as z from "zod";

export const leaseSchema = z
  .object({
    kind: z.enum(["commercial", "residential"]).optional(), // Optional since API doesn't use it
    site_id: z.string().min(1, "Site is required"),
    building_id: z.string().optional(),
    space_id: z.string().min(1, "Space is required"),
    partner_id: z.string().optional(),
    tenant_id: z.string().optional(),
    start_date: z.string().min(1, "Start Date is required"),
    frequency: z.enum(["monthly", "annually"], {
      required_error: "Frequency is required",
    }),
    lease_term_months: z.coerce
      .number({
        invalid_type_error: "Lease Term must be a number",
      })
      .optional(),
    rent_amount: z.coerce
      .number({
        required_error: "Rent Amount is required",
        invalid_type_error: "Rent Amount must be a number",
      })
      .min(0.01, "Rent Amount is required"),
    deposit_amount: z.coerce
      .number({
        invalid_type_error: "Deposit Amount must be a number",
      })
      .optional(),
    cam_rate: z.coerce.number().optional(),
    utilities: z
      .object({
        electricity: z.enum(["submeter", "fixed", "na"]).optional(),
        water: z.enum(["submeter", "fixed", "na"]).optional(),
      })
      .optional(),
    status: z.enum(["draft", "active", "expired", "terminated"], {
      required_error: "Status is required",
    }),
    auto_move_in: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    // Since kind is not used by API, require tenant_id (since that's what the form shows)
    if (!val.tenant_id || String(val.tenant_id).trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tenant_id"],
        message: "Tenant is required",
      });
    }
    // Require lease_term_months when frequency is monthly
    if (
      val.frequency === "monthly" &&
      (!val.lease_term_months || val.lease_term_months < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lease_term_months"],
        message: "Lease Term is required when frequency is monthly",
      });
    }
  });

export type LeaseFormValues = z.infer<typeof leaseSchema>;
