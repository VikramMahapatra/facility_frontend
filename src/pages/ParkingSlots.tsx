import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { parkingSlotApiService } from "@/services/parking_access/parkingslotsapi";

import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function ParkingSlots() {

    const [slots, setSlots] = useState<any[]>([]);
    const [searchParams] = useSearchParams();
    const zoneId = searchParams.get("zone");

    useEffect(() => {
        loadSlots();
    }, [zoneId]);

    const loadSlots = async () => {

        if (!zoneId) return;

        const res = await parkingSlotApiService.getParkingSlots(zoneId);

        if (res.success) {
            setSlots(res.data || []);
        }
    };

    return (

        <div className="space-y-6">

            <div className="flex justify-between items-center">

                <div>
                    <h2 className="text-3xl font-bold">Parking Slots</h2>
                    <p className="text-muted-foreground">
                        Manage physical parking slots
                    </p>
                </div>

                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slot
                </Button>

            </div>

            <div className="rounded-md border">

                <Table>

                    <TableHeader>
                        <TableRow>
                            <TableHead>Slot No</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned Space</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>

                        {slots.map((slot) => (

                            <TableRow key={slot.id}>

                                <TableCell className="font-medium">
                                    {slot.slot_no}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline">
                                        {slot.status}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {slot.space_name || "-"}
                                </TableCell>

                                <TableCell className="text-right">

                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>

                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </div>

        </div>
    );
}
