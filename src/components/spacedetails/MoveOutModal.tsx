import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/app-toast";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";

type Props = {
    open: boolean;
    onClose: () => void;
    spaceId: string;
    onSuccess: () => void;
};


export default function MoveOutModal({
    open,
    onClose,
    spaceId,
    onSuccess,
}: Props) {

    const [form, setForm] = useState({
        keys_returned: false,
        accessories_returned: false,
        damage_checked: false,
        remarks: ""
    });

    const confirmMoveOut = async () => {

        const payload = {
            space_id: spaceId,
            ...form
        };

        const res = await occupancyApiService.moveOut(payload);

        if (res.success) {
            toast.success("Space vacated successfully");
            onSuccess();
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirm Move-Out
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    This will mark the space as vacant and end the current occupancy.
                </p>

                <div className="space-y-3">

                    <label className="flex gap-2">
                        <input
                            type="checkbox"
                            checked={form.keys_returned}
                            onChange={e => setForm({ ...form, keys_returned: e.target.checked })}
                        />
                        Keys Returned
                    </label>

                    <label className="flex gap-2">
                        <input
                            type="checkbox"
                            checked={form.accessories_returned}
                            onChange={e => setForm({ ...form, accessories_returned: e.target.checked })}
                        />
                        Accessories Returned
                    </label>

                    <label className="flex gap-2">
                        <input
                            type="checkbox"
                            checked={form.damage_checked}
                            onChange={e => setForm({ ...form, damage_checked: e.target.checked })}
                        />
                        Damage Checked
                    </label>

                    <Textarea
                        placeholder="Remarks"
                        value={form.remarks}
                        onChange={e => setForm({ ...form, remarks: e.target.value })}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmMoveOut}>
                        Confirm Move-Out
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
