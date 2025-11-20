import * as z from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Organization Name is required"),
  legal_name: z.string().min(1, "Legal Name is required"),
  gst_vat_id: z.string().min(1, "GST/VAT ID is required"),
  billing_email: z.string().email("Invalid email address").min(1, "Billing Email is required"),
  contact_phone: z.string().min(1, "Contact Phone is required"),
  plan: z.enum(["basic", "pro", "enterprise"], {
    required_error: "Plan is required",
  }),
  locale: z.string().min(1, "Locale is required"),
  timezone: z.string().min(1, "Timezone is required"),
  status: z.enum(["active", "inactive", "suspended"], {
    required_error: "Status is required",
  }),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

