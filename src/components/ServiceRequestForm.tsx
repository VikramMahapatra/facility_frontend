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
import { ServiceRequestFormValues, serviceRequestSchema } from "@/schemas/serviceRequest.schema";
import { toast } from "sonner";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { serviceRequestApiService } from "@/services/maintenance_assets/servicerequestapi";
import { leasesApiService } from "@/services/Leasing_Tenants/leasesapi";
import { Reply } from "lucide-react";

export type ServiceRequestPriority = "low" | "medium" | "high" | "urgent";
export type ServiceRequestStatus   = "open" | "in_progress" | "on_hold" | "resolved" | "close";
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

const emptyFormData: ServiceRequestFormValues = {
  site_id: "",
  space_id: null,
  requester_kind: "resident",
  requester_id: null,
  category: "",
  channel: "portal",
  description: "",
  priority: "medium",
  status: "open",
  sla: { duration: "" },
  linked_work_order_id: null,
};

export function ServiceRequestForm({
  serviceRequest,
  isOpen,
  onClose,
  onSave,
  mode,
}: ServiceRequestFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [siteList, setSiteList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [priorityList, setPriorityList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [channelList, setChannelList] = useState<any[]>([]);
  const [requesterKindList, setRequesterKindList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [workOrderList, setWorkOrderList] = useState<any[]>([]);

  // Mock comments until endpoint is ready
  type Comment = { id: string; author: string; ts: string; text: string; replies?: Comment[] };
  const [comments, setComments] = useState<Comment[]>([
    { id: "c1", author: "Agent A", ts: new Date().toISOString(), text: "Ticket created.", replies: [] },
    { id: "c2", author: "Requester", ts: new Date().toISOString(), text: "Please check AC in lobby.", replies: [] },
  ]);
  const [newComment, setNewComment] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const selectedSiteId = watch("site_id");
  const selectedRequesterKind = watch("requester_kind");

  useEffect(() => {
    const kind = serviceRequest?.requester_kind || emptyFormData.requester_kind;

    if (serviceRequest && mode !== "create") {
      const validRequesterKind = (serviceRequest.requester_kind === "resident" || serviceRequest.requester_kind === "merchant") 
        ? serviceRequest.requester_kind 
        : "resident";
      reset({
        site_id: serviceRequest.site_id || "",
        space_id: serviceRequest.space_id || null,
        requester_kind: validRequesterKind,
        requester_id: serviceRequest.requester_id || null,
        category: serviceRequest.category || "",
        channel: serviceRequest.channel || "portal",
        description: serviceRequest.description || "",
        priority: serviceRequest.priority || "medium",
        status: serviceRequest.status || "open",
        sla: serviceRequest.sla || { duration: "" },
        linked_work_order_id: serviceRequest.linked_work_order_id || null,
      });
    } else {
      reset(emptyFormData);
    }
    loadSiteLookup();
    loadStatusLookup();
    loadPriorityLookup();
    loadCategoryLookup();
    loadChannelLookup();
    loadRequesterKindLookup();
    loadServiceRequestFilterWorkorderLookup();
    loadCustomerLookup(kind, serviceRequest?.site_id);
  }, [serviceRequest, mode, reset]);

  // Each ticket should have its own comments (mock for now)
  useEffect(() => {
    if (serviceRequest && serviceRequest.id && mode !== "create") {
      // If backend later returns comments in serviceRequest, use them here.
      // For now, seed with an empty list to ensure comments are isolated per ticket.
      setComments([]);
      setReplyingToId(null);
      setReplyText("");
    } else if (mode === "create") {
      setComments([]);
      setReplyingToId(null);
      setReplyText("");
    }
  }, [serviceRequest?.id, mode]);

  useEffect(() => {
    if (selectedSiteId) {
      loadSpaceLookup(selectedSiteId);
      if (selectedRequesterKind) {
        loadCustomerLookup(selectedRequesterKind, selectedSiteId);
      }
    } else {
      setSpaceList([]);
      setCustomerList([]);
    }
  }, [selectedSiteId, selectedRequesterKind]);

  useEffect(() => {
    if (selectedRequesterKind && selectedSiteId) {
      loadCustomerLookup(selectedRequesterKind, selectedSiteId);
      setValue("requester_id", null);
    }
  }, [selectedRequesterKind, selectedSiteId, setValue]);

  const loadSiteLookup = async () => {
    try {
      const rows = await siteApiService.getSiteLookup();
      if (rows.success) setSiteList(rows.data || []);
    } catch {
      setSiteList([]);
    }
  };
  
  const loadServiceRequestFilterWorkorderLookup = async () => {
    try {
      const rows = await serviceRequestApiService. getServiceRequestFilterWorkorderLookup();
      if (rows.success) setWorkOrderList(rows.data || []);
    } catch {
      setWorkOrderList([]);
    }
  };

  const loadSpaceLookup = async (siteId: string) => {
    try {
      const rows = await spacesApiService.getSpaceLookup(siteId);
      if (rows.success) setSpaceList(rows.data || []);
    } catch {
      setSpaceList([]);
    }
  };

  const loadStatusLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestStatusLookup();
      if (rows.success) setStatusList(rows.data || []);
    } catch {
      setStatusList([]);
    }
  };

  const loadPriorityLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestPriorityLookup();
      if (rows.success) setPriorityList(rows.data || []);
    } catch {
      setPriorityList([]);
    }
  };

  const loadCategoryLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestCategoryLookup();
      if (rows.success) setCategoryList(rows.data || []);
    } catch {
      setCategoryList([]);
    }
  };

  const loadChannelLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestChannelLookup();
      if (rows.success) setChannelList(rows.data || []);
    } catch {
      setChannelList([]);
    }
  };

  const loadRequesterKindLookup = async () => {
    try {
      const rows = await serviceRequestApiService.getServiceRequestRequesterKindLookup();
      if (rows.success) setRequesterKindList(rows.data || []);
    } catch {
      setRequesterKindList([]);
    }
  };

  const loadCustomerLookup = async (kind?: string, site_id?: string) => {
    if (!kind || !site_id) return;
    
    const Kind = kind === "resident" ? "individual" : kind === "merchant" ? "commercial" : kind;
    const lookup = await leasesApiService.getLeasePartnerLookup(Kind, site_id);
    if (lookup.success) setCustomerList(lookup.data || []);
  };

  const onSubmitForm = async (data: ServiceRequestFormValues) => {
    try {
      const orgData = await organisationApiService.getOrg();
      const payload: Partial<ServiceRequest> = {
        ...serviceRequest,
        site_id: data.site_id,
        space_id: data.space_id || null,
        requester_kind: data.requester_kind as ServiceRequesterKind,
        requester_id: data.requester_id || null,
        category: data.category || "",
        channel: data.channel as ServiceRequestChannel,
        description: data.description || null,
        priority: data.priority as ServiceRequestPriority,
        status: data.status as ServiceRequestStatus,
        linked_work_order_id: data.linked_work_order_id || null,
        sla: data.sla?.duration ? { duration: data.sla.duration } : null,
        org_id: orgData?.data?.id,
        updated_at: new Date().toISOString(),
      };

      await onSave(payload);
      reset(emptyFormData);
      onClose();
    } catch (error) {
      reset(undefined, { keepErrors: true, keepValues: true });
      toast("Failed to save service request");
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

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Row 1: Site | Space */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="site_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="site_id">Site *</Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("space_id", null);
                      setValue("requester_id", null);
                    }}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.site_id ? 'border-red-500' : ''}>
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
                  {errors.site_id && (
                    <p className="text-sm text-red-500">{errors.site_id.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name="space_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="space_id">Space</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isReadOnly || !selectedSiteId}
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
              )}
            />
          </div>

          {/* Row 2: Priority | Status */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
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
                  {errors.priority && (
                    <p className="text-sm text-red-500">{errors.priority.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
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
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Row 3: Category | Channel */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
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
              )}
            />
            <Controller
              name="channel"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="channel">Channel</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.channel ? 'border-red-500' : ''}>
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
                  {errors.channel && (
                    <p className="text-sm text-red-500">{errors.channel.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Row 4: Requester Kind | Customer */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="requester_kind"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="requester_kind">Requester Kind *</Label>
                  <Select
                    value={field.value || "resident"}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                        setValue("requester_id", null);
                      }
                    }}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.requester_kind ? 'border-red-500' : ''}>
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
                  {errors.requester_kind && (
                    <p className="text-sm text-red-500">{errors.requester_kind.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name="requester_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="requester_id">Requester</Label>
                  <Select
                    key={customerList.map(c => c.id).join("-")}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isReadOnly || !selectedSiteId || !selectedRequesterKind}
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
              )}
            />
          </div>

          {/* Row 5: Linked Work Order | Response Time */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="linked_work_order_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="linked_work_order_id">Linked Work Order</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
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
              )}
            />
            <Controller
              name="sla.duration"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="sla">Response Time</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
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
              )}
            />
          </div>

          {/* Row 6: Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the request..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>

          {/* Comments (mock for now; to be wired to API) */}
          {mode !== "view" && (
            <div className="space-y-3">
              <Label>Comments</Label>
              <div className="space-y-2 max-h-48 overflow-auto border rounded-md p-2">
                {comments.map((c) => (
                  <div key={c.id} className="border rounded p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{c.author}</div>
                        <div className="text-xs text-muted-foreground">{new Date(c.ts).toLocaleString()}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingToId(c.id);
                          setReplyText("");
                        }}
                        aria-label="Reply"
                      >
                        <Reply className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm mt-1">{c.text}</div>

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-2 space-y-2 pl-4 border-l">
                        {c.replies.map((r) => (
                          <div key={r.id} className="rounded p-2 bg-muted/30">
                            <div className="text-sm font-medium">{r.author}</div>
                            <div className="text-xs text-muted-foreground">{new Date(r.ts).toLocaleString()}</div>
                            <div className="text-sm mt-1">{r.text}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline reply box */}
                    {replyingToId === c.id && (
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            if (!replyText.trim()) return;
                            setComments((prev) =>
                              prev.map((cm) =>
                                cm.id === c.id
                                  ? {
                                      ...cm,
                                      replies: [
                                        ...(cm.replies || []),
                                        { id: `r-${Date.now()}`, author: "You", ts: new Date().toISOString(), text: replyText.trim() },
                                      ],
                                    }
                                  : cm
                              )
                            );
                            setReplyText("");
                            setReplyingToId(null);
                          }}
                          disabled={!replyText.trim()}
                        >
                          Send
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setReplyingToId(null)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-sm text-muted-foreground">No comments yet</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isReadOnly}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!newComment.trim()) return;
                    setComments((prev) => [
                      ...prev,
                      { id: `c-${Date.now()}`, author: "You", ts: new Date().toISOString(), text: newComment.trim(), replies: [] },
                    ]);
                    setNewComment("");
                  }}
                  disabled={isReadOnly || !newComment.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Service Request" : "Update Service Request"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}