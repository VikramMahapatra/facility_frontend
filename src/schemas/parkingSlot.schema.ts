import * as z from "zod";

export const parkingSlotSchema = z.object({
  slot_no: z.string().min(1, "Slot no is required"),
  site_id: z.string().min(1, "Site is required"),
  zone_id: z.string().min(1, "Zone is required"),
  space_id: z.string().optional(),
  slot_type: z.enum(["covered", "open", "visitor", "handicapped", "ev"]),
});

export type ParkingSlotFormValues = z.infer<typeof parkingSlotSchema>;

