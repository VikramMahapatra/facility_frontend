import { Building2, Home, Truck, UserCog, Users } from "lucide-react";

export const accountTypes = [
    {
        value: "organization",
        label: "Organization",
        description: "Property owners and facility managers",
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