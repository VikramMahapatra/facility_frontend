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
            <div className="grid grid-cols-3 gap-4">
                <Controller
                    name="tenant_type"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label htmlFor="tenant_type">Tenant Type *</Label>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger
                                    className={
                                        fieldState.error ? "border-red-500" : ""
                                    }
                                >
                                    <SelectValue placeholder="Select tenant type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="residential">
                                        Residential
                                    </SelectItem>
                                    <SelectItem value="commercial">
                                        Commercial
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.error && (
                                <p className="text-sm text-red-500">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </div>
                    )}
                />
            </div>
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

