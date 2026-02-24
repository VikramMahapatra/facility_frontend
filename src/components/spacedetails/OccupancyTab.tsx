import { formatDate, formatDateTime } from "@/helpers/dateHelpers"
import {
    LogOut,
    KeyRound,
    ClipboardCheck,
    Wrench,
    BadgeCheck,
    CheckCircle
} from "lucide-react"
import { Progress } from "../ui/progress"
import { useState } from "react"
import WorkflowStepper from "./WorkflowStepper"
import ActionDialog from "../ActionDialog"
import HandoverDialog from "./Occupancy/HandoverDialog"
import MoveInModal from "./Occupancy/MoveInModal"
import MoveOutModal from "./Occupancy/MoveOutModal"
import InspectionDialog from "./Occupancy/InspectionDialog"
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi"
import { toast } from "../ui/app-toast"
import InspectionScheduledAlertDialog from "./Occupancy/InspectionScheduledAlertDialog"
import MaintenanceDialog from "./Occupancy/MaintenanceDialog"
import SettlementDialog from "./Occupancy/SettlementDialog"
import { Info } from "../common/InfoLabel"



export default function OccupancyTab({
    spaceId,
    current,
    owners,
    tenants,
    onSucess,
    onMoveOutFlowSuccess
}) {
    const [moveInOpen, setMoveInOpen] = useState(false)
    const [moveOutOpen, setMoveOutOpen] = useState(false)
    const [handoverOpen, setHandoverOpen] = useState(false)
    const [inspectionOpen, setInspectionOpen] = useState(false)
    const [inspectionScheduledOpen, setInspectionScheduledOpen] = useState(false)
    const [inspectionScheduledAlertMessage, setInspectionScheduledAlertMessage] = useState("");
    const [maintenanceOpen, setMaintenanceOpen] = useState(false)
    const [settlementOpen, setSettlementOpen] = useState(false)

    const [inspectionMode, setInspectionMode] = useState<"request" | "complete">("request");
    const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);

    const [maintenanceMode, setMaintenanceMode] = useState<"create" | "complete">("create");

    const [selectedIds, setSelectedIds] = useState({
        occupancyId: null,
        moveOutOccupancyId: null,
        handoverId: null,
        inspectionId: null,
        maintenanceId: null,
        settlementId: null
    })

    const openMoveIn = () => {
        setMoveInOpen(true)
    }

    const openMoveOut = () => {
        setMoveOutOpen(true)
    }

    const openHandover = () => {
        setSelectedIds(prev => ({
            ...prev,
            occupancyId: current.id,
            moveOutOccupancyId: current.move_out_id
        }))
        setHandoverOpen(true)
    }

    const handleHandoverSubmit = async (data: any) => {
        const response = await occupancyApiService.updateHandover(selectedIds.moveOutOccupancyId, data);
        if (response?.success) {
            setHandoverOpen(false);
            onMoveOutFlowSuccess();
        }
    }


    const openInspection = () => {
        if (!current.handover?.id) return;

        if (!current?.inspection) {
            setInspectionMode("request");
        } else if (isInspectionScheduled) {
            // Just show info
            setInspectionScheduledAlertMessage(
                `Inspection scheduled on ${formatDateTime(current.inspection.scheduled_date)}`
            );
            setInspectionScheduledOpen(true);
            return;
        } else {
            const now = new Date();
            const scheduled = new Date(current.inspection.scheduled_date);
            setSelectedIds(prev => ({
                ...prev,
                inspectionId: current.inspection.id
            }))
            if (scheduled > now && current.inspection.status !== "completed") {
                // still scheduled
                setInspectionMode("request"); // allow reschedule if you want
            } else {
                setInspectionMode("complete");
            }
        }
        setInspectionDialogOpen(true);
    }

    const handleInspectionSubmit = async (data: any) => {
        let response;
        if (inspectionMode == "request") {
            response = await occupancyApiService.requestInspection(data);
        }
        else {
            response = await occupancyApiService.completeInspection(selectedIds.inspectionId, data);
        }

        if (response?.success) {
            setInspectionOpen(false);
            onMoveOutFlowSuccess();
        }
    }

    const openMaintenance = () => {
        if (!current.inspection?.id) return

        if (!current?.maintenance) {
            setMaintenanceMode("create");
        } else {
            setSelectedIds(prev => ({
                ...prev,
                maintenanceId: current.maintenance.id
            }))
            setMaintenanceMode("complete");

        }

        setMaintenanceOpen(true)
    }

    const handleMaintenanceSubmit = async (data: any) => {
        let response;
        if (maintenanceMode == "create") {
            response = await occupancyApiService.createMaintenance(data);
        }
        else {
            response = await occupancyApiService.completeMaintenance(selectedIds.maintenanceId, data);
        }

        if (response?.success) {
            setMaintenanceOpen(false);
            onMoveOutFlowSuccess();
        }
    }

    const openSettlement = () => {
        if (!current.inspection?.id) return

        setSelectedIds(prev => ({
            ...prev,
            settlementId: current.settlement?.id
        }))

        setSettlementOpen(true)
    }

    const handleSettlementSubmit = async (data: any) => {
        let response = await occupancyApiService.completeSettlement(selectedIds.settlementId, data);
        if (response?.success) {
            setSettlementOpen(false);
            onSucess();
        }
    }

    const getStepStatus = (step) => {
        if (step.completed) return "completed";
        if (step.enabled) return "current";
        return "pending";
    };

    const now = new Date();

    const isInspectionScheduled =
        current?.inspection &&
        current?.inspection?.status === "requested" &&
        new Date(current?.inspection?.scheduled_date) > now;

    const canCompleteInspection =
        current?.inspection &&
        current?.inspection?.status === "requested" &&
        new Date(current?.inspection?.scheduled_date) <= now;

    const workflowSteps = [
        {
            id: "move_out",
            title: "Move Out",
            icon: LogOut,
            completed: current?.status !== "occupied",
            enabled: current?.status === "occupied",
            action: () => openMoveOut()
        },
        {
            id: "handover",
            title: "Handover",
            icon: KeyRound,
            completed: current?.handover?.status === "completed",
            enabled: current?.status === "handover_in_progress",
            action: () => openHandover()
        },
        {
            id: "inspection",
            title: "Inspection",
            icon: ClipboardCheck,
            completed: current?.inspection?.status === "completed",
            enabled:
                (current?.status === "inspection_pending" || current?.status === "inspection_scheduled") &&
                (!current?.inspection || isInspectionScheduled || canCompleteInspection),
            action: () => openInspection()
        },
        {
            id: "maintenance",
            title: "Maintenance",
            icon: Wrench,
            completed: current?.maintenance?.completed,
            enabled: (current?.status === "maintenance_pending" && current?.inspection?.status === "completed"),
            action: () => openMaintenance()
        },
        {
            id: "settlement",
            title: "Settlement",
            icon: BadgeCheck,
            completed: current?.settlement?.settled,
            enabled: (current?.status === "settlement_pending" && current?.maintenance?.completed),
            action: () => openSettlement()
        },
        // ✅ Final step
        {
            id: "closure",
            title: "Closure",
            icon: CheckCircle, // You can use any icon you like
            completed: current?.settlement?.settled === true,
            enabled: false,
            action: () => console.log("Workflow completed!") // optional final action
        }
    ];

    const completedSteps = workflowSteps.filter(s => s.completed).length
    const progress = Math.round(
        (completedSteps / workflowSteps.length) * 100
    )

    return (
        <div className="space-y-6">
            {/* Vacant Header (First Move-In) */}
            {current?.status === "vacant" && (
                <div className="w-full border rounded-xl p-6 bg-blue-50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md transition-all hover:shadow-lg">

                    {/* Icon + Text Section */}
                    <div className="flex items-center flex-1 gap-4">
                        {/* Vacancy Icon */}
                        <div className="bg-blue-100 text-blue-700 p-3 rounded-full flex-shrink-0">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 7v4a2 2 0 002 2h14a2 2 0 002-2V7M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2"
                                />
                            </svg>
                        </div>

                        {/* Text */}
                        <div>
                            <p className="text-lg md:text-xl font-semibold text-blue-800">
                                Space is Vacant
                            </p>
                            <p className="mt-1 text-sm text-blue-600">
                                Ready for first occupancy or new tenant
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {current?.can_request_move_in && (
                        <button
                            onClick={() => openMoveIn()}
                            className="mt-4 md:mt-0 w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                        >
                            Move-In
                        </button>
                    )}
                </div>
            )}
            {/* Closure Header */}
            {current?.status === "completed" && (
                <div className="flex items-center justify-between border rounded-lg p-4 bg-green-50">
                    <div>
                        <p className="font-semibold text-green-700">
                            Tenant Closure Completed
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Space is ready for next occupancy
                        </p>
                    </div>

                    {current?.can_request_move_in && (
                        <button
                            onClick={() => openMoveIn()}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Move-In
                        </button>
                    )}
                </div>
            )}
            {/* Workflow Bar */}
            {current?.status !== "vacant" && (
                <>
                    {/* Occupant Info */}
                    <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 border rounded-lg p-4">
                        <Info label="Occupant" value={current?.occupant_name} />
                        <Info label="Type" value={current?.occupant_type} />
                        <Info label="Move-In" value={formatDate(current?.move_in_date)} />
                        <Info label="Move-Out" value={formatDate(current?.move_out_date)} />
                    </div>
                    {/* Progress */}
                    <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
                        <div className="flex justify-between text-sm">
                            <p className="font-medium">Move-Out Workflow</p>
                            <p className="text-muted-foreground">{progress}%</p>
                        </div>
                        <Progress value={progress} />
                    </div>
                    <WorkflowStepper steps={workflowSteps} />
                </>

            )}

            {/* Current Stage Details */}
            {current?.handover && (
                <HandoverSummary handover={current.handover} />
            )}

            {current?.inspection && (
                <InspectionSummary inspection={current.inspection} />
            )}

            {current?.maintenance && (
                <MaintenanceSummary maintenance={current.maintenance} />
            )}

            {current?.settlement && (
                <SettlementSummary settlement={current.settlement} />
            )}

            <HandoverDialog
                open={handoverOpen}
                onClose={() => setHandoverOpen(false)}
                handover={current?.handover}
                onSubmit={handleHandoverSubmit}
            />
            <InspectionDialog
                open={inspectionDialogOpen}
                onClose={() => setInspectionDialogOpen(false)}
                handoverId={current?.handover?.id}
                inspection={current?.inspection}
                mode={inspectionMode}
                onSubmit={handleInspectionSubmit}
            />
            <MaintenanceDialog
                open={maintenanceOpen}
                onClose={() => setMaintenanceOpen(false)}
                inspectionId={current?.inspection?.id}
                maintenance={current?.maintenance}
                mode={maintenanceMode}
                onSubmit={handleMaintenanceSubmit}
            />
            <SettlementDialog
                open={settlementOpen}
                onClose={() => setSettlementOpen(false)}
                settlementId={current?.inspection?.id}
                onSubmit={handleSettlementSubmit}
            />
            <MoveInModal
                open={moveInOpen}
                owners={owners}
                tenants={tenants}
                onClose={() => setMoveInOpen(false)}
                spaceId={spaceId}
                onSuccess={onSucess}
            />

            <MoveOutModal
                open={moveOutOpen}
                onClose={() => setMoveOutOpen(false)}
                spaceId={spaceId}
                onSuccess={onSucess}
            />

            <InspectionScheduledAlertDialog
                open={inspectionScheduledOpen}
                onClose={() => setInspectionScheduledOpen(false)}
                title="Inspection Scheduled"
                message={inspectionScheduledAlertMessage}
            />
        </div>
    )
}

