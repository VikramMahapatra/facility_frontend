import * as z from "zod";
import { spaceKinds, SpaceAmenities } from "@/interfaces/spaces_interfaces";

export const spaceGroupSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    site_id: z.string().min(1, "Site is required"),
    kind: z.enum([
        'room',
        'apartment',
        'shop',
        'office',
        'warehouse',
        'meeting_room',
        'hall',
        'common_area',
        'parking',
    ] as const, {
        required_error: "Kind is required",
    }),
    specs: z.object({
        base_rate: z.coerce.number({
            invalid_type_error: "Expected number"
        }).min(0, "Base rate cannot be negative"),
        amenities: z.array(z.string()).default([]),
    }),
});

export type SpaceGroupFormValues = z.infer<typeof spaceGroupSchema>;
