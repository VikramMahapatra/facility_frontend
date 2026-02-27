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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MaintenanceTemplateFormValues,
  maintenanceTemplateSchema,
} from "@/schemas/maintenanceTemplate.schema";
import { toast } from "@/components/ui/app-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import {
  CALCULATION_TYPE_LABELS,
  getKindsByCategory,
  kindToCategory,
  MaintenanceTemplate,
  spaceCategories,
  SpaceKind,
  spaceKinds,
  spaceSubKinds,
} from "@/interfaces/spaces_interfaces";
import { leaseChargeApiService } from "@/services/leasing_tenants/leasechargeapi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import { useSettings } from "@/context/SettingsContext";

interface MaintenanceTemplateFormProps {
  template?: MaintenanceTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Partial<MaintenanceTemplate>) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const calculationTypes = [
  { value: "flat", label: "Flat" },
  { value: "per_sqft", label: "Per Sq Ft" },
];

const emptyFormData: MaintenanceTemplateFormValues = {
  name: "",
  calculation_type: "flat",
  amount: 0,
  category: undefined,
  kind: undefined,
  sub_kind: undefined,
  site_id: undefined,
  is_active: true,
};

export function MaintenanceTemplateForm({
  template,
  isOpen,
  onClose,
  onSave,
  mode,
}: MaintenanceTemplateFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [siteList, setSiteList] = useState<any[]>([]);
  const { systemCurrency } = useSettings();
  const [taxCodeList, setTaxCodeList] = useState<any[]>([]);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] =
    useState<MaintenanceTemplateFormValues | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceTemplateFormValues>({
    resolver: zodResolver(maintenanceTemplateSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    loadSiteLookup();
    loadTaxCodeLookup();
  }, []);

  useEffect(() => {
    if (template && mode !== "create") {
      reset({
        name: template.name || "",
        calculation_type: template.calculation_type || "flat",
        amount: template.amount || 0,
        category: template.category,
        kind: template.kind as any,
        site_id: template.site_id,
        is_active: template.is_active !== undefined ? template.is_active : true,
      });
    } else {
      reset(emptyFormData);
    }
    setIsSubmitted(false);
  }, [template, mode, reset, isOpen]);

  const calculationTypeValue = watch("calculation_type");
  const selectedCategory = watch("category");
  const selectedKind = watch("kind");

  const calculationTypeLabel =
    CALCULATION_TYPE_LABELS[calculationTypeValue] || "";

  const loadSiteLookup = async () => {
    try {
      const response = await siteApiService.getSiteLookup();
      if (response?.success) {
        setSiteList(response.data || []);
      }
    } catch (error) {
      console.error("Error loading sites:", error);
    }
  };

  const loadTaxCodeLookup = async () => {
    const lookup = await leaseChargeApiService.getTaxCodeLookup();
    if (lookup.success) setTaxCodeList(lookup.data || []);
  };

  const onSubmitForm = async (data: MaintenanceTemplateFormValues) => {
    console.log("SUBMIT FIRED", data);
    // Save data temporarily
    if (mode === "create") {
      setPendingSubmitData(data);
      setShowOverrideConfirm(true);
      return;
    }
    // Normal save flow for edit
    await proceedSave(false, data);
  };

  const proceedSave = async (
    overrideExisting: boolean,
    submitData?: MaintenanceTemplateFormValues,
  ) => {
    const finalData = submitData || pendingSubmitData;
    if (!finalData) return;

    setIsSubmitted(true);

    const formResponse = await onSave({
      ...template,
      ...finalData,
      override_existing: overrideExisting,
      updated_at: new Date().toISOString(),
    } as Partial<MaintenanceTemplate>);

    if (formResponse.success) {
      reset(emptyFormData);

      toast.success(
        mode === "create"
          ? "Maintenance template created successfully"
          : "Maintenance template updated successfully",
      );
    } else {
      setIsSubmitted(false);
      reset(undefined, { keepErrors: true, keepValues: true });
    }

    setShowOverrideConfirm(false);
    setPendingSubmitData(null);
  };

  // Filter kinds based on selected category
  const filteredKinds = getKindsByCategory(selectedCategory);

  // Reset kind when category changes if current kind doesn't belong to new category
  useEffect(() => {
    if (selectedCategory && selectedKind) {
      const currentKindCategory = kindToCategory[selectedKind as SpaceKind];
      if (currentKindCategory !== selectedCategory) {
        // Reset to first available kind in the selected category
        const firstKind = filteredKinds[0];
        if (firstKind) {
          setValue("kind", firstKind);
        }
      }
    }
  }, [selectedCategory, selectedKind, filteredKinds, setValue]);

  const isReadOnly = mode === "view";

  const formatCurrency = (val?: number) => {
    if (val == null) return "-";
    return systemCurrency.name;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" && "Create Maintenance Template"}
              {mode === "edit" && "Edit Maintenance Template"}
              {mode === "view" && "Maintenance Template Details"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isReadOnly}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Enter template name"
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
                    <Label htmlFor="site_id">Site</Label>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger
                        className={errors.site_id ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All Sites</SelectItem>
                        {siteList.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
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
            </div>
            <div
              className={`grid ${selectedKind == "apartment" ? "grid-cols-3" : "grid-cols-2"} gap-4`}
            >
              <div className="space-y-2">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="category">Space Category</Label>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? undefined : value)
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.category ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">All Categories</SelectItem>
                          {spaceCategories.map((k) => (
                            <SelectItem key={k} value={k}>
                              {k
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-500">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              <Controller
                name="kind"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="kind">Space Type</Label>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      disabled={isReadOnly || !selectedCategory}
                    >
                      <SelectTrigger
                        className={errors.kind ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            selectedCategory
                              ? "Select space type"
                              : "Select category first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All space types</SelectItem>
                        {filteredKinds.length === 0 ? (
                          <SelectItem value="" disabled>
                            {selectedCategory
                              ? `No ${selectedCategory} types available`
                              : "Select category first"}
                          </SelectItem>
                        ) : (
                          filteredKinds.map((kind) => (
                            <SelectItem key={kind} value={kind}>
                              {kind
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))
                        )}
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
              {selectedKind === "apartment" && (
                <Controller
                  name="sub_kind"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="sub_kind">Sub Type</Label>

                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub type" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="none">All sub types</SelectItem>
                          {spaceSubKinds.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Controller
                  name="calculation_type"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="calculation_type">
                        Calculation Type *
                      </Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={
                            errors.calculation_type ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select calculation type" />
                        </SelectTrigger>
                        <SelectContent>
                          {calculationTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.calculation_type && (
                        <p className="text-sm text-red-500">
                          {errors.calculation_type.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">
                  {`Monthly Amount (${calculationTypeLabel}) (${formatCurrency(0)})`}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("amount")}
                  disabled={isReadOnly}
                  className={errors.amount ? "border-red-500" : ""}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
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
                <Button type="submit" disabled={isSubmitting || isSubmitted}>
                  {isSubmitting
                    ? "Saving..."
                    : mode === "create"
                      ? "Create Template"
                      : "Update Template"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={showOverrideConfirm}
        onOpenChange={setShowOverrideConfirm}
      >
        <AlertDialogPortal>
          <AlertDialogContent className="z-[1000]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Override Existing Template Assignments?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to override existing template assignments for
                matching spaces?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowOverrideConfirm(false)}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction onClick={() => proceedSave(false)}>
                Save Without Override
              </AlertDialogAction>

              <AlertDialogAction
                onClick={() => proceedSave(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Override Existing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}
