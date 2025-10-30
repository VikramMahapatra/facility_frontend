import * as z from "zod";

export const buildingSchema = z.object({
    name: z.string().min(1, "Building name is required"),
    site_id: z.string().min(1, "Site is required"),
    floors: z.coerce.number({
        invalid_type_error: "Expected number"
    }).min(1, "Floors must be at least 1").int("Floors must be a whole number"),
    status: z.enum(['active', 'inactive'], {
        required_error: "Status is required",
    }),
    attributes: z.object({
        lifts: z.coerce.number({
            invalid_type_error: "Expected number"
        }).min(0, "Number of lifts cannot be negative").int("Lifts must be a whole number"),
        fireSafety: z.boolean(),
    }),
});

export type BuildingFormValues = z.infer<typeof buildingSchema>;
