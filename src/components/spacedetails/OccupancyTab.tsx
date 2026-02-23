import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "@/helpers/dateHelpers";
import MoveInModal from "./MoveInModal";
import MoveOutModal from "./MoveOutModal";
import {
    Clock,
    Users,
    LogIn,
    LogOut,
    History,
    User,
    ShieldCheck,
    UserPlus,
    UserCheck,
    UserX,
    UserMinus,
    FileText,
    FileX
} from "lucide-react";
import { OccupancyResponse } from "@/interfaces/spaces_interfaces";
import React from "react";
import { Progress } from "../ui/progress";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";
import { useNavigate } from "react-router-dom";
import { toast } from "../ui/app-toast";

interface Props {
    spaceId: string;
    owners: any[];
    tenants: any[];
    occupancy: OccupancyResponse;
    onSucess: () => void;
}

const EVENT_META: Record<string, any> = {
    owner_requested: { label: "Owner Requested", icon: User, color: "text-yellow-600 bg-yellow-100" },
    owner_approved: { label: "Owner Approved", icon: ShieldCheck, color: "text-green-600 bg-green-100" },
    owner_removed: { label: "Owner Removed", icon: UserX, color: "text-red-600 bg-red-100" },
    tenant_requested: { label: "Tenant Requested", icon: UserPlus, color: "text-yellow-600 bg-yellow-100" },
    tenant_approved: { label: "Tenant Approved", icon: UserCheck, color: "text-green-600 bg-green-100" },
    tenant_rejected: { label: "Tenant Rejected", icon: UserX, color: "text-red-600 bg-red-100" },
    tenant_removed: { label: "Tenant Removed", icon: UserMinus, color: "text-red-600 bg-red-100" },
    lease_created: { label: "Lease Created", icon: FileText, color: "text-green-600 bg-green-100" },
    lease_terminated: { label: "Lease Terminated", icon: FileX, color: "text-red-600 bg-red-100" },
    moved_in: { label: "Moved In", icon: LogIn, color: "text-green-700 bg-green-100" },
    moved_out: { label: "Moved Out", icon: LogOut, color: "text-gray-600 bg-gray-100" }
};

