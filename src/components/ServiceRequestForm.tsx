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
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { serviceRequestApiService } from "@/services/maintenance_assets/servicerequestapi";
import { leasesApiService } from "@/services/Leasing_Tenants/leasesapi";

export type ServiceRequestPriority = "low" | "medium" | "high" | "urgent";
export type ServiceRequestStatus   = "open" | "in_progress" | "on_hold" | "resolved" | "closed" | "cancelled";
export type ServiceRequestChannel  = "portal" | "email" | "phone" | "walkin" | "api";
export type ServiceRequesterKind   = "resident" | "merchant" | "guest" | "staff" | "other";
export type Category = "Maintenance" | "Housekeeping" | "Security" | "Utilities" | string;

export interface ServiceRequest {
  id?: string;
  org_id?: string;
  site_id: string;
  space_id?: string | null;
  requester_kind: ServiceRequesterKind;
  requester_id?: string | null;
  category?: string;
  channel: ServiceRequestChannel;
  description?: string | null;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  sla?: { duration?: string } | null;
  linked_work_order_id?: string | null;
  created_at?: string;
  updated_at?: string;

}

interface ServiceRequestFormProps {
  serviceRequest?: ServiceRequest;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ServiceRequest>) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData: ServiceRequest = {
  site_id: "",
  space_id: "",
  requester_kind: "guest",
  requester_id:"",
  category: "",
  channel: "portal",
  description: "",
  priority: "medium",
  status: "open",
  sla: { duration: "" },
  linked_work_order_id: "",
};

