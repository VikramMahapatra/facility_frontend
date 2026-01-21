import { UserAccount } from "@/interfaces/user_interface";
import { Card, CardContent } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffSitesSection } from "./StaffSitesSection";
import { Building2, MapPin } from "lucide-react";

interface Props {
    key: string;
    account: UserAccount;
    onEdit: () => void;
}

export default function AccountCard({
    key,
    account,
    onEdit
}: Props) {

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return <Badge className="bg-green-100 text-green-700">Active</Badge>;
            case "inactive":
                return <Badge variant="secondary">Inactive</Badge>;
            case "pending_approval":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700">
                        Pending Approval
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };


    return (
        <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold capitalize">
                            {account.account_type} Account
                        </h3>
                        {getStatusBadge(account.status)}
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={onEdit}>
                            Edit
                        </Button>
                        <Button size="sm" variant="destructive">
                            Deactivate
                        </Button>
                    </div>
                </div>

                {/* Roles */}
                <div>
                    <p className="text-sm text-muted-foreground mb-2">Roles</p>
                    <div className="flex flex-wrap gap-2">
                        {account.roles.map(role => (
                            <Badge key={role.id}>{role.name}</Badge>
                        ))}
                    </div>
                </div>

                {/* Tenant Spaces */}
                {account.account_type === "tenant" && (
                    <TenantSpacesSection spaces={account.tenant_spaces} />
                )}

                {/* Staff Sites */}
                {account.account_type === "staff" && (
                    <StaffSitesSection sites={account.sites} staff_role={account.staff_role} />
                )}
            </CardContent>
        </Card>
    )
}


function TenantSpacesSection({ spaces }) {
    if (!spaces || spaces.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No spaces assigned
            </p>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "occupied":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-red-100 text-red-700";
            case "vacated":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-blue-100 text-blue-700";
        }
    };

    return (
        <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Assigned Spaces
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                {spaces.map(space => (
                    <Card key={space.space_id}>
                        <CardContent className="p-4">

                            <div className="text-base flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <p className="font-semibold">{space.space_name}</p>
                                {space.status && (
                                    <Badge
                                        variant="outline"
                                        className={`${getStatusColor(
                                            space.status
                                        )} border-0`}
                                    >
                                        {space.status}
                                    </Badge>
                                )}
                            </div>

                            <div className="text-sm text-muted-foreground mt-1">
                                {[space.building_block_name, space.site_name]
                                    .filter(Boolean)
                                    .join(" • ")}
                            </div>

                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
