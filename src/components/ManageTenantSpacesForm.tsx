import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AccountFormValues } from "@/schemas/account.schema";
import { Tenant } from "@/interfaces/leasing_tenants_interface";
import { SpacesForm } from "./userdetails/SpaceForm";

type Mode = 'create' | 'edit' | 'view';

interface Props {
    spacesOpen: boolean;
    onClose: () => void;
    tenant?: Tenant | null;
    onSubmit: (data: AccountFormValues) => Promise<void>
}

export function ManageTenantSpacesForm({
    spacesOpen,
    onClose,
    onSubmit,
    tenant,
}: Props) {


    const initialValues: AccountFormValues = {
        account_type: "tenant",
        tenant_type: tenant?.kind ?? "residential",
        tenant_spaces: tenant?.tenant_spaces ?? [],
    };

    const form = useForm<AccountFormValues>({
        defaultValues: initialValues,
        mode: "onChange",
    });

    const { handleSubmit, formState: { isSubmitting } } = form;

    useEffect(() => {
        if (spacesOpen) {
            form.reset(initialValues);
        }
    }, [spacesOpen, tenant]); // tenant included on purpose

    const onSubmitForm = async (data: AccountFormValues) => {
        await onSubmit(data);
    };

    const handleClose = () => {
        form.reset(initialValues); // 🔥 discard unsaved edits
        onClose();
    };

    return (
        <Dialog
            open={spacesOpen}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            <DialogContent className="max-w-[900px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Spaces</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmitForm)}>
                    <div className="overflow-y-auto flex-1 pr-2 -mr-2">
                        <SpacesForm
                            form={form}
                            name="tenant_spaces"
                            mode="edit"
                            isRowReadOnly={(space) => space?.status === "leased"}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}