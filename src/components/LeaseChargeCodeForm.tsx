import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


export interface LeaseChargeCode {
    id?: string;
    code: string;
}

interface LeaseChargeCodeFormProps {
    leaseChargeCode?: LeaseChargeCode;
    isOpen: boolean;
    onClose: () => void;
    onSave: (leaseChargeCode: Partial<LeaseChargeCode>) => Promise<any>;
    mode: "create" | "edit" | "view";
}


const emptyFormData: LeaseChargeCode = {
    code: "",
}

export function LeaseChargeCodeForm({ leaseChargeCode, isOpen, onClose, onSave, mode }: LeaseChargeCodeFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LeaseChargeCode>({
        resolver: zodResolver(z.object({
            code: z.string().min(1, "Code is required"),
        })),
    });

    useEffect(() => {
        if(leaseChargeCode && mode !== "create") {
            reset({
                code: leaseChargeCode.code,
            });
        } else {
            reset(emptyFormData);
        }
    }, [leaseChargeCode, mode, reset, isOpen]);

    const onSubmitForm = async (data: LeaseChargeCode) => {
        const formResponse = await onSave({
            ...leaseChargeCode,
            ...data,
        });
        if (formResponse.success) {
            reset(emptyFormData);
            onClose();
        } else {
            reset(undefined, { keepErrors: true, keepValues: true });
        }
    }

    const isReadOnly = mode === "view";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Create Lease Charge Code" : mode === "edit" ? "Edit Lease Charge Code" : "View Lease Charge Code"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Code *</Label>
                        <Input id="code" {...register("code")} disabled={isReadOnly} placeholder="Enter code" className={errors.code ? "border-red-500" : ""} />
                    </div>
                    {errors.code && (
                        <p className="text-sm text-red-500">{errors.code.message}</p>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            {mode === "view" ? "Close" : "Cancel"}
                        </Button>
                        {mode !== "view" && (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

}