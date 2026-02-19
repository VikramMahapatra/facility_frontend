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
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { Invoice, PaymentInput } from "@/interfaces/invoices_interfaces";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { useForm, Controller } from "react-hook-form";
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
  site_id: "",
  building_id: "",
  space_id: "",
  date: new Date().toISOString().split("T")[0],
  due_date: "",
  status: "draft",
  currency: "INR",
  billable_item_type: "",
  billable_item_id: "",
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

  useEffect(() => {
    if (isOpen) {
      loadSiteLookup();
      loadInvoiceTypeLookup();
    }
  }, [isOpen]);

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

  // Calculate grand total when subtotal or tax changes
  const watchedSubtotal = watch("totals.sub");
  const watchedTax = watch("totals.tax");

  useEffect(() => {
    const subtotal = Number(watchedSubtotal) || 0;
    const taxPercent = Number(watchedTax) || 5;
    const grandTotal = subtotal + (subtotal * taxPercent) / 100;
    setValue("totals.grand", grandTotal, { shouldValidate: false });
  }, [watchedSubtotal, watchedTax, setValue]);

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
        // Tax is always default 5%
        setValue("totals.tax", 5);
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
            site_id: invoice.site_id || "",
            building_id: (invoice as any).building_id || "",
            space_id: (invoice as any).space_id || "",
            date: invoice.date || new Date().toISOString().split("T")[0],
            due_date: invoice.due_date || "",
            status: invoice.status || "draft",
            currency: invoice.currency || "INR",
            billable_item_type: invoice.billable_item_type || "",
            billable_item_id: invoice.billable_item_id || "",
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
        site_id: data.site_id,
        building_id: data.building_id,
        space_id: data.space_id,
        date: data.date,
        due_date: data.due_date,
        status: data.status || "draft",
        currency: data.currency || "INR",
        billable_item_type: data.billable_item_type,
        billable_item_id: data.billable_item_id,
        totals: {
          sub: data.totals?.sub ?? 0,
          tax: data.totals?.tax ?? 5,
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

  const isFieldDisabled = (fieldName: string) => {
    if (isReadOnly) return true;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create Invoice"
              : mode === "edit"
                ? "Edit Invoice"
                : "View Invoice"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmitForm)}
              className="space-y-4"
              id="invoice-form"
            >
              {/* Invoice Type Selection - At the top */}
              <div className="space-y-3 pb-3 border-b">
                <Label className="text-base font-semibold">
                  Invoice Type *
                </Label>
                <Controller
                  name="billable_item_type"
                  control={control}
                  render={({ field }) => {
                    const hasSelection = !!field.value;

                    return (
                      <div className="flex flex-wrap gap-3">
                        {invoiceTypeList.map((item) => {
                          const isSelected = field.value === item.id;

                          return (
                            <Button
                              key={item.id}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className={
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : hasSelection
                                    ? "hidden"
                                    : "hover:bg-muted hover:border-primary/50"
                              }
                              style={isSelected ? { width: "100%" } : {}}
                              onClick={() => {
                                if (isSelected) {
                                  field.onChange("");
                                  setValue("billable_item_id", "");
                                } else {
                                  field.onChange(item.id);
                                  setValue("billable_item_id", "");
                                }
                              }}
                              disabled={isReadOnly}
                            >
                              {item.name}
                            </Button>
                          );
                        })}
                      </div>
                    );
                  }}
                />
                {errors.billable_item_type && (
                  <p className="text-sm text-red-500">
                    {errors.billable_item_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {/* Row 1: Site, Building, Space */}
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
                  </div>
                </div>

                {/* Row 2: Billable Item */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billable_item_id">
                      {(() => {
                        const selectedType = invoiceTypeList.find(
                          (type) => type.id === watchedBillableType,
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
                          disabled={isReadOnly || !watchedBillableType}
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

                {/* Row 3: Invoice Date, Due Date, Currency */}
                <div className="grid grid-cols-3 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      {...register("currency")}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                {/* Row 4: Totals */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub">Subtotal ({formatCurrency(0)})</Label>
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
                    <Label htmlFor="tax">Tax (%)</Label>
                    <Input
                      id="tax"
                      type="number"
                      {...register("totals.tax", {
                        setValueAs: (v) => (v === "" ? 5 : Number(v)),
                      })}
                      disabled={isFieldDisabled("totals.tax")}
                      defaultValue={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grand">
                      Grand Total ({formatCurrency(0)})
                    </Label>
                    <Input
                      id="grand"
                      type="number"
                      {...register("totals.grand", {
                        setValueAs: (v) => (v === "" ? 0 : Number(v)),
                      })}
                      disabled={true}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
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
              {isSubmitting || formIsSubmitting ? "Saving..." : "Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
