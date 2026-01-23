import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { withFallback } from "@/helpers/commonHelper";

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const [invoice, setInvoice] = useState<Invoice | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { withLoader } = useLoader();

  const pathname = location.pathname;
  let formMode: "create" | "edit" | "view" = "create";
  if (pathname.includes("/edit")) {
    formMode = "edit";
  } else if (pathname.includes("/view")) {
    formMode = "view";
  } else if (id) {
    formMode = "view";
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    mode: "onChange",
    defaultValues: {
      site_id: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      currency: "INR",
      billable_item_type: "",
      billable_item_id: "",
      totals: { sub: 0, tax: 0, grand: 0 },
      payments: [{ method: "upi", ref_no: "", paid_at: "", amount: 0 }],
    },
  });

  const [siteList, setSiteList] = useState<any[]>([]);
  const [invoiceTypeList, setInvoiceTypeList] = useState<
    { id: string; name: string }[]
  >([]);
  const [billableItemList, setBillableItemList] = useState<any[]>([]);
  const [totalsAutoFilled, setTotalsAutoFilled] = useState(false);

  const watchedSiteId = watch("site_id");
  const watchedBillableType = watch("billable_item_type");
  const watchedBillableItemId = watch("billable_item_id");

  useEffect(() => {
   
    loadSiteLookup();
    loadInvoiceTypeLookup();
  }, []);

  useEffect(() => {
    if (!id || formMode === "create") return;
    loadInvoice();
  }, [id, formMode]);

  useEffect(() => {
    loadAll();
  }, [invoice?.id]);

  const loadInvoice = async () => {
    const response = await withLoader(async () => {
      return await invoiceApiService.getInvoiceById(id);
    });

    if (response?.success && response.data) {
      console.log("Loaded invoice:", response.data);
      setInvoice(response.data);
    } else {
      toast.error("Failed to load invoice details");
      navigate("/invoices");
    }
  };

  const loadAll = async () => {
    setTotalsAutoFilled(false);

    // Format payments to ensure they have all required fields
    const invoicePayments = (invoice as any)?.payments;
    const hasValidPayments =
      invoicePayments &&
      Array.isArray(invoicePayments) &&
      invoicePayments.length > 0;

    const formattedPayments = hasValidPayments
      ? invoicePayments.map((payment: any) => ({
          id: payment.id,
          method: payment.method || "upi",
          ref_no: payment.ref_no || "",
          paid_at: payment.paid_at || "",
          amount:
            typeof payment.amount === "number"
              ? payment.amount
              : parseFloat(payment.amount) || 0,
        }))
      : [{ method: "upi" as any, ref_no: "", paid_at: "", amount: 0 }];

    // Reset form based on mode - if create mode or no invoice, use empty data
    reset(
      invoice && formMode !== "create"
        ? {
            site_id: invoice.site_id || "",
            date: invoice.date || new Date().toISOString().split("T")[0],
            due_date: invoice.due_date || "",
            status: invoice.status || "draft",
            currency: invoice.currency || "INR",
            billable_item_type: invoice.billable_item_type || "",
            billable_item_id: invoice.billable_item_id || "",
            totals: invoice.totals || { sub: 0, tax: 0, grand: 0 },
            payments: formattedPayments,
          }
        : {
            site_id: "",
            date: new Date().toISOString().split("T")[0],
            due_date: "",
            status: "draft",
            currency: "INR",
            billable_item_type: "",
            billable_item_id: "",
            totals: { sub: 0, tax: 0, grand: 0 },
            payments: [
              { method: "upi" as any, ref_no: "", paid_at: "", amount: 0 },
            ],
          },
    );

    // Preload billable item lookup for existing invoice (edit/view mode)
    if (
      invoice &&
      formMode !== "create" &&
      invoice.site_id &&
      invoice.billable_item_type
    ) {
      
      await loadBillableItemLookup(invoice.billable_item_type, invoice.site_id);
    }
  };

  useEffect(() => {
    if (formMode === "create") {
      if (watchedBillableType && watchedSiteId && siteList.length > 0) {
        loadBillableItemLookup(watchedBillableType, watchedSiteId);
      } else if (!watchedBillableType || !watchedSiteId) {
        setBillableItemList([]);
        setValue("billable_item_id", "");
      }
    }
  }, [watchedBillableType, watchedSiteId, setValue, formMode, siteList.length]);

  // Load invoice totals when billable item is selected
  useEffect(() => {
    if (watchedBillableType && watchedBillableItemId && formMode === "create") {
      loadInvoiceTotals(watchedBillableType, watchedBillableItemId);
    } else {
      if (
        formMode === "create" &&
        (!watchedBillableItemId || !watchedBillableType)
      ) {
        setValue("totals.sub", 0);
        setValue("totals.tax", 0);
        setValue("totals.grand", 0);
      }
      setTotalsAutoFilled(false);
    }
  }, [watchedBillableType, watchedBillableItemId, formMode, setValue]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadInvoiceTypeLookup = async () => {
    try {
      const response = await invoiceApiService.getInvoiceTypeLookup();
      if (response?.success) {
        const items = response.data?.data || response.data || [];
        if (Array.isArray(items) && items.length > 0) {
          setInvoiceTypeList(
            items.map((item: any) => ({
              id: item.id,
              name: item.name,
            }))
          );
        } else {
          setInvoiceTypeList([]);
        }
      } else {
        setInvoiceTypeList([]);
      }
    } catch (error) {
      console.error("Failed to load invoice types:", error);
      setInvoiceTypeList([]);
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
      // Use the type value directly as it comes from API (e.g., "lease charge", "work order", "owner maintenance")
      params.append("billable_item_type", type);

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
          })),
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
    billableItemId: string,
  ) => {
    if (!billableType || !billableItemId) {
      setTotalsAutoFilled(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      // Use the billableType value directly as it comes from API
      params.append("billable_item_type", billableType);
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

  const handleSave = async (invoiceData: Partial<Invoice>) => {
    setIsSubmitting(true);
    let response;
    if (formMode === "create") {
      response = await invoiceApiService.addInvoice(invoiceData);
    } else if (formMode === "edit" && invoice) {
      const updatedInvoice = {
        ...invoice,
        ...invoiceData,
        id: invoice.id || id, // Ensure ID is included
        invoice_no: invoice.invoice_no, // Preserve invoice number
        updated_at: new Date().toISOString(),
      };
      response = await invoiceApiService.updateInvoice(updatedInvoice);
    }

    if (response?.success) {
      navigate("/invoices");
      toast.success(
        `Invoice has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`,
      );
    } else if (response && !response.success) {
      if (response?.message) {
        toast.error(response.message);
      } else {
        toast.error("Failed to save invoice.");
      }
    }
    setIsSubmitting(false);
    return response;
  };

  const onSubmitForm = async (data: InvoiceFormValues) => {
    const payload: Partial<Invoice> = {
      ...invoice,
      ...data,
      id: invoice?.id || id, // Ensure ID is included for updates
      invoice_no: invoice?.invoice_no, // Preserve invoice number
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
    await handleSave(payload);
  };

  const isReadOnly = formMode === "view";

  const isFieldDisabled = (fieldName: string) => {
    if (formMode === "view") return true;
    if (formMode === "edit") {
      return fieldName !== "due_date" && fieldName !== "status";
    }

    if (formMode === "create" && totalsAutoFilled) {
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
      id: `temp-${Date.now()}-${Math.random()}`, // Add temporary unique ID
      method: "upi" as any,
      ref_no: "",
      paid_at: "",
      amount: 0,
    };
    setValue("payments", [...currentPaymentModes, newPaymentMode], {
      shouldValidate: false,
      shouldDirty: true,
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

  const updatePaymentMode = useCallback(
    (
      index: number,
      field: "method" | "ref_no" | "paid_at" | "amount",
      value: string,
    ) => {
      const currentPaymentModes = getValues("payments") || [];
      const updated = [...currentPaymentModes];
      updated[index] = { ...updated[index], [field]: value };
      setValue("payments", updated, {
        shouldValidate: false,
        shouldTouch: false,
        shouldDirty: true,
      });
    },
    [getValues, setValue],
  );

  const handleClose = () => {
    reset({
      site_id: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      currency: "INR",
      billable_item_type: "",
      billable_item_id: "",
      totals: { sub: 0, tax: 0, grand: 0 },
      payments: [{ method: "upi", ref_no: "", paid_at: "", amount: 0 }],
    });
    setBillableItemList([]);
    navigate("/invoices");
  };

  const fallBillableItems = invoice?.billable_item_id
    ? {
        id: invoice.billable_item_id,
        name: invoice.billable_item_name,
      }
    : null;

  const billable_items = withFallback(billableItemList, fallBillableItems);

  return (
    <ContentContainer>
      <LoaderOverlay />
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {formMode === "create"
                  ? "Create New Invoice"
                  : formMode === "edit"
                    ? "Edit Invoice"
                    : "Invoice Details"}
              </h1>
              <p className="text-muted-foreground">
                {formMode === "create"
                  ? "Add a new invoice to the system"
                  : formMode === "edit"
                    ? "Update invoice information"
                    : "View invoice details"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formMode !== "view" && (
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || formIsSubmitting}
              >
                Cancel
              </Button>
            )}
            {formMode !== "view" && (
              <Button
                type="submit"
                form="invoice-form"
                disabled={isSubmitting || formIsSubmitting}
              >
                {isSubmitting || formIsSubmitting
                  ? formMode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : formMode === "create"
                    ? "Create Invoice"
                    : "Update Invoice"}
              </Button>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-4"
          id="invoice-form"
        >
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
                      value={field.value || ""}
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
                        {invoiceTypeList.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
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
                  {(() => {
                    const selectedType = invoiceTypeList.find(
                      (type) => type.id === watchedBillableType
                    );
                    return selectedType
                      ? `${selectedType.name} *`
                      : "Billable Item *";
                  })()}
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
                        {billable_items.map((item: any) => (
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

            {/* Invoice Date - Due Date - Currency */}
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
                  <p className="text-sm text-red-500">{errors.date.message}</p>
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
                {paymentModes.map((paymentMode, index) => {
                  const stableKey =
                    (paymentMode as any).id || `payment-${index}`;
                  return (
                    <Card key={stableKey} className="relative">
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
                                  e.target.value,
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
                                    e.target.value,
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
                                    e.target.value,
                                  );
                                }}
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
          </div>
        </form>
      </div>
    </ContentContainer>
  );
}
