import { AccountFormValues } from "@/schemas/account.schema";
import { UseFormReturn, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SpacesForm } from "./SpaceForm";

type Mode = 'create' | 'edit' | 'view';

interface Props {
    form: UseFormReturn<AccountFormValues>;
    mode: Mode
};

export default function TenantSpacesForm({
    form,
    mode
}: Props) {
    const {
        control,
        register,
        watch,
        setValue,
        getValues,
        formState: { errors, isSubmitting: formIsSubmitting, isValid, isSubmitted },
    } = form;
    const isReadOnly = mode === "view"

    return (
        <>
            <SpacesForm
                form={form}
                name="tenant_spaces"
                mode={mode}
                isRowReadOnly={(space) => {
                    if (space?.id && space?.status === "leased") return true;
                    if (space?.status === "approved" || space?.status === "ended") return true;
                    return false;
                }}
            />

        </>
    )
}

