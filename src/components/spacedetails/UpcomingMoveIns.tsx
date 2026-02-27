import { formatDate } from "@/helpers/dateHelpers";
import { Info } from "../common/InfoLabel";

function Badge({ text }) {
    return (
        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
            {text}
        </span>
    );
}

export function UpcomingMoveIns({ upcoming }) {
    if (!upcoming || upcoming.length === 0) {
        return (
            <div className="text-sm text-muted-foreground py-6 text-center">
                No upcoming move-ins scheduled
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {upcoming.map((u, index) => (
                <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-sm transition"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="font-semibold">{u.occupant_name}</p>
                            <p className="text-xs text-muted-foreground">
                                {u.occupant_type}
                            </p>
                        </div>

                        <Badge text="Scheduled" />
                    </div>

                    <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-4 text-sm">
                        <Info label="Move-In Date" value={formatDate(u.move_in_date)} />
                        <Info label="Move-Out Date" value={formatDate(u.move_out_date)} />
                        <Info label="Time Slot" value={u.time_slot || "-"} />
                        <Info label="Heavy Items" value={u.heavy_items ? "Yes" : "No"} />
                        <Info label="Reference" value={u.reference_no || "-"} />
                    </div>
                </div>
            ))}
        </div>
    );
}