import { AccountFormValues } from "@/schemas/account.schema";
import { UseFormReturn, Controller } from "react-hook-form";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { AsyncAutocompleteRQ } from "../common/async-autocomplete-rq";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { useEffect, useState } from "react";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { toast } from "sonner";

type Mode = 'create' | 'edit' | 'view';

interface Props {
    form: UseFormReturn<AccountFormValues>;
    mode: Mode
};

export default function StaffSitesForm({
    form,
    mode
}: Props) {
    const {
        control,
        watch,
        setValue,
        getValues,
        formState: { errors, isSubmitting: formIsSubmitting, isValid, isSubmitted },
    } = form;
    const [siteList, setSiteList] = useState<any[]>([]);
    const isReadOnly = mode === "view";

    useEffect(() => {
        const loadSites = async () => {
            const res = await siteApiService.getSiteLookup();
            if (res.success) setSiteList(res.data || []);
        };
        loadSites();
    }, []);

    const loadSiteLookup = async () => {
        const lookup = await siteApiService.getSiteLookup();
        if (lookup.success) setSiteList(lookup.data || []);
    };

    const selectedSiteIds = watch("site_ids") || [];
    const siteIdsError = form.getFieldState("site_ids").error;
    return (
        <>
            <div className="space-y-4">
                <Controller
                    name="site_ids"
                    control={control}
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label>Select Sites *</Label>
                            <div className="space-y-2 border rounded-md p-4 max-h-[180px] overflow-y-auto">
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
                                                disabled={isReadOnly}
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

