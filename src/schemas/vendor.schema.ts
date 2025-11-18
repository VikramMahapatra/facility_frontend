import * as z from "zod";

export const vendorSchema = z.object({
    name: z.string().min(1, "Vendor name is required"),
    gst_vat_id: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    categories: z.array(z.string()).default([]),
    contact: z.object({
        name: z.string().optional(),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
        phone: z.string()
            .optional()
            .or(z.literal(""))
            .refine((val) => {
                if (!val || val === "") return true; // Allow empty
                // Remove the + prefix and extract digits
                const digits = val.replace(/\D/g, "");
                // Check if we have country code (1-3 digits) + 10 digits
                // Total should be 11-13 digits, and last 10 should be the phone number
                if (digits.length >= 11 && digits.length <= 13) {
                    // Extract last 10 digits (phone number without country code)
                    const phoneDigits = digits.slice(-10);
                    return phoneDigits.length === 10 && /^\d{10}$/.test(phoneDigits);
                }
                return false;
            }, {
                message: "Phone number must be exactly 10 digits after country code"
            }),
        address: z.string().optional(),
    }).optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;