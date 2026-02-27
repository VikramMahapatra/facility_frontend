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
import { toast } from "@/components/ui/app-toast";
import { vendorsApiService } from "@/services/procurements/vendorsapi";
import { ticketsApiService } from "@/services/ticketing_service/ticketsapi";
import { ticketWorkOrderApiService } from "@/services/ticketing_service/ticketworkorderapi";
import {
  ticketWorkOrderSchema,
  TicketWorkOrderFormValues,
} from "@/schemas/ticketworkorder.schema";
import { leaseChargeApiService } from "@/services/leasing_tenants/leasechargeapi";
import { withFallback } from "@/helpers/commonHelper";
import { useSettings } from "@/context/SettingsContext";

interface TicketWorkOrderFormProps {
  workOrder?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (workOrder: Partial<any>) => void;
  mode: "create" | "edit" | "view";
  initialTicketId?: string;
}

const emptyFormData: TicketWorkOrderFormValues = {
  ticket_id: "",
  description: "",
  assigned_to: "",
  vendor_name: "",
  bill_to_id: undefined,
  bill_to_type: undefined,
  status: "pending",
  labour_cost: undefined,
  material_cost: undefined,
  other_expenses: undefined,
  estimated_time: 0,
  special_instructions: "",
};

export function TicketWorkOrderForm({
  workOrder,
  isOpen,
  onClose,
  onSave,
  mode,
  initialTicketId,
}: TicketWorkOrderFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TicketWorkOrderFormValues>({
    resolver: zodResolver(ticketWorkOrderSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [taxCodeList, setTaxCodeList] = useState<any[]>([]);
  const [billToList, setBillToList] = useState<any[]>([]);
  const { systemCurrency } = useSettings();
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<any>(null);
  const [isLoadingTicketDetails, setIsLoadingTicketDetails] = useState(false);

  const selectedTicketId = watch("ticket_id");

  const loadAll = async () => {
    setFormLoading(true);

    const ticketId =
      workOrder && mode !== "create"
        ? workOrder.ticket_id || ""
        : initialTicketId || "";

    reset(
      workOrder && mode !== "create"
        ? {
          ticket_id: workOrder.ticket_id || "",
          description: workOrder.description || "",
          assigned_to: workOrder.assigned_to || "",
          bill_to_id: workOrder.bill_to_id || "",
          bill_to_type: workOrder.bill_to_type || "",
          vendor_name: workOrder.vendor_name || "",
          status: workOrder.status || "PENDING",
          labour_cost: workOrder.labour_cost || undefined,
          material_cost: workOrder.material_cost || undefined,
          other_expenses: workOrder.other_expenses || undefined,
          estimated_time: workOrder.estimated_time || undefined,
          special_instructions: workOrder.special_instructions || "",
          tax_code_id: workOrder.tax_code_id || "",
        }
        : {
          ...emptyFormData,
          ticket_id: initialTicketId || "",
        },
    );

    setFormLoading(false);

    await Promise.all([
      loadVendorLookup(),
      loadTicketLookup(),
      loadStatusLookup(),
      loadTaxCodeLookup(),
    ]);

    if (ticketId) {
      setIsLoadingTicketDetails(true);
      const response =
        await ticketWorkOrderApiService.getTicketAssignments(ticketId);
      if (response.success) {
        setSelectedTicketDetails(response.data);
      }
      setIsLoadingTicketDetails(false);
    } else {
      setSelectedTicketDetails(null);
      setIsLoadingTicketDetails(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [workOrder, mode, isOpen, reset]);

  useEffect(() => {
    const loadTicketAssignments = async () => {
      if (selectedTicketId) {
        setIsLoadingTicketDetails(true);
        setSelectedTicketDetails(null);
        const response =
          await ticketWorkOrderApiService.getTicketAssignments(
            selectedTicketId,
          );
        if (response.success) {
          setSelectedTicketDetails(response.data);
          setBillToList(response.data?.bill_to_options || []);
        }
        setIsLoadingTicketDetails(false);
      } else {
        setSelectedTicketDetails(null);
        setIsLoadingTicketDetails(false);
      }
    };

    loadTicketAssignments();
  }, [selectedTicketId, mode, isOpen]);

  const loadVendorLookup = async () => {
    const lookup = await vendorsApiService.getVendorWorkOrderLookup();
    if (lookup.success) setVendorList(lookup.data || []);
  };

  const loadTicketLookup = async () => {
    const lookup = await ticketsApiService.getTicketNoLookup();
    if (lookup.success) setTicketsList(lookup.data || []);
  };

  const loadStatusLookup = async () => {
    const lookup = await ticketWorkOrderApiService.getStatusLookup();
    if (lookup.success) setStatusList(lookup.data || []);
  };
  const loadTaxCodeLookup = async () => {
    const lookup = await leaseChargeApiService.getTaxCodeLookup();
    if (lookup.success) setTaxCodeList(lookup.data || []);
  };

  const onSubmitForm = async (data: TicketWorkOrderFormValues) => {
    const submitData = {
      ...workOrder,
      ...data,
      assigned_to: data.assigned_to || null,
      tax_code_id:
        data.tax_code_id &&
          data.tax_code_id !== "NO_TAX" &&
          data.tax_code_id !== ""
          ? data.tax_code_id
          : undefined,
    };

    const formResponse = await onSave(submitData);
  };

  const isReadOnly = mode === "view";

  // Create fallback options for fields that might not be in lookup lists
  const fallbackTicket = workOrder?.ticket_id
    ? {
      id: workOrder.ticket_id,
      name:
        workOrder.ticket_name ||
        workOrder.ticket_no ||
        `Ticket (${workOrder.ticket_id.slice(0, 6)})`,
    }
    : null;

  const fallbackVendor = workOrder?.vendor_name
    ? {
      id: workOrder.vendor_id || "",
      name: workOrder.vendor_name,
    }
    : null;

  const fallbackStatus = workOrder?.status
    ? {
      id: workOrder.status,
      name: workOrder.status,
    }
    : null;

  const fallbackTaxCode = workOrder?.tax_code_id
    ? {
      id: workOrder.tax_code_id,
      name:
        workOrder.tax_code_name ||
        `Tax Code (${workOrder.tax_code_id.slice(0, 6)})`,
    }
    : null;

  // Apply fallback to lists
  const tickets = withFallback(ticketsList, fallbackTicket);
  const vendors = withFallback(vendorList, fallbackVendor);
  const statuses = withFallback(statusList, fallbackStatus);
  const taxCodes = withFallback(taxCodeList, fallbackTaxCode);

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };

  const formatCurrency = (val?: number) => {
    if (val == null) return "-";
    return `${systemCurrency.name}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Ticket Work Order"}
            {mode === "edit" && "Edit Ticket Work Order"}
            {mode === "view" && "Ticket Work Order Details"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
          className="space-y-4"
        >
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Row 1: Ticket ID | Status */}
              <div className="grid grid-cols-3 gap-4">
                <Controller
                  name="ticket_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="ticket_id">Ticket *</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          isReadOnly || mode === "edit" || !!initialTicketId
                        }
                      >
                        <SelectTrigger
                          className={errors.ticket_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select ticket" />
                        </SelectTrigger>
                        <SelectContent>
                          {tickets.map((ticket) => (
                            <SelectItem key={ticket.id} value={ticket.id}>
                              {ticket.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.ticket_id && (
                        <p className="text-sm text-red-500">
                          {errors.ticket_id.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <input type="hidden" {...register("bill_to_type")} />
                <Controller
                  name="bill_to_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="status">Bill To *</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          const selected = billToList.find((o) => o.id === value);

                          field.onChange(value); // bill_to_id
                          setValue("bill_to_type", selected?.type); // set type
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select who to bill" />
                        </SelectTrigger>

                        <SelectContent>
                          {billToList.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.type.toUpperCase()} - {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.status ? "border-red-500" : ""}
                        >
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
                      {errors.status && (
                        <p className="text-sm text-red-500">
                          {errors.status.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              {/* Row 2: Preview (when ticket selected) or Description (when no ticket) */}
              {selectedTicketId ? (
                isLoadingTicketDetails ? (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">Assignment Preview:</h4>
                    <div className="text-sm text-muted-foreground">
                      Loading ticket details...
                    </div>
                  </div>
                ) : selectedTicketDetails ? (
                  <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Assignment Preview</h4>
                      <span className="text-xs text-muted-foreground">
                        Auto-filled from ticket
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Staff */}
                      <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          S
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Staff</p>
                          <p className="text-sm font-medium">
                            {selectedTicketDetails?.assigned_to_name ||
                              selectedTicketDetails?.assigned_to?.name ||
                              "Not Assigned"}
                          </p>
                        </div>
                      </div>

                      {/* Vendor */}
                      <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          V
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Vendor</p>
                          <p className="text-sm font-medium">
                            {selectedTicketDetails?.vendor_name ||
                              selectedTicketDetails?.assigned_vendor_name ||
                              "Not Assigned"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Detailed description of the work to be performed..."
                    rows={5}
                    disabled={isReadOnly}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              )}

              {/* Row 3: Description (when ticket selected) */}
              {selectedTicketId && (
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Detailed description of the work to be performed..."
                    rows={5}
                    disabled={isReadOnly}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              )}

              {/* Row 4: Labour | Material | Other Expenses */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labour_cost">
                    Labour Cost ({formatCurrency(0)})
                  </Label>
                  <Input
                    id="labour_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("labour_cost", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    placeholder="0.00"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material_cost">
                    Material Cost ({formatCurrency(0)})
                  </Label>
                  <Input
                    id="material_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("material_cost", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    placeholder="0.00"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other_expenses">
                    Other Expenses ({formatCurrency(0)})
                  </Label>
                  <Input
                    id="other_expenses"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("other_expenses", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    placeholder="0.00"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">
                    Estimated Time (minutes) *
                  </Label>
                  <Input
                    id="estimated_time"
                    type="number"
                    min="0"
                    step="1"
                    {...register("estimated_time", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    placeholder="0"
                    disabled={isReadOnly}
                    className={errors.estimated_time ? "border-red-500" : ""}
                  />
                  {errors.estimated_time && (
                    <p className="text-sm text-red-500">
                      {errors.estimated_time.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 6: Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="special_instructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="special_instructions"
                  {...register("special_instructions")}
                  placeholder="Enter any special instructions or notes..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : mode === "create"
                        ? "Create Work Order"
                        : "Update Work Order"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
