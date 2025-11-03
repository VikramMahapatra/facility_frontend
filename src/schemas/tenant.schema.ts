import * as z from "zod";

export const tenantSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone is required"),
    site_id: z.string().min(1, "Site is required"),
    building_id: z.string().optional(),
    space_id: z.string().optional(),
    tenant_type: z.enum(["individual", "commercial"], {
      required_error: "Tenant type is required",
    }),
    status: z.enum(["active", "inactive", "suspended"], {
      required_error: "Status is required",
    }),
    type: z.string().optional(),
    legal_name: z.string().optional(),
    contact_info: z
      .object({
        name: z.string().optional(),
        email: z.string().email("Invalid email").optional(),
        phone: z.string().optional(),
        address: z
          .object({
            line1: z.string().optional(),
            line2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            pincode: z
              .string()
              .regex(/^\d*$/, "Pincode must contain only numbers")
              .optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .superRefine((val, ctx) => {
    // For commercial tenants, either legal_name or contact name should be present (soft rule)
    if (
      val.tenant_type === "commercial" &&
      (!val.legal_name || String(val.legal_name).trim() === "") &&
      (!val.contact_info?.name || String(val.contact_info?.name).trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["legal_name"],
        message: "Provide Legal Name or Contact Name for commercial tenant",
      });
    }
  });

export type TenantFormValues = z.infer<typeof tenantSchema>;


