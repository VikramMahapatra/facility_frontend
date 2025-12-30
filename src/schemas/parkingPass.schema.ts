import { z } from "zod";

export const parkingPassSchema = z.object({
  site_id: z.string().min(1, "Site is required"),
  space_id: z.string().min(1, "Space is required"),
  zone_id: z.string().min(1, "Zone is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  vehicle_no: z.string().min(1, "Vehicle number is required"),
  valid_from: z.string().min(1, "Valid from date is required"),
  valid_to: z.string().min(1, "Valid to date is required"),
  pass_holder: z.string().optional(),
  status: z.string().optional(),
});

export type ParkingPassFormValues = z.infer<typeof parkingPassSchema>;

