import * as z from "zod";

export const tenantSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().refine(
      (val) => {
        if (!val || val === "") return false; // Phone is required
        // Remove the + prefix and extract digits
        const digits = val.replace(/\D/g, "");
        // Check if we have country code (1-3 digits) + 10 digits
        // Total should be 11-13 digits, and last 10 should be the phone number
        if (digits.length >= 11 && digits.length <= 13) {
          // Extract last 10 digits (phone number without country code)
          const phoneDigits = digits.slice(-10);
          return phoneDigits.length === 10 && /^\d{10}$/.test(phoneDigits);
        }
        return false;
      },
      {
        message: "Phone number must be exactly 10 digits after country code",
      }
    ),
    status: z.coerce.string().min(1, "Status is required"),
    type: z.string().optional(),
    legal_name: z.string().optional(),
    commercial_type: z.string().optional(),
    // contact_info: z
    //   .object({
    //     name: z.string().optional(),
    //     email: z
    //       .union([
    //         z.string().email("Invalid email"),
    //         z.literal(""),
    //         z.undefined(),
    //       ])
    //       .optional(),
    //     phone: z
    //       .string()
    //       .optional()
    //       .or(z.literal(""))
    //       .refine(
    //         (val) => {
    //           if (!val || val === "") return true; // Allow empty
    //           // Remove the + prefix and extract digits
    //           const digits = val.replace(/\D/g, "");
    //           // Check if we have country code (1-3 digits) + 10 digits
    //           // Total should be 11-13 digits, and last 10 should be the phone number
    //           if (digits.length >= 11 && digits.length <= 13) {
    //             // Extract last 10 digits (phone number without country code)
    //             const phoneDigits = digits.slice(-10);
    //             return (
    //               phoneDigits.length === 10 && /^\d{10}$/.test(phoneDigits)
    //             );
    //           }
    //           return false;
    //         },
    //         {
    //           message:
    //             "Phone number must be exactly 10 digits after country code",
    //         }
    //       ),

    //   })
    //   .optional(),
    address: z
      .object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z
          .string()
          .regex(/^\d*$/, "Pincode must contain only numbers")
          .optional(),
      })
      .optional(),
    family_info: z
      .array(
        z.object({
          member: z.string().optional(),
          relation: z.string().optional(),
        })
      )
      .optional(),
    vehicle_info: z
      .array(
        z.object({
          type: z.string().optional(),
          number: z.string().optional(),
        })
      )
      .optional(),
    tenant_spaces: z
      .array(
        z.object({
          id: z.string().optional(),
          site_id: z.string().optional(),
          building_block_id: z.string().optional(),
          space_id: z.string().optional(),
        })
      )
      .optional(),
  });

export type TenantFormValues = z.infer<typeof tenantSchema>;
