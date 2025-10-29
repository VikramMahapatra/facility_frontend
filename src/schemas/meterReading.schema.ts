import * as z from "zod";

export const meterReadingSchema = z.object({
    meter_id: z.string().min(1, "Meter is required"),
    ts: z.string().min(1, "Timestamp is required"),
    reading: z
        .number({ invalid_type_error: "Reading value is required" })
        .min(0, "Reading value cannot be negative"),
    delta: z.coerce.number({
        required_error: "Delta is required",
        invalid_type_error: "Delta must be a number"
    }),
    source: z.string().min(1, "Source is required"),
    metadata: z.any().optional()
});

export type MeterReadingFormValues = z.infer<typeof meterReadingSchema>;
