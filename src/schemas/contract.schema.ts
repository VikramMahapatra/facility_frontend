import * as z from "zod";

const documentSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  name: z.string().optional(),
});

const slaConfigSchema = z.object({
  response_hrs: z.coerce
    .number()
    .min(0, "Response hours cannot be negative")
    .optional()
    .nullable(),
});

const penaltyConfigSchema = z.object({
  per_day: z.coerce
    .number()
    .min(0, "Penalty per day cannot be negative")
    .optional()
    .nullable(),
});

const termsSchema = z.object({
  sla: slaConfigSchema.optional().nullable(),
  penalty: penaltyConfigSchema.optional().nullable(),
});

export const contractSchema = z
  .object({
    title: z.string().min(1, "Contract Title is required"),
    type: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    vendor_id: z.string().min(1, "Vendor is required"),
    site_id: z.string().min(1, "Site is required"),
    start_date: z.string().min(1, "Start Date is required"),
    end_date: z.string().min(1, "End Date is required"),
    value: z.preprocess((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number({ required_error: "Contract value is required", invalid_type_error: "Contract value must be a number" }).min(1, "Contract value must be greater than 0")),
    terms: termsSchema.optional().nullable(),
    documents: z.array(documentSchema).optional().default([]),
  })
  .superRefine((val, ctx) => {
    if (val.start_date && val.end_date) {
      const start = new Date(val.start_date);
      const end = new Date(val.end_date);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End Date cannot be before Start Date",
        });
      }
    }
  });

export type ContractFormValues = z.infer<typeof contractSchema>;
