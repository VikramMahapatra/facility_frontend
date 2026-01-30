import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, } from "@/components/ui/card";
import { Users, LogIn, LogOut, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "@/helpers/dateHelpers";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";
import MoveInModal from "./MoveInModal";
import MoveOutModal from "./MoveOutModal";

interface OccupancyRecord {
    status: "vacant" | "occupied";
    occupant_type?: string;
    occupant_name?: string;
    move_in_date?: string;
    reference_no?: string;
}

interface HistoryRecord {
    id: string;
    occupant_type: string;
    occupant_name: string;
    move_in_date: string;
    move_out_date?: string;
}

interface Props {
    spaceId: string;
    owners: any[];
    tenants: any[];
}

export default function OccupancyTab({ spaceId, owners, tenants }: Props) {
    const [occupancy, setOccupancy] = useState<OccupancyRecord>({ status: "vacant" });
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMoveInOpen, setIsMoveInOpen] = useState(false);
    const [isMoveOutOpen, setIsMoveOutOpen] = useState(false);


    const fetchOccupancy = async () => {
        setLoading(true);
        const res = await occupancyApiService.getSpaceOccupancy(spaceId);
        if (res?.success) {
            setOccupancy(res.data.current || { status: "vacant" });
            setHistory(res.data.history || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOccupancy();
    }, [spaceId]);


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
                            {occupancy.status === "vacant" && (
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
                        <History className="h-5 w-5" /> Occupancy History
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {history.length === 0 && (
                        <p className="text-sm text-muted-foreground">No history</p>
                    )}
                    {history.map((h) => (
                        <div key={h.id} className="border rounded p-3 text-sm">
                            <div className="font-medium">{h.occupant_name}</div>
                            <div className="text-muted-foreground">
                                {h.occupant_type} • {formatDate(h.move_in_date)} →{" "}
                                {h.move_out_date ? formatDate(h.move_out_date) : "Present"}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <MoveInModal
                open={isMoveInOpen}
                owners={owners}
                tenants={tenants}
                onClose={() => setIsMoveInOpen(false)}
                spaceId={spaceId}
                onSuccess={() => {
                    fetchOccupancy();   // refresh current occupancy
                }}
            />
            <MoveOutModal
                open={isMoveOutOpen}
                onClose={() => setIsMoveOutOpen(false)}
                spaceId={spaceId}
                onSuccess={() => {
                    fetchOccupancy();   // refresh current occupancy
                }}
            />
        </div>
    );
}
