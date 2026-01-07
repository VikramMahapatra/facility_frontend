import * as z from "zod";

export const createUserSchema = (isCreateMode: boolean = false) =>
  z
    .object({
      full_name: z
        .string()
        .min(2, "Name is required")
        .max(200, "Name must not exceed 200 characters"),
      email: z
        .string()
        .email("Invalid email address")
        .max(200, "Email must not exceed 200 characters"),
      password: isCreateMode
        ? z
            .string()
            .min(1, "Password is required")
            .min(6, "Password must be at least 6 characters")
        : z.string().optional().or(z.literal("")),
      phone: z.string().regex(/^\+\d{10,15}$/, "Invalid phone number"),
      status: z.string().min(1, "Status is required"),
      account_type: z.string().min(1, "Type is required"),
      role_ids: z
        .array(z.string())
        .min(1, "At least one role must be selected"),
      site_id: z.string().optional(),
      building_id: z.string().optional(),
      space_id: z.string().optional(),
      site_ids: z.array(z.string()).optional(),
      tenant_type: z.string().optional(),
      staff_role: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // Make site_ids required when account_type is "staff"
      if (data.account_type === "staff") {
        if (!data.site_ids || data.site_ids.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["site_ids"],
            message: "At least one site must be selected for staff",
          });
        }
      }
    });

export const userSchema = createUserSchema(false);

export type UserFormValues = z.infer<typeof userSchema>;
