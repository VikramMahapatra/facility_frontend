import * as z from "zod";

const StatusEnum = z.enum([
  "active",
  "inactive",
  "blocked",
]);

export const accountSchema = (isCreateMode: boolean = false) =>
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
      status: StatusEnum,
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
      tenant_spaces: z
        .array(
          z.object({
            site_id: z.string().min(1, "Site is required"),
            building_block_id: z.string().optional(),
            space_id: z.string().min(1, "Space is required"),
            role: z.enum(["owner", "occupant"]).optional(),
          })
        )
        .optional(),
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
      if (data.account_type === "tenant") {
        if (!data.tenant_spaces || data.tenant_spaces.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["tenant_spaces"],
            message: "At least one space is required for tenant",
          });
        }
      }
      else {
        // 👇 IMPORTANT: prevent validation when not tenant
        delete (data as any).tenant_spaces;
      }
    });

export const userSchema = (isCreateMode: boolean = false) =>
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
      status: StatusEnum,
    });

export const userFormSchema = userSchema(false);
export type UserFormValues = z.infer<typeof userFormSchema>;


export const userFormPageSchema = accountSchema(false);
export type UserFormPageValues = z.infer<typeof userFormPageSchema>;
