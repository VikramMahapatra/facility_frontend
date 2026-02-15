import * as z from "zod";
import { spaceKinds } from "@/interfaces/spaces_interfaces";

export const spaceSchema = z.object({
    name: z.string().optional(),
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
        'villa',
        'row_house',
        'bungalow',
        'duplex',
        'penthouse',
        'studio_apartment',
        'farm_house',
    ] as const, {
        required_error: "Kind is required",
    }),
    category: z.enum(['residential', 'commercial']).optional(),
    floor: z.coerce.number({
        invalid_type_error: "Expected number"
    }).int("Floor must be a whole number").optional(),
    building_block_id: z.string().optional(),
    area_sqft: z.coerce.number({
        invalid_type_error: "Expected number"
    }).min(0, "Area cannot be negative").optional(),
    beds: z.coerce.number({
        invalid_type_error: "Expected number"
    }).min(0, "Beds cannot be negative").int("Beds must be a whole number").optional(),
    baths: z.coerce.number({
        invalid_type_error: "Expected number"
    }).min(0, "Baths cannot be negative").int("Baths must be a whole number").optional(),
    status: z.enum(['available', 'occupied', 'out_of_service'], {
        required_error: "Status is required",
    }),
    attributes: z.object({
        view: z.string().optional(),
        //smoking: z.boolean().optional(),
        furnished: z.enum(['unfurnished', 'semi', 'fully']).optional(),
        star_rating: z.string().optional(),
    }).optional(),
    accessories: z.array(z.object({
        accessory_id: z.string(),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1").int("Quantity must be a whole number"),
    })).optional(),
    maintenance_template_id: z.string().min(1, "Maintenance template is required"),
});

export type SpaceFormValues = z.infer<typeof spaceSchema>;

