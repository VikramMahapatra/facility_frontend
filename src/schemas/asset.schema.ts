import * as z from "zod";

export const assetSchema = z.object({
    tag: z.string().min(1, "Asset Tag is required"),
    name: z.string().min(1, "Name is required"),
    site_id: z.string().min(1, "Site is required"),
    category_id: z.string().optional(),
    serial_no: z.string().optional(),
    model: z.string().optional(),
    manufacturer: z.string().optional(),
    purchase_date: z.string().optional(),
    warranty_expiry: z.string().optional(),
    cost: z.coerce.number({
        invalid_type_error: "Expected number"
    }).min(0, "Cost cannot be negative").optional(),
    status: z.enum(["active", "retired", "in_repair"], {
        required_error: "Status is required",
    }).optional(),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
