import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PMTemplateFormValues, pmTemplateSchema } from "@/schemas/pmTemplate.schema";
import { toast } from "sonner";
import { preventiveMaintenanceApiService } from "@/services/maintenance_assets/preventive_maintenanceapi";
//import { siteApiService } from "@/services/spaces_sites/sitesapi";

interface ChecklistItem {
  step: number;
  pass_fail: boolean;
  instruction: string;
}

interface SLAConfig {
  priority: string;
  resolve_hrs: number;
  response_hrs: number;
}

interface PMTemplate {
  id?: string;
  name?: string;
  category_id?: string;
  asset_category?: string;
  frequency?: string;
  next_due?: string;
  checklist?: ChecklistItem[];
  meter_metric?: string;
  threshold?: number;
  sla?: SLAConfig;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface PMTemplateFormProps {
  template?: PMTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Partial<PMTemplate>) => void;
  mode: "create" | "edit" | "view";
}

const defaultChecklistItem: ChecklistItem = { step: 1, pass_fail: false, instruction: "" };

const emptyFormData: PMTemplateFormValues = {
  name: "",
  category_id: null,
  frequency: "",
  status: "",
  next_due: null,
  checklist: [defaultChecklistItem],
  meter_metric: "",
  threshold: undefined,
  sla: {
    priority: "",
    resolve_hrs: undefined,
    response_hrs: undefined,
  },
};

