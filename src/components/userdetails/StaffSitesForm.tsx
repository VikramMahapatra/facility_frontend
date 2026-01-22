import { AccountFormValues } from "@/schemas/account.schema";
import { UseFormReturn, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "../ui/input";

type Mode = 'create' | 'edit' | 'view';

interface Props {
    form: UseFormReturn<AccountFormValues>;
    mode: Mode;
    siteList: any[];
};

export default function StaffSitesForm({
    form,
    mode,
    siteList
}: Props) {
    const {
        control,
        watch,
        setValue,
        getValues,
        register,
        formState: { errors, isSubmitting: formIsSubmitting, isValid, isSubmitted },
    } = form;


    const selectedSiteIds = watch("site_ids") || [];
    const siteIdsError = form.getFieldState("site_ids").error;
    return (
        <>
            <div className="grid grid-cols-3 gap-4">
                <Controller
                    name="staff_role"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            <Label htmlFor="staff_role">Staff Role *</Label>
                            <Input
                                id="model"
                                {...register("staff_role")}
                                placeholder="e.g., Technician"
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-500">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </div>
                    )}
                />
            </div>
            <div className="space-y-4">
                <Controller
                    name="site_ids"
                    control={control}
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label>Select Sites *</Label>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 border rounded-md p-4 max-h-[180px] overflow-y-auto">
                                {siteList.map((site: any) => {
                                    const isChecked = selectedSiteIds.includes(site.id);
                                    return (
                                        <div
                                            key={site.id}
                                            className="flex items-center space-x-3"
                                        >
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                    const currentValues = field.value || [];
                                                    if (checked) {
                                                        field.onChange([...currentValues, site.id]);
                                                    } else {
                                                        field.onChange(
                                                            currentValues.filter(
                                                                (value) => value !== site.id
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                            <div className="space-y-0">
                                                <Label className="font-medium cursor-pointer">
                                                    {site.name}
                                                </Label>
                                                {site.code && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {site.code}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {siteIdsError && (
                                <p className="text-sm text-red-500">
                                    {siteIdsError.message}
                                </p>
                            )}
                        </div>
                    )}
                />
            </div>
        </>
    )
}

