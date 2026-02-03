import { UserAccount } from "@/interfaces/user_interface";
import { Card, CardContent } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffSitesSection } from "./StaffSitesSection";
import { Building2, MapPin, Pencil, Power, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSpaceOwnershipStatusColor } from "@/interfaces/spaces_interfaces";

interface Props {
    key: string;
    account: UserAccount;
    onEdit: () => void;
    onMarkASDefault: (account) => void;
}

export default function AccountCard({
    key,
    account,
    onEdit,
    onMarkASDefault
}: Props) {

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return <Badge className="bg-green-100 text-green-700">active</Badge>;
            case "inactive":
                return <Badge variant="secondary">inactive</Badge>;
            case "pending_approval":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700">
                        pending approval
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status.toLowerCase()}</Badge>;
        }
    };


    return (
        <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                            {account.account_type} Account
                            {!account.is_default ? (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => onMarkASDefault(account)}
                                    title="Mark as default account"
                                >
                                    <Star className="h-5 w-5" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled
                                    className="cursor-default"
                                    title="This account is used by default for login and actions"
                                >
                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                </Button>
                            )}
                        </h3>
                        {getStatusBadge(account.status)}
                    </div>

                    <div className="flex gap-2">

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onEdit}
                            title="Edit account"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        {/* <Button
                            size="icon"
                            variant="ghost"
                            //onClick={() => onDeactivate(account)}
                            title="Deactivate account"
                            className="text-destructive hover:text-destructive"
                            disabled={account.is_default} // UX rule
                        >
                            <Power className="h-4 w-4" />
                        </Button> */}
                    </div>
                </div>

                {/* Roles */}
                <div>
                    <p className="text-sm text-muted-foreground mb-2">Roles</p>
                    <div className="flex flex-wrap gap-2">
                        {account.roles.map(role => (
                            <Badge key={role.id}>{role.name}</Badge>
                        ))}
                        {account.roles.length == 0 && (
                            <p className="text-sm text-muted-foreground">
                                No roles assigned
                            </p>
                        )}
                    </div>
                </div>

                {/* Tenant Spaces */}
                {account.account_type === "tenant" && (
                    <TenantSpacesSection spaces={account.tenant_spaces} />
                )}

                {/* Owner Spaces */}
                {account.account_type === "owner" && (
                    <TenantSpacesSection spaces={account.owner_spaces} />
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
    const navigate = useNavigate();

    if (!spaces || spaces.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No spaces assigned
            </p>
        );
    }



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
                                <p className="font-semibold cursor-pointer hover:underline"
                                    onClick={() =>
                                        navigate(`/spaces/${space.space_id}`)
                                    }
                                >{space.space_name}</p>
                                {space.status && (
                                    <Badge
                                        variant="outline"
                                        className={`${getSpaceOwnershipStatusColor(
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