export function ServiceRequestForm({
  serviceRequest,
  isOpen,
  onClose,
  onSave,
  mode,
}: ServiceRequestFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<ServiceRequest>>(emptyFormData);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [priorityList, setPriorityList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [channelList, setChannelList] = useState<any[]>([]);
  const [requesterKindList, setRequesterKindList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const[workOrderList, setWorkOrderList]=useState<any[]>([]);

 useEffect(() => {
  const kind = serviceRequest?.requester_kind || emptyFormData.requester_kind;

  if (serviceRequest) {
    console.log("selected service request:", serviceRequest);
    setFormData(serviceRequest);
  } else {
    setFormData(emptyFormData);
  }
    loadSiteLookup();
    loadSpaceLookup();
    loadStatusLookup();
    loadPriorityLookup();
    loadCategoryLookup();
    loadChannelLookup();
    loadRequesterKindLookup();
    loadServiceRequestFilterWorkorderLookup();

    loadCustomerLookup(kind, serviceRequest?.site_id);
}, [serviceRequest]);

  useEffect(() => {
    loadCustomerLookup(formData.requester_kind, formData.site_id);
  }, [formData.requester_kind, formData.site_id]);

  useEffect(() => {

    loadSpaceLookup();
  }, [formData.site_id]);

  useEffect(() => {
    if (!serviceRequest) return;

    console.log("selectedservicerequest",serviceRequest)

   
      setFormData((prev) => ({ ...prev, requester_id: String(serviceRequest.requester_id) }));
    
  }, [customerList]);

  const loadSiteLookup = async () => {
    try {
      const rows = await siteApiService.getSiteLookup();
      setSiteList(rows || []);
    } catch {
      setSiteList([]);
    }
  };
  
  const loadServiceRequestFilterWorkorderLookup = async () => {
    try {
      const rows = await serviceRequestApiService. getServiceRequestFilterWorkorderLookup();
      setWorkOrderList(rows || []);
    } catch {
      setWorkOrderList([]);
    }
  };

  const loadSpaceLookup = async () => {
    if (!formData.site_id) {
      setSpaceList([]);
      return;
    }
    try {
      const rows = await spacesApiService.getSpaceLookup(formData.site_id as string);
      setSpaceList(rows || []);
    } catch {
      setSpaceList([]);
    }
  };

  const loadStatusLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestStatusLookup();
      setStatusList(rows || []);
    } catch {
      setStatusList([]);
    }
  };

  const loadPriorityLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestPriorityLookup();
      setPriorityList(rows || []);
    } catch {
      setPriorityList([]);
    }
  };

  const loadCategoryLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestCategoryLookup();
      setCategoryList(rows || []);
    } catch {
      setCategoryList([]);
    }
  };

  const loadChannelLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestChannelLookup();
      setChannelList(rows || []);
    } catch {
      setChannelList([]);
    }
  };

  const loadRequesterKindLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestRequesterKindLookup();
      setRequesterKindList(rows || []);
    } catch {
      setRequesterKindList([]);
    }
  };

  const loadCustomerLookup = async (kind?: string, site_id?: string) => {
    if (!kind || !site_id) return;
    
    const Kind = kind === "resident" ? "individual" : kind === "merchant" ? "commercial" : kind;
    const lookup = await leasesApiService.getLeasePartnerLookup(Kind, site_id);
    setCustomerList(lookup);
  };


  const handleSLAFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      sla: { ...(prev.sla || {}), [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.site_id) {
      toast({
        title: "Validation Error",
        description: "Site is a required field",
        variant: "destructive",
      });
      return;
    }

    try {
      const orgData = await organisationApiService.getOrg();
      const payload: Partial<ServiceRequest> = {
        ...serviceRequest,
        site_id: formData.site_id,
        space_id: formData.space_id || null,
        requester_kind: formData.requester_kind as ServiceRequesterKind,
        requester_id: formData.requester_id || null,
        category: formData.category || "",
        channel: (formData.channel as ServiceRequestChannel) || "portal",
        description: formData.description || null,
        priority: (formData.priority as ServiceRequestPriority) || "medium",
        status: (formData.status as ServiceRequestStatus) || "open",
        linked_work_order_id: formData.linked_work_order_id || null,
        sla:
          formData.sla && formData.sla.duration
            ? { duration: formData.sla.duration }
            : null,
        org_id: orgData?.id,
        updated_at: new Date().toISOString(),
      };

      onSave(payload);
    } catch {
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
            {mode === "create" && "Create Service Request"}
            {mode === "edit" && "Edit Service Request"}
            {mode === "view" && "Service Request Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Site | Space */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site">Site *</Label>
              <Select
                value={formData.site_id || ""}
                onValueChange={(value) => {
                  setFormData({ ...formData, site_id: value, space_id: "", requester_id: "" });
                  loadCustomerLookup(formData.requester_kind, value);
                }}
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
                value={(formData.space_id as string) || ""}
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

          {/* Row 2: Priority | Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={(formData.priority as string) || "medium"}
                onValueChange={(value: ServiceRequestPriority) =>
                  setFormData({ ...formData, priority: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityList.map((priority: any) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={(formData.status as string) || "open"}
                onValueChange={(value: ServiceRequestStatus) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
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
            </div>
          </div>

          {/* Row 3: Category | Channel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={(formData.category as string) || ""}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={(formData.channel as string) || "portal"}
                onValueChange={(value: ServiceRequestChannel) =>
                  setFormData({ ...formData, channel: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channelList.map((ch: any) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Requester Kind | Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="Requester_kind">Requester Kind *</Label>
              <Select
                name="Requester_kind"
                value={(formData.requester_kind as string) || "resident"}
                onValueChange={(value: ServiceRequesterKind) => {
                  setFormData({ ...formData, requester_kind: value, requester_id: "" });
                  loadCustomerLookup(value, formData.site_id);
                }}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select requester kind" />
                </SelectTrigger>
                <SelectContent>
                  {requesterKindList.map((rk: any) => (
                    <SelectItem key={rk.id} value={rk.id}>
                      {rk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="requester_id">Requester*</Label>
              <Select
                key={customerList.map(c => c.id).join("-")}
                name="requester_id"
                value={formData.requester_id || ""}
                onValueChange={(value) => setFormData({ ...formData, requester_id: value })}
                disabled={isReadOnly || !formData.site_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Requester" />
                </SelectTrigger>
                <SelectContent>
                  {customerList.map((cust) => (
                    <SelectItem key={cust.id} value={cust.id}>
                      {cust.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: Linked Work Order | Response Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linked_work_order_id">Linked Work Order</Label>
              <Select
                value={(formData.linked_work_order_id as string) || ""}
                onValueChange={(value) => setFormData({ ...formData, linked_work_order_id: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work order (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {workOrderList.map((wo: any) => (
                    <SelectItem key={wo.id} value={wo.id}>
                      #{String(wo.name || wo.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sla">Response Time</Label>
              <Select
                value={formData.sla?.duration || ""}
                onValueChange={(value) => handleSLAFieldChange("duration", value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select response time" />
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

          {/* Row 6: Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the request..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit">
                {mode === "create" ? "Create Service Request" : "Update Service Request"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}