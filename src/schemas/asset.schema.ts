import * as z from "zod";

export const assetSchema = z.object({
    tag: z.string().min(1, "Asset Tag is required"),
    name: z.string().min(1, "Name is required"),
    site_id: z.string().min(1, "Site is required"),
    category_id: z.string().min(1, "Category is required"),
    serial_no: z.string().optional(),
    model: z.string().optional(),
    manufacturer: z.string().optional(),
    purchase_date: z.string().min(1, "Purchase date is required"),
    warranty_expiry: z.string().min(1, "Warranty expiry date is required"),
    cost: z.coerce.number({
        invalid_type_error: "Cost is required"
    }).min(0.01, "Cost must be greater than zero"),
    status: z.enum(["active", "inactive", "retired", "in_repair"], {
        required_error: "Status is required",
    }).optional(),
}).refine(
    (data) => {
        return new Date(data.warranty_expiry) >= new Date(data.purchase_date);
    },
    {
        message: "Warranty expiry date must be after purchase date",
        path: ["warranty_expiry"],
    }
);

export type AssetFormValues = z.infer<typeof assetSchema>;
