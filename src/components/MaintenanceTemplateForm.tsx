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
import { toast } from "sonner";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { SpaceKind, spaceKinds } from "@/interfaces/spaces_interfaces";

export interface MaintenanceTemplate {
  id?: string;
  org_id?: string;
  name: string;
  calculation_type: "flat" | "per_sqft" | "per_bed" | "custom";
  amount: number;
  category?: "residential" | "commercial";
  kind?: SpaceKind;
  site_id?: string;
  site_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

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
  { value: "per_bed", label: "Per Bed" },
  { value: "custom", label: "Custom" },
];

const emptyFormData: MaintenanceTemplateFormValues = {
  name: "",
  calculation_type: "flat",
  amount: 0,
  category: undefined,
  kind: undefined,
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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceTemplateFormValues>({
    resolver: zodResolver(maintenanceTemplateSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    loadSiteLookup();
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

  const onSubmitForm = async (data: MaintenanceTemplateFormValues) => {
    setIsSubmitted(true);
    const formResponse = await onSave({
      ...template,
      ...data,
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
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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



          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="kind">Kind</Label>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? undefined : value)
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger
                      className={errors.kind ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select kind" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Kinds</SelectItem>
                      {spaceKinds.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
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

            <div className="space-y-2">
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
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
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
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

          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Controller
                name="calculation_type"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="calculation_type">Calculation Type *</Label>
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
              <Label htmlFor="amount">Monthly Amount *</Label>
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
                <p className="text-sm text-red-500">{errors.amount.message}</p>
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
  );
}
