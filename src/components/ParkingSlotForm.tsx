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
import { ParkingSlot, ParkingZone } from "@/interfaces/parking_access_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { AsyncAutocompleteRQ } from "./common/async-autocomplete-rq";
import { ParkingSlotFormValues, parkingSlotSchema } from "@/schemas/parkingSlot.schema";
import { parkingSlotApiService } from "@/services/parking_access/parkingslotsapi";
import { parkingZoneApiService } from "@/services/parking_access/parkingzonesapi";

interface ParkingSlotFormProps {
  slot?: ParkingSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: ParkingSlotFormValues = {
  slot_no: "",
  site_id: "",
  zone_id: "",
};

export function ParkingSlotForm({
  slot,
  isOpen,
  onClose,
  onSave,
  mode,
}: ParkingSlotFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ParkingSlotFormValues>({
    resolver: zodResolver(parkingSlotSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [zoneList, setZoneList] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);

  const loadAll = async () => {

    const sitesResponse = await siteApiService.getSiteLookup();
    const sites = sitesResponse.success ? sitesResponse.data || [] : [];
    setSiteList(sites);

    reset(
      slot && mode !== "create"
        ? {
          slot_no: slot.slot_no || "",
          site_id: slot.site_id || "",
          zone_id: slot.zone_id || "",
        }
        : emptyFormData
    );

    setFormLoading(false);

  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [slot, mode, isOpen, reset]);

  const selectedSiteId = watch("site_id");

  const loadparkingZones = async () => {
    if (!selectedSiteId) return;

    const params = new URLSearchParams({ site_id: selectedSiteId });
    const response = await parkingZoneApiService.getParkingZoneLookup(params);
    if (response.success) setZoneList(response.data || []);
  };

  const onSubmitForm = async (data: ParkingSlotFormValues) => {
    await onSave({
      ...slot,
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
            {mode === "create" && "Create New Slot"}
            {mode === "edit" && "Edit Parking Slot"}
            {mode === "view" && "Parking Slot Details"}
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
                  name="zone_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="zone_id">Zone *</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.zone_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {zoneList.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No zones available
                            </SelectItem>
                          ) : (
                            zoneList.map((zone) => (
                              <SelectItem key={zone.id} value={zone.id}>
                                {zone.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.zone_id && (
                        <p className="text-sm text-red-500">
                          {errors.zone_id.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slot_no">Slot Number *</Label>
                  <Input
                    id="slot_no"
                    {...register("slot_no")}
                    placeholder="Slot number"
                    disabled={isReadOnly}
                    className={errors.slot_no ? "border-red-500" : ""}
                  />
                  {errors.slot_no && (
                    <p className="text-sm text-red-500">
                      {errors.slot_no.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Controller
                    name="slot_type"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="slot_type">Slot Type *</Label>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger
                            className={errors.slot_type ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select Slot Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="covered">Covered</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="visitor">Visitor</SelectItem>
                            <SelectItem value="handicapped">Handicapped</SelectItem>
                            <SelectItem value="ev">EV</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.slot_type && (
                          <p className="text-sm text-red-500">
                            {errors.slot_type.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Controller
                  name="space_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="space_id">Assign to Space (Optional)</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.space_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select Space" />
                        </SelectTrigger>
                        <SelectContent>
                          {spaces.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No spaces available
                            </SelectItem>
                          ) : (
                            spaces.map((space) => (
                              <SelectItem key={space.id} value={space.id}>
                                {space.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.space_id && (
                        <p className="text-sm text-red-500">
                          {errors.space_id.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Label>Assign to Space (Optional)</Label>
                <Select
                  value={watch("space_id") || ""}
                  onValueChange={(value) => setValue("space_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select space" />
                  </SelectTrigger>

                  <SelectContent>
                    {spaces.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>
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