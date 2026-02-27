import { useState } from "react";
import { formatDate } from "@/helpers/dateHelpers";
import { Info } from "../common/InfoLabel";

function StatusBadge({ status }) {
    let color = "bg-gray-100 text-gray-700";

    if (status === "completed") color = "bg-green-100 text-green-700";
    if (status === "occupied") color = "bg-blue-100 text-blue-700";
    if (status === "move_out_scheduled") color = "bg-yellow-100 text-yellow-700";

    return (
        <span className={`text-xs px-2 py-1 rounded ${color}`}>
            {status}
        </span>
    );
}

export function OccupancyHistoryTab({ history }) {
    const [openRow, setOpenRow] = useState(null);

    if (!history || history.length === 0) {
        return (
            <div className="text-sm text-muted-foreground py-6 text-center">
                No occupancy history found
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((h, index) => {
                const expanded = openRow === index;

                return (
                    <div
                        key={index}
                        className={`border rounded-lg p-4 ${index === 0 ? "bg-yellow-50 border-yellow-200" : ""
                            }`}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-semibold">{h.occupant_name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {h.occupant_type}
                                </p>
                            </div>

                            <StatusBadge status={h.status} />
                        </div>

                        {/* Basic Info */}
                        <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-4 text-sm mb-3">
                            <Info label="Move-In" value={formatDate(h.move_in_date)} />
                            <Info label="Move-Out" value={formatDate(h.move_out_date)} />
                            <Info label="Time Slot" value={h.time_slot || "-"} />
                            <Info label="Reference" value={h.reference_no || "-"} />
                            <Info
                                label="Settlement"
                                value={
                                    h.settlement?.settled
                                        ? "Completed"
                                        : "Pending"
                                }
                            />
                        </div>

                        {/* Expand Button */}
                        <button
                            onClick={() =>
                                setOpenRow(expanded ? null : index)
                            }
                            className="text-sm text-blue-600"
                        >
                            {expanded ? "Hide Details" : "View Details"}
                        </button>

                        {/* Expanded Details */}
                        {expanded && (
                            <div className="mt-4 space-y-4 border-t pt-4">
                                {/* Handover */}
                                {h.handover && (
                                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                                        <Info
                                            label="Handover Date"
                                            value={formatDate(h.handover.handover_date)}
                                        />
                                        <Info
                                            label="Keys Returned"
                                            value={
                                                h.handover.keys_returned
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />
                                        <Info
                                            label="Accessories Returned"
                                            value={
                                                h.handover.accessories_returned
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />
                                        <Info
                                            label="Remarks"
                                            value={h.handover.remarks || "-"}
                                        />
                                    </div>
                                )}

                                {/* Inspection */}
                                {h.inspection && (
                                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                                        <Info
                                            label="Inspection Date"
                                            value={formatDate(
                                                h.inspection.inspection_date
                                            )}
                                        />
                                        <Info
                                            label="Damage Found"
                                            value={
                                                h.inspection.damage_found
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />
                                        <Info
                                            label="Walls"
                                            value={
                                                h.inspection.walls_condition || "-"
                                            }
                                        />
                                        <Info
                                            label="Flooring"
                                            value={
                                                h.inspection.flooring_condition || "-"
                                            }
                                        />
                                    </div>
                                )}

                                {/* Maintenance */}
                                {h.maintenance && (
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                        <Info
                                            label="Maintenance Required"
                                            value={
                                                h.maintenance.maintenance_required
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />
                                        <Info
                                            label="Completed"
                                            value={
                                                h.maintenance.completed
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />
                                        <Info
                                            label="Notes"
                                            value={h.maintenance.notes || "-"}
                                        />
                                    </div>
                                )}

                                {/* Settlement */}
                                {h.settlement && (
                                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                                        <Info
                                            label="Damage Charges"
                                            value={h.settlement.damage_charges}
                                        />
                                        <Info
                                            label="Pending Dues"
                                            value={h.settlement.pending_dues}
                                        />
                                        <Info
                                            label="Final Amount"
                                            value={h.settlement.final_amount}
                                        />
                                        <Info
                                            label="Settled"
                                            value={
                                                h.settlement.settled
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}