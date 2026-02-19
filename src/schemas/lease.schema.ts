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

    // Calculate lease end date
    let leaseEndDate: Date | null = null;
    if (val.start_date && val.lease_term_duration && val.lease_frequency) {
      const startDate = new Date(val.start_date);
      const termDuration = Number(val.lease_term_duration);
      
      if (val.lease_frequency === "annually") {
        // If lease frequency is annually, term is in years
        leaseEndDate = new Date(startDate);
        leaseEndDate.setFullYear(leaseEndDate.getFullYear() + termDuration);
      } else {
        // If lease frequency is monthly, term is in months
        leaseEndDate = new Date(startDate);
        leaseEndDate.setMonth(leaseEndDate.getMonth() + termDuration);
      }
    }

    // Validate payment_terms
    val.payment_terms?.forEach((term, index) => {
      // Validate cheque payment requires reference number
      if (term.payment_method === "cheque" && (!term.reference_no || term.reference_no.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["payment_terms", index, "reference_no"],
          message: "Reference No is required for cheque payments",
        });
      }

      // Validate payment date is between start_date and end_date
      if (term.due_date && val.start_date && leaseEndDate) {
        const dueDate = new Date(term.due_date);
        const startDate = new Date(val.start_date);
        
        if (dueDate < startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["payment_terms", index, "due_date"],
            message: "Payment date must be on or after lease start date",
          });
        }
        
        if (dueDate > leaseEndDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["payment_terms", index, "due_date"],
            message: "Payment date must be on or before lease end date",
          });
        }
      }

      // Validate sequential dates (each date should be >= previous and <= next)
      if (term.due_date && val.payment_terms && val.payment_terms.length > 1) {
        const currentDate = new Date(term.due_date);
        
        // Check against previous payment term
        if (index > 0 && val.payment_terms[index - 1]?.due_date) {
          const prevDate = new Date(val.payment_terms[index - 1].due_date);
          if (currentDate < prevDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["payment_terms", index, "due_date"],
              message: "Payment date must be on or after the previous payment date",
            });
          }
        }
        
        // Check against next payment term
        if (index < val.payment_terms.length - 1 && val.payment_terms[index + 1]?.due_date) {
          const nextDate = new Date(val.payment_terms[index + 1].due_date);
          if (currentDate > nextDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["payment_terms", index, "due_date"],
              message: "Payment date must be on or before the next payment date",
            });
          }
        }
      }
    });
  });

export type LeaseFormValues = z.infer<typeof leaseSchema>;
