import ActionDialog from "@/components/ActionDialog";
import { useEffect, useState } from "react";
import { formatDate } from "@/helpers/dateHelpers";

interface MaintenanceDialogProps {
    open: boolean;
    onClose: () => void;
    inspectionId: string;
    maintenance?: any;
    mode: "create" | "complete";
    onSubmit: (data: any) => void;
}

export default function MaintenanceDialog({
    open,
    onClose,
    inspectionId,
    maintenance,
    mode,
    onSubmit,
}: MaintenanceDialogProps) {
    const [maintenanceRequired, setMaintenanceRequired] = useState(true);
    const [notes, setNotes] = useState("");
    const [completedAt, setCompletedAt] = useState("");

    const isCreate = mode === "create";
    const isComplete = mode === "complete";

    useEffect(() => {
        if (maintenance) {
            setMaintenanceRequired(maintenance.maintenance_required ?? true);
            setNotes(maintenance.notes || "");
            setCompletedAt(
                maintenance.completed_at
                    ? formatDate(maintenance.completed_at)
                    : ""
            );
        } else {
            setMaintenanceRequired(true);
            setNotes("");
            setCompletedAt("");
        }
    }, [maintenance, open]);

    const handleSubmit = async () => {
        let data: any = {
            inspection_id: inspectionId,
        };

        if (isCreate) {
            data = {
                ...data,
                maintenance_required: maintenanceRequired,
                notes,
            };
        }

        if (isComplete) {
            data = {
                ...data,
                completed: true,
                completed_at: completedAt || new Date().toISOString(),
            };
        }

        return await onSubmit(data);
    };

    return (
        <ActionDialog
            open={open}
            onClose={onClose}
            title={
                isCreate
                    ? "Create Maintenance"
                    : "Complete Maintenance"
            }
            onSubmit={handleSubmit}
        >
            {isCreate && (
                <>
                    {/* Maintenance Required */}
                    <label className="flex items-center space-x-2 mb-3">
                        <input
                            type="checkbox"
                            checked={maintenanceRequired}
                            onChange={(e) =>
                                setMaintenanceRequired(e.target.checked)
                            }
                        />
                        <span className="text-xs">
                            Maintenance Required
                        </span>
                    </label>

                    {/* Notes */}
                    <label className="block text-xs font-medium mb-1">
                        Maintenance Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter maintenance details"
                        className="border w-full p-2 rounded"
                    />
                </>
            )}

            {isComplete && (
                <>
                    <div className="text-xs mb-2 text-muted-foreground">
                        Maintenance created on{" "}
                        {maintenance?.created_at
                            ? formatDate(maintenance.created_at)
                            : "-"}
                    </div>

                    <label className="block text-xs font-medium mb-1">
                        Completed At
                    </label>
                    <input
                        type="datetime-local"
                        value={completedAt}
                        onChange={(e) => setCompletedAt(e.target.value)}
                        className="border w-full p-2 rounded"
                    />

                    {maintenance?.notes && (
                        <>
                            <label className="block text-xs font-medium mt-3">
                                Notes
                            </label>
                            <div className="text-sm bg-muted p-2 rounded">
                                {maintenance.notes}
                            </div>
                        </>
                    )}
                </>
            )}
        </ActionDialog>
    );
}