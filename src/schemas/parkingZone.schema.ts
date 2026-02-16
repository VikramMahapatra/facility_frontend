import * as z from "zod";

export const parkingZoneSchema = z.object({
  name: z.string().min(1, "Zone Name is required"),
  site_id: z.string().min(1, "Site is required")
});

export type ParkingZoneFormValues = z.infer<typeof parkingZoneSchema>;

