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
import { toast } from "sonner";
import { vendorsApiService } from "@/services/pocurments/vendorsapi";
import { ticketsApiService } from "@/services/ticketing_service/ticketsapi";
import { ticketWorkOrderApiService } from "@/services/ticketing_service/ticketworkorderapi";
import { ticketWorkOrderSchema, TicketWorkOrderFormValues } from "@/schemas/ticketworkorder.schema";

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
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<any>(null);

  const selectedTicketId = watch("ticket_id");

  const loadAll = async () => {
    setFormLoading(true);

    await Promise.all([loadVendorLookup(), loadTicketLookup(), loadStatusLookup()]);

    const ticketId = workOrder && mode !== "create" 
      ? workOrder.ticket_id || "" 
      : initialTicketId || "";

    reset(
      workOrder && mode !== "create"
        ? {
            ticket_id: workOrder.ticket_id || "",
            description: workOrder.description || "",
            assigned_to: workOrder.assigned_to || "",
            vendor_name: workOrder.vendor_name || "",
            status: workOrder.status || "PENDING",
            labour_cost: workOrder.labour_cost || undefined,
            material_cost: workOrder.material_cost || undefined,
            other_expenses: workOrder.other_expenses || undefined,
            estimated_time: workOrder.estimated_time || undefined,
            special_instructions: workOrder.special_instructions || "",
          }
        : {
            ...emptyFormData,
            ticket_id: initialTicketId || "",
          }
    );

    // Load ticket details if ticket_id exists (for view/edit mode)
    if (ticketId) {
      try {
        const response = await ticketsApiService.getTicketById(ticketId);
        if (response.success) {
          setSelectedTicketDetails(response.data);
        }
      } catch (error) {
        console.error("Failed to load ticket details:", error);
      }
    }

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [workOrder, mode, isOpen, reset]);

  useEffect(() => {
    const loadTicketDetails = async () => {
      if (selectedTicketId) {
        try {
          const response = await ticketsApiService.getTicketById(selectedTicketId);
          if (response.success) {
            setSelectedTicketDetails(response.data);
          }
        } catch (error) {
          console.error("Failed to load ticket details:", error);
        }
      } else {
        setSelectedTicketDetails(null);
      }
    };

    loadTicketDetails();
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

  const onSubmitForm = async (data: TicketWorkOrderFormValues) => {
    const formResponse = await onSave({
      ...workOrder,
      ...data,
      assigned_to: data.assigned_to || null,
    });
  };

  const isReadOnly = mode === "view";

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Ticket Work Order"}
            {mode === "edit" && "Edit Ticket Work Order"}
            {mode === "view" && "Ticket Work Order Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Row 1: Ticket ID | Status */}
              <div className="grid grid-cols-2 gap-4">
            <Controller
              name="ticket_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="ticket_id">Ticket *</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly || mode === "edit" || !!initialTicketId}
                  >
                    <SelectTrigger className={errors.ticket_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select ticket" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketsList.map((ticket) => (
                        <SelectItem key={ticket.id} value={ticket.id}>
                          {ticket.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ticket_id && (
                    <p className="text-sm text-red-500">{errors.ticket_id.message}</p>
                  )}
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

          {/* Row 2: Preview (when ticket selected) or Description (when no ticket) */}
          {selectedTicketId ? (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Assignment Preview:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  <strong>Staff:</strong>{" "}
                  {selectedTicketDetails?.assigned_to_name ||
                   selectedTicketDetails?.assigned_to ||
                   "N/A"}
                </div>
                <div>
                  <strong>Vendor:</strong>{" "}
                  {selectedTicketDetails?.vendor_name ||
                   selectedTicketDetails?.vendor?.name ||
                   "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detailed description of the work to be performed..."
                rows={5}
                disabled={isReadOnly}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
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
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          )}

          {/* Row 4: Labour Cost | Material Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labour_cost">Labour Cost</Label>
              <Input
                id="labour_cost"
                type="number"
                step="0.01"
                {...register("labour_cost", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                placeholder="0.00"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material_cost">Material Cost</Label>
              <Input
                id="material_cost"
                type="number"
                step="0.01"
                {...register("material_cost", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                placeholder="0.00"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Row 5: Other Expenses | Estimated Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="other_expenses">Other Expenses</Label>
              <Input
                id="other_expenses"
                type="number"
                step="0.01"
                {...register("other_expenses", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                placeholder="0.00"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_time">Estimated Time (minutes) *</Label>
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
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              {...register("special_instructions")}
              placeholder="Enter any special instructions or notes..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : mode === "create" ? "Create Work Order" : "Update Work Order"}
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

