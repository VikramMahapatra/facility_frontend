import * as z from "zod";

export const vendorSchema = z.object({
    name: z.string().min(1, "Vendor name is required"),
    gst_vat_id: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    categories: z.array(z.string()).default([]),
    contact: z.object({
        name: z.string().optional(),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
        phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional().or(z.literal("")),
        address: z.string().optional(),
    }).optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;