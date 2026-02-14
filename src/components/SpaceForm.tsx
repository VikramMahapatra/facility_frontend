import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceFormValues, spaceSchema } from "@/schemas/space.schema";
import { toast } from "sonner";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { SpaceKind, spaceKinds } from "@/interfaces/spaces_interfaces";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, X, Plus } from "lucide-react";

import { withFallback } from "@/helpers/commonHelper";

interface Space {
  id: string;
  org_id: string;
  site_id: string;
  site_name?: string;
  name?: string;
  kind: SpaceKind;
  category?: "residential" | "commercial";
  floor?: string;
  building_block_id?: string;
  building_block?: string;
  area_sqft?: number;
  beds?: number;
  baths?: number;
  attributes?: {
    view?: string;
    //smoking?: boolean;
    furnished?: string;
    star_rating?: string;
  };
  accessories?: Array<{
    accessory_id: string;
    quantity: number;
  }>;
  status: "available" | "occupied" | "out_of_service";
  created_at: string;
  updated_at: string;
}

interface SpaceFormProps {
  space?: Space;
  isOpen: boolean;
  onClose: () => void;
  onSave: (space: Partial<Space>) => Promise<any>;
  mode: "create" | "edit" | "view";
}

// Mapping of space kinds to categories
const kindToCategory: Record<SpaceKind, "residential" | "commercial"> = {
  room: "residential",
  apartment: "residential",
  villa: "residential",
  row_house: "residential",
  bungalow: "residential",
  duplex: "residential",
  penthouse: "residential",
  studio_apartment: "residential",
  farm_house: "residential",
  shop: "commercial",
  office: "commercial",
  warehouse: "commercial",
  meeting_room: "commercial",
  hall: "commercial",
  common_area: "commercial",
  parking: "commercial",
};

const getKindsByCategory = (
  category?: "residential" | "commercial",
): readonly SpaceKind[] => {
  if (!category) return spaceKinds;
  return spaceKinds.filter((kind) => kindToCategory[kind] === category);
};

const emptyFormData: SpaceFormValues = {
  name: "",
  kind: "room",
  category: undefined,
  site_id: "",
  floor: undefined,
  building_block_id: "",
  area_sqft: undefined,
  beds: undefined,
  baths: undefined,
  status: "available",
  attributes: {
    view: "",
    furnished: undefined,
    star_rating: "",
  },
  accessories: [],
};

