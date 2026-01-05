import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { meterSchema, MeterFormValues } from "@/schemas/meter.schema";
import { Meter } from "@/interfaces/energy_iot_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { assetApiService } from "@/services/maintenance_assets/assetsapi";

interface MeterFormProps {
  meter?: Meter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meter: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: MeterFormValues = {
  site_id: "",
  kind: "electricity",
  code: "",
  asset_id: null,
  space_id: null,
  unit: "",
  multiplier: 1,
  status: "active",
};

// Hardcoded dropdown options
const meterUnits = [
  { id: "kWh", name: "kWh (Kilowatt Hours)" },
  { id: "kW", name: "kW (Kilowatts)" },
  { id: "m3", name: "m³ (Cubic Meters)" },
  { id: "L", name: "L (Liters)" },
  { id: "gal", name: "Gallons" },
  { id: "therms", name: "Therms" },
  { id: "BTU", name: "BTU (British Thermal Units)" },
  { id: "tons", name: "Tons" },
  { id: "count", name: "Count" },
  { id: "hours", name: "Hours" },
];

const meterStatuses = [
  { id: "active", name: "Active" },
  { id: "inactive", name: "Inactive" },
  { id: "maintenance", name: "Maintenance" },
];

const meterKinds = [
  { id: "electricity", name: "Electricity" },
  { id: "water", name: "Water" },
  { id: "gas", name: "Gas" },
  { id: "btuh", name: "BTUH" },
  { id: "people_counter", name: "People Counter" },
];

export function MeterForm({
  meter,
  isOpen,
  onClose,
  onSave,
  mode,
}: MeterFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MeterFormValues>({
    resolver: zodResolver(meterSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [assetList, setAssetList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);

  const selectedSiteId = watch("site_id");

  const loadAll = async () => {
    setFormLoading(true);

    if (mode === "create") {
      setSpaceList([]);
    }

    const [sitesResponse, assetsResponse] = await Promise.all([
      siteApiService.getSiteLookup(),
      assetApiService.getAssetLookup(),
    ]);

    const sites = sitesResponse?.data || [];
    const assets = assetsResponse?.data || [];
    setSiteList(sites);
    setAssetList(assets);

    if (meter && mode !== "create" && meter.site_id) {
      const spacesResponse = await spacesApiService.getSpaceLookup(
        meter.site_id
      );
      if (spacesResponse.success) {
        setSpaceList(spacesResponse.data || []);
      }
    }

    reset(
      meter && mode !== "create"
        ? {
            site_id: meter.site_id || "",
            kind: meter.kind || (meter as any).meter_kind || "electricity",
            code: meter.code || "",
            asset_id: meter.asset_id || null,
            space_id: meter.space_id || null,
            unit: meter.unit || "",
            multiplier: meter.multiplier || 1,
            status: meter.status || "active",
          }
        : emptyFormData
    );

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [meter, mode, isOpen, reset]);

  useEffect(() => {
    if (!selectedSiteId) {
      setSpaceList([]);
      return;
    }

    const loadSpacesLookup = async () => {
      const spacesResponse = await spacesApiService.getSpaceLookup(
        selectedSiteId
      );
      if (spacesResponse.success) {
        setSpaceList(spacesResponse.data || []);
      } else {
        setSpaceList([]);
      }
    };

    loadSpacesLookup();
  }, [selectedSiteId]);

  const onSubmitForm = async (data: MeterFormValues) => {
    await onSave({
      ...meter,
      ...data,
      asset_id: data.asset_id || null,
      space_id: data.space_id || null,
    });
  };

  const isReadOnly = mode === "view";

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Meter"}
            {mode === "edit" && "Edit Meter"}
            {mode === "view" && "View Meter"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Site */}
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

                {/* Associated Space */}
                <div className="space-y-2">
                  <Label htmlFor="space_id">Space</Label>
                  <Controller
                    name="space_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        disabled={isReadOnly || !selectedSiteId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedSiteId
                                ? "Select site first"
                                : "Select space (optional)"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Space</SelectItem>
                          {spaceList.map((space) => (
                            <SelectItem key={space.id} value={space.id}>
                              {space.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meter Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">Meter Code *</Label>
                  <Input
                    id="code"
                    {...register("code")}
                    placeholder="e.g., ELEC-001, WATER-MAIN"
                    disabled={isReadOnly}
                    className={errors.code ? "border-red-500" : ""}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.unit ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {meterUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.unit && (
                    <p className="text-sm text-red-500">
                      {errors.unit.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meter Kind */}
                <div className="space-y-2">
                  <Label htmlFor="kind">Meter Kind *</Label>
                  <Controller
                    name="kind"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.kind ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select meter kind" />
                        </SelectTrigger>
                        <SelectContent>
                          {meterKinds.map((kind) => (
                            <SelectItem key={kind.id} value={kind.id}>
                              {kind.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.kind && (
                    <p className="text-sm text-red-500">
                      {errors.kind.message}
                    </p>
                  )}
                </div>

                {/* Associated Asset */}
                <div className="space-y-2">
                  <Label htmlFor="asset_id">Asset</Label>
                  <Controller
                    name="asset_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Asset</SelectItem>
                          {assetList.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Multiplier */}
                <div className="space-y-2">
                  <Label htmlFor="multiplier">Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.0001"
                    min="0"
                    {...register("multiplier", { valueAsNumber: true })}
                    placeholder="1.0000"
                    disabled={isReadOnly}
                    className={errors.multiplier ? "border-red-500" : ""}
                  />
                  {errors.multiplier && (
                    <p className="text-sm text-red-500">
                      {errors.multiplier.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Factor to multiply readings by (default: 1.0000)
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "active"}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {meterStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {!formLoading && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {isReadOnly ? "Close" : "Cancel"}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : mode === "create"
                    ? "Create Meter"
                    : "Update Meter"}
                </Button>
              )}
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
