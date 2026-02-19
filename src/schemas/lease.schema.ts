import * as z from "zod";

export const leaseSchema = z
  .object({
    kind: z.enum(["commercial", "residential"]).optional(),
    site_id: z.string().min(1, "Site is required"),
    building_id: z.string().optional(),
    space_id: z.string().min(1, "Space is required"),
    partner_id: z.string().optional(),
    tenant_id: z.string().optional(),
    start_date: z.string().min(1, "Start Date is required"),
    frequency: z.enum(["monthly", "quaterly", "annually"], {
      required_error: "Rent billing frequency is required",
    }),
    lease_frequency: z.enum(["monthly", "annually"], {
      required_error: "Lease tenure is required",
    }),
    lease_term_duration: z.coerce
      .number({ invalid_type_error: "Lease Term must be a number" })
      .min(1, "Term Duration is required"),
    rent_amount: z.coerce
      .number({
        required_error: "Rent Amount is required",
        invalid_type_error: "Rent Amount must be a number",
      })
      .min(0.01, "Rent Amount is required"),
    deposit_amount: z.coerce.number().optional(),
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
    description: z.string().optional(),
    payment_method: z.enum(["upi", "card", "bank", "cash", "cheque", "other"]).optional(),
    payment_ref_no: z.string().optional(),
    payment_date: z.string().optional(),
    payment_amount: z.coerce.number().optional(),
    number_of_installments: z.coerce.number().min(1, "Number of installments must be at least 1").optional(),
    payment_terms: z
      .array(
        z.object({
          id: z.string().uuid().optional(),
          payment_method: z.enum(["upi", "card", "bank", "cash", "cheque", "other"]).optional(),
          reference_no: z.string().optional(),
          due_date: z.string().optional(),
          amount: z.coerce.number().optional(),
        })
      )
      .optional(),
  })
  .superRefine((val, ctx) => {
    // Tenant is required
    if (!val.tenant_id || String(val.tenant_id).trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tenant_id"],
        message: "Tenant is required",
      });
    }

    // Validate payment_terms: if method is cheque, ref_no must be present
    val.payment_terms?.forEach((term, index) => {
      if (term.payment_method === "cheque" && (!term.reference_no || term.reference_no.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["payment_terms", index, "ref_no"],
          message: "Reference No is required for cheque payments",
        });
      }
    });
  });

export type LeaseFormValues = z.infer<typeof leaseSchema>;
