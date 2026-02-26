import ActionDialog from "@/components/ActionDialog";
import { AsyncAutocompleteRQ } from "@/components/common/async-autocomplete-rq";
import { formatDate } from "@/helpers/dateHelpers";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { useState, useEffect } from "react";


interface InspectionDialogProps {
    open: boolean;
    onClose: () => void;
    handoverId: string;
    inspection?: any;
    mode: "request" | "complete";   // add this
    onSubmit: (data: any) => void;
}

export default function InspectionDialog({
    open,
    onClose,
    handoverId,
    inspection,
    mode,
    onSubmit,
}: InspectionDialogProps) {
    const [scheduledDate, setScheduledDate] = useState("");
    const [inspector, setInspector] = useState("");
    const [damageFound, setDamageFound] = useState(false);
    const [damageNotes, setDamageNotes] = useState("");
    const [wallsCondition, setWallsCondition] = useState("");
    const [flooringCondition, setFlooringCondition] = useState("");
    const [electricalCondition, setElectricalCondition] = useState("");
    const [plumbingCondition, setPlumbingCondition] = useState("");

    const isRequest = mode === "request";

    useEffect(() => {
        if (inspection) {
            setScheduledDate(formatDate(inspection.scheduled_date));
            setInspector(inspection.inspected_by_user_id || "");
            setDamageFound(inspection.damage_found || false);
            setDamageNotes(inspection.damage_notes || "");
            setWallsCondition(inspection.walls_condition || "");
            setFlooringCondition(inspection.flooring_condition || "");
            setElectricalCondition(inspection.electrical_condition || "");
            setPlumbingCondition(inspection.plumbing_condition || "");
        } else {
            // Reset fields if creating new inspection
            setScheduledDate("");
            setInspector("");
            setDamageFound(false);
            setDamageNotes("");
            setWallsCondition("");
            setFlooringCondition("");
            setElectricalCondition("");
            setPlumbingCondition("");
        }
    }, [inspection, open]);

    const handleSubmit = async () => {
        let data: any = {
            handover_id: handoverId,
        };

        if (mode === "request") {
            data = {
                ...data,
                scheduled_date: scheduledDate,
                inspected_by_user_id: inspector,
                status: "requested",
            };
        }

        if (mode === "complete") {
            data = {
                ...data,
                damage_found: damageFound,
                damage_notes: damageNotes,
                walls_condition: wallsCondition,
                flooring_condition: flooringCondition,
                electrical_condition: electricalCondition,
                plumbing_condition: plumbingCondition,
                status: "completed",
            };
        }

        return await onSubmit(data);
    };

    return (
        <ActionDialog
            open={open}
            onClose={onClose}
            title={inspection ? "Update Inspection" : "Request Inspection"}
            onSubmit={handleSubmit}
        >
            {isRequest && (
                <>
                    <label className="block text-xs font-medium mb-1">Scheduled Date</label>
                    <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="border w-full p-2 rounded mb-2"
                    />

                    <label className="block text-xs font-medium mb-1">Inspector</label>
                    <AsyncAutocompleteRQ
                        value={inspector}
                        onChange={(e) => setInspector(e)}
                        placeholder="Search user"
                        queryKey={["users"]}
                        queryFn={async (search) => {
                            const res = await userManagementApiService.searchStaffUsers(search);
                            return res.data.map((u: any) => ({ id: u.id, label: u.name }));
                        }}
                    />
                </>
            )}
            {mode === "complete" && (
                <>
                    {/* Damage Found */}
                    <label className="flex items-center space-x-2 mb-2">
                        <input
                            type="checkbox"
                            checked={damageFound}
                            onChange={(e) => setDamageFound(e.target.checked)}
                        />
                        <span className="text-xs">Damage Found</span>
                    </label>

                    {/* Damage Notes */}
                    <label className="block text-xs font-medium mb-1">Damage Notes</label>
                    <textarea
                        value={damageNotes}
                        onChange={(e) => setDamageNotes(e.target.value)}
                        placeholder="Notes about damages"
                        className="border w-full p-2 rounded mb-2"
                    />

                    {/* Conditions */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-medium mb-1">Walls</label>
                            <input
                                type="text"
                                value={wallsCondition}
                                onChange={(e) => setWallsCondition(e.target.value)}
                                placeholder="Walls condition"
                                className="border w-full p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Flooring</label>
                            <input
                                type="text"
                                value={flooringCondition}
                                onChange={(e) => setFlooringCondition(e.target.value)}
                                placeholder="Flooring condition"
                                className="border w-full p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Electrical</label>
                            <input
                                type="text"
                                value={electricalCondition}
                                onChange={(e) => setElectricalCondition(e.target.value)}
                                placeholder="Electrical condition"
                                className="border w-full p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Plumbing</label>
                            <input
                                type="text"
                                value={plumbingCondition}
                                onChange={(e) => setPlumbingCondition(e.target.value)}
                                placeholder="Plumbing condition"
                                className="border w-full p-2 rounded"
                            />
                        </div>
                    </div>
                </>
            )}
        </ActionDialog>
    );
}