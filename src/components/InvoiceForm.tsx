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
import { invoiceApiService } from "@/services/financials/invoicesapi";
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
      site_id: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      currency: "INR",
      billable_item_type: "lease_charge",
      billable_item_id: "",
      totals: { sub: 0, tax: 0, grand: 0 },
    },
  });

  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [billableItemList, setBillableItemList] = useState<any[]>([]);
  const [totalsAutoFilled, setTotalsAutoFilled] = useState(false);

  const watchedSiteId = watch("site_id");
  const watchedBillableType = watch("billable_item_type");
  const watchedBillableItemId = watch("billable_item_id");

  const loadAll = async () => {
    setFormLoading(true);
    setTotalsAutoFilled(false);

    if (mode === "create") {
      setBillableItemList([]);
    }

    await loadSiteLookup();

    if (
      invoice &&
      mode !== "create" &&
      invoice.site_id &&
      invoice.billable_item_type
    ) {
      const billableType =
        invoice.billable_item_type === "lease charge"
          ? "lease_charge"
          : invoice.billable_item_type === "work order"
          ? "work_order"
          : "lease_charge";
      await loadBillableItemLookup(billableType, invoice.site_id);
    }

    reset(
      invoice && mode !== "create"
        ? {
            site_id: invoice.site_id || "",
            date: invoice.date || new Date().toISOString().split("T")[0],
            due_date: invoice.due_date || "",
            status: invoice.status || "draft",
            currency: invoice.currency || "INR",
            billable_item_type:
              invoice.billable_item_type === "lease charge"
                ? "lease_charge"
                : invoice.billable_item_type === "work order"
                ? "work_order"
                : "lease_charge",
            billable_item_id: invoice.billable_item_id || "",
            totals: invoice.totals || { sub: 0, tax: 0, grand: 0 },
          }
        : {
            site_id: "",
            date: new Date().toISOString().split("T")[0],
            due_date: "",
            status: "draft",
            currency: "INR",
            billable_item_type: "lease_charge",
            billable_item_id: "",
            totals: { sub: 0, tax: 0, grand: 0 },
          }
    );

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [invoice, mode, isOpen, reset]);

  useEffect(() => {
    if (watchedBillableType && watchedSiteId) {
      loadBillableItemLookup(watchedBillableType, watchedSiteId);
    } else {
      setBillableItemList([]);
      setValue("billable_item_id", "");
    }
  }, [watchedBillableType, watchedSiteId, setValue]);

  // Load invoice totals when billable item is selected
  useEffect(() => {
    if (watchedBillableType && watchedBillableItemId && mode === "create") {
      loadInvoiceTotals(watchedBillableType, watchedBillableItemId);
    } else {
      // Reset totals if billable item is cleared or in edit/view mode
      if (
        mode === "create" &&
        (!watchedBillableItemId || !watchedBillableType)
      ) {
        setValue("totals.sub", 0);
        setValue("totals.tax", 0);
        setValue("totals.grand", 0);
      }
      setTotalsAutoFilled(false);
    }
  }, [watchedBillableType, watchedBillableItemId, mode, setValue]);

  const loadSiteLookup = async () => {
    try {
      const rows = await siteApiService.getSiteLookup();
      if (rows.success) setSiteList(rows.data || []);
    } catch {
      setSiteList([]);
    }
  };

  const loadBillableItemLookup = async (type?: string, siteId?: string) => {
    if (!type || !siteId) {
      setBillableItemList([]);
      setValue("billable_item_id", "");
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("site_id", siteId);
      params.append(
        "billable_item_type",
        type === "lease_charge" ? "lease charge" : "work order"
      );

      const response = await invoiceApiService.getInvoiceEntityLookup(params);
      if (response?.success) {
        const items =
          response.data?.items ||
          response.data?.entities ||
          response.data ||
          [];

        setBillableItemList(
          items.map((item: any) => ({
            id: item.id,
            name: item.name || item.code || item.label || item.id,
          }))
        );
      } else {
        setBillableItemList([]);
      }
    } catch {
      setBillableItemList([]);
    }
  };

  const loadInvoiceTotals = async (
    billableType: string,
    billableItemId: string
  ) => {
    if (!billableType || !billableItemId) {
      setTotalsAutoFilled(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append(
        "billable_item_type",
        billableType === "lease_charge" ? "lease charge" : "work order"
      );
      params.append("billable_item_id", billableItemId);

      const response = await invoiceApiService.getInvoiceTotals(params);
      if (response?.success && response.data) {
        const totals = response.data;
        setValue("totals.sub", Number(totals.subtotal || 0));
        setValue("totals.tax", Number(totals.tax || 0));
        setValue("totals.grand", Number(totals.grand_total || 0));
        setTotalsAutoFilled(true);
      } else {
        setTotalsAutoFilled(false);
      }
    } catch {
      setTotalsAutoFilled(false);
    }
  };

  const onSubmitForm = async (data: InvoiceFormValues) => {
    const payload: Partial<Invoice> = {
      ...invoice,
      ...data,
      billable_item_type:
        data.billable_item_type === "lease_charge"
          ? "lease charge"
          : "work order",
      billable_item_id: data.billable_item_id,
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

  const isFieldDisabled = (fieldName: string) => {
    if (mode === "view") return true;
    if (mode === "edit") {
      return fieldName !== "due_date" && fieldName !== "status";
    }

    if (mode === "create" && totalsAutoFilled) {
      if (
        fieldName === "totals.sub" ||
        fieldName === "totals.tax" ||
        fieldName === "totals.grand"
      ) {
        return true;
      }
    }
    return false;
  };

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

        <form
          onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
          className="space-y-4"
        >
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Site */}
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
                      }}
                      disabled={isFieldDisabled("site_id")}
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
                  <p className="text-sm text-red-500">
                    {errors.site_id.message}
                  </p>
                )}
              </div>

              {/* Invoice Type + Billable Item */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billable_item_type">Invoice Type *</Label>
                  <Controller
                    name="billable_item_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "lease_charge"}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("billable_item_id", "");
                        }}
                        disabled={isFieldDisabled("billable_item_type")}
                      >
                        <SelectTrigger
                          className={
                            errors.billable_item_type ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lease_charge">
                            Lease Charge
                          </SelectItem>
                          <SelectItem value="work_order">Work Order</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.billable_item_type && (
                    <p className="text-sm text-red-500">
                      {errors.billable_item_type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billable_item_id">
                    {watchedBillableType === "work_order"
                      ? "Work Order *"
                      : "Lease Charge Code *"}
                  </Label>
                  <Controller
                    name="billable_item_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={
                          isFieldDisabled("billable_item_id") ||
                          !watchedBillableType
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.billable_item_id ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {billableItemList.map((item: any) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.billable_item_id && (
                    <p className="text-sm text-red-500">
                      {errors.billable_item_id.message}
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
                    disabled={isFieldDisabled("date")}
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">
                      {errors.date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    {...register("due_date")}
                    disabled={isFieldDisabled("due_date")}
                    className={errors.due_date ? "border-red-500" : ""}
                    min={watch("date") || undefined}
                  />
                  {errors.due_date && (
                    <p className="text-sm text-red-500">
                      {errors.due_date.message}
                    </p>
                  )}
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
                        disabled={isFieldDisabled("status")}
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
                    disabled={isFieldDisabled("currency")}
                  />
                </div>
              </div>

              {watchedBillableType && watchedBillableItemId && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub">Subtotal</Label>
                    <Input
                      id="sub"
                      type="number"
                      {...register("totals.sub", {
                        setValueAs: (v) => (v === "" ? 0 : Number(v)),
                      })}
                      disabled={isFieldDisabled("totals.sub")}
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
                      disabled={isFieldDisabled("totals.tax")}
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
                      disabled={isFieldDisabled("totals.grand")}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting || formLoading}
                >
                  {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting || formLoading}>
                    {isSubmitting
                      ? "Saving..."
                      : mode === "create"
                      ? "Create"
                      : "Update"}
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
