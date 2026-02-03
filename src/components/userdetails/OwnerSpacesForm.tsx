import { AccountFormValues } from "@/schemas/account.schema";
import { UseFormReturn } from "react-hook-form";
import { SpacesForm } from "./SpaceForm";

type Mode = 'create' | 'edit' | 'view';

interface Props {
    form: UseFormReturn<AccountFormValues>;
    mode: Mode
};

export default function OwnerSpacesForm({
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

    return (
        <>
            <SpacesForm
                form={form}
                name="owner_spaces"
                mode={mode}
                isRowReadOnly={(space) => {
                    if (space?.id && space?.status === "approved") return true;
                    return false;
                }}
            />
        </>
    )
}

