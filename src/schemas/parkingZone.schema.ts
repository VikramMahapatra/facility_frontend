import * as z from "zod";

export const parkingZoneSchema = z.object({
  name: z.string().min(1, "Zone Name is required"),
  site_id: z.string().min(1, "Site is required"),
  capacity: z.coerce.number({
    required_error: "Capacity is required",
    invalid_type_error: "Expected number",
  }).min(1, "Capacity must be greater than 0"),
});

export type ParkingZoneFormValues = z.infer<typeof parkingZoneSchema>;

