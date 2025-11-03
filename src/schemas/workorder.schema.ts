import * as z from "zod";

export const workorderSchema = z.object({
    title: z.string().min(1, "Title is required"),
    site_id: z.string().min(1, "Site is required"),
    space_id: z.string().optional().nullable(),
    asset_id: z.string().optional().nullable(),
    vendor_id: z.string().optional(),
    request_id: z.string().optional().nullable(),
    priority: z.enum(["low", "medium", "high", "critical"], {
        required_error: "Priority is required",
    }),
    status: z.enum(["open", "in_progress", "completed", "closed"], {
        required_error: "Status is required",
    }),
    type: z.enum(["corrective", "preventive", "emergency", "inspection"], {
        required_error: "Type is required",
    }),
    description: z.string().optional(),
    due_at: z.string().optional().nullable(),
    sla: z.object({
        response_time: z.string().optional(),
    }).optional().nullable(),
});

export type WorkOrderFormValues = z.infer<typeof workorderSchema>;

