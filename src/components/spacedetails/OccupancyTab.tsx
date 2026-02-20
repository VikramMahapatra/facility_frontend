import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, } from "@/components/ui/card";
import {
    Clock,
    CheckCircle,
    XCircle,
    LogIn,
    LogOut,
    User,
    UserPlus,
    UserCheck,
    UserX,
    FileText,
    ShieldCheck,
    Users,
    History,
    UserMinus,
    FileX
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "@/helpers/dateHelpers";
import MoveInModal from "./MoveInModal";
import MoveOutModal from "./MoveOutModal";
import { OccupancyResponse } from "@/interfaces/spaces_interfaces";

interface Props {
    spaceId: string;
    owners: any[];
    tenants: any[];
    occupancy: OccupancyResponse;
    onSucess: () => void;
}

const EVENT_META: Record<string, any> = {
    owner_requested: {
        label: "Owner Requested",
        icon: User,
        color: "text-yellow-600 bg-yellow-100"
    },
    owner_approved: {
        label: "Owner Approved",
        icon: ShieldCheck,
        color: "text-green-600 bg-green-100"
    },
    owner_removed: {
        label: "Owner Removed",
        icon: UserX,
        color: "text-red-600 bg-red-100"
    },

    tenant_requested: {
        label: "Tenant Requested",
        icon: UserPlus,
        color: "text-yellow-600 bg-yellow-100"
    },
    tenant_approved: {
        label: "Tenant Approved",
        icon: UserCheck,
        color: "text-green-600 bg-green-100"
    },
    tenant_rejected: {
        label: "Tenant Rejected",
        icon: UserX,
        color: "text-red-600 bg-red-100"
    },
    tenant_removed: {
        label: "Tenant Removed",
        icon: UserMinus,
        color: "text-red-600 bg-red-100"
    },

    lease_created: {
        label: "Lease Created",
        icon: FileText,
        color: "text-green-600 bg-green-100"
    },
    lease_terminated: {
        label: "Lease Terminated",
        icon: FileX, // 📄❌ lease ended
        color: "text-red-600 bg-red-100"
    },

    moved_in: {
        label: "Moved In",
        icon: LogIn,
        color: "text-green-700 bg-green-100"
    },
    moved_out: {
        label: "Moved Out",
        icon: LogOut,
        color: "text-gray-600 bg-gray-100"
    }
};

export default function OccupancyTab({
    spaceId,
    owners,
    tenants,
    occupancy,
    onSucess
}: Props) {

    const [isMoveInOpen, setIsMoveInOpen] = useState(false);
    const [isMoveOutOpen, setIsMoveOutOpen] = useState(false);

    const current = occupancy?.current || { status: "vacant" };

    const canViewMoveInButton = owners.length > 0 || tenants.length > 0;

    const isOccupied = current.status === "occupied";
    const isVacant = current.status === "vacant";

    return (
        <div className="space-y-6">

            {/* ========================= */}
            {/* CURRENT OCCUPANCY */}
            {/* ========================= */}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" /> Current Occupancy
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    {/* Status + Actions */}
                    <div className="flex items-center justify-between">

                        <Badge variant={isOccupied ? "default" : "secondary"}>
                            {current.status?.toUpperCase() || "VACANT"}
                        </Badge>

                        <div className="flex gap-2">

                            {/* MOVE-IN */}
                            {isVacant && canViewMoveInButton && (
                                <Button onClick={() => setIsMoveInOpen(true)}>
                                    <LogIn className="h-4 w-4 mr-1" /> Move-In
                                </Button>
                            )}

                            {/* MOVE-OUT */}
                            {isOccupied && (
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsMoveOutOpen(true)}
                                >
                                    <LogOut className="h-4 w-4 mr-1" /> Move-Out
                                </Button>
                            )}

                        </div>
                    </div>


                    {/* OCCUPANT DETAILS */}
                    {isOccupied && (
                        <div className="grid grid-cols-2 gap-4 text-sm">

                            <div>
                                <p className="text-muted-foreground">Occupant</p>
                                <p className="font-medium">{current.occupant_name}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">Type</p>
                                <p className="font-medium capitalize">{current.occupant_type}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">Move-In</p>
                                <p>{formatDate(current.move_in_date)}</p>
                            </div>

                            {current.move_out_date && (
                                <div>
                                    <p className="text-muted-foreground">Move-Out</p>
                                    <p>{formatDate(current.move_out_date)}</p>
                                </div>
                            )}

                            {current.time_slot && (
                                <div>
                                    <p className="text-muted-foreground">Time Slot</p>
                                    <p>{current.time_slot}</p>
                                </div>
                            )}

                            {current.reference_no && (
                                <div>
                                    <p className="text-muted-foreground">Reference</p>
                                    <p>{current.reference_no}</p>
                                </div>
                            )}

                        </div>
                    )}

                    {/* HANDOVER DETAILS */}
                    {current.handover && (
                        <div className="border-t pt-3 text-sm space-y-1">
                            <p className="font-semibold">Handover Details</p>
                            <p>Handover By: {current.handover.handover_by}</p>
                            <p>Handover To: {current.handover.handover_to || "N/A"}</p>
                            {current.handover.condition_notes && (
                                <p>Notes: {current.handover.condition_notes}</p>
                            )}
                        </div>
                    )}

                </CardContent>
            </Card>

            {/* ========================= */}
            {/* UPCOMING MOVE-INS */}
            {/* ========================= */}

            {occupancy?.upcoming?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Move-Ins</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2">

                        {occupancy.upcoming.map((u, index) => (
                            <div key={index} className="flex justify-between text-sm">

                                <span>
                                    {u.occupant_name} ({u.occupant_type})
                                </span>

                                <span>
                                    {formatDate(u.move_in_date)}
                                </span>

                            </div>
                        ))}

                    </CardContent>
                </Card>
            )}

            {/* ========================= */}
            {/* HISTORY */}
            {/* ========================= */}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Occupancy Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {occupancy?.history.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No history</p>
                    ) : (
                        <div className="relative pl-6">
                            <div className="space-y-6">
                                {occupancy?.history.map((e, i) => {
                                    const meta = EVENT_META[e.event] || {};
                                    const Icon = meta.icon || Clock;

                                    return (
                                        <div key={i} className="relative flex gap-4">
                                            {/* timeline line */}
                                            <div className="relative flex flex-col items-center">
                                                {/* vertical line */}
                                                {i !== history.length - 1 && (
                                                    <span className="absolute top-8 h-full w-px bg-border" />
                                                )}

                                                {/* dot */}
                                                <div
                                                    className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${meta.color}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                            </div>

                                            {/* content */}
                                            <div className="flex-1 pb-6">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{meta.label || e.event}</p>

                                                    {e.occupant_type && (
                                                        <span className="rounded bg-muted px-2 py-0.5 text-xs capitalize">
                                                            {e.occupant_type}
                                                        </span>
                                                    )}
                                                </div>

                                                {e.occupant_name && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {e.occupant_name}
                                                    </p>
                                                )}

                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(e.date).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ========================= */}
            {/* MODALS */}
            {/* ========================= */}

            <MoveInModal
                open={isMoveInOpen}
                owners={owners}
                tenants={tenants}
                onClose={() => setIsMoveInOpen(false)}
                spaceId={spaceId}
                onSuccess={onSucess}
            />

            <MoveOutModal
                open={isMoveOutOpen}
                onClose={() => setIsMoveOutOpen(false)}
                spaceId={spaceId}
                onSuccess={onSucess}
            />

        </div>
    );
}


