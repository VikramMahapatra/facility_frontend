import { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { Invoice } from "@/interfaces/invoices_interfaces";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "@/schemas/invoice.schema";
import {
  Plus,
  Trash2,
  CreditCard,
  Wallet,
  Building2,
  FileText,
  Smartphone,
  Calendar,
} from "lucide-react";

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
    getValues,
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
      payments: [{ method: "upi", ref_no: "", paid_at: "", amount: 0 }],
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

      if (invoice.billable_item_id && invoice.billable_item_name) {
        setBillableItemList((prev) => {
          const exists = prev.some(
            (item: any) => item.id === invoice.billable_item_id
          );
          if (!exists) {
            return [
              ...prev,
              {
                id: invoice.billable_item_id,
                name: invoice.billable_item_name,
              },
            ];
          }
          return prev;
        });

        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    const invoicePayments = (invoice as any)?.payments;
    const hasValidPayments =
      invoicePayments &&
      Array.isArray(invoicePayments) &&
      invoicePayments.length > 0;

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
            payments: hasValidPayments
              ? invoicePayments
              : [{ method: "upi" as any, ref_no: "", paid_at: "", amount: 0 }],
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
            payments: [
              { method: "upi" as any, ref_no: "", paid_at: "", amount: 0 },
            ],
          }
    );

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [invoice?.id, mode, isOpen]);

  useEffect(() => {
    if (mode === "create") {
      if (watchedBillableType && watchedSiteId && siteList.length > 0) {
        loadBillableItemLookup(watchedBillableType, watchedSiteId);
      } else if (!watchedBillableType || !watchedSiteId) {
        setBillableItemList([]);
        setValue("billable_item_id", "");
      }
    }
  }, [watchedBillableType, watchedSiteId, setValue, mode, siteList.length]);

  // Load invoice totals when billable item is selected
  useEffect(() => {
    if (watchedBillableType && watchedBillableItemId && mode === "create") {
      loadInvoiceTotals(watchedBillableType, watchedBillableItemId);
    } else {
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
      payments: data.payments as any,
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

  // Payment mode helpers: add, remove multiple payment modes
  const paymentModes = watch("payments") || [];

  // Filter out any duplicate payments
  const uniquePaymentModes = useMemo(() => {
    const seen = new Set<string>();
    return paymentModes.filter((payment) => {
      const key = `${payment.method}-${payment.ref_no}-${payment.paid_at}-${payment.amount}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [paymentModes]);

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Wallet className="h-4 w-4" />;
      case "bank":
        return <Building2 className="h-4 w-4" />;
      case "cheque":
        return <FileText className="h-4 w-4" />;
      case "upi":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number | string | undefined) => {
    const numAmount =
      typeof amount === "string" ? parseFloat(amount) || 0 : amount || 0;
    const currency = watch("currency") || "INR";
    const symbol =
      currency === "INR"
        ? "₹"
        : currency === "USD"
        ? "$"
        : currency === "EUR"
        ? "€"
        : currency;
    return `${symbol} ${numAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate payment summary
  const invoiceTotal = watch("totals.grand") || 0;
  const paidAmount = uniquePaymentModes.reduce((sum, payment) => {
    const amount =
      typeof payment.amount === "string"
        ? parseFloat(payment.amount) || 0
        : payment.amount || 0;
    return sum + amount;
  }, 0);
  const outstanding = invoiceTotal - paidAmount;
  const paymentStatus =
    outstanding <= 0 ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid";

  const addPaymentMode = () => {
    const currentPaymentModes =
      paymentModes.length > 0 ? paymentModes : getValues("payments") || [];
    const newPaymentMode = {
      method: "upi" as any,
      ref_no: "",
      paid_at: "",
      amount: 0,
    };
    setValue("payments", [...currentPaymentModes, newPaymentMode], {
      shouldValidate: true,
    });
  };

  const removePaymentMode = (index: number) => {
    const currentPaymentModes = getValues("payments") || [];
    const remaining = currentPaymentModes.filter((_, i) => i !== index);
    // Ensure at least one entry remains
    const ensured =
      remaining.length === 0
        ? [{ method: "upi" as any, ref_no: "", paid_at: "", amount: 0 }]
        : remaining;
    setValue("payments", ensured);
  };

  const updatePaymentMode = (
    index: number,
    field: "method" | "ref_no" | "paid_at" | "amount",
    value: string
  ) => {
    const currentPaymentModes = getValues("payments") || [];
    const updated = [...currentPaymentModes];
    updated[index] = { ...updated[index], [field]: value };
    setValue("payments", updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              {/* Invoice Type + Billable Item */}
              <div className="grid grid-cols-3 gap-4">
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
                      : "Lease Charge *"}
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

              {/* Invoice Date - Due Date - Currency (third row, 3 columns) */}
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="due_date">Due Date *</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    {...register("currency")}
                    disabled={isFieldDisabled("currency")}
                  />
                </div>
              </div>

              {/* Status*/}
              {/* <div className="space-y-2">
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
              </div> */}

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

              {/* Payment Details Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Payment Details</h3>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={addPaymentMode}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Payment
                    </Button>
                  )}
                </div>

                {/* Payment Cards */}
                <div className="space-y-4">
                  {uniquePaymentModes.map((paymentMode, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Payment #{index + 1}
                          </CardTitle>
                          {!isReadOnly && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePaymentMode(index)}
                              disabled={paymentModes.length === 1}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          {/* Mode */}
                          <div className="space-y-2">
                            <Label>Mode</Label>
                            <Controller
                              name={`payments.${index}.method` as any}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  value={field.value || ""}
                                  onValueChange={(value) => {
                                    updatePaymentMode(index, "method", value);
                                  }}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                      {field.value &&
                                        getPaymentMethodIcon(field.value)}
                                      <SelectValue placeholder="Select payment type" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="bank">
                                      Bank Transfer
                                    </SelectItem>
                                    <SelectItem value="cheque">
                                      Cheque
                                    </SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          {/* Reference No. */}
                          <div className="space-y-2">
                            <Label>Reference No.</Label>
                            <Input
                              type="text"
                              placeholder="Enter Ref No."
                              value={paymentMode.ref_no || ""}
                              onChange={(e) => {
                                updatePaymentMode(
                                  index,
                                  "ref_no",
                                  e.target.value
                                );
                              }}
                              disabled={isReadOnly}
                            />
                          </div>

                          {/* Date */}
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              <Input
                                type="date"
                                className="pl-10"
                                value={paymentMode.paid_at || ""}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  updatePaymentMode(
                                    index,
                                    "paid_at",
                                    e.target.value
                                  );
                                }}
                              />
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="space-y-2">
                            <Label>Amount</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                {watch("currency") === "INR"
                                  ? "₹"
                                  : watch("currency") === "USD"
                                  ? "$"
                                  : watch("currency") === "EUR"
                                  ? "€"
                                  : watch("currency") || "₹"}
                              </span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="pl-8"
                                value={paymentMode.amount || ""}
                                onChange={(e) => {
                                  updatePaymentMode(
                                    index,
                                    "amount",
                                    e.target.value
                                  );
                                }}
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Payment Summary */}
                {watchedBillableType &&
                  watchedBillableItemId &&
                  invoiceTotal > 0 && (
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">
                                Invoice Total
                              </Label>
                              <p className="text-lg font-semibold">
                                {formatCurrency(invoiceTotal)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">
                                Paid Amount
                              </Label>
                              <p className="text-lg font-semibold">
                                {formatCurrency(paidAmount)}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">
                                Outstanding
                              </Label>
                              <p
                                className={`text-lg font-semibold ${
                                  outstanding > 0
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}
                              >
                                {formatCurrency(outstanding)}
                              </p>
                            </div>
                            <div className="flex items-end">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-2 w-2 rounded-full ${
                                    paymentStatus === "Paid"
                                      ? "bg-green-500"
                                      : paymentStatus === "Partially Paid"
                                      ? "bg-orange-500"
                                      : "bg-gray-500"
                                  }`}
                                />
                                <Label className="text-muted-foreground">
                                  Status:
                                </Label>
                                <span className="font-semibold">
                                  {paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>

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
