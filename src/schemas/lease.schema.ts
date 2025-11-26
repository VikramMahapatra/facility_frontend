import * as z from "zod";

export const leaseSchema = z
  .object({
    kind: z.enum(["commercial", "residential"], {
      required_error: "Lease Type is required",
    }),
    site_id: z.string().min(1, "Site is required"),
    space_id: z.string().min(1, "Space is required"),
    partner_id: z.string().optional(),
    tenant_id: z.string().optional(),
    start_date: z.string().min(1, "Start Date is required"),
    end_date: z.string().min(1, "End Date is required"),
    rent_amount: z.coerce.number({
      required_error: "Rent Amount is required",
      invalid_type_error: "Rent Amount must be a number",
    }).min(0.01, "Rent Amount is required"),
    deposit_amount: z.coerce.number({
      invalid_type_error: "Deposit Amount must be a number",
    }).optional(),
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
  })
  .superRefine((val, ctx) => {
    if (val.kind === "commercial" && (!val.partner_id || String(val.partner_id).trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["partner_id"], message: "Partner is required for commercial lease" });
    }
    if (val.kind === "residential" && (!val.tenant_id || String(val.tenant_id).trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tenant_id"], message: "Tenant is required for residential lease" });
    }
    if (val.start_date && val.end_date) {
      const start = new Date(val.start_date);
      const end = new Date(val.end_date);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["end_date"], message: "End Date cannot be before Start Date" });
      }
    }
  });

export type LeaseFormValues = z.infer<typeof leaseSchema>;


