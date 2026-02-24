import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import { CalendarClock } from "lucide-react";

interface AlertDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
}


export default function InspectionScheduledAlertDialog({
    open,
    onClose,
    title,
    message,
}: AlertDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogPortal>
                <AlertDialogContent className="z-[1000] max-w-md">
                    <AlertDialogHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg">
                                <CalendarClock size={20} />
                            </div>

                            <AlertDialogTitle className="text-lg font-semibold">
                                {title}
                            </AlertDialogTitle>
                        </div>

                        <AlertDialogDescription className="text-sm text-muted-foreground">
                            {message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Got it
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialog>
    );
}