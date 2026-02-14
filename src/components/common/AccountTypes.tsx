import { Building2, Home, Truck, UserCog, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const accountTypes = [
    {
        value: "organization",
        label: "Org Admin",
        description: "manages the entire organization and all its properties",
        icon: <Building2 className="w-5 h-5" />,
    },
    {
        value: "staff",
        label: "Staff",
        description: "manages the sites of properties",
        icon: <UserCog className="w-5 h-5" />,
    },
    {
        value: "tenant",
        label: "Tenant",
        description: "Renters and occupants of properties",
        icon: <Users className="w-5 h-5" />,
    },
    {
        value: "owner",
        label: "Space Owner",
        description: "owner of the properties",
        icon: <Home className="w-5 h-5" />,
    },
    {
        value: "vendor",
        label: "Vendor",
        description: "Service providers and contractors",
        icon: <Truck className="w-5 h-5" />,
    },
];

export const userAccountTypes = [
    "organization",
    "staff",
    "tenant",
    "owner",
    "vendor",
] as const; // <-- as const makes it a tuple of string literals

export type AccountType = typeof accountTypes[number];

export const getUserAccountTypeBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    const variants = {
        tenant: "default",
        owner: "default",
        vendor: "default",
        staff: "secondary",
        organization: "destructive",
        pending: "secondary",
    } as const;

    const labels = {
        tenant: "tenant",
        owner: "space owner",
        vendor: "vendor",
        staff: "staff",
        pending: "pending",
        organization: "org admin", // <-- display this instead of "organization"
    } as const;

    return (
        <Badge variant={variants[normalizedStatus as keyof typeof variants] || "outline"}>
            {labels[normalizedStatus as keyof typeof labels] || normalizedStatus}
        </Badge>
    );
};