export function PMTemplateForm({
  template,
  isOpen,
  onClose,
  onSave,
  mode,
}: PMTemplateFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PMTemplateFormValues>({
    resolver: zodResolver(pmTemplateSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [categoryList, setCategoryList] = useState([]);
  const [frequencyList, setFrequencyList] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const checklist = watch("checklist") || [];

  useEffect(() => {
    if (template && mode !== "create") {
      reset({
        name: template.name || "",
        category_id: template.category_id || null,
        frequency: template.frequency || "",
        status: template.status || "",
        next_due: template.next_due || null,
        checklist: template.checklist && template.checklist.length > 0
          ? template.checklist
          : [defaultChecklistItem],
        meter_metric: template.meter_metric || "",
        threshold: template.threshold,
        sla: template.sla || {
          priority: "",
          resolve_hrs: undefined,
          response_hrs: undefined,
        },
      });
    } else {
      reset(emptyFormData);
    }
    loadCategoryLookup();
    loadFrequencyLookup();
    loadStatusLookup();
  }, [template, mode, reset]);

  const loadCategoryLookup = async () => {
    const lookup = await preventiveMaintenanceApiService.getPreventiveMaintenanceCategoryLookup();
    if (lookup.success) setCategoryList(lookup.data || []);
  };

  const loadFrequencyLookup = async () => {
    const lookup = await preventiveMaintenanceApiService.getPreventiveMaintenanceFrequencyLookup();
    if (lookup.success) setFrequencyList(lookup.data || []);
  };

  const loadStatusLookup = async () => {    
      const lookup = await preventiveMaintenanceApiService.getPreventiveMaintenanceStatusLookup();
      if (lookup.success) setStatusList(lookup.data || []);
    }

  // Checklist helpers: add, update, remove multiple items
  const addChecklistItem = () => {
    const currentChecklist = getValues("checklist") || [];
    const nextStep = currentChecklist.length + 1;
    const newItem: ChecklistItem = { step: nextStep, pass_fail: false, instruction: "" };
    setValue("checklist", [...currentChecklist, newItem]);
  };

  const updateChecklistItem = (
    index: number,
    field: keyof ChecklistItem,
    value: string | number | boolean
  ) => {
    const currentChecklist = getValues("checklist") || [];
    const updated = [...currentChecklist];
    updated[index] = { ...updated[index], [field]: value } as ChecklistItem;
    setValue("checklist", updated);
  };

  const removeChecklistItem = (index: number) => {
    const currentChecklist = getValues("checklist") || [];
    const remaining = currentChecklist.filter((_, i) => i !== index);
    // Ensure at least one item remains visible
    const ensured = remaining.length === 0 ? [defaultChecklistItem] : remaining;
    // Re-number steps to keep them sequential
    const renumbered = ensured.map((item, i) => ({ ...item, step: i + 1 }));
    setValue("checklist", renumbered);
  };

  const onSubmitForm = async (data: PMTemplateFormValues) => {
    try {
      const templateData = {
        name: data.name,
        category_id: data.category_id || null,
        frequency: data.frequency,
        status: data.status,
        next_due: data.next_due,
        checklist: data.checklist as ChecklistItem[],
        meter_metric: data.meter_metric,
        threshold: data.threshold,
        sla: data.sla ? {
          priority: data.sla.priority || "",
          resolve_hrs: data.sla.resolve_hrs || 0,
          response_hrs: data.sla.response_hrs || 0,
        } as SLAConfig : undefined,
        updated_at: new Date().toISOString(),
      };
      await onSave(templateData);
      reset(emptyFormData);
      onClose();
    } catch (error) {
      reset(undefined, { keepErrors: true, keepValues: true });
      toast.error("Failed to save PM template");
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New PM Template"}
            {mode === "edit" && "Edit PM Template"}
            {mode === "view" && "PM Template Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter template name"
              disabled={isReadOnly}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Category and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="category_id">Asset Category</Label>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categoryList.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.frequency ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyList.map((frequency) => (
                        <SelectItem key={frequency.id} value={frequency.id}>
                          {frequency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.frequency && (
                    <p className="text-sm text-red-500">{errors.frequency.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Status and Next Due */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusList.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="next_due">Next Due Date</Label>
              <Input
                id="next_due"
                type="date"
                {...register("next_due")}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Meter Metric and Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meter_metric">Meter Metric</Label>
              <Input
                id="meter_metric"
                {...register("meter_metric")}
                placeholder="e.g., Hours, Cycles, Days"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                {...register("threshold", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                placeholder="Enter threshold value"
                disabled={isReadOnly}
                className={errors.threshold ? 'border-red-500' : ''}
              />
              {errors.threshold && (
                <p className="text-sm text-red-500">{errors.threshold.message}</p>
              )}
            </div>
          </div>

          {/* Checklist Configuration */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Checklist Configuration</h3>
              {!isReadOnly && (
                <Button type="button" variant="outline" onClick={addChecklistItem}>
                  Add Item
                </Button>
              )}
            </div>
            {errors.checklist && typeof errors.checklist === "object" && !Array.isArray(errors.checklist) && (
              <p className="text-sm text-red-500">{errors.checklist.message}</p>
            )}
            {checklist.length === 0 && (
              <div className="text-sm text-muted-foreground">No items yet. Click Add Item.</div>
            )}

            <div className="space-y-3">
              {checklist.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md">
                  <div className="col-span-2">
                    <Label className="text-xs">Step</Label>
                    <Input
                      type="number"
                      value={item.step}
                      onChange={(e) => updateChecklistItem(index, "step", parseInt(e.target.value) || 0)}
                      disabled={isReadOnly}
                      className={errors.checklist?.[index]?.step ? 'border-red-500' : ''}
                    />
                    {errors.checklist?.[index]?.step && (
                      <p className="text-xs text-red-500">{errors.checklist[index]?.step?.message}</p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Pass/Fail</Label>
                    <Select
                      value={item.pass_fail ? "pass" : "fail"}
                      onValueChange={(value) => updateChecklistItem(index, "pass_fail", value === "pass")}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pass/fail" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-6">
                    <Label className="text-xs">Instruction</Label>
                    <Input
                      value={item.instruction}
                      onChange={(e) => updateChecklistItem(index, "instruction", e.target.value)}
                      placeholder="Enter instruction..."
                      disabled={isReadOnly}
                      className={errors.checklist?.[index]?.instruction ? 'border-red-500' : ''}
                    />
                    {errors.checklist?.[index]?.instruction && (
                      <p className="text-xs text-red-500">{errors.checklist[index]?.instruction?.message}</p>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {!isReadOnly && (
                      <Button type="button" variant="outline" onClick={() => removeChecklistItem(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Configuration */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">SLA Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="sla.priority"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="sla.priority">Priority</Label>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <Controller
                name="sla.response_hrs"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="sla.response_hrs">Response Hours</Label>
                    <Input
                      id="response_hrs"
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value) || 0)}
                      placeholder="e.g., 2"
                      disabled={isReadOnly}
                      className={errors.sla?.response_hrs ? 'border-red-500' : ''}
                    />
                    {errors.sla?.response_hrs && (
                      <p className="text-sm text-red-500">{errors.sla.response_hrs.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="sla.resolve_hrs"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="sla.resolve_hrs">Resolve Hours</Label>
                    <Input
                      id="resolve_hrs"
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value) || 0)}
                      placeholder="e.g., 24"
                      disabled={isReadOnly}
                      className={errors.sla?.resolve_hrs ? 'border-red-500' : ''}
                    />
                    {errors.sla?.resolve_hrs && (
                      <p className="text-sm text-red-500">{errors.sla.resolve_hrs.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Template" : "Update Template"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
