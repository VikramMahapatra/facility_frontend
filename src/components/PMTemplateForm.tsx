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

interface PMTemplate {
  id?: string;
  name?: string;
  category_id?: string;
  asset_category?: string;
  frequency?: string;
  next_due?: string;
  checklist?: string;
  meter_metric?: string;
  threshold?: number;
  sla?: string;
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
  checklist: null,
  meter_metric: "",
  threshold: 0,
  sla: null,
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
    if (template) {
      setFormData(template);
    } else {
      setFormData(emptyFormData);
    }
    loadCategoryLookup();
    loadFrequencyLookup();
    loadStatusLookup();
  }, [template]);

  const loadCategoryLookup = async () => {
    const lookup = await preventiveMaintenanceApiService.getPreventiveMaintenanceCategoryLookup();
    setCategoryList(lookup || []);
  };

  const loadFrequencyLookup = async () => {
    const lookup = await preventiveMaintenanceApiService.getPreventiveMaintenanceFrequencyLookup();
    setFrequencyList(lookup || []);
  };

  const loadStatusLookup = async () => {    
      const lookup = await preventiveMaintenanceApiService.getPreventiveMaintenanceStatusLookup();
      setStatusList(lookup || []);
    }

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

          {/* Checklist */}
          <div>
            <Label htmlFor="checklist">Checklist Items</Label>
            <Textarea
              id="checklist"
              value={formData.checklist || ""}
              onChange={(e) => {
                setFormData({ ...formData, checklist: e.target.value });
              }}
              placeholder="Enter checklist items (e.g. Check oil levels, Inspect filters, Test functionality)"
              disabled={isReadOnly}
              rows={4}
            />
          </div>

          {/* SLA */}
          <div>
            <Label htmlFor="sla">SLA Configuration</Label>
            <Textarea
              id="sla"
              value={formData.sla || ""}
              onChange={(e) => {
                setFormData({ ...formData, sla: e.target.value });
              }}
              placeholder="Enter SLA configuration (e.g., Response time: 2 hours, Resolution time: 24 hours)"
              disabled={isReadOnly}
              rows={3}
            />
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
