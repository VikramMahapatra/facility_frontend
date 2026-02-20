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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { Invoice, PaymentInput } from "@/interfaces/invoices_interfaces";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "@/schemas/invoice.schema";
import { toast } from "@/components/ui/app-toast";
import { useLoader } from "@/context/LoaderContext";
import { useSettings } from "@/context/SettingsContext";

interface InvoiceFormProps {
  invoice?: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: InvoiceFormValues = {
  invoice_no: "",
  site_id: "",
  building_id: "",
  space_id: "",
  tenant_id: "",
  tenant_name: "",
  tenant_email: "",
  tenant_phone: "",
  date: new Date().toISOString().split("T")[0],
  due_date: "",
  status: "draft",
  currency: "INR",
  billable_item_type: "",
  billable_item_id: "",
  items: [
    {
      item: "",
      description: "",
      amount: 0,
      tax: 5,
    },
  ],
  totals: { sub: 0, tax: 5, grand: 0 },
  payments: [],
};

export function InvoiceForm({
  invoice,
  isOpen,
  onClose,
  onSave,
  mode,
}: InvoiceFormProps) {
  const { withLoader } = useLoader();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [invoiceTypeList, setInvoiceTypeList] = useState<
    { id: string; name: string }[]
  >([]);
  const [billableItemList, setBillableItemList] = useState<any[]>([]);
  const [totalsAutoFilled, setTotalsAutoFilled] = useState(false);
  const [totalsLoaded, setTotalsLoaded] = useState(false);
  const { systemCurrency } = useSettings();
  const formatCurrency = (val?: number) => {
    if (val == null) return "-";
    return `${systemCurrency.name}`;
  };
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    mode: "onSubmit",
    defaultValues: emptyFormData,
  });

  const watchedSiteId = watch("site_id");
  const watchedBuildingId = watch("building_id");
  const watchedSpaceId = watch("space_id");
  const watchedBillableType = watch("billable_item_type");
  const watchedBillableItemId = watch("billable_item_id");
  const watchedItems = watch("items");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (isOpen) {
      loadSiteLookup();
      loadInvoiceTypeLookup();
    }
  }, [isOpen]);

  // Auto-select first invoice type when types are loaded
  useEffect(() => {
    if (
      invoiceTypeList.length > 0 &&
      !watchedBillableType &&
      mode === "create"
    ) {
      setValue("billable_item_type", invoiceTypeList[0].id);
    }
  }, [invoiceTypeList, mode, watchedBillableType, setValue]);

  useEffect(() => {
    if (watchedSiteId) {
      loadBuildingLookup();
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [watchedSiteId]);

  useEffect(() => {
    if (watchedBuildingId && watchedSiteId) {
      loadSpaceLookup();
    } else {
      setSpaceList([]);
    }
  }, [watchedBuildingId, watchedSiteId]);

  useEffect(() => {
    if (watchedBillableType && watchedSiteId) {
      loadBillableItemLookup();
    } else {
      setBillableItemList([]);
    }
  }, [watchedBillableType, watchedSiteId]);

  // Load tenant details when space is selected
  useEffect(() => {
    if (watchedSpaceId && mode === "create") {
      loadTenantDetails();
    }
  }, [watchedSpaceId, mode]);

  // Calculate totals when items change
  useEffect(() => {
    if (watchedItems && watchedItems.length > 0) {
      const subtotal = watchedItems.reduce((sum, item) => {
        return sum + (item.amount || 0);
      }, 0);
      const totalTax = watchedItems.reduce((sum, item) => {
        const itemAmount = item.amount || 0;
        const itemTaxPercent = item.tax || 5;
        const itemTax = (itemAmount * itemTaxPercent) / 100;
        return sum + itemTax;
      }, 0);
      const grandTotal = subtotal + totalTax;
      setValue("totals.sub", subtotal, { shouldValidate: false });
      setValue("totals.tax", totalTax, { shouldValidate: false });
      setValue("totals.grand", grandTotal, { shouldValidate: false });
    }
  }, [watchedItems, setValue]);

  // Load totals when period is selected for an item
  const loadPeriodTotals = async (periodId: string, index: number) => {
    if (!watchedBillableType || !watchedSiteId || !periodId) return;

    try {
      const params = new URLSearchParams();
      params.append("billable_item_type", watchedBillableType);
      params.append("billable_item_id", periodId);

      const response = await invoiceApiService.getInvoiceTotals(params);
      if (response?.success && response.data) {
        const totals = response.data;
        const subtotal = Number(totals.subtotal || 0);

        // Update the item amount
        setValue(`items.${index}.amount`, subtotal, { shouldValidate: false });

        // Recalculate totals
        const allItems = getValues("items");
        const newSubtotal = allItems.reduce((sum, item) => {
          return sum + (item.amount || 0);
        }, 0);
        const totalTax = allItems.reduce((sum, item) => {
          const itemAmount = item.amount || 0;
          const itemTaxPercent = item.tax || 5;
          const itemTax = (itemAmount * itemTaxPercent) / 100;
          return sum + itemTax;
        }, 0);
        const grandTotal = newSubtotal + totalTax;

        setValue("totals.sub", newSubtotal, { shouldValidate: false });
        setValue("totals.tax", totalTax, { shouldValidate: false });
        setValue("totals.grand", grandTotal, { shouldValidate: false });
      }
    } catch (error) {
      console.error("Failed to load period totals:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [invoice?.id, isOpen, mode]);

  useEffect(() => {
    if (
      watchedBillableItemId &&
      watchedBillableType &&
      !totalsAutoFilled &&
      !totalsLoaded
    ) {
      loadBillableItemTotals();
    }
  }, [watchedBillableItemId, watchedBillableType]);

  const loadSiteLookup = async () => {
    try {
      const lookup = await siteApiService.getSiteLookup();
      if (lookup.success) {
        setSiteList(lookup.data || []);
      }
    } catch (error) {
      console.error("Failed to load sites:", error);
      setSiteList([]);
    }
  };

  const loadBuildingLookup = async () => {
    if (!watchedSiteId) return;
    try {
      const lookup = await buildingApiService.getBuildingLookup(watchedSiteId);
      if (lookup.success) {
        setBuildingList(lookup.data || []);
      }
    } catch (error) {
      console.error("Failed to load buildings:", error);
      setBuildingList([]);
    }
  };

  const loadSpaceLookup = async () => {
    if (!watchedSiteId || !watchedBuildingId) return;
    try {
      const lookup = await spacesApiService.getSpaceLookup(
        watchedSiteId,
        watchedBuildingId,
      );
      if (lookup.success) {
        setSpaceList(lookup.data || []);
      }
    } catch (error) {
      console.error("Failed to load spaces:", error);
      setSpaceList([]);
    }
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
            })),
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

  const loadBillableItemLookup = async () => {
    if (!watchedBillableType || !watchedSiteId) {
      setBillableItemList([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("site_id", watchedSiteId);
      params.append("billable_item_type", watchedBillableType);

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
    } catch (error) {
      console.error("Failed to load billable items:", error);
      setBillableItemList([]);
    }
  };

  const loadTenantDetails = async () => {
    if (!watchedSpaceId) return;
    try {
      const response = await tenantsApiService.getSpaceTenants(watchedSpaceId);
      if (response?.success && response.data && response.data.length > 0) {
        const tenant = response.data[0]; // Get first tenant
        setValue("tenant_id", tenant.id || tenant.tenant_id || "");
        setValue("tenant_name", tenant.name || tenant.tenant_name || "");
        setValue("tenant_email", tenant.email || "");
        setValue("tenant_phone", tenant.phone || "");
      }
    } catch (error) {
      console.error("Failed to load tenant details:", error);
    }
  };

  const loadBillableItemTotals = async () => {
    if (!watchedBillableItemId || !watchedBillableType) return;

    try {
      const params = new URLSearchParams();
      params.append("billable_item_type", watchedBillableType);
      params.append("billable_item_id", watchedBillableItemId);

      const response = await invoiceApiService.getInvoiceTotals(params);
      if (response?.success && response.data) {
        const totals = response.data;
        // Only fetch subtotal from API
        const subtotal = Number(totals.subtotal || 0);
        setValue("totals.sub", subtotal);
        // Tax percentage remains editable (don't overwrite if already set)
        // Grand total will be calculated by useEffect
        setTotalsAutoFilled(true);
        setTotalsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load totals:", error);
    }
  };

  const loadAll = async () => {
    setTotalsAutoFilled(false);
    setTotalsLoaded(false);

    reset(
      invoice && mode !== "create"
        ? {
            invoice_no: invoice.invoice_no || "",
            site_id: invoice.site_id || "",
            building_id: (invoice as any).building_id || "",
            space_id: (invoice as any).space_id || "",
            tenant_id: invoice.customer_id || "",
            tenant_name: invoice.customer_name || "",
            tenant_email: "",
            tenant_phone: "",
            date: invoice.date || new Date().toISOString().split("T")[0],
            due_date: invoice.due_date || "",
            status: invoice.status || "draft",
            currency: invoice.currency || "INR",
            billable_item_type: invoice.billable_item_type || "",
            billable_item_id: invoice.billable_item_id || "",
            items:
              invoice.lines && invoice.lines.length > 0
                ? invoice.lines.map((line) => ({
                    item: line.description || "",
                    description: line.description || "",
                    amount: line.price || 0,
                    tax: line.taxPct || 5,
                  }))
                : emptyFormData.items,
            totals: invoice.totals || { sub: 0, tax: 5, grand: 0 },
            payments: [],
          }
        : emptyFormData,
    );

    if (invoice && mode !== "create") {
      if (invoice.site_id) {
        await loadBuildingLookup();
      }
      if ((invoice as any).building_id && invoice.site_id) {
        await loadSpaceLookup();
      }
      if (invoice.billable_item_type) {
        await loadBillableItemLookup();
      }
      if (invoice.billable_item_id && invoice.billable_item_type) {
        setTotalsLoaded(true);
        if (invoice.totals) {
          setTotalsAutoFilled(true);
        }
      }
    }

    setFormLoading(false);
  };

  const isReadOnly = mode === "view";
  const billable_items = billableItemList;

  const onSubmitForm = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    try {
      const invoiceData: Partial<Invoice> = {
        invoice_no: data.invoice_no,
        site_id: data.site_id,
        building_id: data.building_id,
        space_id: data.space_id,
        customer_id: data.tenant_id,
        customer_name: data.tenant_name,
        date: data.date,
        due_date: data.due_date,
        status: data.status || "draft",
        currency: data.currency || "INR",
        billable_item_type: data.billable_item_type,
        billable_item_id: data.billable_item_id,
        lines: data.items.map((item) => ({
          id: "",
          invoiceId: "",
          code: "",
          description: item.description || item.item || "",
          qty: 1,
          price: item.amount || 0,
          taxPct: item.tax || 5,
        })),
        totals: {
          sub: data.totals?.sub ?? 0,
          tax: data.totals?.tax ?? 5, // Tax percentage (default 5%)
          grand: data.totals?.grand ?? 0,
        },
        payments:
          data.payments
            ?.filter((p) => p.paid_at) // Only include payments with paid_at
            .map(
              (p): PaymentInput => ({
                method: p.method,
                ref_no: p.ref_no,
                amount: p.amount || 0,
                paid_at: p.paid_at!,
              }),
            ) || [],
      };
      await onSave(invoiceData);
      onClose();
      reset(emptyFormData);
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    append({
      item: "",
      description: "",
      amount: 0,
      tax: 5,
    });
  };

  const isFieldDisabled = (fieldName: string) => {
    if (isReadOnly) return true;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create New Invoice"
              : mode === "edit"
                ? "Edit Invoice"
                : "View Invoice"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmitForm)}
              className="space-y-6"
              id="invoice-form"
            >
              {/* Header Section */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_no">Invoice No</Label>
                  <Input
                    id="invoice_no"
                    {...register("invoice_no")}
                    disabled={isReadOnly}
                    placeholder="Auto-generated"
                  />
                </div>
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
                    disabled={isReadOnly}
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

              <Separator />

              {/* Property Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Details</h3>
                <div className="grid grid-cols-3 gap-4">
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
                            setValue("building_id", "");
                            setValue("space_id", "");
                            setValue("tenant_id", "");
                            setValue("tenant_name", "");
                            setValue("tenant_email", "");
                            setValue("tenant_phone", "");
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
                      <p className="text-sm text-red-500">
                        {errors.site_id.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="building_id">Building</Label>
                    <Controller
                      name="building_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setValue("space_id", "");
                            setValue("tenant_id", "");
                            setValue("tenant_name", "");
                            setValue("tenant_email", "");
                            setValue("tenant_phone", "");
                          }}
                          disabled={isReadOnly || !watchedSiteId}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !watchedSiteId
                                  ? "Select site first"
                                  : "Select building"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {buildingList.map((building) => (
                              <SelectItem key={building.id} value={building.id}>
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="space_id">Space *</Label>
                    <Controller
                      name="space_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={isReadOnly || !watchedSiteId}
                        >
                          <SelectTrigger
                            className={errors.space_id ? "border-red-500" : ""}
                          >
                            <SelectValue
                              placeholder={
                                !watchedSiteId
                                  ? "Select site first"
                                  : "Select space"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {spaceList.map((space) => (
                              <SelectItem key={space.id} value={space.id}>
                                {space.name || space.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.space_id && (
                      <p className="text-sm text-red-500">
                        {errors.space_id.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant_name">Customer Name</Label>
                    <Input
                      id="tenant_name"
                      {...register("tenant_name")}
                      disabled={isReadOnly}
                      placeholder="Auto-filled from space"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant_email">Email</Label>
                    <Input
                      id="tenant_email"
                      type="email"
                      {...register("tenant_email")}
                      disabled={isReadOnly}
                      placeholder="Auto-filled from space"
                    />
                    {errors.tenant_email && (
                      <p className="text-sm text-red-500">
                        {errors.tenant_email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant_phone">Phone</Label>
                    <Input
                      id="tenant_phone"
                      {...register("tenant_phone")}
                      disabled={isReadOnly}
                      placeholder="Auto-filled from space"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Invoice Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Invoice Items</h3>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  )}
                </div>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24">Tax %</TableHead>
                        <TableHead className="w-32">Amount</TableHead>
                        {!isReadOnly && (
                          <TableHead className="w-16"></TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Controller
                              name={`items.${index}.item`}
                              control={control}
                              render={({ field: itemField }) => (
                                <Select
                                  value={itemField.value || ""}
                                  onValueChange={async (value) => {
                                    itemField.onChange(value);
                                    // Find the period ID from the selected value
                                    const selectedPeriod =
                                      billableItemList.find(
                                        (item) =>
                                          item.name === value ||
                                          item.id === value,
                                      );
                                    if (selectedPeriod) {
                                      await loadPeriodTotals(
                                        selectedPeriod.id,
                                        index,
                                      );
                                    }
                                  }}
                                  disabled={
                                    isReadOnly ||
                                    !watchedSiteId ||
                                    !watchedBillableType
                                  }
                                >
                                  <SelectTrigger
                                    className={
                                      errors.items?.[index]?.item
                                        ? "border-red-500"
                                        : ""
                                    }
                                  >
                                    <SelectValue
                                      placeholder={
                                        !watchedSiteId
                                          ? "Select site first"
                                          : !watchedBillableType
                                            ? "Select invoice type first"
                                            : billableItemList.length === 0
                                              ? "No periods available"
                                              : "Select period"
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {billableItemList.map((item: any) => (
                                      <SelectItem
                                        key={item.id}
                                        value={item.name || item.id}
                                      >
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.items?.[index]?.item && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.items[index]?.item?.message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              {...register(`items.${index}.description`)}
                              disabled={isReadOnly}
                              placeholder="Enter description"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`items.${index}.tax`, {
                                setValueAs: (v) => (v === "" ? 5 : Number(v)),
                              })}
                              disabled={isReadOnly}
                              placeholder="5"
                              defaultValue={5}
                              className={
                                errors.items?.[index]?.tax
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {errors.items?.[index]?.tax && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.items[index]?.tax?.message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`items.${index}.amount`, {
                                setValueAs: (v) => (v === "" ? 0 : Number(v)),
                              })}
                              disabled={isReadOnly}
                              placeholder="0.00"
                              className={
                                errors.items?.[index]?.amount
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {errors.items?.[index]?.amount && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.items[index]?.amount?.message}
                              </p>
                            )}
                          </TableCell>
                          {!isReadOnly && (
                            <TableCell>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {errors.items && (
                  <p className="text-sm text-red-500">{errors.items.message}</p>
                )}
              </div>

              <Separator />

              {/* Totals Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm">
                    {systemCurrency.format(watch("totals.sub") || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tax:</span>
                  <span className="text-sm">
                    {systemCurrency.format(watch("totals.tax") || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold">Grand Total:</span>
                  <span className="text-lg font-bold">
                    {systemCurrency.format(watch("totals.grand") || 0)}
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              reset(emptyFormData);
            }}
          >
            Cancel
          </Button>
          {!isReadOnly && (
            <Button
              type="submit"
              form="invoice-form"
              disabled={isSubmitting || formIsSubmitting}
            >
              {isSubmitting || formIsSubmitting ? "Saving..." : "Save Invoice"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
