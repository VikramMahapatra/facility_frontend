import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceGroupFormValues, spaceGroupSchema } from "@/schemas/spaceGroup.schema";
import { SpaceGroup } from "@/pages/SpaceGroups";
import { toast } from "sonner";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { amenitiesByKind, SpaceAmenities, SpaceKind, spaceKinds } from "@/interfaces/spaces_interfaces";

interface Props {
  group?: SpaceGroup;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SpaceGroup>) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData: SpaceGroupFormValues = {
  name: "",
  site_id: "",
  kind: "apartment",
  specs: {
    base_rate: 0,
    amenities: []
  }
};

export function SpaceGroupForm({ group, isOpen, onClose, onSave, mode }: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SpaceGroupFormValues>({
    resolver: zodResolver(spaceGroupSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [siteList, setSiteList] = useState<any[]>([]);
  const selectedKind = watch("kind");

  useEffect(() => {
    loadSiteLookup();
  }, []);

  useEffect(() => {
    if (group && mode !== "create") {
      reset({
        name: group.name || "",
        site_id: group.site_id || "",
        kind: group.kind || "apartment",
        specs: {
          base_rate: group.specs?.base_rate || 0,
          amenities: group.specs?.amenities || []
        }
      });
    } else {
      reset(emptyFormData);
    }
  }, [group, mode, reset]);

  const loadSiteLookup = async () => {
    try {
      const lookup = await siteApiService.getSiteLookup();
      setSiteList(lookup || []);
    } catch (error) {
      console.error('Failed to load sites:', error);
      setSiteList([]);
    }
  };

  const onSubmitForm = async (data: SpaceGroupFormValues) => {
    try {
      await onSave({
        ...group,
        ...data,
      } as Partial<SpaceGroup>);
      reset(emptyFormData);
      onClose();
    } catch (error) {
      reset(undefined, { keepErrors: true, keepValues: true });
      toast("Failed to save space group");
    }
  };

  const isView = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Group" : mode === "edit" ? "Edit Group" : "View Group"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Group Name"
              disabled={isView}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <Controller
            name="site_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="site_id">Site *</Label>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isView}
                >
                  <SelectTrigger className={errors.site_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    {siteList.length === 0 ? (
                      <SelectItem value="none" disabled>No sites available</SelectItem>
                    ) : (
                      siteList.map(site => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.site_id && (
                  <p className="text-sm text-red-500">{errors.site_id.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="kind"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="kind">Kind *</Label>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isView}
                >
                  <SelectTrigger className={errors.kind ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Kind" />
                  </SelectTrigger>
                  <SelectContent>
                    {spaceKinds.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {kind.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kind && (
                  <p className="text-sm text-red-500">{errors.kind.message}</p>
                )}
              </div>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="base_rate">Base Rate</Label>
            <Input
              id="base_rate"
              type="number"
              {...register("specs.base_rate", { valueAsNumber: true })}
              placeholder="Base Rate"
              disabled={isView}
              className={errors.specs?.base_rate ? 'border-red-500' : ''}
              min="0"
            />
            {errors.specs?.base_rate && (
              <p className="text-sm text-red-500">{errors.specs.base_rate.message}</p>
            )}
          </div>

          <Controller
            name="specs.amenities"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <select
                  multiple
                  value={field.value || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    field.onChange(selected);
                  }}
                  disabled={isView}
                  className="w-full border rounded p-2 h-32"
                >
                  <option value="" disabled>Select Amenities</option>
                  {selectedKind && amenitiesByKind[selectedKind as SpaceKind]?.map((amenity) => (
                    <option key={amenity} value={amenity}>
                      {amenity.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {isView ? "Close" : "Cancel"}
            </Button>
            {!isView && (
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
