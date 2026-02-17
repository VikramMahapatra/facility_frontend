import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/app-toast";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";

type MoveInModalProps = {
    open: boolean;
    owners: any[];
    tenants: any[];
    onClose: () => void;
    spaceId: string;
    onSuccess: () => void;
};

type OccupantType = "owner" | "tenant";

export default function MoveInModal({
    open,
    owners,
    tenants,
    onClose,
    spaceId,
    onSuccess,
}: MoveInModalProps) {
    const [occupantType, setOccupantType] = useState<OccupantType>("tenant");
    const [leases, setLeases] = useState<any[]>([]);

    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedLeaseId, setSelectedLeaseId] = useState<string>("");
    const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
    const [moveInAt, setMoveInAt] = useState<string>("");

    /* ---------------- Fetch Data ---------------- */

    useEffect(() => {
        if (!open) return;

        setSelectedUserId("");
        setSelectedLeaseId("");
        setMoveInAt(new Date().toISOString().slice(0, 16));

    }, [open, occupantType, spaceId]);

    /* ---------------- Submit ---------------- */

    const handleSubmit = async () => {
        if (!selectedUserId) {
            toast.error("Please select a user");
            return;
        }

        if (occupantType === "tenant" && !selectedLeaseId) {
            toast.error("Please select a lease");
            return;
        }

        const payload: any = {
            occupant_type: occupantType,
            occupant_user_id: selectedUserId,
            move_in_date: moveInAt,
            space_id: spaceId
        };

        if (occupantType === "tenant") {
            payload.tenant_id = selectedTenantId; // ✅ ADD
            payload.lease_id = selectedLeaseId;
        }

        const res = await occupancyApiService.moveIn(payload);
        if (res.success) {
            toast.success("Move-in successful");
            onSuccess();
            onClose();
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Move In</DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Occupant Type */}
                    <div>
                        <Label>Who is moving in?</Label>
                        <RadioGroup
                            value={occupantType}
                            onValueChange={(v) => setOccupantType(v as OccupantType)}
                            className="flex gap-6 mt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="tenant" id="tenant" />
                                <Label htmlFor="tenant">Tenant</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="owner" id="owner" />
                                <Label htmlFor="owner">Owner</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* User Selection */}
                    <div>
                        <Label>{occupantType === "owner" ? "Owner" : "Tenant"}</Label>
                        <Select value={selectedUserId}
                            onValueChange={(value) => {
                                setSelectedUserId(value);
                                if (occupantType === "tenant") {
                                    const tenant = tenants.find(t => t.user_id === value);
                                    setSelectedTenantId(tenant?.tenant_id ?? null);
                                }
                            }}>
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${occupantType}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {(occupantType === "owner" ? owners : tenants).map(u => (
                                    <SelectItem key={u.user_id} value={u.user_id}>
                                        {u.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lease (Tenant only) */}
                    {occupantType === "tenant" && (
                        <div>
                            <Label>Lease</Label>
                            <Select value={selectedLeaseId} onValueChange={setSelectedLeaseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select lease" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenants.map(l => (
                                        <SelectItem key={l.lease_id} value={l.lease_id}>
                                            {l.lease_no}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Move-in Date */}
                    <div>
                        <Label>Move-in Date</Label>
                        <Input
                            type="datetime-local"
                            value={moveInAt}
                            onChange={e => setMoveInAt(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            Confirm Move In
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
