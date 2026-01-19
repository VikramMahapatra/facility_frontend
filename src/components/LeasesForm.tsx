import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseSchema, LeaseFormValues } from "@/schemas/lease.schema";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { Lease } from "@/interfaces/leasing_tenants_interface";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";

interface LeaseFormProps {
  lease?: Lease;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lease: Partial<Lease>) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: Partial<Lease> = {
  kind: "residential",
  site_id: "",
  building_id: "",
  space_id: "",
  partner_id: "",
  tenant_id: "",
  start_date: "",
  end_date: "",
  rent_amount: "" as any,
  deposit_amount: "" as any,
  cam_rate: "" as any,
  utilities: { electricity: undefined, water: undefined },
  status: "draft",
};

export function LeaseForm({
  lease,
  isOpen,
  onClose,
  onSave,
  mode,
}: LeaseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    clearErrors,
    trigger,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      kind: "residential",
      site_id: "",
      building_id: "",
      space_id: "",
      partner_id: "",
      tenant_id: "",
      start_date: "",
      end_date: "",
      rent_amount: "" as any,
      deposit_amount: "" as any,
      cam_rate: "" as any,
      utilities: { electricity: undefined, water: undefined },
      status: "draft",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [leasePartnerList, setLeasePartnerList] = useState<any[]>([]);
  const isReadOnly = mode === "view";
  const loadAll = async () => {
    setFormLoading(true);

    await Promise.all([loadSites()]);

    const leaseSiteId = lease && mode !== "create" ? lease.site_id : undefined;
    const leaseBuildingId =
      lease && mode !== "create"
        ? (lease as any).building_id || (lease as any).building_block_id
        : undefined;

    if (leaseSiteId) {
      await loadBuildingLookup(leaseSiteId);
      if (leaseSiteId) {
        const spaces = await spacesApiService.getSpaceLookup(
          leaseSiteId,
          leaseBuildingId
        );
        if (spaces.success) setSpaceList(spaces.data || []);
      }
    }

    reset(
      lease
        ? {
          kind: (lease.kind as any) || "commercial",
          site_id: lease.site_id || "",
          building_id: leaseBuildingId || "",
          space_id: lease.space_id || "",
          partner_id: lease.partner_id ? String(lease.partner_id) : "",
          tenant_id: lease.tenant_id ? String(lease.tenant_id) : "",
          start_date: lease.start_date || "",
          end_date: lease.end_date || "",
          rent_amount: lease.rent_amount as any,
          deposit_amount: lease.deposit_amount as any,
          cam_rate: lease.cam_rate as any,
          utilities: {
            electricity: lease.utilities?.electricity as any,
            water: lease.utilities?.water as any,
          },
          status: (lease.status as any) || "draft",
        }
        : emptyFormData
    );
    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    } else {
      reset(emptyFormData);
      setBuildingList([]);
      setSpaceList([]);
      setLeasePartnerList([]);
    }
  }, [isOpen, lease, mode, reset]);

  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_id");
  const selectedSpaceId = watch("space_id");
  const selectedKind = watch("kind");
  const selectedTenantId = watch("tenant_id");

  useEffect(() => {
    if (selectedTenantId && selectedKind !== "residential") {
      setValue("kind", "residential", { shouldValidate: true });
    }
  }, [selectedTenantId, selectedKind, setValue]);

  // Load buildings when site changes
  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup(selectedSiteId);
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId]);

  // Load spaces when site or building changes
  useEffect(() => {
    if (selectedSiteId) {
      loadSpaces();
    } else {
      setSpaceList([]);
    }
  }, [selectedSiteId, selectedBuildingId]);

  useEffect(() => {
    loadLeaseTenants();
  }, [selectedSiteId, selectedSpaceId]);

  useEffect(() => {
    if (lease && leasePartnerList.length > 0) {
      if (lease.kind === "commercial" && lease.partner_id) {
        const partnerIdStr = String(lease.partner_id);
        clearErrors("partner_id");
        setValue("partner_id", partnerIdStr, { shouldValidate: true });
        trigger("partner_id");
      } else if (lease.kind === "residential" && lease.tenant_id) {
        const tenantIdStr = String(lease.tenant_id);
        clearErrors("tenant_id");
        setValue("tenant_id", tenantIdStr, { shouldValidate: true });
        trigger("tenant_id");
      }
    }
  }, [leasePartnerList, lease, setValue, clearErrors, trigger]);

  const loadBuildingLookup = async (siteId: string) => {
    const lookup = await buildingApiService.getBuildingLookup(siteId);
    if (lookup.success) setBuildingList(lookup.data || []);
  };

  const loadSpaces = async () => {
    if (selectedSiteId) {
      const spaces = await spacesApiService.getSpaceLookup(
        selectedSiteId,
        selectedBuildingId
      );
      if (spaces.success) setSpaceList(spaces.data || []);
    }
  };

  const loadSites = async () => {
    const sites = await siteApiService.getSiteLookup();
    if (sites.success) setSiteList(sites.data || []);
  };

  const loadLeaseTenants = async () => {
    if (!selectedSiteId) return;
    const tenants = await leasesApiService.getLeaseTenantLookup(
      selectedSiteId,
      selectedSpaceId
    );
    if (tenants?.success) setLeasePartnerList(tenants.data || []);
  };

  const onSubmitForm = async (data: LeaseFormValues) => {
    try {
      const { kind, ...updated } = data;
      console.log("Submitting lease data:", updated);
      const formResponse = await onSave(updated);
      console.log("Lease save response:", formResponse);
    } catch (error) {
      console.error("Error submitting lease form:", error);
      toast.error("Failed to submit lease form. Please try again.");
    }
  };

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList([]);
    setSpaceList([]);
    setLeasePartnerList([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create New Lease"
              : mode === "edit"
                ? "Edit Lease"
                : "Lease Details"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={
            isSubmitting
              ? undefined
              : handleSubmit(onSubmitForm, (errors) => {
                console.log("Form validation errors:", errors);
                const firstError = Object.values(errors)[0];
                if (firstError?.message) {
                  toast.error(firstError.message as string);
                } else {
                  toast.error(
                    "Please fill in all required fields correctly."
                  );
                }
              })
          }
          className="space-y-4"
        >
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Row 1: Site, Building */}
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
                          // Reset building and space when site changes
                          setValue("building_id", "");
                          setValue("space_id", "");
                        }}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.site_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                          {siteList.map((site: any) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.site_id && (
                        <p className="text-sm text-red-500">
                          {errors.site_id.message as any}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="building_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="building_id">Building</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset space when building changes
                          setValue("space_id", "");
                        }}
                        disabled={isReadOnly || !selectedSiteId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedSiteId
                                ? "Select site first"
                                : "Select building"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {buildingList.map((building: any) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>

              {/* Row 2: Space, Tenant */}
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="space_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="space_id">Space *</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly || !selectedSiteId}
                      >
                        <SelectTrigger
                          className={errors.space_id ? "border-red-500" : ""}
                        >
                          <SelectValue
                            placeholder={
                              !selectedSiteId
                                ? "Select site first"
                                : "Select space"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {spaceList.map((space: any) => (
                            <SelectItem key={space.id} value={space.id}>
                              {space.name || space.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.space_id && (
                        <p className="text-sm text-red-500">
                          {errors.space_id.message as any}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div className="space-y-2">
                  <Label>Tenant *</Label>
                  <Controller
                    name="tenant_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.tenant_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {leasePartnerList.map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tenant_id && (
                    <p className="text-sm text-red-500">
                      {errors.tenant_id?.message as any}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    disabled={isReadOnly}
                    {...register("start_date")}
                    className={errors.start_date ? "border-red-500" : ""}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">
                      {errors.start_date.message as any}
                    </p>
                  )}
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    disabled={isReadOnly}
                    {...register("end_date")}
                    className={errors.end_date ? "border-red-500" : ""}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-500">
                      {errors.end_date.message as any}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Rent Amount *</Label>
                  <Input
                    type="number"
                    step="any"
                    disabled={isReadOnly}
                    {...register("rent_amount")}
                    className={errors.rent_amount ? "border-red-500" : ""}
                  />
                  {errors.rent_amount && (
                    <p className="text-sm text-red-500">
                      {errors.rent_amount.message as any}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Deposit Amount</Label>
                  <Input
                    type="number"
                    step="any"
                    disabled={isReadOnly}
                    {...register("deposit_amount")}
                    className={
                      errors.deposit_amount ? "border-red-500" : ""
                    }
                  />
                  {errors.deposit_amount && (
                    <p className="text-sm text-red-500">
                      {errors.deposit_amount.message as any}
                    </p>
                  )}
                </div>
                <div>
                  <Label>CAM Rate (per sq ft)</Label>
                  <Input
                    type="number"
                    step="any"
                    disabled={isReadOnly}
                    {...register("cam_rate")}
                    className={errors.cam_rate ? "border-red-500" : ""}
                  />
                  {errors.cam_rate && (
                    <p className="text-sm text-red-500">
                      {errors.cam_rate.message as any}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="terminated">
                            Terminated
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Utilities */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Electricity</Label>
                  <Controller
                    name="utilities.electricity"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submeter">Submeter</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="na">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label>Water</Label>
                  <Controller
                    name="utilities.water"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submeter">Submeter</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="na">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
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
                        ? "Create Lease"
                        : "Update Lease"}
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
