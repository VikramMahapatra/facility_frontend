import { z } from "zod";

const baseAccountSchema = {
    account_type: z.enum(["tenant", "staff", "organization", "owner", "vendor"]),
    status: z.enum(["active", "inactive"]),
    role_ids: z.array(z.string()).min(1, "At least one role is required"),
};

const spaceSchema = z.object({
    id: z.string().optional(),
    site_id: z.string().min(1, "Site is required").optional(),
    site_name: z.string().optional(),
    building_block_id: z.string().optional(),
    building_block_name: z.string().optional(),
    space_id: z.string().min(1, "Space is required").optional(),
    space_name: z.string().optional(),
    status: z.string().optional()
});

export const tenantAccountSchema = z.object({
    ...baseAccountSchema,
    account_type: z.literal("tenant"),
    tenant_type: z.enum(["residential", "commercial"]),
    tenant_spaces: z.array(spaceSchema).min(1, "At least one space is required"),
});


export const ownerAccountSchema = z.object({
    ...baseAccountSchema,
    account_type: z.literal("owner"),
    owner_spaces: z.array(spaceSchema).min(1, "At least one space is required"),
});

export const staffAccountSchema = z.object({
    ...baseAccountSchema,
    account_type: z.literal("staff"),
    staff_role: z.string().min(1, "Staff role is required"),
    site_ids: z.array(z.string()).min(1, "Select at least one site"),
});

export const adminAccountSchema = z.object({
    ...baseAccountSchema,
    account_type: z.enum(["organization", "vendor"]),
});

export const accountSchema = z
    .discriminatedUnion("account_type", [
        tenantAccountSchema,
        staffAccountSchema,
        adminAccountSchema,
        ownerAccountSchema,
    ])
    .superRefine((data, ctx) => {
        if (data.account_type === "tenant") {
            data.tenant_spaces.forEach((s, index) => {
                if (!s.site_id) {
                    ctx.addIssue({
                        path: ["tenant_spaces", index, "site_id"],
                        message: "Site is required",
                        code: z.ZodIssueCode.custom,
                    });
                }

                if (!s.space_id) {
                    ctx.addIssue({
                        path: ["tenant_spaces", index, "space_id"],
                        message: "Space is required",
                        code: z.ZodIssueCode.custom,
                    });
                }
            });
        }

        if (data.account_type === "owner") {
            data.owner_spaces.forEach((s, index) => {
                if (!s.site_id || !s.space_id) {
                    ctx.addIssue({
                        path: ["owner_spaces", index],
                        message: "Site and Space are required",
                        code: z.ZodIssueCode.custom,
                    });
                }
            });
        }
    });


export type AccountFormValues = z.infer<typeof accountSchema>;