function HandoverSummary({ handover }) {
    if (!handover) return null;

    return (
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="font-semibold text-base">Handover</p>

                <span
                    className={`px-3 py-1 text-xs rounded-full
                    ${handover.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {handover.status}
                </span>
            </div>

            {/* Main info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Info
                    label="Handover Date"
                    value={formatDate(handover.handover_date)}
                />
                <Info
                    label="Handover By"
                    value={handover.handover_by || "-"}
                />
                <Info
                    label="Contact Person"
                    value={handover.handover_to_person || "-"}
                />
                <Info
                    label="Contact"
                    value={handover.handover_to_contact || "-"}
                />

            </div>

            {/* Cards info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Info
                    label="Keys Returned"
                    value={handover.keys_returned ? "Yes" : "No"}
                />
                <Info
                    label="Accessories Returned"
                    value={handover.accessories_returned ? "Yes" : "No"}
                />
                <Info
                    label="Access Cards"
                    value={
                        handover.access_card_returned
                            ? handover.number_of_access_cards
                            : "No"
                    }
                />
                <Info
                    label="Parking Cards"
                    value={
                        handover.parking_card_returned
                            ? handover.number_of_parking_cards
                            : "No"
                    }
                />

            </div>

            {/* Remarks */}
            {handover.remarks && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {handover.remarks}
                </div>
            )}
        </div>
    );
}


function InspectionSummary({ inspection }) {
    if (!inspection) return null;

    const status = inspection.status;

    const isRequested = status === "requested";
    const isScheduled = status === "scheduled";
    const isCompleted = status === "completed";

    return (
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="font-semibold text-base">Inspection</p>

                <span
                    className={`px-3 py-1 text-xs rounded-full
                        ${isCompleted
                            ? "bg-green-100 text-green-700"
                            : isScheduled
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {status}
                </span>
            </div>

            {/* Requested */}
            {isRequested && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Info
                        label="Requested"
                        value={formatDateTime(inspection.scheduled_date)}
                    />
                </div>
            )}

            {/* Scheduled */}
            {(isScheduled || isCompleted) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Info
                        label="Scheduled Date"
                        value={formatDate(inspection.scheduled_date)}
                    />
                    <Info
                        label="Inspector"
                        value={inspection.inspected_by_user_name || "-"}
                    />
                    {isCompleted && (
                        <>
                            <Info
                                label="Inspection Date"
                                value={formatDate(inspection.inspection_date)}
                            />
                            <Info
                                label="Damage Found"
                                value={inspection.damage_found ? "Yes" : "No"}
                            />
                        </>
                    )}
                </div>
            )}

            {/* Completed Inspection Details */}
            {isCompleted && (
                <>
                    {/* Condition Report */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Info
                            label="Walls"
                            value={inspection.walls_condition || "-"}
                        />
                        <Info
                            label="Flooring"
                            value={inspection.flooring_condition || "-"}
                        />
                        <Info
                            label="Electrical"
                            value={inspection.electrical_condition || "-"}
                        />
                        <Info
                            label="Plumbing"
                            value={inspection.plumbing_condition || "-"}
                        />
                    </div>

                    {inspection.damage_notes && (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            {inspection.damage_notes}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
function MaintenanceSummary({ maintenance }) {
    if (!maintenance) return null;

    const isCompleted = maintenance.completed;
    const notRequired = maintenance.maintenance_required === false;

    const fields = [];

    fields.push({
        label: "Maintenance Required",
        value: maintenance.maintenance_required ? "Yes" : "No",
    });

    if (maintenance.created_at) {
        fields.push({
            label: "Created",
            value: formatDate(maintenance.created_at),
        });
    }

    if (isCompleted) {
        fields.push({
            label: "Completed At",
            value: formatDate(maintenance.completed_at),
        });

        fields.push({
            label: "Completed By",
            value: maintenance.completed_by_name || "-",
        });
    }

    return (
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="font-semibold text-base">Maintenance</p>

                <span
                    className={`px-3 py-1 text-xs rounded-full
                        ${notRequired
                            ? "bg-gray-100 text-gray-700"
                            : isCompleted
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                        }
                    `}
                >
                    {notRequired
                        ? "Not Required"
                        : isCompleted
                            ? "Completed"
                            : "Pending"}
                </span>
            </div>

            {/* Dynamic Grid */}
            <div
                className={`grid gap-4 ${fields.length === 1
                    ? "grid-cols-1"
                    : fields.length === 2
                        ? "grid-cols-2"
                        : fields.length === 3
                            ? "grid-cols-3"
                            : "grid-cols-4"
                    }`}
            >
                {fields.map((f, i) => (
                    <Info key={i} label={f.label} value={f.value} />
                ))}
            </div>

            {/* Notes */}
            {maintenance.notes && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {maintenance.notes}
                </div>
            )}
        </div>
    );
}

function SettlementSummary({ settlement }) {
    if (!settlement) return null;

    const isCompleted = settlement.settled;

    return (
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <p className="font-semibold">Settlement</p>

                <span
                    className={`px-3 py-1 text-xs rounded-full ${isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {isCompleted ? "Settled" : "Pending"}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Info
                    label="Damage Charges"
                    value={`₹ ${settlement.damage_charges || 0}`}
                />
                <Info
                    label="Pending Dues"
                    value={`₹ ${settlement.pending_dues || 0}`}
                />
                <Info
                    label="Final Amount"
                    value={`₹ ${settlement.final_amount || 0}`}
                />
                {isCompleted && (
                    <Info
                        label="Settled At"
                        value={formatDate(settlement.settled_at)}
                    />
                )}
            </div>
        </div>
    );
}



