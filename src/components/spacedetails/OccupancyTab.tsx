import { formatDate } from "@/helpers/dateHelpers"
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
import MoveInModal from "./MoveInModal"
import MoveOutModal from "./MoveOutModal"
import InspectionDialog from "./Occupancy/InspectionDialog"

export default function OccupancyTab({
    spaceId,
    current,
    owners,
    tenants,
    onSucess
}) {
    const [moveInOpen, setMoveInOpen] = useState(false)
    const [moveOutOpen, setMoveOutOpen] = useState(false)
    const [handoverOpen, setHandoverOpen] = useState(false)
    const [inspectionOpen, setInspectionOpen] = useState(false)
    const [maintenanceOpen, setMaintenanceOpen] = useState(false)
    const [settlementOpen, setSettlementOpen] = useState(false)

    const [selectedIds, setSelectedIds] = useState({
        occupancyId: null,
        handoverId: null,
        inspectionId: null
    })

    const openMoveIn = () => {
        setSelectedIds(prev => ({
            ...prev,
            occupancyId: current.id // or scheduled occupancy id
        }))
        // Open MoveIn dialog
        setMoveInOpen(true)
    }

    const openMoveOut = () => {
        setSelectedIds(prev => ({
            ...prev,
            occupancyId: current.id
        }))
        setMoveOutOpen(true)
    }

    const openHandover = () => {
        setSelectedIds(prev => ({
            ...prev,
            occupancyId: current.id
        }))
        setHandoverOpen(true)
    }

    const handleHandoverSubmit = () => {

    }

    const handleInspectionSubmit = () => {

    }

    const openInspection = () => {
        if (!current.handover?.id) return;

        if (!current.inspection) {
            // Request a new inspection
            setInspectionOpen(true);
        } else {
            // Update existing inspection
            setSelectedIds(prev => ({ ...prev, inspectionId: current.inspection.id }));
            setInspectionOpen(true);
        }
    }

    const openMaintenance = () => {
        if (!current.inspection?.id) return

        setSelectedIds(prev => ({
            ...prev,
            inspectionId: current.inspection.id
        }))

        setMaintenanceOpen(true)
    }

    const openSettlement = () => {
        setSelectedIds(prev => ({
            ...prev,
            occupancyId: current.id
        }))

        setSettlementOpen(true)
    }

    const getStepStatus = (step) => {
        if (step.completed) return "completed";
        if (step.enabled) return "current";
        return "pending";
    };

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
            enabled: current?.handover?.status === "inspection_pending",
            action: () => openInspection()
        },
        {
            id: "maintenance",
            title: "Maintenance",
            icon: Wrench,
            completed: current?.maintenance?.completed,
            enabled: current?.inspection?.status === "completed",
            action: () => openMaintenance()
        },
        {
            id: "settlement",
            title: "Settlement",
            icon: BadgeCheck,
            completed: current?.settlement?.settled,
            enabled: current?.maintenance?.completed,
            action: () => openSettlement()
        },
        // ✅ Final step
        {
            id: "closure",
            title: "Closure",
            icon: CheckCircle, // You can use any icon you like
            completed: current?.settlement?.settled === true,
            enabled: current?.settlement?.settled === true,
            action: () => console.log("Workflow completed!") // optional final action
        }
    ];

    const completedSteps = workflowSteps.filter(s => s.completed).length
    const progress = Math.round(
        (completedSteps / workflowSteps.length) * 100
    )

    return (
        <div className="space-y-6">

            {/* Occupant Info */}
            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 border rounded-lg p-4">
                <Info label="Occupant" value={current?.occupant_name} />
                <Info label="Type" value={current?.occupant_type} />
                <Info label="Move-In" value={formatDate(current?.move_in_date)} />
                <Info label="Move-Out" value={formatDate(current?.move_out_date)} />
            </div>
            {current.can_request_move_in && (
                <div className="mb-4">
                    <button
                        onClick={() => openMoveIn()} // define this function
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Move-In
                    </button>
                </div>
            )}

            {/* Progress */}
            <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
                <div className="flex justify-between text-sm">
                    <p className="font-medium">Move-Out Workflow</p>
                    <p className="text-muted-foreground">{progress}%</p>
                </div>
                <Progress value={progress} />
            </div>

            {/* Workflow Bar */}
            <WorkflowStepper steps={workflowSteps} />

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
                onSubmit={async (data) => {
                    //todo
                }}
            />
            <InspectionDialog
                open={inspectionOpen}
                onClose={() => setInspectionOpen(false)}
                handoverId={current.handover?.id}
                inspection={current.inspection} // undefined if requesting
                onSubmit={handleInspectionSubmit}
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
        </div>
    )
}

function HandoverSummary({ handover }) {
    return (
        <div className="border rounded-lg p-4 space-y-2">
            <p className="font-semibold">Handover Details</p>

            <div className="grid grid-cols-4 gap-4">
                <Info label="Handover Date" value={formatDate(handover.handover_date)} />
                <Info label="Keys Returned" value={handover.keys_returned ? "Yes" : "No"} />
                <Info label="Accessories Returned" value={handover.accessories_returned ? "Yes" : "No"} />
                <Info label="Remarks" value={handover.remarks || "-"} />
            </div>
        </div>
    )
}


function InspectionSummary({ inspection }) {
    return (
        <div className="border rounded-lg p-4 space-y-2">
            <p className="font-semibold">Inspection</p>

            <Info label="Scheduled Date" value={formatDate(inspection.scheduled_date)} />
            <Info label="Status" value={inspection.status} />
            <Info label="Damage Found" value={inspection.damage_found ? "Yes" : "No"} />
            <Info label="Notes" value={inspection.damage_notes || "-"} />
        </div>
    )
}

function MaintenanceSummary({ maintenance }) {
    return (
        <div className="border rounded-lg p-4 space-y-2">
            <p className="font-semibold">Maintenance</p>

            <Info label="Completed" value={maintenance.completed ? "Yes" : "No"} />
            <Info label="Notes" value={maintenance.notes || "-"} />
        </div>
    )
}

function SettlementSummary({ settlement }) {
    return (
        <div className="border rounded-lg p-4 space-y-2">
            <p className="font-semibold">Final Settlement</p>

            <Info label="Final Amount" value={settlement.final_amount} />
            <Info label="Settled" value={settlement.settled ? "Yes" : "No"} />
        </div>
    )
}


function Info({ label, value }) {
    return (
        <div>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-medium">{value || "-"}</p>
        </div>
    )
}