export function SpaceForm({
  space,
  isOpen,
  onClose,
  onSave,
  mode,
}: SpaceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [accessoriesList, setAccessoriesList] = useState<any[]>([]);
  const [accessoriesPopoverOpen, setAccessoriesPopoverOpen] = useState(false);
  const selectedSiteId = watch("site_id");
  const selectedCategory = watch("category");
  const selectedKind = watch("kind");
  const selectedAccessories = watch("accessories") || [];

  const loadAll = async () => {
    setFormLoading(true);
    reset(
      space && mode !== "create"
        ? {
            name: space.name || "",
            kind: space.kind || "room",
            category: space.category,
            site_id: space.site_id || "",
            floor:
              space.floor !== undefined && space.floor !== null
                ? Number(space.floor)
                : undefined,
            building_block_id: space.building_block_id || "",
            area_sqft: space.area_sqft,
            beds: space.beds,
            baths: space.baths,
            status: space.status || "available",
            attributes: {
              view: space.attributes?.view || "",

              furnished: space.attributes?.furnished as
                | "unfurnished"
                | "semi"
                | "fully"
                | undefined,
              star_rating: space.attributes?.star_rating || "",
            },
            accessories: space.accessories || [],
          }
        : emptyFormData,
    );

    setFormLoading(false);

    Promise.all([loadSiteLookup(), loadAccessoriesLookup()]);

    if (space?.site_id) {
      loadBuildingLookup(space.site_id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [space, mode, isOpen, reset]);

  useEffect(() => {
    if (isOpen) {
      loadAccessoriesLookup();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup();
    } else {
      setBuildingList([]);
    }
  }, [selectedSiteId]);

  const loadBuildingLookup = async (siteId?: string) => {
    const id = siteId || selectedSiteId;
    if (!id) return;

    const response = await buildingApiService.getBuildingLookup(id);
    if (response.success) setBuildingList(response.data || []);
  };

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) setSiteList(response.data || []);
  };

  const loadAccessoriesLookup = async () => {
    const response = await spacesApiService.getAccessoriesLookup();
    if (response.success) setAccessoriesList(response.data || []);
  };

  const handleAccessoryToggle = (accessoryId: string) => {
    const currentAccessories = selectedAccessories || [];
    const isSelected = currentAccessories.some(
      (acc: any) => acc.accessory_id === accessoryId,
    );

    if (isSelected) {
      setValue(
        "accessories",
        currentAccessories.filter(
          (acc: any) => acc.accessory_id !== accessoryId,
        ),
      );
    } else {
      setValue("accessories", [
        ...currentAccessories,
        { accessory_id: accessoryId, quantity: 1 },
      ]);
    }
  };

  const handleAccessoryRemove = (accessoryId: string) => {
    const currentAccessories = selectedAccessories || [];
    setValue(
      "accessories",
      currentAccessories.filter((acc: any) => acc.accessory_id !== accessoryId),
    );
  };

  const handleAccessoryQuantityChange = (
    accessoryId: string,
    quantity: number,
  ) => {
    const currentAccessories = selectedAccessories || [];
    setValue(
      "accessories",
      currentAccessories.map((acc: any) =>
        acc.accessory_id === accessoryId ? { ...acc, quantity: quantity } : acc,
      ),
    );
  };

  const getAccessoryName = (accessoryId: string) => {
    const accessory = accessoriesList.find(
      (a) => (a.id ?? a.value ?? a).toString() === accessoryId,
    );
    return accessory?.name ?? accessory?.label ?? accessory ?? accessoryId;
  };

  const onSubmitForm = async (data: SpaceFormValues) => {
    const formResponse = await onSave({
      ...space,
      ...data,
      floor:
        data.floor !== undefined && data.floor !== null
          ? String(data.floor)
          : mode === "create"
            ? "0"
            : space?.floor,
    } as Partial<Space>);
  };

  const isReadOnly = mode === "view";

  // Filter kinds based on selected category
  const filteredKinds = getKindsByCategory(selectedCategory);

  // Reset kind when category changes if current kind doesn't belong to new category
  useEffect(() => {
    if (selectedCategory && selectedKind) {
      const currentKindCategory = kindToCategory[selectedKind as SpaceKind];
      if (currentKindCategory !== selectedCategory) {
        // Reset to first available kind in the selected category
        const firstKind = filteredKinds[0];
        if (firstKind) {
          setValue("kind", firstKind);
        }
      }
    }
  }, [selectedCategory, selectedKind, filteredKinds, setValue]);

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList([]);
    onClose();
  };

  const fallbackBuilding = space?.building_block_id
    ? {
        id: space.building_block_id,
        name:
          space.building_block ||
          `Building (${space.building_block_id.slice(0, 6)})`,
      }
    : null;

  const building_blocks = withFallback(buildingList, fallbackBuilding);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Space"}
            {mode === "edit" && "Edit Space"}
            {mode === "view" && "Space Details"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
          className="space-y-4"
        >
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Row 1: Site, Building, Unit */}
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="site_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="site_id">Site *</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.site_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select Site" />
                        </SelectTrigger>
                        <SelectContent>
                          {siteList.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No sites available
                            </SelectItem>
                          ) : (
                            siteList.map((site) => (
                              <SelectItem key={site.id} value={site.id}>
                                {site.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.site_id && (
                        <p className="text-sm text-red-500">
                          {errors.site_id.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="building_block_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="building_block_id">Building Block</Label>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? "" : value)
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={
                            errors.building_block_id ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select building block" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select building</SelectItem>
                          {building_blocks.map((building_block) => (
                            <SelectItem
                              key={building_block.id}
                              value={building_block.id}
                            >
                              {building_block.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.building_block_id && (
                        <p className="text-sm text-red-500">
                          {errors.building_block_id.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <div className="space-y-2">
                  <Label htmlFor="name">Unit *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Space name"
                    disabled={isReadOnly}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Category, Type, Status */}
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) =>
                          field.onChange(value === "" ? undefined : value)
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.category ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">
                            Residential
                          </SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-500">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="kind"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="kind">Type *</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly || !selectedCategory}
                      >
                        <SelectTrigger
                          className={errors.kind ? "border-red-500" : ""}
                        >
                          <SelectValue
                            placeholder={
                              selectedCategory
                                ? "Select type"
                                : "Select category first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredKinds.length === 0 ? (
                            <SelectItem value="" disabled>
                              {selectedCategory
                                ? `No ${selectedCategory} types available`
                                : "Select category first"}
                            </SelectItem>
                          ) : (
                            filteredKinds.map((kind) => (
                              <SelectItem key={kind} value={kind}>
                                {kind
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.kind && (
                        <p className="text-sm text-red-500">
                          {errors.kind.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.status ? "border-red-500" : ""}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="out_of_service">
                            Out of Service
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-red-500">
                          {errors.status.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Row 3: Floor, Area, Bed, Bath */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    {...register("floor", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    placeholder="0, 1, 2 , ..."
                    disabled={isReadOnly}
                    className={errors.floor ? "border-red-500" : ""}
                  />
                  {errors.floor && (
                    <p className="text-sm text-red-500">
                      {errors.floor.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area_sqft">Area (sq ft)</Label>
                  <Input
                    id="area_sqft"
                    type="number"
                    step="any"
                    {...register("area_sqft", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={isReadOnly}
                    className={errors.area_sqft ? "border-red-500" : ""}
                    min="0"
                  />
                  {errors.area_sqft && (
                    <p className="text-sm text-red-500">
                      {errors.area_sqft.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds">Beds</Label>
                  <Input
                    id="beds"
                    type="number"
                    {...register("beds", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={isReadOnly}
                    className={errors.beds ? "border-red-500" : ""}
                    min="0"
                  />
                  {errors.beds && (
                    <p className="text-sm text-red-500">
                      {errors.beds.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baths">Baths</Label>
                  <Input
                    id="baths"
                    type="number"
                    {...register("baths", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={isReadOnly}
                    className={errors.baths ? "border-red-500" : ""}
                    min="0"
                  />
                  {errors.baths && (
                    <p className="text-sm text-red-500">
                      {errors.baths.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 4: View, Furnished, Star Rating */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="view">View</Label>
                  <Input
                    id="view"
                    {...register("attributes.view")}
                    placeholder="e.g., Sea, Garden, City"
                    disabled={isReadOnly}
                  />
                </div>
                <Controller
                  name="attributes.furnished"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="furnished">Furnished</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unfurnished">
                            Unfurnished
                          </SelectItem>
                          <SelectItem value="semi">Semi Furnished</SelectItem>
                          <SelectItem value="fully">Fully Furnished</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                <Controller
                  name="attributes.star_rating"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="star_rating">Star Rating</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating === 0
                                ? "No Rating"
                                : `${rating} Star${rating > 1 ? "s" : ""}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>

              {/* Accessories Section */}
              <div className="space-y-2">
                <Label>Accessories</Label>
                <Controller
                  name="accessories"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Popover
                        open={accessoriesPopoverOpen}
                        onOpenChange={setAccessoriesPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={accessoriesPopoverOpen}
                            className="w-1/2 justify-between"
                            disabled={isReadOnly}
                          >
                            {selectedAccessories.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {selectedAccessories
                                  .slice(0, 2)
                                  .map((acc: any) => (
                                    <Badge
                                      key={acc.accessory_id}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {getAccessoryName(acc.accessory_id)} (
                                      {acc.quantity})
                                    </Badge>
                                  ))}
                                {selectedAccessories.length > 2 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{selectedAccessories.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              "Select accessories..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <div className="max-h-96 overflow-y-auto">
                            <div className="p-1">
                              {accessoriesList.map((acc: any) => {
                                const accessoryId = (
                                  acc.id ??
                                  acc.value ??
                                  acc
                                ).toString();
                                const accessoryName =
                                  acc.name ?? acc.label ?? acc;
                                const isSelected = selectedAccessories.some(
                                  (a: any) => a.accessory_id === accessoryId,
                                );

                                return (
                                  <div
                                    key={accessoryId}
                                    className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                                    onClick={() =>
                                      !isReadOnly &&
                                      handleAccessoryToggle(accessoryId)
                                    }
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={() =>
                                        !isReadOnly &&
                                        handleAccessoryToggle(accessoryId)
                                      }
                                      disabled={isReadOnly}
                                    />
                                    <span className="text-sm flex-1">
                                      {accessoryName}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Selected Accessories Display with Quantity */}
                      {selectedAccessories.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {selectedAccessories.map((acc: any) => (
                            <div
                              key={acc.accessory_id}
                              className="flex items-center gap-2 p-2 border rounded-md"
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs flex-1"
                              >
                                {getAccessoryName(acc.accessory_id)}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Qty:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={acc.quantity || 1}
                                  onChange={(e) => {
                                    const qty = parseInt(e.target.value) || 1;
                                    handleAccessoryQuantityChange(
                                      acc.accessory_id,
                                      qty,
                                    );
                                  }}
                                  disabled={isReadOnly}
                                  className="w-20 h-8 text-xs"
                                />
                              </div>
                              {!isReadOnly && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleAccessoryRemove(acc.accessory_id)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : mode === "create"
                        ? "Create Space"
                        : "Update Space"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
