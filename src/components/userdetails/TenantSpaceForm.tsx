import { AccountFormValues } from "@/schemas/account.schema";
import { UseFormReturn, Controller, useFieldArray, useWatch } from "react-hook-form";
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
import { Badge } from "../ui/badge";
import { getSpaceOwnershipStatusColor } from "@/interfaces/spaces_interfaces";
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
    const [buildingList, setBuildingList] = useState<Record<string, any[]>>({});
    const [spaceList, setSpaceList] = useState<Record<string, any[]>>({});
    const [fallbackSpaces, setFallbackSpaces] = useState<Record<number, any>>({});
    const isReadOnly = mode === "view"

    const { fields, append, remove } = useFieldArray({
        control,
        name: "tenant_spaces",
    });
    const tenantSpaces = useWatch({
        control,
        name: "tenant_spaces",
        defaultValue: [],
    });

    const loadAll = async () => {
        if (mode === "create") {
            setBuildingList({});
            setSpaceList({});
        }

        // Preload building and space lists for existing tenant spaces (edit mode)
        if (tenantSpaces && mode !== "create") {
            const spaces = tenantSpaces;
            if (Array.isArray(tenantSpaces) && spaces.length > 0) {
                const loadPromises = spaces.map(async (space: any) => {
                    if (space.site_id) {
                        await loadBuildingLookup(space.site_id);
                        if (space.building_block_id) {
                            await loadSpaceLookup(space.site_id, space.building_block_id);
                        } else {
                            await loadSpaceLookup(space.site_id);
                        }
                    }
                });
                await Promise.all(loadPromises);
            }
        }
    }

    useEffect(() => {
        loadAll();

        tenantSpaces.forEach((space, index) => {
            if (space.space_id && space.space_name) {
                setFallbackSpaces((prev) => ({
                    ...prev,
                    [index]: {
                        id: space.space_id,
                        name: space.space_name,
                    },
                }));
            }
        });
    }, [form]);

    // Helper functions for managing multiple user spaces
    const addUserSpaceEntry = () => {
        const currentSpaces = getValues("tenant_spaces") || [];
        const newEntry = {
            site_id: undefined,
            building_block_id: undefined,
            space_id: undefined,
            status: "pending"
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
        field: "site_id" | "site_name" | "building_block_id" | "space_id",
        value: string,
        label?: string // optional: pass label if available
    ) => {
        const currentSpaces = getValues("tenant_spaces") || [];
        const updated = [...currentSpaces];

        updated[index] = { ...updated[index], [field]: value };

        // if we got a label, update it immediately
        if (field === "site_id" && label) {
            updated[index].site_name = label;
        }

        // reset dependent fields
        if (field === "site_id") {
            updated[index].building_block_id = "";
            updated[index].space_id = "";
            if (value) {
                loadBuildingLookup(value);
                loadSpaceLookup(value);
            }
        }

        if (field === "building_block_id") {
            updated[index].space_id = "";
            if (updated[index].site_id) {
                loadSpaceLookup(updated[index].site_id, value || undefined);
            }
        }

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


        // only delete fallback if really needed
        setFallbackSpaces((prev) => {
            const copy = { ...prev };
            // maybe keep fallback until space_id is selected
            // delete copy[index];
            return copy;
        });

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

    useEffect(() => {
        if (tenantSpaces.length === 0) {
            append({
                site_id: "",
                building_block_id: "",
                space_id: "",
                status: "pending",
            });
        }
    }, [tenantSpaces.length, append]);

    const isRowReadOnly = (space: any) => {
        // Rows with an existing ID are saved → readonly
        // OR rows with status approved/ended → readonly
        if (space?.id) return true;
        if (space?.status === "approved" || space?.status === "ended") return true;
        return false; // new row → editable
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

