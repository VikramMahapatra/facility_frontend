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
import { SpaceKind, spaceKinds } from "@/interfaces/spaces_interfaces";

interface Space {
  id: string;
  org_id: string;
  site_id: string;
  code: string;
  name?: string;
  kind: SpaceKind;
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

const emptyFormData: SpaceFormValues = {
  code: "",
  name: "",
  kind: "room",
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
  const selectedSiteId = watch("site_id");

  const loadAll = async () => {
    setFormLoading(true);

    // Clear building list when in create mode
    if (mode === "create") {
      setBuildingList([]);
    }

    await Promise.all([loadSiteLookup(), loadBuildingLookup()]);

      reset(
      space && mode !== "create"
        ? {
            code: space.code || "",
            name: space.name || "",
            kind: space.kind || "room",
            site_id: space.site_id || "",
            floor:
              space.floor !== undefined && space.floor !== null
                ? Number(space.floor)
                : undefined,
            building_block_id: space.building_block_id || "",
            area_sqft: space.area_sqft,
            beds: space.beds ,
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
          }
        : emptyFormData
    );

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [space, mode, isOpen, reset]);

  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup();
    } else {
      setBuildingList([]);
    }
  }, [selectedSiteId]);

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) setSiteList(response.data || []);
  };

  const loadBuildingLookup = async () => {
    if (selectedSiteId) {
      const response = await buildingApiService.getBuildingLookup(
        selectedSiteId
      );
      if (response.success) setBuildingList(response.data || []);
    }
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
  const selectedKind = watch("kind");

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    {...register("code")}
                    placeholder="e.g., 101, A-1203, SH-12"
                    disabled={isReadOnly}
                    className={errors.code ? "border-red-500" : ""}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">
                      {errors.code.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Space name"
                    disabled={isReadOnly}
                    className={errors.name ? "border-red-500" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Select site" />
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
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
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
                          {buildingList.map((building_block) => (
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <Controller
                  name="kind"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="kind">Type *</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.kind ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {spaceKinds.map((kind) => (
                            <SelectItem key={kind} value={kind}>
                              {kind
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {selectedKind && ["room", "apartment"].includes(selectedKind) && (
                <div className="grid grid-cols-2 gap-4">
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
              )}

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="view">View</Label>
                  <Input
                    id="view"
                    {...register("attributes.view")}
                    placeholder="e.g., Sea, Garden, City"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
