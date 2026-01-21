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
import { useState } from "react";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { toast } from "sonner";

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
    const [buildingList, setBuildingList] = useState<Record<string, any[]>>({});
    const [spaceList, setSpaceList] = useState<Record<string, any[]>>({});

    const isReadOnly = mode === "view";

    const tenantSpaces = watch("tenant_spaces") || [];

    // Helper functions for managing multiple user spaces
    const addUserSpaceEntry = () => {
        const currentSpaces = getValues("tenant_spaces") || [];
        const newEntry = {
            site_id: "",
            building_block_id: "",
            space_id: "",
        };
        setValue("tenant_spaces", [...currentSpaces, newEntry], {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const removeUserSpaceEntry = (index: number) => {
        const currentSpaces = getValues("tenant_spaces") || [];
        const remaining = currentSpaces.filter((_, i) => i !== index);
        const ensured =
            remaining.length === 0
                ? [
                    {
                        site_id: "",
                        building_block_id: "",
                        space_id: "",
                    },
                ]
                : remaining;
        setValue("tenant_spaces", ensured, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const updateUserSpaceEntry = (
        index: number,
        field: "site_id" | "building_block_id" | "space_id",
        value: string
    ) => {
        const currentSpaces = getValues("tenant_spaces") || [];
        const updated = [...currentSpaces];
        updated[index] = { ...updated[index], [field]: value };

        // Reset building and space when site changes
        if (field === "site_id") {
            updated[index].building_block_id = "";
            updated[index].space_id = "";
            if (value) {
                loadBuildingLookup(value);
                loadSpaceLookup(value);
            }
        }
        // Reset space when building changes
        if (field === "building_block_id") {
            updated[index].space_id = "";
            if (updated[index].site_id) {
                loadSpaceLookup(updated[index].site_id, value || undefined);
            }
        }

        // Check for duplicate space entries
        if (field === "space_id" && value && updated[index].site_id) {
            const currentEntry = updated[index];
            const duplicateIndex = updated.findIndex(
                (space: any, i: number) =>
                    i !== index &&
                    space.site_id &&
                    space.space_id &&
                    space.site_id === currentEntry.site_id &&
                    (space.building_block_id || "") ===
                    (currentEntry.building_block_id || "") &&
                    space.space_id === value
            );

            if (duplicateIndex !== -1) {
                toast.error(
                    "This space is already added. Please select a different space."
                );
                updated[index] = { ...currentSpaces[index] };
                setValue("tenant_spaces", updated, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                return;
            }
        }

        setValue("tenant_spaces", updated, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const loadBuildingLookup = async (siteId: string) => {
        if (siteId && !buildingList[siteId]) {
            const lookup = await buildingApiService.getBuildingLookup(siteId);
            if (lookup.success) {
                setBuildingList((prev) => ({
                    ...prev,
                    [siteId]: lookup.data || [],
                }));
            }
        }
    };

    const loadSpaceLookup = async (siteId: string, buildingId?: string) => {
        if (siteId) {
            const key = buildingId ? `${siteId}_${buildingId}` : siteId;
            if (!spaceList[key]) {
                const lookup = await spacesApiService.getSpaceLookup(
                    siteId,
                    buildingId
                );
                if (lookup.success) {
                    setSpaceList((prev) => ({
                        ...prev,
                        [key]: lookup.data?.spaces || lookup.data || [],
                    }));
                }
            }
        }
    };


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
                                value={field.value || "residential"}
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
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="tenant_spaces">Space(s)</Label>
                    {!isReadOnly && (
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={addUserSpaceEntry}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Space
                        </Button>
                    )}
                </div>

                {/* Space Cards */}
                <div className="space-y-4">
                    {tenantSpaces.map((space: any, index: number) => (
                        <Card key={index} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Space #{index + 1}
                                    </CardTitle>
                                    {!isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeUserSpaceEntry(index)}
                                            disabled={tenantSpaces.length === 1}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Site */}
                                    <div className="space-y-2">
                                        <Label>Site *</Label>
                                        <Controller
                                            name={`tenant_spaces.${index}.site_id` as any}
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <div className="space-y-4">
                                                    <Label htmlFor="site_id">Site *</Label>
                                                    <AsyncAutocompleteRQ
                                                        value={field.value}
                                                        onChange={(value) => {
                                                            updateUserSpaceEntry(
                                                                index,
                                                                "site_id",
                                                                value
                                                            );
                                                        }}
                                                        placeholder="Select site"
                                                        disabled={isReadOnly}
                                                        queryKey={["sites"]}
                                                        queryFn={async (search) => {
                                                            const res = await siteApiService.getSiteLookup(search);
                                                            return res.data.map((s) => ({
                                                                id: s.id,
                                                                label: s.name,
                                                            }));
                                                        }}
                                                        fallbackOption={
                                                            space?.site_id
                                                                ? {
                                                                    id: space.site_id,
                                                                    label: space.site_name || "Selected Site",
                                                                }
                                                                : undefined
                                                        }
                                                        minSearchLength={1}
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

                                    {/* Building */}
                                    <div className="space-y-2">
                                        <Label>Building</Label>
                                        <Controller
                                            name={
                                                `tenant_spaces.${index}.building_block_id` as any
                                            }
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value ? field.value : "none"}
                                                    onValueChange={(v) => {
                                                        updateUserSpaceEntry(
                                                            index,
                                                            "building_block_id",
                                                            v === "none" ? "" : v
                                                        );
                                                    }}
                                                    disabled={isReadOnly || !space?.site_id}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={
                                                                space?.site_id
                                                                    ? "Select building"
                                                                    : "Select site first"
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Select building
                                                        </SelectItem>
                                                        {(
                                                            buildingList[space?.site_id || ""] || []
                                                        ).map((building) => (
                                                            <SelectItem
                                                                key={building.id}
                                                                value={building.id}
                                                            >
                                                                {building.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    {/* Space */}
                                    <div className="space-y-2">
                                        <Label>Space *</Label>
                                        <Controller
                                            name={`tenant_spaces.${index}.space_id` as any}
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <>
                                                    <Select
                                                        value={field.value || ""}
                                                        onValueChange={(value) => {
                                                            updateUserSpaceEntry(
                                                                index,
                                                                "space_id",
                                                                value
                                                            );
                                                        }}
                                                        disabled={isReadOnly || !space?.site_id}
                                                    >
                                                        <SelectTrigger
                                                            className={
                                                                fieldState.error &&
                                                                    (fieldState.isTouched || isSubmitted)
                                                                    ? "border-red-500"
                                                                    : ""
                                                            }
                                                        >
                                                            <SelectValue
                                                                placeholder={
                                                                    !space?.site_id
                                                                        ? "Select site first"
                                                                        : "Select space"
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(() => {
                                                                const siteId = space?.site_id || "";
                                                                const buildingId =
                                                                    space?.building_block_id || "";
                                                                const key = buildingId
                                                                    ? `${siteId}_${buildingId}`
                                                                    : siteId;
                                                                return (spaceList[key] || []).map(
                                                                    (sp) => (
                                                                        <SelectItem
                                                                            key={sp.id}
                                                                            value={sp.id}
                                                                        >
                                                                            {sp.name || sp.code}
                                                                        </SelectItem>
                                                                    )
                                                                );
                                                            })()}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && (
                                                        <p className="text-sm text-red-500">
                                                            {fieldState.error.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    )
}

