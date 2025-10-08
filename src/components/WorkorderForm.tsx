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
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { workOrderApiService } from "@/services/maintenance_assets/workorderapi";
import { assetApiService } from "@/services/maintenance_assets/assetsapi";
import { serviceRequestApiService } from "@/services/maintenance_assets/servicerequestapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import {
  WorkOrder,
  WorkOrderPriority,
  WorkOrderStatus,
  WorkOrderType,
} from "@/interfaces/assets_interface";

interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  onSave: (workOrder: Partial<WorkOrder>) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData = {
  site_id: "",
  space_id: "",
  title: "",
  description: "",
  priority: "medium" as const,
  status: "open" as const,
  type: "corrective" as const,
  asset_id: null,
  due_at: null,
  sla: {
    response_time: "",
  },
};

export function WorkOrderForm({
  workOrder,
  isOpen,
  onClose,
  onSave,
  mode,
}: WorkOrderFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<WorkOrder>>(emptyFormData);
  const [siteList, setSiteList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [serviceRequestList, setServiceRequestList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);

  useEffect(() => {
    if (workOrder) {
      setFormData(workOrder);
    } else {
      setFormData(emptyFormData);
    }
    loadSiteLookup();
    loadSpaceLookup();
    loadAssetLookup();
    loadStatusLookup();
    loadServiceRequestLookup();
    loadPriorityLookup();
  }, [workOrder]);

  useEffect(() => {
    loadSpaceLookup();
  }, [formData.site_id]);

  useEffect(() => {
    loadAssetLookup();
  }, [formData.asset_id]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  };

  const loadSpaceLookup = async () => {
    if (!formData.site_id) {
      setSpaceList([]);
      return;
    }
    try {
      const spaces = await spacesApiService.getSpaceLookup(formData.site_id);
      setSpaceList(spaces || []);
    } catch {
      setSpaceList([]);
    }
  };

  const loadAssetLookup = async () => {
    const lookup = await assetApiService.getAssetLookup();
    setAssetList(lookup || []);
  };

  const loadStatusLookup = async () => {
    const lookup = await workOrderApiService.getWorkOrderStatusLookup();
    setStatusList(lookup || []);
  };

  const loadPriorityLookup = async () => {
    const lookup = await workOrderApiService.getWorkOrderPriorityLookup();
    setPriorityList(lookup || []);
  };

  const loadServiceRequestLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestLookup();
      setServiceRequestList(Array.isArray(rows) ? rows : []);
    } catch {
      setServiceRequestList([]);
    }
  };

  const handleSLAFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, sla: { ...prev.sla, [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.site_id) {
      toast({
        title: "Validation Error",
        description: "Title and Site are required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const orgData = await organisationApiService.getOrg();
      const workOrderData = {
        ...workOrder,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: formData.status,
        type: formData.type,
        site_id: formData.site_id,
        space_id: formData.space_id || null,
        request_id: formData.request_id || null,
        asset_id: formData.asset_id || null,
        due_at: formData.due_at,
        sla: formData.sla?.response_time ? formData.sla : null,
        org_id: orgData.id,
        updated_at: new Date().toISOString(),
      };

      console.log("WorkOrder payload:", workOrderData);
      onSave(workOrderData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get organization data",
        variant: "destructive",
      });
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Work Order"}
            {mode === "edit" && "Edit Work Order"}
            {mode === "view" && "Work Order Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Title | Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., AC Not Cooling Properly"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: WorkOrderStatus) =>
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
          </div>

          {/* Row 2: Site | Space */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site">Site *</Label>
              <Select
                value={formData.site_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, site_id: value, space_id: "" })
                }
                disabled={isReadOnly}
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
            <div>
              <Label htmlFor="space">Space</Label>
              <Select
                value={formData.space_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, space_id: value })
                }
                disabled={isReadOnly || !formData.site_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select space (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {spaceList.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Asset | Service Request */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asset">Asset</Label>
              <Select
                value={formData.asset_id || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    asset_id: value === "none" ? null : value,
                  })
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
            </div>
            <div>
              <Label htmlFor="service_request">Service Request</Label>
              <Select
                value={formData.request_id || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    request_id: value !== "none" ? value : null,
                  })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service request (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Service Request</SelectItem>
                  {serviceRequestList.map((sr: any) => (
                    <SelectItem key={sr.id} value={sr.id}>
                      {sr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Priority | Type | Response Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: WorkOrderPriority) =>
                  setFormData({ ...formData, priority: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityList.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: WorkOrderType) =>
                  setFormData({ ...formData, type: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sla">Response Time</Label>
              <Select
                value={formData.sla?.response_time || ""}
                onValueChange={(value) =>
                  handleSLAFieldChange("response_time", value)
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Response time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="48h">48 Hours</SelectItem>
                  <SelectItem value="72h">72 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed description of the work order..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>

          {/* Row 6: Due Date */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="due_at">Due Date</Label>
              <Input
                id="due_at"
                type="datetime-local"
                value={formData.due_at ? formData.due_at.slice(0, 16) : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    due_at: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                disabled={isReadOnly}
                className="w-48"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit">
                {mode === "create" ? "Create Work Order" : "Update Work Order"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
