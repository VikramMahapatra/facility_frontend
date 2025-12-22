import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parkingZoneSchema,
  ParkingZoneFormValues,
} from "@/schemas/parkingZone.schema";
import { ParkingZone } from "@/interfaces/parking_access_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";

interface ParkingZoneFormProps {
  zone?: ParkingZone | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: ParkingZoneFormValues = {
  name: "",
  site_id: "",
  capacity: 0,
};

export function ParkingZoneForm({
  zone,
  isOpen,
  onClose,
  onSave,
  mode,
}: ParkingZoneFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ParkingZoneFormValues>({
    resolver: zodResolver(parkingZoneSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);

  const loadAll = async () => {
    setFormLoading(true);

    const sitesResponse = await siteApiService.getSiteLookup();
    const sites = sitesResponse.success ? sitesResponse.data || [] : [];
    setSiteList(sites);

    reset(
      zone && mode !== "create"
        ? {
            name: zone.name || "",
            site_id: zone.site_id || "",
            capacity: zone.capacity || 0,
          }
        : emptyFormData
    );

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [zone, mode, isOpen, reset]);

  const onSubmitForm = async (data: ParkingZoneFormValues) => {
    await onSave({
      ...zone,
      ...data,
    });
  };

  const isReadOnly = mode === "view";

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Zone"}
            {mode === "edit" && "Edit Parking Zone"}
            {mode === "view" && "Parking Zone Details"}
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
                  <Label htmlFor="name">Zone Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Underground Garage A"
                    disabled={isReadOnly}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_id">Site *</Label>
                  <Controller
                    name="site_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
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
                    )}
                  />
                  {errors.site_id && (
                    <p className="text-sm text-red-500">
                      {errors.site_id.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (spots) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  {...register("capacity", {
                    setValueAs: (v) => (v === "" ? 0 : Number(v)),
                  })}
                  placeholder="e.g., 150"
                  disabled={isReadOnly}
                  className={errors.capacity ? "border-red-500" : ""}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-500">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting || formLoading}>
                    {isSubmitting
                      ? "Saving..."
                      : mode === "create"
                      ? "Create Zone"
                      : "Update Zone"}
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
