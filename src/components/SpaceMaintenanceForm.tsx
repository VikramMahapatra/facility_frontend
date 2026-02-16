import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { toast } from "sonner";
import { withFallback } from "@/helpers/commonHelper";
import { ownerMaintenancesApiService } from "@/services/spaces_sites/ownermaintenancesapi";
import { Info } from "lucide-react";

interface SpaceMaintenanceFormValues {
  site_id: string;
  building_block_id: string;
  space_id: string;
  owner_user_id: string;
  owner_org_id: string;
  ownership_type: string;
  ownership_percentage: string;
  start_date: string;
  end_date: string;
  due_date: string;
  status: string;
}

interface SpaceMaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: SpaceMaintenanceFormValues) => Promise<any>;
  mode: "create" | "edit" | "view";
  record?: Partial<SpaceMaintenanceFormValues> | null;
  defaultSpaceId?: string;
}

const emptyFormData: SpaceMaintenanceFormValues = {
  site_id: "",
  building_block_id: "",
  space_id: "",
  owner_user_id: "",
  owner_org_id: "",
  ownership_type: "",
  ownership_percentage: "",
  start_date: "",
  end_date: "",
  due_date: "",
  status: "pending",
};

export const SpaceMaintenanceForm = ({
  isOpen,
  onClose,
  onSave,
  mode,
  record,
  defaultSpaceId,
}: SpaceMaintenanceFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SpaceMaintenanceFormValues>({
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [formLoading, setFormLoading] = useState(true);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [siteFallback, setSiteFallback] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(false);

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

  const loadSpaces = async (siteId: string, buildingId?: string) => {
    if (!siteId) {
      setSpaceList([]);
      return [];
    }

    try {
      const lookup =
        await ownerMaintenancesApiService.getSpaceOwnerLookup(siteId, buildingId);
      const list = lookup?.success ? lookup.data || [] : [];
      setSpaceList(list);
      return list;
    } catch (error) {
      console.error("Failed to load spaces:", error);
      setSpaceList([]);
      return [];
    }
  };


  const loadStatusLookup = async () => {
    const lookup =
      await ownerMaintenancesApiService.getOwnerMaintenanceStatusLookup();
    if (lookup?.success) {
      setStatusList(lookup.data || []);
    }
  };

  const loadAll = async () => {
    setFormLoading(true);

    reset(
      record && (mode !== "create" || hasPrefill)
        ? {
          ...emptyFormData,
          ...record,
          site_id: record?.site_id || "",
          building_block_id: record?.building_block_id || "",
          space_id: record?.space_id || defaultSpaceId || "",
          start_date:
            (record as any)?.period_start || record?.start_date || "",
          end_date: (record as any)?.period_end || record?.end_date || "",
          due_date: (record as any)?.due_date || record?.due_date || "",
          status: (record as any)?.status || emptyFormData.status,
        }
        : emptyFormData,
    );
    setFormLoading(false);

    const [sites] = await Promise.all([loadSites(), loadStatusLookup()]);

    if (record && (mode !== "create" || hasPrefill)) {
      const siteId =
        record?.site_id ||
        sites.find((s: any) => s.name === (record as any)?.site_name)?.id ||
        "";
      if (siteId) {
        setValue("site_id", siteId);
        setSiteFallback({
          id: siteId,
          label: (record as any)?.site_name || "Selected Site",
        });
        const buildings = await loadBuildings(siteId);
        const buildingId =
          record?.building_block_id ||
          buildings.find((b: any) => b.name === (record as any)?.building_name)
            ?.id ||
          "";
        await loadSpaces(siteId, buildingId);
        if (buildingId) {
          setValue("building_block_id", buildingId);
        }
      }
      if (record?.space_id || defaultSpaceId) {
        setValue("space_id", record?.space_id || defaultSpaceId || "");
      }
    } else {
      setSiteFallback(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [isOpen, record, defaultSpaceId, reset]);

  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_block_id");
  const selectedSpaceId = watch("space_id");
  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const isReadyForCalculation =
    !!selectedSpaceId && !!startDate && !!endDate;

  useEffect(() => {
    if (selectedSiteId) {
      loadBuildings(selectedSiteId);
      loadSpaces(selectedSiteId, selectedBuildingId);
      // Clear space selection when building changes
      if (selectedBuildingId) {
        // Don't clear if we're in edit mode or have a prefilled record
        if (mode === "create" && !hasPrefill) {
          setValue("space_id", "");
        }
      }
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId, selectedBuildingId]);

  useEffect(() => {

    if (!isReadyForCalculation) {
      setCalculatedAmount(0);
      return;
    }

    const fetchAmount = async () => {

      try {
        setIsLoading(true);

        const res =
          await ownerMaintenancesApiService.getCalculatedMaintenances({
            space_id: selectedSpaceId,
            start_date: startDate,
            end_date: endDate,
          });

        setCalculatedAmount(res.data ?? 0);

      } finally {
        setIsLoading(false);
      }
    };

    fetchAmount();

  }, [selectedSpaceId, startDate, endDate]);



  const isReadOnly = mode === "view";
  const isEditMode = mode === "edit";
  const hasPrefill = mode === "create" && !!record;

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList([]);
    setSpaceList([]);
    setSiteFallback(null);
    setIsSubmitted(false);
    onClose();
  };

  const onSubmitForm = async (data: SpaceMaintenanceFormValues) => {
    setIsSubmitted(true);
    const formResponse = await onSave({
      ...record,
      ...data,
    });
    if (formResponse?.success) {
      reset(emptyFormData);
    }
    setIsSubmitted(false);
  };
  const fallbackSpace = record?.space_id
    ? {
      id: record.space_id,
      name: (record as any).space_name || record.space_id || "Selected Space",
    }
    : null;

  const spaces = withFallback(spaceList, fallbackSpace);

  const fallbackStatus = record?.status
    ? {
      id: record.status,
      name: record.status,
      value: record.status,
    }
    : null;

  const statuses = withFallback(statusList, fallbackStatus);

  const fallbackBuilding = record?.building_block_id
    ? {
      id: record.building_block_id,
      name:
        (record as any).building_block ||
        `Building (${record.building_block_id.slice(0, 6)})`,
    }
    : null;

  const buildings = withFallback(buildingList, fallbackBuilding);


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Space Maintenance"}
            {mode === "edit" && "Edit Space Maintenance"}
            {mode === "view" && "Space Maintenance Details"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={
            isSubmitting
              ? undefined
              : handleSubmit(onSubmitForm, (formErrors) => {
                const firstError = Object.values(formErrors)[0];
                if (firstError?.message) {
                  toast.error(firstError.message as string);
                } else {
                  toast.error(
                    "Please fill in all required fields correctly.",
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
                          setValue("space_id", "");
                        }}
                        disabled={isReadOnly || isEditMode || hasPrefill}
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
                          setValue("space_id", "");
                        }}
                        disabled={
                          isReadOnly ||
                          isEditMode ||
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

                <Controller
                  name="space_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="space_id">Space *</Label>
                      <Select
                        value={
                          field.value &&
                            spaces.some((space: any) => space.id === field.value)
                            ? field.value
                            : undefined
                        }
                        onValueChange={field.onChange}
                        disabled={
                          isReadOnly ||
                          isEditMode ||
                          hasPrefill ||
                          !selectedSiteId
                        }
                      >
                        <SelectTrigger
                          className={errors.space_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder={"Select space"} />
                        </SelectTrigger>
                        <SelectContent>
                          {spaces.map((space: any) => (
                            <SelectItem key={space.id} value={space.id}>
                              {space.name}
                            </SelectItem>
                          ))}
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

                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    {...register("start_date", {
                      required: "Start date is required",
                    })}
                    disabled={isReadOnly || isEditMode}
                    className={errors.start_date ? "border-red-500" : ""}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    {...register("end_date")}
                    min={watch("start_date") || undefined}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    {...register("due_date")}
                    min={watch("start_date") || undefined}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maintenance Amount</Label>

                  <div className="h-10 flex items-center justify-between rounded-md border px-3 text-sm bg-muted">

                    {isLoading ? (
                      <span className="text-muted-foreground">
                        Calculating...
                      </span>
                    ) : (
                      <>
                        <span className="font-medium">
                          ₹ {calculatedAmount ?? "0.00"}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          Auto calculated
                        </span>
                      </>
                    )}

                  </div>

                  {/* Helper text like error message */}
                  {!isReadyForCalculation && (
                    <p className="text-xs text-muted-foreground">
                      Amount will be calculated after selecting space and dates
                    </p>
                  )}
                </div>




              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            {mode !== "view" && (
              <Button
                type="submit"
                disabled={isSubmitting || (isSubmitted && !isValid)}
              >
                {mode === "create" ? "Create" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