export default function OccupancyTab({ spaceId, owners, tenants, occupancy, onSucess }: Props) {
    const navigate = useNavigate();
    const [isMoveInOpen, setIsMoveInOpen] = useState(false);
    const [isMoveOutOpen, setIsMoveOutOpen] = useState(false);

    const current = occupancy?.current || { status: "vacant" };
    const isVacant = current.status === "vacant";
    const isOccupied = current.status === "occupied";
    const isMoveOutScheduled = current.status === "move_out_scheduled";
    const isHandoverAwaited = current.status === "handover_awaited";
    const isRecentlyVacated = current.status === "recently_vacated";

    const openInspection = (occupancyId: string) => {
        navigate(`/inspection/${occupancyId}`)
    }

    const completeHandover = async (occupancyId: string) => {
        const response = await occupancyApiService.completeHandover(occupancyId)
        if (response?.succes) {
            toast.success("Handover completed")
            onSucess()
        }
    }

    const updateHandover = async (occupancyId: string, type: "keys" | "accessories") => {
        const params = { item: type }
        const response = await occupancyApiService.updateHandover(occupancyId, params)
        if (response?.succes) {
            toast.success("Handover completed")
            onSucess()
        }
    }

    const handoverProgress = React.useMemo(() => {
        if (!current?.handover) return 0

        let steps = 0
        let completed = 0

        // Keys returned
        steps++
        if (current.handover.keys_returned) completed++

        // Damage inspection
        steps++
        if (current.handover.inspection_completed) completed++

        // Accessories returned
        steps++
        if (current.handover.accessories_returned) completed++

        // Final completion
        steps++
        if (current.handover.status === "completed") completed++

        return Math.round((completed / steps) * 100)
    }, [current])

    const workflow = {
        inspectionDone: current?.handover?.inspection_completed,
        keysReturned: current?.handover?.keys_returned,
        accessoriesReturned: current?.handover?.accessories_returned,
        completed: current?.handover?.status === "completed"
    }

    const nextStep =
        !workflow.inspectionDone
            ? "inspection"
            : !workflow.keysReturned
                ? "keys"
                : !workflow.accessoriesReturned
                    ? "accessories"
                    : !workflow.completed
                        ? "complete"
                        : null

    return (
        <div className="space-y-6">

            {/* ================= Current Occupancy ================= */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Current Occupancy
                        </CardTitle>

                        <Badge
                            variant={
                                isOccupied
                                    ? "default"
                                    : isHandoverAwaited
                                        ? "secondary"
                                        : isMoveOutScheduled
                                            ? "outline"
                                            : "secondary"
                            }
                            className="text-xs px-3 py-1"
                        >
                            {current.status?.toUpperCase() || "VACANT"}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-2">
                        {isVacant && current.can_request_move_in && (owners.length > 0 || tenants.length > 0) && (
                            <Button onClick={() => setIsMoveInOpen(true)}>
                                <LogIn className="h-4 w-4 mr-2" />
                                Move-In
                            </Button>
                        )}

                        {isOccupied && current.can_request_move_out && (
                            <Button variant="destructive" onClick={() => setIsMoveOutOpen(true)}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Move-Out
                            </Button>
                        )}

                        {isHandoverAwaited && (
                            <>
                                {nextStep === "inspection" && (
                                    <Button onClick={() => openInspection(current.handover?.occupancy_id)}>
                                        Start Inspection
                                    </Button>
                                )}

                                {nextStep === "keys" && (
                                    <Button onClick={() => updateHandover(current.handover?.occupancy_id, "keys")}>
                                        Mark Keys Returned
                                    </Button>
                                )}

                                {nextStep === "accessories" && (
                                    <Button onClick={() => updateHandover(current.handover?.occupancy_id, "accessories")}>
                                        Confirm Accessories
                                    </Button>
                                )}

                                {nextStep === "complete" && (
                                    <Button onClick={() => completeHandover(current.handover?.occupancy_id)}>
                                        Complete Handover
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {/* OCCUPANT SUMMARY */}
                    {(isOccupied || isHandoverAwaited) && (
                        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 border rounded-lg p-4">
                            <Info label="Occupant" value={current.occupant_name} />
                            <Info label="Type" value={current.occupant_type} />
                            <Info label="Move-In" value={formatDate(current.move_in_date)} />
                            {current.move_out_date && (
                                <Info label="Move-Out" value={formatDate(current.move_out_date)} />
                            )}
                            {current.time_slot && (
                                <Info label="Time Slot" value={current.time_slot} />
                            )}
                        </div>
                    )}

                    {/* HANDOVER SECTION */}
                    {/* Handover Details */}
                    {current.handover && (
                        <div className="border-t pt-3 text-sm space-y-3">
                            <div className="bg-muted/40 rounded-lg p-4 space-y-4">
                                <p className="font-semibold">Handover Details</p>

                                <p>
                                    Status:
                                    <Badge
                                        variant={
                                            current.handover.status === "completed"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {current.handover.status}
                                    </Badge>
                                </p>

                                {/* ADD PROGRESS HERE */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <p className="font-medium">Handover Progress</p>
                                        <span className="text-muted-foreground">
                                            {handoverProgress}%
                                        </span>
                                    </div>
                                    <Progress value={handoverProgress} />
                                </div>

                                {/* ADD CHECKLIST HERE */}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <WorkflowStep
                                        title="Inspection"
                                        done={workflow.inspectionDone}
                                        active={nextStep === "inspection"}
                                    />

                                    <WorkflowStep
                                        title="Keys Returned"
                                        done={workflow.keysReturned}
                                        active={nextStep === "keys"}
                                    />

                                    <WorkflowStep
                                        title="Accessories"
                                        done={workflow.accessoriesReturned}
                                        active={nextStep === "accessories"}
                                    />

                                    <WorkflowStep
                                        title="Completed"
                                        done={workflow.completed}
                                        active={nextStep === "complete"}
                                    />
                                </div>

                                <p>Handover By: {current.handover.handover_by}</p>
                                <p>Handover To: {current.handover.handover_to || "N/A"}</p>

                                {current.handover.condition_notes && (
                                    <p>Notes: {current.handover.condition_notes}</p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ================= Upcoming Move-Ins ================= */}
            {occupancy?.upcoming?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Move-Ins</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {occupancy.upcoming.map((u, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span>{u.occupant_name} ({u.occupant_type})</span>
                                <span>{formatDate(u.move_in_date)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* ================= Occupancy History ================= */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Occupancy Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {occupancy?.history?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No history</p>
                    ) : (
                        <div className="relative pl-6">
                            <div className="space-y-6">
                                {occupancy?.history.map((e, i) => {
                                    const meta = EVENT_META[e.event] || {};
                                    const Icon = meta.icon || Clock;
                                    return (
                                        <div key={i} className="relative flex gap-4">
                                            <div className="relative flex flex-col items-center">
                                                {i !== occupancy.history.length - 1 && (
                                                    <span className="absolute top-8 h-full w-px bg-border" />
                                                )}
                                                <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${meta.color}`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{meta.label || e.event}</p>
                                                    {e.occupant_type && (
                                                        <span className="rounded bg-muted px-2 py-0.5 text-xs capitalize">{e.occupant_type}</span>
                                                    )}
                                                </div>
                                                {e.occupant_name && <p className="text-sm text-muted-foreground">{e.occupant_name}</p>}
                                                <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ================= Modals ================= */}
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

function Info({ label, value }) {
    return (
        <div>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-medium">{value || "-"}</p>
        </div>
    )
}

function StatusItem({ label, done }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`h-2 w-2 rounded-full ${done ? "bg-green-500" : "bg-gray-300"
                    }`}
            />
            <span>{label}</span>
        </div>
    )
}

function WorkflowStep({ title, done, active }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`h-3 w-3 rounded-full ${done
                    ? "bg-green-500"
                    : active
                        ? "bg-blue-500 animate-pulse"
                        : "bg-gray-300"
                    }`}
            />
            <span className={done ? "text-green-600" : ""}>{title}</span>
        </div>
    )
}