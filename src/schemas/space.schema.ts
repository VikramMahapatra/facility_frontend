import * as z from "zod";
import { spaceKinds, spaceSubKinds } from "@/interfaces/spaces_interfaces";

export const spaceSchema = z.object({
    name: z.string().optional(),
    site_id: z.string().min(1, "Site is required"),
    kind: z.enum(spaceKinds, {
        required_error: "Type is required",
    }),
    category: z.enum(['residential', 'commercial', 'common_area'], {
        required_error: "Category is required",
    }),
    sub_kind: z.enum(spaceSubKinds).optional(),
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
    balconies: z.coerce.number({
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
    parking_slot_ids: z.array(z.string()).optional(),
    maintenance_template_id: z.string().optional(),
}).superRefine((data, ctx) => {
    // ⭐ If apartment → sub_kind required
    if (data.kind === "apartment") {
        if (!data.sub_kind) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Sub type is required for apartment",
                path: ["sub_kind"],
            });
        }
    }

    // ⭐ Non-apartment → sub_kind must not exist
    if (data.kind !== "apartment" && data.sub_kind) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Sub type allowed only for apartments",
            path: ["sub_kind"],
        });
    }
});

export type SpaceFormValues = z.infer<typeof spaceSchema>;

