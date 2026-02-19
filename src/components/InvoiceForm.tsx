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
import { Invoice } from "@/interfaces/invoices_interfaces";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "@/schemas/invoice.schema";
import { toast } from "@/components/ui/app-toast";
import { useLoader } from "@/context/LoaderContext";
import { withFallback } from "@/helpers/commonHelper";
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
  totals: { sub: 0, tax: 0, grand: 0 },
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
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    mode: "onChange",
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
      if (invoice && mode !== "create") {
        loadAll();
      } else {
        reset(emptyFormData);
      }
    }
  }, [isOpen, invoice, mode]);

  // Load buildings when site changes
  useEffect(() => {
    if (watchedSiteId) {
      loadBuildingLookup(watchedSiteId);
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [watchedSiteId]);

  // Load spaces when site or building changes
  useEffect(() => {
    if (watchedSiteId) {
      loadSpaceLookup(watchedSiteId, watchedBuildingId);
    } else {
      setSpaceList([]);
    }
  }, [watchedSiteId, watchedBuildingId]);

  useEffect(() => {
    if (mode === "create") {
      if (watchedBillableType && watchedSiteId && siteList.length > 0) {
        loadBillableItemLookup(
          watchedBillableType,
          watchedSiteId,
          watchedSpaceId,
        );
      } else if (!watchedBillableType || !watchedSiteId) {
        setBillableItemList([]);
        setValue("billable_item_id", "");
      }
    }
  }, [
    watchedBillableType,
    watchedSiteId,
    watchedSpaceId,
    setValue,
    mode,
    siteList.length,
  ]);

  useEffect(() => {
    // Auto-load totals only once when billable item is first selected
    if (
      mode === "create" &&
      watchedBillableType &&
      watchedBillableItemId &&
      !totalsLoaded
    ) {
      loadInvoiceTotals(watchedBillableType, watchedBillableItemId);
      setTotalsLoaded(true);
    } else if (
      mode === "create" &&
      (!watchedBillableItemId || !watchedBillableType)
    ) {
      // Reset totals loaded flag if billable item is cleared
      setTotalsLoaded(false);
      if (!watchedBillableItemId || !watchedBillableType) {
        setValue("totals.sub", 0);
        setValue("totals.tax", 0);
        setValue("totals.grand", 0);
      }
      setTotalsAutoFilled(false);
    }
  }, [
    watchedBillableType,
    watchedBillableItemId,
    mode,
    setValue,
    totalsLoaded,
  ]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadBuildingLookup = async (siteId: string) => {
    const lookup = await buildingApiService.getBuildingLookup(siteId);
    if (lookup.success) setBuildingList(lookup.data || []);
  };

  const loadSpaceLookup = async (siteId: string, buildingId?: string) => {
    const lookup = await spacesApiService.getSpaceLookup(siteId, buildingId);
    if (lookup.success) setSpaceList(lookup.data || []);
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

  const loadBillableItemLookup = async (
    type?: string,
    siteId?: string,
    spaceId?: string,
  ) => {
    if (!type || !siteId) {
      setBillableItemList([]);
      setValue("billable_item_id", "");
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("site_id", siteId);
      params.append("billable_item_type", type);
      if (spaceId) {
        params.append("space_id", spaceId);
      }

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

  const loadAll = async () => {
    setTotalsAutoFilled(false);
    setTotalsLoaded(false); // Reset totals loaded flag when form loads

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
            totals: invoice.totals || { sub: 0, tax: 0, grand: 0 },
            payments: [],
          }
        : emptyFormData,
    );

    // Preload building and space lookups for existing invoice (edit/view mode)
    if (invoice && mode !== "create" && invoice.site_id) {
      await loadBuildingLookup(invoice.site_id);
      const buildingId = (invoice as any).building_id;
      if (invoice.site_id) {
        await loadSpaceLookup(invoice.site_id, buildingId);
      }
    }

    // Preload billable item lookup for existing invoice (edit/view mode)
    if (
      invoice &&
      mode !== "create" &&
      invoice.site_id &&
      invoice.billable_item_type
    ) {
      const spaceId = (invoice as any).space_id;
      await loadBillableItemLookup(
        invoice.billable_item_type,
        invoice.site_id,
        spaceId,
      );
    }
  };

  const normalizeBillableTypeForSubmit = (typeId?: string) => {
    if (!typeId) return "";

    const invoiceType = invoiceTypeList.find((item) => item.id === typeId);
    if (!invoiceType) return typeId;

    const typeName = invoiceType.name.toLowerCase();
    if (typeName.includes("lease") || typeName.includes("lease charge")) {
      return "lease charge";
    } else if (
      typeName.includes("owner maintenance") ||
      typeName.includes("owner_maintenance")
    ) {
      return "owner maintenance";
    } else if (
      typeName.includes("work order") ||
      typeName.includes("work_order")
    ) {
      return "work order";
    }

    return typeName.replace(/_/g, " ");
  };

  const onSubmitForm = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    const payload: Partial<Invoice> = {
      ...invoice,
      ...data,
      id: invoice?.id,
      invoice_no: invoice?.invoice_no,
      billable_item_type: normalizeBillableTypeForSubmit(
        data.billable_item_type,
      ),
      billable_item_id: data.billable_item_id,
      totals: {
        sub: data.totals?.sub ?? 0,
        tax: data.totals?.tax ?? 0,
        grand: data.totals?.grand ?? 0,
      },
      payments: invoice?.payments || [], // Preserve existing payments, don't modify from form
      updated_at: new Date().toISOString(),
    };
    const response = await onSave(payload);
    setIsSubmitting(false);
    if (response?.success) {
      handleClose();
    }
  };

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList([]);
    setSpaceList([]);
    setBillableItemList([]);
    onClose();
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

  const fallBillableItems = invoice?.billable_item_id
    ? {
        id: invoice.billable_item_id,
        name: invoice.billable_item_name,
      }
    : null;

  const billable_items = withFallback(billableItemList, fallBillableItems);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Invoice"}
            {mode === "edit" && "Edit Invoice"}
            {mode === "view" && "Invoice Details"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2 -mr-2">
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmitForm)}
              className="space-y-4"
              id="invoice-form"
            >
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
                    <Label htmlFor="space_id">Space</Label>
                    <Controller
                      name="space_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={isReadOnly || !watchedSiteId}
                        >
                          <SelectTrigger>
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

                {/* Row 2: Invoice Type, Billable Item */}
                <div className="grid grid-cols-2 gap-4">
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
                          disabled={isReadOnly}
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
                          disabled={isReadOnly}
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
            onClick={handleClose}
            disabled={isSubmitting || formIsSubmitting}
          >
            Cancel
          </Button>
          {mode !== "view" && (
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
