import {
    Controller,
    useFieldArray,
    useWatch,
    UseFormReturn,
    FieldValues,
    ArrayPath,
    Path,
    PathValue,
} from "react-hook-form";
import { useEffect, useState } from "react";
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { AsyncAutocompleteRQ } from "@/components/common/async-autocomplete-rq";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";

interface SpacesFormProps<TForm extends FieldValues> {
    form: UseFormReturn<TForm>;
    name: ArrayPath<TForm>;
    mode: "create" | "edit" | "view";
    isRowReadOnly: (space: any) => boolean;
}

export function SpacesForm<TForm extends FieldValues>({
    form,
    name,
    mode,
    isRowReadOnly,
}: SpacesFormProps<TForm>) {
    const { control, setValue } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const spaces = useWatch({
        control,
        name: name as unknown as Path<TForm>,
    }) ?? [];

    const [buildingList, setBuildingList] = useState<Record<string, any[]>>({});
    const [spaceList, setSpaceList] = useState<Record<string, any[]>>({});

    /* ----------------------------- helpers ----------------------------- */
    type SpaceField =
        | "site_id"
        | "site_name"
        | "building_block_id"
        | "space_id"
        | "status";

    const setField = (
        index: number,
        field: SpaceField,
        value: string
    ) => {
        setValue(
            `${name}.${index}.${field}` as Path<TForm>,
            value as PathValue<TForm, Path<TForm>>,
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        );
    };

    const addSpace = () => {
        append({
            site_id: "",
            site_name: "",
            building_block_id: "",
            space_id: "",
            status: "pending",
        } as any);
    };

    const removeSpaceRow = (index: number) => {
        if (spaces.length > 1) remove(index);
    };

    /* --------------------------- loaders --------------------------- */

    const loadBuildings = async (siteId: string) => {
        if (buildingList[siteId]) return;
        const res = await buildingApiService.getBuildingLookup(siteId);
        if (res.success) {
            setBuildingList((p) => ({ ...p, [siteId]: res.data || [] }));
        }
    };

    const loadSpaces = async (siteId: string, buildingId: string) => {
        const key = `${siteId}_${buildingId}`;
        if (spaceList[key]) return;
        const res = await spacesApiService.getSpaceLookup(siteId, buildingId);
        if (res.success) {
            setSpaceList((p) => ({
                ...p,
                [key]: res.data?.spaces || res.data || [],
            }));
        }
    };

    /* ------------------------- preload edit ------------------------- */

    useEffect(() => {
        if (mode !== "create") {
            spaces.forEach((sp: any) => {
                if (sp.site_id) loadBuildings(sp.site_id);
                if (sp.site_id && sp.building_block_id) {
                    loadSpaces(sp.site_id, sp.building_block_id);
                }
            });
        }
    }, [mode]);

    /* ------------------------------ UI ------------------------------ */

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Spaces</Label>
                <Button type="button" size="sm" onClick={addSpace}>
                    <Plus className="mr-2 h-4 w-4" /> Add Space
                </Button>
            </div>
            {fields.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                        <div className="text-sm text-muted-foreground">
                            No spaces added yet.
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Click <b>Add Space</b> to assign a site, building, and space.
                        </div>

                        {mode !== "view" && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={addSpace}
                                className="mt-2"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Space
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
            {fields.map((f, index) => {
                const space = spaces[index];
                const siteId = space?.site_id;
                const buildingId = space?.building_block_id;
                const spaceKey =
                    siteId && buildingId ? `${siteId}_${buildingId}` : "";

                return (
                    <Card key={f.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    Space #{index + 1}
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={isRowReadOnly(space) || spaces.length === 1}
                                    onClick={() => removeSpaceRow(index)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="grid grid-cols-3 gap-4">
                            {/* ---------------- Site ---------------- */}
                            <Controller
                                name={`${name}.${index}.site_id` as any}
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label>Site *</Label>
                                        <AsyncAutocompleteRQ
                                            value={field.value}
                                            disabled={isRowReadOnly(space)}
                                            queryKey={["sites"]}
                                            queryFn={async (search) => {
                                                const res =
                                                    await siteApiService.getSiteLookup(search);
                                                return res.data.map((s: any) => ({
                                                    id: s.id,
                                                    label: s.name,
                                                }));
                                            }}
                                            fallbackOption={
                                                space?.site_id
                                                    ? { id: space.site_id, label: space.site_name || "" }
                                                    : undefined
                                            }
                                            onChange={(val: string, option?: any) => {
                                                field.onChange(val);
                                                setField(index, "site_id", val);
                                                setField(index, "site_name", option?.label || "");
                                                setField(index, "building_block_id", "");
                                                setField(index, "space_id", "");
                                                if (val) loadBuildings(val);
                                            }}
                                            minSearchLength={1}
                                        />
                                    </div>
                                )}
                            />

                            {/* ---------------- Building ---------------- */}
                            <Controller
                                name={`${name}.${index}.building_block_id` as any}
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label>Building</Label>
                                        <Select
                                            value={field.value || "none"}
                                            disabled={isRowReadOnly(space) || !siteId}
                                            onValueChange={(v) => {
                                                const value = v === "none" ? "" : v;
                                                field.onChange(value);
                                                setField(index, "building_block_id", value);
                                                setField(index, "space_id", "");
                                                if (siteId && value) {
                                                    loadSpaces(siteId, value);
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select building" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Select building
                                                </SelectItem>
                                                {(buildingList[siteId] || []).map((b) => (
                                                    <SelectItem key={b.id} value={b.id}>
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />

                            {/* ---------------- Space ---------------- */}
                            <Controller
                                name={`${name}.${index}.space_id` as any}
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label>Space *</Label>
                                        <Select
                                            value={field.value || ""}
                                            disabled={
                                                isRowReadOnly(space) ||
                                                !siteId ||
                                                !buildingId
                                            }
                                            onValueChange={(v) => {
                                                field.onChange(v);
                                                setField(index, "space_id", v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select space" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(spaceList[spaceKey] || []).map((sp) => (
                                                    <SelectItem key={sp.id} value={sp.id}>
                                                        {sp.name || sp.code}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
