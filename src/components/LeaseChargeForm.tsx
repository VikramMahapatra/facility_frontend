import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/app-toast";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { leaseChargeApiService } from "@/services/leasing_tenants/leasechargeapi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leaseChargeSchema,
  LeaseChargeFormValues,
} from "@/schemas/leaseCharge.schema";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { withFallback } from "@/helpers/commonHelper";
import { LeaseCharge } from "@/interfaces/leasing_tenants_interface";



interface LeaseChargeFormProps {
  charge?: Partial<LeaseCharge>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leasecharge: any) => Promise<any>;
  mode: "create" | "edit" | "view";
  disableLeaseField?: boolean; // When true, disables the lease dropdown
  defaultLeaseId?: string;
}

// ---- Empty (default) form data, styled like SpaceForm's emptyFormData) ----
const emptyFormData: Partial<LeaseCharge> = {
  site_id: "",
  building_block_id: "",
  lease_id: "",
  charge_code_id: "",
  period_start: "",
  period_end: "",
  amount: undefined as unknown as number,
  tax_code_id: "",
  tax_pct: 0,
};

const emptyCalculatedAmount = {
  "base_amount": 0,
  "tax_amount": 0,
  "total_amount": 0
}

export function LeaseChargeForm({
  charge,
  isOpen,
  onClose,
  onSave,
  mode,
  disableLeaseField = false,
  defaultLeaseId

}: LeaseChargeFormProps) {
  const getMonthBounds = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    return { startDate: formatDate(start), endDate: formatDate(end) };
  };
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LeaseChargeFormValues>({
    resolver: zodResolver(leaseChargeSchema),
    defaultValues: {
      site_id: "",
      building_block_id: "",
      lease_id: "",
      charge_code_id: "",
      period_start: "",
      period_end: "",
      tax_pct: 0 as any,
      tax_code_id: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const [leaseList, setLeaseList] = useState([]);
  const [taxCodeList, setTaxCodeList] = useState<any[]>([]);
  const [formLoading, setFormLoading] = useState(true);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  //const [isRentAmountLocked, setIsRentAmountLocked] = useState(false);

  const periodStart = watch("period_start");
  const periodEnd = watch("period_end");
  const selectedLeaseId = watch("lease_id");
  const selectedTaxCodeId = watch("tax_code_id");
  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_block_id");

  //const selectedChargeCodeId = watch("charge_code_id");
  const isReadyForCalculation =
    !!selectedLeaseId && !!periodStart && !!periodEnd;

  const isReadOnly = mode === "view";
  const isEdit = mode === "edit";
  const hasPrefill = mode === "create" && !!charge;
  const isLeaseLocked = isReadOnly || isEdit || disableLeaseField;
  const [calculatedAmount, setCalculatedAmount] = useState<any>(emptyCalculatedAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [siteFallback, setSiteFallback] = useState<{
    id: string;
    label: string;
  } | null>(null);

  // Trigger validation when either date changes
  useEffect(() => {
    if (periodStart && periodEnd) {
      // Only trigger validation when both dates are filled
      setTimeout(() => {
        trigger("period_end");
      }, 0);
    }
  }, [periodStart, periodEnd, trigger]);

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [charge, isOpen, mode, reset]);


  useEffect(() => {

    if (!isReadyForCalculation) {
      setCalculatedAmount(emptyCalculatedAmount);
      return;
    }

    const fetchAmount = async () => {

      try {
        setIsLoading(true);

        const res = await leaseChargeApiService.getLeaseRentAmount({
          lease_id: selectedLeaseId,
          tax_code_id: selectedTaxCodeId || undefined,
          start_date: periodStart,
          end_date: periodEnd,
        });

        setCalculatedAmount(res.data ?? emptyCalculatedAmount);

      } finally {
        setIsLoading(false);
      }
    };

    fetchAmount();

  }, [selectedLeaseId, periodStart, periodEnd]);

  const loadAll = async () => {
    setFormLoading(true);

    if (charge && mode !== "create") {
      console.log("edit mode charge data", charge);
      reset({
        site_id: charge?.site_id || "",
        building_block_id: charge?.building_block_id || "",
        lease_id: (charge.lease_id as any) || "",
        charge_code_id: (charge.charge_code_id as any) || "",
        period_start: charge.period_start || "",
        period_end: charge.period_end || "",
        tax_pct: (charge.tax_pct as any) ?? 0,
        tax_code_id: charge.tax_code_id || "", // ✅ Add this
      });
    } else {
      const { startDate, endDate } = getMonthBounds();
      reset({
        site_id: "",
        building_block_id: "",
        lease_id: (charge?.lease_id as any) || "",
        charge_code_id: "",
        period_start: startDate,
        period_end: endDate,
        tax_pct: 0 as any,
        tax_code_id: "", // ✅ Add this
      });
    }

    const [sites] = await Promise.all([loadSites(), loadTaxCodeLookup()]);
    if (charge && (mode !== "create" || hasPrefill)) {
      const siteId =
        charge?.site_id ||
        sites.find((s: any) => s.name === (charge as any)?.site_name)?.id ||
        "";
      if (siteId) {
        setValue("site_id", siteId);
        setSiteFallback({
          id: siteId,
          label: (charge as any)?.site_name || "Selected Site",
        });
        const buildings = await loadBuildings(siteId);
        const buildingId =
          charge?.building_block_id ||
          buildings.find((b: any) => b.name === (charge as any)?.building_name)
            ?.id ||
          "";
        await loadLeaseLookup(siteId, buildingId);
        if (buildingId) {
          setValue("building_block_id", buildingId);
        }
      }
      if (charge?.lease_id || defaultLeaseId) {
        setValue("lease_id", charge?.lease_id || defaultLeaseId || "");
      }
    } else {
      setSiteFallback(null);
    }

    setFormLoading(false);
  };

  useEffect(() => {
    if (selectedSiteId) {
      loadBuildings(selectedSiteId);
      loadLeaseLookup(selectedSiteId, selectedBuildingId);
      // Clear space selection when building changes
      if (selectedBuildingId) {
        // Don't clear if we're in edit mode or have a prefilled record
        if (mode === "create" && !hasPrefill) {
          setValue("lease_id", "");
        }
      }
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId, selectedBuildingId]);

  const loadLeaseLookup = async (siteId, buildingId) => {
    if (!siteId) {
      setLeaseList([]);
      return [];
    }

    const lookup = await leasesApiService.getLeaseLookup(siteId, buildingId);
    if (lookup.success) setLeaseList(lookup.data || []);
  };

  const loadSites = async () => {
    const sites = await siteApiService.getSiteLookup();
    const list = sites?.success ? sites.data || [] : [];
    setSiteList(list);
    return list;
  };

  const loadBuildings = async (siteId: string) => {
    const lookup = await buildingApiService.getBuildingLookup(siteId);
    const list = lookup?.success ? lookup.data || [] : [];
    setBuildingList(list);
    return list;
  };


  const loadTaxCodeLookup = async () => {
    const lookup = await leaseChargeApiService.getTaxCodeLookup();
    if (lookup.success) setTaxCodeList(lookup.data || []);
  };

  const onSubmitForm = async (data: LeaseChargeFormValues) => {
    const formResponse = await onSave(data);
  };

  const fallbackLease = charge?.lease_id
    ? {
      id: charge.lease_id,
      name: (charge as any).lease_name || charge.lease_id || "Selected Space With Lease",
    }
    : null;

  const leases = withFallback(leaseList, fallbackLease);

  const fallbackBuilding = charge?.building_block_id
    ? {
      id: charge.building_block_id,
      name:
        (charge as any).building_block ||
        `Building (${charge.building_block_id})`,
    }
    : null;

  const buildings = withFallback(buildingList, fallbackBuilding);

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList([]);
    setSiteFallback(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Rent Charge"}
            {mode === "edit" && "Edit Rent Charge"}
            {mode === "view" && "Lease Rent Details"}
          </DialogTitle>
        </DialogHeader>

        {formLoading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <form
            onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
            className="space-y-4"
          >
            {/* Lease */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="site_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Site *</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("building_block_id", "");
                          setValue("lease_id", "");
                        }}
                        disabled={isReadOnly || isEdit || hasPrefill}
                      >
                        <SelectTrigger>
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
                    </div>
                  )}
                />
                <div className="space-y-2">
                  <Label>Building</Label>
                  <Controller
                    name="building_block_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("lease_id", "");
                        }}
                        disabled={
                          isReadOnly ||
                          isEdit ||
                          hasPrefill ||
                          buildings.length === 0
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select building" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>


              </div>
            </div>
            <div className="grid gri-cols-1">
              <div>
                <Label htmlFor="lease">Space *</Label>
                <Controller
                  name="lease_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLeaseLocked}
                    >
                      <SelectTrigger
                        disabled={isLeaseLocked}
                        className={errors.lease_id ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select lease" />
                      </SelectTrigger>
                      <SelectContent>
                        {leases.map((lease: any) => (
                          <SelectItem key={lease.id} value={lease.id}>
                            {lease.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.lease_id && (
                  <p className="text-sm text-red-500">
                    {errors.lease_id.message as any}
                  </p>
                )}
              </div>
            </div>
            {/* Charge Code */}
            {/* <div>
              <Label htmlFor="charge_code_id">Charge Code *</Label>
              <Controller
                name="charge_code_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isChargeCodeLocked}
                  >
                    <SelectTrigger
                      disabled={isChargeCodeLocked}
                      className={errors.charge_code_id ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {chargeCodeList.map((code: any) => (
                        <SelectItem key={code.id} value={code.id}>
                          {code.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.charge_code_id && (
                <p className="text-sm text-red-500">
                  {errors.charge_code_id.message as any}
                </p>
              )}
            </div> */}
            {/* Payer Type - NEW FIELD */}
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Period Start *</Label>
                <Input
                  type="date"
                  disabled={isReadOnly}
                  {...register("period_start", {
                    onBlur: () => {
                      if (periodEnd) trigger("period_end");
                    },
                  })}
                  className={errors.period_start ? "border-red-500" : ""}
                />
                {errors.period_start && (
                  <p className="text-sm text-red-500">
                    {errors.period_start.message as any}
                  </p>
                )}
              </div>
              <div>
                <Label>Period End *</Label>
                <Input
                  type="date"
                  disabled={isReadOnly}
                  {...register("period_end", {
                    onBlur: () => {
                      if (periodStart) trigger("period_end");
                    },
                  })}
                  className={errors.period_end ? "border-red-500" : ""}
                />
                {errors.period_end && (
                  <p className="text-sm text-red-500">
                    {errors.period_end.message as any}
                  </p>
                )}
              </div>
            </div>
            {/* Amounts */}
            <div className="grid grid-cols-2 gap-6 items-center mt-4">
              <div className="rounded-lg border bg-muted/40 p-4">

                {isLoading ? (
                  <span className="text-sm text-muted-foreground">
                    Calculating...
                  </span>
                ) : (
                  <div className="flex items-center justify-between">

                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Rent Amount
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Auto calculated
                      </p>
                    </div>

                    <p className="text-xl font-semibold tabular-nums">
                      ₹ {calculatedAmount?.base_amount ?? "0.00"}
                    </p>

                  </div>
                )}

              </div>

              {/* Info Section */}
              <div className="text-sm text-muted-foreground leading-relaxed">
                Amount will be calculated automatically after selecting
                space and dates.
              </div>

            </div>



            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {mode === "view" ? "Close" : "Cancel"}
              </Button>
              {mode !== "view" && (
                <Button type="submit" disabled={isSubmitting || formLoading}>
                  {isSubmitting
                    ? "Saving..."
                    : mode === "create"
                      ? "Create Charge"
                      : "Update Charge"}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}