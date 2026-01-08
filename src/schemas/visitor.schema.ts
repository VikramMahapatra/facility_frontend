import * as z from "zod";

export const visitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine(
      (val) => {
        if (!val || val === "") return false;
        const digits = val.replace(/\D/g, "");
        if (digits.length >= 11 && digits.length <= 13) {
          const phoneDigits = digits.slice(-10);
          return phoneDigits.length === 10 && /^\d{10}$/.test(phoneDigits);
        }
        return false;
      },
      {
        message: "Phone number must be exactly 10 digits after country code",
      }
    ),
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
