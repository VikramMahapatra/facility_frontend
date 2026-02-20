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
import { Label } from "../ui/label";
import { Input } from "../ui/input";

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

    const [moveOutAt, setMoveoutAt] = useState<string>("");

    const confirmMoveOut = async () => {

        const payload: any = {
            move_out_date: moveOutAt,
            space_id: spaceId
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

                    <div>
                        <Label>Move-out Date</Label>
                        <Input
                            type="datetime-local"
                            value={moveOutAt}
                            onChange={e => setMoveoutAt(e.target.value)}
                        />
                    </div>
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
