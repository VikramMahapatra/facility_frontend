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
import { useEffect } from "react";

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
    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            account_type: account?.account_type as any ?? "organization",
            status: account?.status ?? "inactive",
            role_ids: account?.roles.map((r) => r.id) ?? [],
            tenant_spaces: account?.tenant_spaces ?? [],
            site_ids: account?.site_ids ?? [],
        },
    });

    // Reset form when modal opens or account changes
    useEffect(() => {
        if (open) {
            form.reset({
                account_type: account?.account_type as any ?? "",
                status: account?.status ?? "active",
                role_ids: account?.roles?.map((r: any) => r.id) ?? [],
                tenant_spaces: account?.tenant_spaces ?? [],
                site_ids: account?.site_ids ?? [],
            });
        }
    }, [open, account]);

    const getTitle = () => {
        if (mode === "create") return "Add Account";
        if (mode === "edit") return "Edit Account";
        return "Account Details";
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
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
