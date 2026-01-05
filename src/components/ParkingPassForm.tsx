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
  parkingPassSchema,
  ParkingPassFormValues,
} from "@/schemas/parkingPass.schema";
import { ParkingPass } from "@/interfaces/parking_access_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { parkingZoneApiService } from "@/services/parking_access/parkingzonesapi";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { parkingPassesApiService } from "@/services/parking_access/parkingpassesapi";

interface ParkingPassFormProps {
  pass?: ParkingPass | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pass: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: ParkingPassFormValues = {
  site_id: "",
  space_id: "",
  zone_id: "",
  vehicle_no: "",
  valid_from: "",
  valid_to: "",
  tenant_id: "",
  pass_holder: "",
  status: "active",
};

export function ParkingPassForm({
  pass,
  isOpen,
  onClose,
  onSave,
  mode,
}: ParkingPassFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ParkingPassFormValues>({
    resolver: zodResolver(parkingPassSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [zoneList, setZoneList] = useState<any[]>([]);
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const selectedSiteId = watch("site_id");
  const selectedSpaceId = watch("space_id");
  const selectedTenantId = watch("tenant_id");

  const loadSiteLookup = async () => {
    const sitesResponse = await siteApiService.getSiteLookup();
    const sites = sitesResponse.success ? sitesResponse.data || [] : [];
    setSiteList(sites);
  };

  const loadStatusLookup = async () => {
    const response = await parkingPassesApiService.getStatusLookup();
    if (response.success) {
      setStatusList(response.data || []);
    }
  };

  const loadSpaces = async (siteId: string) => {
    const spaces = await spacesApiService.getSpaceLookup(siteId);
    if (spaces.success) {
      setSpaceList(spaces.data || []);
    }
  };

  const loadZones = async (siteId: string) => {
    const params = new URLSearchParams();
    params.append("site_id", siteId);
    const zones = await parkingZoneApiService.getParkingZones(params);
    if (zones.success) {
      setZoneList(zones.data?.zones || zones.data || []);
    }
  };

  const loadTenantLookup = async (siteId: string, spaceId: string) => {
    const params = new URLSearchParams();
    params.append("site_id", siteId);
    params.append("space_id", spaceId);
    const response = await tenantsApiService.getTenantsBySiteSpace(params);
    if (response.success) {
      setTenantList(response.data || []);
    }
  };

  const loadAll = async () => {
    setFormLoading(true);

    // Load sites and status lookup
    await Promise.all([loadSiteLookup(), loadStatusLookup()]);

    // Load spaces and zones if editing
    if (pass && mode !== "create" && pass.site_id) {
      await loadSpaces(pass.site_id);
      await loadZones(pass.site_id);

      // Load tenants if space is available
      if (pass.space_id) {
        await loadTenantLookup(pass.site_id, pass.space_id);

        // If tenant is not in the list but we have partner_id, add it to the list
        const tenantId = pass.resident_id || pass.partner_id;
        if (tenantId && (pass as any).partner_name) {
          setTenantList((prev) => {
            const exists = prev.some((t: any) => t.id === tenantId);
            if (!exists) {
              return [
                ...prev,
                {
                  id: tenantId,
                  name: (pass as any).partner_name,
                },
              ];
            }
            return prev;
          });
        }
      }
    }

    reset(
      pass && mode !== "create"
        ? {
            site_id: pass.site_id || "",
            space_id: pass.space_id || "",
            zone_id: pass.zone_id || "",
            vehicle_no: pass.vehicle_no || "",
            valid_from: pass.valid_from || "",
            valid_to: pass.valid_to || "",
            tenant_id: pass.resident_id || pass.partner_id || "",
            pass_holder:
              (pass as any).pass_holder_name || (pass as any).pass_holder || "",
            status: pass.status || "",
          }
        : emptyFormData
    );

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [pass, mode, isOpen]);

  // Load spaces when site changes
  useEffect(() => {
    if (selectedSiteId) {
      loadSpaces(selectedSiteId);
      loadZones(selectedSiteId);
    } else {
      setSpaceList([]);
      setZoneList([]);
      setValue("space_id", "");
      setValue("zone_id", "");
      setTenantList([]);
      setValue("tenant_id", "");
    }
  }, [selectedSiteId, setValue]);

  useEffect(() => {
    if (selectedSiteId && selectedSpaceId) {
      loadTenantLookup(selectedSiteId, selectedSpaceId);

      if (mode === "create" || (!pass?.resident_id && !pass?.partner_id)) {
        setValue("tenant_id", "");
      }
    } else {
      setTenantList([]);

      if (mode === "create" || (!pass?.resident_id && !pass?.partner_id)) {
        setValue("tenant_id", "");
      }
    }
  }, [selectedSiteId, selectedSpaceId, setValue, mode, pass]);

  useEffect(() => {
    const loadPreview = async () => {
      if (selectedTenantId) {
        setIsLoadingPreview(true);
        setPreviewData(null);
        try {
          const response = await parkingPassesApiService.getParkingPassPreview(
            selectedTenantId
          );
          if (response?.success) {
            setPreviewData(response.data);
            if (mode === "create" && response.data?.partner_name) {
              setValue("pass_holder", response.data.partner_name);
            }
          }
        } catch (error) {
          setPreviewData(null);
        } finally {
          setIsLoadingPreview(false);
        }
      } else {
        setPreviewData(null);
        if (mode === "create") {
          setValue("pass_holder", "");
        }
      }
    };

    loadPreview();
  }, [selectedTenantId, setValue, mode]);

  const onSubmitForm = async (data: ParkingPassFormValues) => {
    const apiData = {
      site_id: data.site_id,
      space_id: data.space_id,
      zone_id: data.zone_id,
      vehicle_no: data.vehicle_no,
      pass_holder_name: data.pass_holder || "",
      partner_id: data.tenant_id || "",
      valid_from: data.valid_from,
      valid_to: data.valid_to,
      status: data.status || "active",
    };

    await onSave({
      ...pass,
      ...apiData,
    });
  };

  const isReadOnly = mode === "view";

  const isFieldDisabled = (fieldName: string) => {
    if (mode === "view") return true;
    if (mode === "edit") {
      const editableFields = [
        "pass_holder",
        "vehicle_no",
        "valid_from",
        "valid_to",
        "status",
      ];
      return !editableFields.includes(fieldName);
    }
    return false;
  };

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Parking Pass"}
            {mode === "edit" && "Edit Parking Pass"}
            {mode === "view" && "Parking Pass Details"}
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
              {/* Site and Space */}
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="site_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="site_id">Site *</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("space_id", "");
                          setValue("zone_id", "");
                        }}
                        disabled={isReadOnly || isFieldDisabled("site_id")}
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
                  name="space_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="space_id">Space *</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={
                          isReadOnly ||
                          isFieldDisabled("space_id") ||
                          !selectedSiteId
                        }
                      >
                        <SelectTrigger
                          className={errors.space_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select space" />
                        </SelectTrigger>
                        <SelectContent>
                          {spaceList.length === 0 ? (
                            <SelectItem value="none" disabled>
                              {selectedSiteId
                                ? "No spaces available"
                                : "Select site first"}
                            </SelectItem>
                          ) : (
                            spaceList.map((space) => (
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
              </div>

              {/* Zone and Tenant */}
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="zone_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="zone_id">Zone *</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={
                          isReadOnly ||
                          isFieldDisabled("zone_id") ||
                          !selectedSiteId
                        }
                      >
                        <SelectTrigger
                          className={errors.zone_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {zoneList.length === 0 ? (
                            <SelectItem value="none" disabled>
                              {selectedSiteId
                                ? "No zones available"
                                : "Select site first"}
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

                <Controller
                  name="tenant_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="tenant_id">Tenant *</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={
                          isReadOnly ||
                          isFieldDisabled("tenant_id") ||
                          !selectedSpaceId
                        }
                      >
                        <SelectTrigger
                          className={errors.tenant_id ? "border-red-500" : ""}
                        >
                          <SelectValue
                            placeholder={
                              selectedSpaceId
                                ? "Select Tenant"
                                : "Select space first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {tenantList.map((tenant: any) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tenant_id && (
                        <p className="text-sm text-red-500">
                          {errors.tenant_id.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Preview Section */}
              {selectedTenantId &&
                selectedTenantId !== "none" &&
                (isLoadingPreview ? (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    {/*<h4 className="font-medium text-sm">Tenant Preview:</h4>*/}
                    <div className="text-sm text-muted-foreground">
                      Loading tenant details...
                    </div>
                  </div>
                ) : previewData ? (
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    {/*<h4 className="font-medium text-sm">Tenant Preview:</h4>*/}
                    <div className="text-sm text-muted-foreground">
                      <div className="grid grid-cols-2 gap-4">
                        {previewData.family_info &&
                          previewData.family_info.length > 0 && (
                            <div>
                              <strong>Family Members:</strong>
                              <div className="ml-4 mt-1 space-y-1">
                                {previewData.family_info.map(
                                  (member: any, index: number) => (
                                    <div key={index}>
                                      {member.member} ({member.relation})
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {previewData.vehicle_info &&
                          previewData.vehicle_info.length > 0 && (
                            <div>
                              <strong>Vehicles:</strong>
                              <div className="ml-4 mt-1 space-y-1">
                                {previewData.vehicle_info.map(
                                  (vehicle: any, index: number) => (
                                    <div key={index}>
                                      {vehicle.type}: {vehicle.number}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ) : null)}

              {/* Pass Holder and Vehicle No */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pass_holder">Pass Holder</Label>
                  <Input
                    id="pass_holder"
                    {...register("pass_holder")}
                    placeholder="Pass holder name"
                    disabled={isReadOnly || isFieldDisabled("pass_holder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_no">Vehicle No. *</Label>
                  <Input
                    id="vehicle_no"
                    {...register("vehicle_no")}
                    placeholder="e.g., ABC-1234"
                    disabled={isReadOnly || isFieldDisabled("vehicle_no")}
                    className={errors.vehicle_no ? "border-red-500" : ""}
                  />
                  {errors.vehicle_no && (
                    <p className="text-sm text-red-500">
                      {errors.vehicle_no.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Start Date, End Date, and Status */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Start Date *</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    {...register("valid_from")}
                    disabled={isReadOnly || isFieldDisabled("valid_from")}
                    className={errors.valid_from ? "border-red-500" : ""}
                  />
                  {errors.valid_from && (
                    <p className="text-sm text-red-500">
                      {errors.valid_from.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_to">End Date *</Label>
                  <Input
                    id="valid_to"
                    type="date"
                    {...register("valid_to")}
                    disabled={isReadOnly || isFieldDisabled("valid_to")}
                    className={errors.valid_to ? "border-red-500" : ""}
                    min={watch("valid_from") || undefined}
                  />
                  {errors.valid_to && (
                    <p className="text-sm text-red-500">
                      {errors.valid_to.message}
                    </p>
                  )}
                </div>

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly || isFieldDisabled("status")}
                      >
                        <SelectTrigger
                          className={errors.status ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusList.map((status: any) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
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
                      ? "Create Pass"
                      : "Update Pass"}
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
