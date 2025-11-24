import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { Invoice } from "@/interfaces/invoices_interfaces";
import { serviceRequestApiService } from "@/services/maintenance_assets/servicerequestapi";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "@/schemas/invoice.schema";

interface InvoiceFormProps {
  invoice?: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
  mode: "create" | "edit" | "view";
}

export function InvoiceForm({
  invoice,
  isOpen,
  onClose,
  onSave,
  mode,
}: InvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    mode: "onChange",
    defaultValues: {
      invoice_no: "",
      site_id: "",
      customer_kind: "resident",
      customer_id: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      currency: "INR",
      totals: { sub: 0, tax: 0, grand: 0 },
    },
  });

  const [siteList, setSiteList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [requesterKindList, setRequesterKindList] = useState<any[]>([]);

  const watchedSiteId = watch("site_id");
  const watchedCustomerKind = watch("customer_kind");

  useEffect(() => {
    loadSiteLookup();
    loadRequesterKindLookup();
  }, []);

  useEffect(() => {
    if (invoice) {
      reset({
        invoice_no: invoice.invoice_no || "",
        site_id: invoice.site_id || "",
        customer_kind: invoice.customer_kind || "resident",
        customer_id: String(invoice.customer_id || ""),
        date: invoice.date || new Date().toISOString().split("T")[0],
        due_date: invoice.due_date || "",
        status: invoice.status || "draft",
        currency: invoice.currency || "INR",
        totals: invoice.totals || { sub: 0, tax: 0, grand: 0 },
      });
    } else {
      reset({
        invoice_no: "",
        site_id: "",
        customer_kind: "resident",
        customer_id: "",
        date: new Date().toISOString().split("T")[0],
        due_date: "",
        status: "draft",
        currency: "INR",
        totals: { sub: 0, tax: 0, grand: 0 },
      });
    }
  }, [invoice, reset]);

  // ✅ Load customer when kind or site changes
  useEffect(() => {
    if (watchedCustomerKind && watchedSiteId) {
      loadCustomerLookup(watchedCustomerKind, watchedSiteId);
    } else {
      setCustomerList([]);
      setValue("customer_id", "");
    }
  }, [watchedCustomerKind, watchedSiteId, setValue]);

  const loadSiteLookup = async () => {
    try {
      const rows = await siteApiService.getSiteLookup();
      if (rows.success) setSiteList(rows.data || []);
    } catch {
      setSiteList([]);
    }
  };

  const loadRequesterKindLookup = async () => {
    try {
      // ✅ Use service request requester kind lookup (SAME as service request)
      const rows =
        await serviceRequestApiService.getServiceRequestRequesterKindLookup();
      if (rows.success) setRequesterKindList(rows.data || []);
    } catch {
      setRequesterKindList([]);
    }
  };

  const loadCustomerLookup = async (kind?: string, site_id?: string) => {
    if (!kind || !site_id) {
      setCustomerList([]);
      return;
    }

    try {
      // ✅ SAME LOGIC AS SERVICE REQUEST FORM - Use leasesApiService for customer lookup
      const Kind =
        kind === "resident"
          ? "individual"
          : kind === "merchant"
          ? "commercial"
          : kind;
      const lookup = await leasesApiService.getLeasePartnerLookup(
        Kind,
        site_id
      );
      if (lookup.success) setCustomerList(lookup.data || []);
    } catch {
      setCustomerList([]);
    }
  };

  const onSubmitForm = async (data: InvoiceFormValues) => {
    const payload: Partial<Invoice> = {
      ...invoice,
      ...data,
      customer_id: data.customer_id,
      totals: {
        sub: data.totals?.sub ?? 0,
        tax: data.totals?.tax ?? 0,
        grand: data.totals?.grand ?? 0,
      },
      updated_at: new Date().toISOString(),
    };
    await onSave(payload);
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Invoice"}
            {mode === "edit" && "Edit Invoice"}
            {mode === "view" && "Invoice Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Invoice No + Site */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_no">Invoice No *</Label>
              <Input
                id="invoice_no"
                {...register("invoice_no")}
                placeholder="INV-2025-001"
                disabled={isReadOnly}
                className={errors.invoice_no ? "border-red-500" : ""}
              />
              {errors.invoice_no && (
                <p className="text-sm text-red-500">
                  {errors.invoice_no.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_id">Site *</Label>
              <Controller
                name="site_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("customer_id", "");
                    }}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger
                      className={errors.site_id ? "border-red-500" : ""}
                    >
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
                )}
              />
              {errors.site_id && (
                <p className="text-sm text-red-500">{errors.site_id.message}</p>
              )}
            </div>
          </div>

          {/* Customer Kind + Customer ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_kind">Customer Type *</Label>
              <Controller
                name="customer_kind"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "resident"}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("customer_id", "");
                    }}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger
                      className={errors.customer_kind ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {requesterKindList.map((rk: any) => (
                        <SelectItem key={rk.id} value={rk.id}>
                          {rk.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customer_kind && (
                <p className="text-sm text-red-500">
                  {errors.customer_kind.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer *</Label>
              <Controller
                name="customer_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={
                      isReadOnly || !watchedSiteId || !watchedCustomerKind
                    }
                  >
                    <SelectTrigger
                      className={errors.customer_id ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerList.map((cust) => (
                        <SelectItem key={cust.id} value={cust.id}>
                          {cust.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customer_id && (
                <p className="text-sm text-red-500">
                  {errors.customer_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                disabled={isReadOnly}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Status + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "draft"}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="void">Void</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register("currency")}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub">Subtotal</Label>
              <Input
                id="sub"
                type="number"
                {...register("totals.sub", {
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Tax</Label>
              <Input
                id="tax"
                type="number"
                {...register("totals.tax", {
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grand">Grand Total</Label>
              <Input
                id="grand"
                type="number"
                {...register("totals.grand", {
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Invoice"
                  : "Update Invoice"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
