import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, } from "@/components/ui/card";
import { Users, LogIn, LogOut, History, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "@/helpers/dateHelpers";
import MoveInModal from "./MoveInModal";
import MoveOutModal from "./MoveOutModal";
import { TimelineEvent, OccupancyRecord } from "@/interfaces/spaces_interfaces";

interface Props {
    spaceId: string;
    owners: any[];
    tenants: any[];
    occupancy: OccupancyRecord;
    history: TimelineEvent[];
    onSucess: () => void;
}

const EVENT_META: Record<string, any> = {
    tenant_requested: {
        label: "Tenant Requested",
        icon: Clock,
        color: "text-yellow-600 bg-yellow-100"
    },
    tenant_approved: {
        label: "Tenant Approved",
        icon: CheckCircle,
        color: "text-green-600 bg-green-100"
    },
    tenant_rejected: {
        label: "Tenant Rejected",
        icon: XCircle,
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

export default function OccupancyTab({ spaceId, owners, tenants, occupancy, history, onSucess }: Props) {
    const [isMoveInOpen, setIsMoveInOpen] = useState(false);
    const [isMoveOutOpen, setIsMoveOutOpen] = useState(false);
    const canViewMoveInButton = owners.length > 0 || tenants.length > 0;

    return (
        <div className="space-y-6">
            {/* Current Occupancy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" /> Current Occupancy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant={occupancy.status === "occupied" ? "default" : "secondary"}>
                            {occupancy.status.toUpperCase()}
                        </Badge>

                        <div className="flex gap-2">
                            {occupancy.status === "vacant" && canViewMoveInButton && (
                                <Button onClick={() => setIsMoveInOpen(true)}>
                                    <LogIn className="h-4 w-4 mr-1" /> Move-In
                                </Button>

                            )}
                            {occupancy.status === "occupied" && (
                                <Button variant="destructive" onClick={() => setIsMoveOutOpen(true)}>
                                    <LogOut className="h-4 w-4 mr-1" /> Move-Out
                                </Button>
                            )}
                        </div>
                    </div>

                    {occupancy.status === "occupied" && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Occupant</p>
                                <p className="font-medium">{occupancy.occupant_name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Type</p>
                                <p className="font-medium">{occupancy.occupant_type}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Move-In</p>
                                <p>{formatDate(occupancy.move_in_date)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Reference</p>
                                <p>{occupancy.reference_no}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Occupancy Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {history.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No history</p>
                    ) : (
                        <div className="relative pl-6">
                            {/* vertical line */}
                            <div className="absolute left-2 top-0 h-full w-px bg-border" />
                            <div className="space-y-6">
                                {history.map((e, i) => {
                                    const meta = EVENT_META[e.event] || {};
                                    const Icon = meta.icon || Clock;

                                    return (
                                        <div key={i} className="relative flex gap-4">
                                            {/* dot */}
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.color}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            {/* content */}
                                            <div className="flex-1">
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

                                                {e.notes && (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {e.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <MoveInModal
                open={isMoveInOpen}
                owners={owners}
                tenants={tenants}
                onClose={() => setIsMoveInOpen(false)}
                spaceId={spaceId}
                onSuccess={() => {
                    onSucess();   // refresh current occupancy
                }}
            />
            <MoveOutModal
                open={isMoveOutOpen}
                onClose={() => setIsMoveOutOpen(false)}
                spaceId={spaceId}
                onSuccess={() => {
                    onSucess();   // refresh current occupancy
                }}
            />
        </div>
    );
}
