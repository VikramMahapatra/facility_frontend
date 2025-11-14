import * as z from "zod";

export const siteSchema = z.object({
    code: z.union([
        z.string().min(3, "Code must be at least 3 characters"),
        z.literal(""),
        z.undefined()
    ]).optional(),
    name: z.string().min(1, "Name is required"),
    kind: z.enum(['residential', 'commercial', 'hotel', 'mall', 'mixed', 'campus'], {
        required_error: "Kind is required",
    }),
    status: z.enum(['active', 'inactive'], {
        required_error: "Status is required",
    }),
    opened_on: z.string().optional(),
    address: z.object({
        line1: z.string().min(1, "Address line 1 is required"),
        line2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        country: z.string().optional(),
        pincode: z.union([
            z.string().regex(/^\d+$/, "Pincode must contain only numbers"),
            z.literal(""),
            z.undefined()
        ]).optional(),
    }),
    geo: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
    }).optional(),
});

export type SiteFormValues = z.infer<typeof siteSchema>;
