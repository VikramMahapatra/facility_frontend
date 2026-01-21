import { z } from "zod";

const baseAccountSchema = {
    account_type: z.enum(["tenant", "staff", "organization", "owner", "vendor"]),
    status: z.enum(["active", "inactive"]),
    role_ids: z.array(z.string()).min(1, "At least one role is required"),
};

export const tenantAccountSchema = z.object({
    ...baseAccountSchema,
    account_type: z.literal("tenant"),
    tenant_type: z.enum(["residential", "commercial"]),
    tenant_spaces: z.array(
        z.object({
            site_id: z.string().min(1),
            building_block_id: z.string().optional(),
            space_id: z.string().min(1),
        })
    ).min(1, "At least one space is required"),
});

export const staffAccountSchema = z.object({
    ...baseAccountSchema,
    account_type: z.literal("staff"),
    site_ids: z.array(z.string()).min(1, "Select at least one site"),
});

export const adminAccountSchema = z.object({
    ...baseAccountSchema,
    account_type: z.literal("admin"),
});

export const accountSchema = z.discriminatedUnion("account_type", [
    tenantAccountSchema,
    staffAccountSchema,
    adminAccountSchema,
]);

export type AccountFormValues = z.infer<typeof accountSchema>;
