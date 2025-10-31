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
import { useToast } from "@/hooks/use-toast";
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

const emptyFormData = {
  name: "",
  category_id: "",
  frequency: "monthly" as const,
  status: "active" as const,
  next_due: null,
  checklist: [] as ChecklistItem[],
  meter_metric: "",
  threshold: 0,
  sla: {
    priority: "",
    resolve_hrs: 0,
    response_hrs: 0,
  } as SLAConfig,
};

export function PMTemplateForm({
  template,
  isOpen,
  onClose,
  onSave,
  mode,
}: PMTemplateFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<PMTemplate>>(emptyFormData);
  const [categoryList, setCategoryList] = useState([]);
  const [frequencyList, setFrequencyList] = useState([]);
  const [statusList, setStatusList] = useState([]);

  useEffect(() => {
    const defaultChecklistItem: ChecklistItem = { step: 1, pass_fail: false, instruction: "" };
    if (template) {
      setFormData({
        ...emptyFormData,
        ...template,
        checklist:
          template.checklist && template.checklist.length > 0
            ? template.checklist
            : [defaultChecklistItem],
        sla: template.sla || {
          priority: "",
          resolve_hrs: 0,
          response_hrs: 0,
        },
      });
    } else {
      setFormData({ ...emptyFormData, checklist: [defaultChecklistItem] });
    }
    loadCategoryLookup();
    loadFrequencyLookup();
    loadStatusLookup();
  }, [template]);

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
    const nextStep = (formData.checklist?.length || 0) + 1;
    const newItem: ChecklistItem = { step: nextStep, pass_fail: false, instruction: "" };
    setFormData((prev) => ({
      ...prev,
      checklist: [...(prev.checklist || []), newItem],
    }));
  };

  const updateChecklistItem = (
    index: number,
    field: keyof ChecklistItem,
    value: string | number | boolean
  ) => {
    const updated = [...(formData.checklist || [])];
    updated[index] = { ...updated[index], [field]: value } as ChecklistItem;
    setFormData({ ...formData, checklist: updated });
  };

  const removeChecklistItem = (index: number) => {
    const remaining = (formData.checklist || []).filter((_, i) => i !== index);
    // Ensure at least one item remains visible
    const ensured =
      remaining.length === 0
        ? [{ step: 1, pass_fail: false, instruction: "" }]
        : remaining;
    // Re-number steps to keep them sequential
    const renumbered = ensured.map((item, i) => ({ ...item, step: i + 1 }));
    setFormData({ ...formData, checklist: renumbered });
  };


  const handleSLAFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, sla: { ...prev.sla, [field]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Name is a required field",
        variant: "destructive",
      });
      return;
    }

    
    const templateData = {
      name: formData.name,
      category_id: formData.category_id || null,
      frequency: formData.frequency,
      status: formData.status,
      next_due: formData.next_due,
      checklist: formData.checklist,
      meter_metric: formData.meter_metric,
      threshold: formData.threshold,
      sla: formData.sla,
      updated_at: new Date().toISOString(),
    };

    onSave(templateData);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Name */}
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter template name"
              disabled={isReadOnly}
            />
          </div>

          {/* Category and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Asset Category</Label>
              <Select
                value={formData.category_id ?? undefined}
                onValueChange={(value) => {
                  if (value === "none") {
                    setFormData({ ...formData, category_id: null as unknown as string });
                  } else {
                    setFormData({ ...formData, category_id: value });
                  }
                }}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {/* Optional none value - must not be empty string for Radix */}
                  <SelectItem value="none">None</SelectItem>
                  {categoryList.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, frequency: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
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
            </div>
          </div>

          {/* Status and Next Due */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
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
            </div>
            <div>
              <Label htmlFor="next_due">Next Due Date</Label>
              <Input
                id="next_due"
                type="date"
                value={formData.next_due ? new Date(formData.next_due).toISOString().split('T')[0] : ""}
                onChange={(e) =>
                  setFormData({ ...formData, next_due: e.target.value })
                }
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Meter Metric and Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meter_metric">Meter Metric</Label>
              <Input
                id="meter_metric"
                value={formData.meter_metric || ""}
                onChange={(e) =>
                  setFormData({ ...formData, meter_metric: e.target.value })
                }
                placeholder="e.g., Hours, Cycles, Days"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={formData.threshold ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFormData({ ...formData, threshold: undefined });
                  } else {
                    setFormData({ ...formData, threshold: Number(value) });
                  }
                }}
                placeholder="Enter threshold value"
                disabled={isReadOnly}
              />
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

            {(formData.checklist || []).length === 0 && (
              <div className="text-sm text-muted-foreground">No items yet. Click Add Item.</div>
            )}

            <div className="space-y-3">
              {(formData.checklist || []).map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md">
                  <div className="col-span-2">
                    <Label className="text-xs">Step</Label>
                    <Input
                      type="number"
                      value={item.step}
                      onChange={(e) => updateChecklistItem(index, "step", parseInt(e.target.value) || 0)}
                      disabled={isReadOnly}
                    />
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
                    />
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
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.sla?.priority || ""}
                  onValueChange={(value) => handleSLAFieldChange("priority", value)}
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
              <div>
                <Label htmlFor="response_hrs">Response Hours</Label>
                <Input
                  id="response_hrs"
                  type="number"
                  value={formData.sla?.response_hrs || ""}
                  onChange={(e) => handleSLAFieldChange("response_hrs", parseInt(e.target.value) || 0)}
                  placeholder="e.g., 2"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="resolve_hrs">Resolve Hours</Label>
                <Input
                  id="resolve_hrs"
                  type="number"
                  value={formData.sla?.resolve_hrs || ""}
                  onChange={(e) => handleSLAFieldChange("resolve_hrs", parseInt(e.target.value) || 0)}
                  placeholder="e.g., 24"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit">
                {mode === "create" ? "Create Template" : "Update Template"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
