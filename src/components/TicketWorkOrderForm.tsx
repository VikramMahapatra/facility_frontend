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
  status: "pending",
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

  const loadAll = async () => {
    setFormLoading(true);

    await Promise.all([loadVendorLookup(), loadTicketLookup(), loadStatusLookup()]);

    reset(
      workOrder && mode !== "create"
        ? {
            ticket_id: workOrder.ticket_id || "",
            description: workOrder.description || "",
            assigned_to: workOrder.assigned_to || "",
            status: workOrder.status || "PENDING",
          }
        : {
            ...emptyFormData,
            ticket_id: initialTicketId || "",
          }
    );

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [workOrder, mode, isOpen, reset]);

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

          {/* Row 2: Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assigned To *</Label>
            <Controller
              name="assigned_to"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {vendorList.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Row 3: Description */}
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

