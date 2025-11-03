import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ParkingZoneFormValues, parkingZoneSchema } from "@/schemas/parkingZone.schema";
import { toast } from "sonner";
import { ParkingZone } from "@/interfaces/parking_access_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";

const emptyFormData: ParkingZoneFormValues = {
  name: "",
  site_id: "",
  capacity: 0,
}

interface ParkingZoneFormProps {
  zone?: ParkingZone;
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: Partial<ParkingZone>) => void;
  mode: 'create' | 'edit' | 'view';
}

export function ParkingZoneForm({ zone, isOpen, onClose, onSave, mode }: ParkingZoneFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ParkingZoneFormValues>({
    resolver: zodResolver(parkingZoneSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [siteList, setSiteList] = useState([]);

  useEffect(() => {
    if (zone && mode !== "create") {
      reset({
        name: zone.name || "",
        site_id: zone.site_id || "",
        capacity: zone.capacity || 0,
      });
    } else {
      reset(emptyFormData);
    }
    loadSiteLookup();
  }, [zone, mode, reset]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  }

  const onSubmitForm = async (data: ParkingZoneFormValues) => {
    try {
      await onSave(data);
      reset(emptyFormData);
      onClose();
    } catch (error) {
      reset(undefined, { keepErrors: true, keepValues: true });
      toast("Failed to save parking zone");
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && "Create New Parking Zone"}
            {mode === 'edit' && "Edit Parking Zone"}
            {mode === 'view' && "Parking Zone Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Zone Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Underground Garage A"
              disabled={isReadOnly}
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
                <Label htmlFor="site">Site *</Label>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={errors.site_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {siteList.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.site_id && (
                  <p className="text-sm text-red-500">{errors.site_id.message}</p>
                )}
              </div>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (spots) *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              {...register("capacity", {
                setValueAs: (v) => v === "" ? 0 : Number(v)
              })}
              placeholder="e.g., 150"
              disabled={isReadOnly}
              className={errors.capacity ? 'border-red-500' : ''}
            />
            {errors.capacity && (
              <p className="text-sm text-red-500">{errors.capacity.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? "Saving..." : mode === 'create' ? 'Create Zone' : 'Update Zone'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}