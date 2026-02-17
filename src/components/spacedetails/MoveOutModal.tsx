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
    const confirmMoveOut = async () => {
        const res = await occupancyApiService.moveOut(spaceId);
        if (res.success) {
            toast.success("Space is now vacant");
            onSuccess();
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirm Move-Out
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    This will mark the space as vacant and end the current occupancy.
                </p>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmMoveOut}>
                        Move Out
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
