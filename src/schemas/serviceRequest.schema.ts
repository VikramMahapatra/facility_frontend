import * as z from "zod";

export const serviceRequestSchema = z.object({
    site_id: z.string().min(1, "Site is required"),
    space_id: z.string().optional().nullable(),
    requester_kind: z.enum(["resident", "merchant"], {
        required_error: "Requester Kind is required",
    }),
    requester_id: z.string().optional().nullable(),
    category: z.string().optional(),
    channel: z.enum(["portal", "email", "phone", "walkin", "api"], {
        required_error: "Channel is required",
    }),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"], {
        required_error: "Priority is required",
    }),
    status: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                return val.replace(/\s+/g, "_").toLowerCase();
            }
            return val;
        },
        z.enum(["open", "in_progress", "on_hold", "resolved", "close"], {
            required_error: "Status is required",
        })
    ),
    sla: z.object({
        duration: z.string().optional(),
    }).optional().nullable(),
    linked_work_order_id: z.string().optional().nullable(),
});

export type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;
