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
import { WorkOrderFormValues, workorderSchema } from "@/schemas/workorder.schema";
import { toast } from "@/components/ui/app-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { workOrderApiService } from "@/services/maintenance_assets/workorderapi";
import { assetApiService } from "@/services/maintenance_assets/assetsapi";
import { serviceRequestApiService } from "@/services/maintenance_assets/servicerequestapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { vendorsApiService } from "@/services/procurements/vendorsapi";
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

const emptyFormData: WorkOrderFormValues = {
  site_id: "",
  space_id: "",
  title: "",
  description: "",
  priority: "medium",
  status: "open",
  type: "corrective",
  asset_id: null,
  vendor_id: "",
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
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workorderSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [siteList, setSiteList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [serviceRequestList, setServiceRequestList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [vendorList, setVendorList] = useState([]);

  const selectedSiteId = watch("site_id");

  useEffect(() => {
    if (workOrder && mode !== "create") {
      reset({
        title: workOrder.title || "",
        site_id: workOrder.site_id || "",
        space_id: workOrder.space_id || "",
        asset_id: workOrder.asset_id || null,
        vendor_id: workOrder.assigned_to || "",
        request_id: workOrder.request_id || null,
        priority: workOrder.priority || "medium",
        status: workOrder.status || "open",
        type: workOrder.type || "corrective",
        description: workOrder.description || "",
        due_at: workOrder.due_at ? workOrder.due_at.slice(0, 16) : null,
        sla: workOrder.sla || { response_time: "" },
      });
    } else {
      reset(emptyFormData);
    }
    loadSiteLookup();
    loadAssetLookup();
    loadStatusLookup();
    loadServiceRequestLookup();
    loadPriorityLookup();
    loadVendorLookup();
  }, [workOrder, mode, reset]);

  useEffect(() => {
    if (selectedSiteId) {
      loadSpaceLookup(selectedSiteId);
    } else {
      setSpaceList([]);
    }
  }, [selectedSiteId]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadSpaceLookup = async (siteId: string) => {
    try {
      const spaces = await spacesApiService.getSpaceLookup(siteId);
      if (spaces.success) setSpaceList(spaces.data || []);
    } catch {
      setSpaceList([]);
    }
  };

  const loadAssetLookup = async () => {
    const lookup = await assetApiService.getAssetLookup();
    if (lookup.success) setAssetList(lookup.data || []);
  };

  const loadStatusLookup = async () => {
    const lookup = await workOrderApiService.getWorkOrderStatusLookup();
    if (lookup.success) setStatusList(lookup.data || []);
  };

  const loadPriorityLookup = async () => {
    const lookup = await workOrderApiService.getWorkOrderPriorityLookup();
    if (lookup.success) setPriorityList(lookup.data || []);
  };

  const loadVendorLookup = async () => {
    const vendors = await vendorsApiService.getVendorLookup().catch(() => []);
    if (Array.isArray(vendors)) {
      setVendorList(vendors);
    } else if (vendors?.success) {
      setVendorList(vendors.data || []);
    } else {
      setVendorList([]);
    }
  };

  const loadServiceRequestLookup = async () => {
    const lookup = await serviceRequestApiService.getServiceRequestLookup();
    if (lookup.success) setServiceRequestList(lookup.data || []);
  };

  const onSubmitForm = async (data: WorkOrderFormValues) => {
    try {
      const orgData = await organisationApiService.getOrg();
      const workOrderData = {
        ...workOrder,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        type: data.type,
        site_id: data.site_id,
        space_id: data.space_id || null,
        request_id: data.request_id || null,
        asset_id: data.asset_id || null,
        assigned_to: data.vendor_id || null,
        due_at: data.due_at ? new Date(data.due_at).toISOString() : null,
        sla: data.sla?.response_time ? data.sla : null,
        org_id: orgData?.data?.id,
        updated_at: new Date().toISOString(),
      };

      await onSave(workOrderData);
      reset(emptyFormData);
      onClose();
    } catch (error) {
      reset(undefined, { keepErrors: true, keepValues: true });
      toast.error("Failed to save work order");
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

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Row 1: Title | Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., AC Not Cooling Properly"
                disabled={isReadOnly}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
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
          </div>

          {/* Row 2: Site | Space */}
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
                      setValue("space_id", "");
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

          {/* Row 3: Asset | Vendor */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="asset_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="asset_id">Asset</Label>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
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
              )}
            />
            <Controller
              name="vendor_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="vendor_id">Vendor</Label>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Vendor</SelectItem>
                      {vendorList.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>

          {/* Row 4: Service Request */}
          <div className="grid grid-cols-1 gap-4">
            <Controller
              name="request_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="request_id">Service Request</Label>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) => field.onChange(value !== "none" ? value : null)}
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
              )}
            />
          </div>

          {/* Row 4: Priority | Type | Response Time */}
          <div className="grid grid-cols-3 gap-4">
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
                      {priorityList.map((priority) => (
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
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name="sla.response_time"
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
              )}
            />
          </div>

          {/* Row 5: Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Detailed description of the work order..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>

          {/* Row 6: Due Date */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_at">Due Date</Label>
              <Input
                id="due_at"
                type="datetime-local"
                {...register("due_at")}
                disabled={isReadOnly}
                className="w-48"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Work Order" : "Update Work Order"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
