import * as z from "zod";

export const assetCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(128, "Name must be less than 128 characters"),
  code: z.string().min(1, "Code is required").max(32, "Code must be less than 32 characters"),
  parent_id: z.string().optional().or(z.literal("")),
  attributes: z.record(z.any()).optional(),
});

export type AssetCategoryFormValues = z.infer<typeof assetCategorySchema>;

