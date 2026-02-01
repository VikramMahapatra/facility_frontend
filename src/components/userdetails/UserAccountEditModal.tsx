import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AccountForm from "./AccountForm";
import { AccountFormValues, accountSchema } from "@/schemas/account.schema";
import { UserAccount } from "@/interfaces/user_interface";
import { useEffect, useState } from "react";



type Mode = 'create' | 'edit' | 'view';

interface Props {
    open: boolean;
    onClose: () => void;
    account?: UserAccount | null;
    onSubmit: (data: AccountFormValues) => Promise<void>;
    mode: Mode
}

export default function AccountEditModal({
    open,
    onClose,
    account,
    onSubmit,
    mode
}: Props) {


    function getAccountDefaultValues(
        account?: any
    ): Partial<AccountFormValues> {
        if (account) {
            // EDIT MODE
            return {
                account_type: account.account_type,
                status: account.status,
                role_ids: account.roles?.map((r: any) => r.id) ?? [],
                tenant_type: account.tenant_type ?? "residential",
                tenant_spaces: account.tenant_spaces ?? [],
                owner_spaces: account.owner_spaces ?? [],
                site_ids: account.site_ids ?? [],
                staff_role: account.staff_role ?? ""
            };
        }

        // CREATE MODE (SAFE DEFAULT)
        return {
            account_type: "organization",        // ✅ must be valid union member
            status: "active",
            role_ids: []
        };
    }


    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: getAccountDefaultValues(account),
    });

    // Reset form when modal opens or account changes
    useEffect(() => {
        if (open) {
            form.reset(getAccountDefaultValues(account));

        }
    }, [open, account, form]);

    const getTitle = () => {
        if (mode === "create") return "Add Account";
        if (mode === "edit") return "Edit Account";
        return "Account Details";
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                </DialogHeader>

                <AccountForm
                    form={form}
                    onCancel={onClose}
                    onSubmit={form.handleSubmit(onSubmit)}
                    mode={mode}
                />
            </DialogContent>
        </Dialog>
    );
}
