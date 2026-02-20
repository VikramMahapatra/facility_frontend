import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, ArrowLeft, FileText, Wrench, Home, Car } from "lucide-react";
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
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useSettings } from "@/context/SettingsContext";

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

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const { withLoader } = useLoader();
  const [invoice, setInvoice] = useState<Invoice | undefined>();
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
    loadSiteLookup();
    loadInvoiceTypeLookup();
  }, []);

  // Don't auto-select - user must choose

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
    if (watchedSpaceId && formMode === "create") {
      loadTenantDetails();
    }
  }, [watchedSpaceId, formMode]);

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

  useEffect(() => {
    if (!id || formMode === "create") {
      loadAll();
      return;
    }
    loadInvoice();
  }, [id, formMode]);

  useEffect(() => {
    if (invoice && formMode !== "create") {
      loadAll();
    }
  }, [invoice?.id]);

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

  const loadInvoice = async () => {
    const response = await withLoader(async () => {
      return await invoiceApiService.getInvoiceById(id!);
    });

    if (response?.success && response.data) {
      setInvoice(response.data);
    } else {
      toast.error("Failed to load invoice details");
      navigate("/invoices");
    }
  };

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
      console.log("Raw invoice type API response:", response);
      if (response?.success) {
        const items = response.data?.data || response.data || [];
        console.log("Raw invoice type items:", items);
        if (Array.isArray(items) && items.length > 0) {
          const mappedItems = items.map((item: any) => ({
            id: item.id,
            name: item.name,
          }));
          console.log("Mapped invoice types:", mappedItems);
          setInvoiceTypeList(mappedItems);
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
        // Grand total will be calculated by useEffect
        setTotalsAutoFilled(true);
        setTotalsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load totals:", error);
    }
  };

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

  const loadAll = async () => {
    setTotalsAutoFilled(false);
    setTotalsLoaded(false);

    reset(
      invoice && formMode !== "create"
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

    if (invoice && formMode !== "create") {
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

  const isReadOnly = formMode === "view";
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
          tax: data.totals?.tax ?? 5,
          grand: data.totals?.grand ?? 0,
        },
        payments:
          data.payments
            ?.filter((p) => p.paid_at)
            .map(
              (p): PaymentInput => ({
                method: p.method,
                ref_no: p.ref_no,
                amount: p.amount || 0,
                paid_at: p.paid_at!,
              }),
            ) || [],
      };

      let response;
      if (formMode === "create") {
        response = await withLoader(async () => {
          return await invoiceApiService.addInvoice(invoiceData);
        });
      } else if (formMode === "edit" && invoice) {
        const updatedInvoice = {
          ...invoice,
          ...invoiceData,
          id: invoice.id || id,
          invoice_no: invoice.invoice_no,
          updated_at: new Date().toISOString(),
        };
        response = await withLoader(async () => {
          return await invoiceApiService.updateInvoice(updatedInvoice);
        });
      }

      if (response?.success) {
        toast.success(
          `Invoice has been ${
            formMode === "create" ? "created" : "updated"
          } successfully.`,
        );
        navigate("/invoices");
      } else if (response && !response.success) {
        if (response?.message) {
          toast.error(response.message);
        } else {
          toast.error("Failed to save invoice.");
        }
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice.");
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

  const handleClose = () => {
    navigate("/invoices");
  };

  return (
    <ContentContainer>
      <LoaderOverlay />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
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
                    : "View Invoice"}
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
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || formIsSubmitting}
            >
              Cancel
            </Button>
            {!isReadOnly && (
              <Button
                type="submit"
                form="invoice-form"
                disabled={isSubmitting || formIsSubmitting}
              >
                {isSubmitting || formIsSubmitting
                  ? "Saving..."
                  : "Save Invoice"}
              </Button>
            )}
          </div>
        </div>

        {formLoading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="space-y-6"
            id="invoice-form"
          >
            {/* Invoice Type Selection */}
            <Controller
              name="billable_item_type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {formMode === "create" && (
                    <>
                      <Label className="text-sm font-semibold">
                        Invoice Type *
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {invoiceTypeList.length > 0 ? (
                          invoiceTypeList.map((type) => {
                          const isSelected = field.value === type.id;
                          const getIcon = () => {
                            const name = type.name.toLowerCase();
                            const id = type.id?.toLowerCase() || "";
                            
                            // Check both name and id for better matching
                            if (
                              name.includes("lease") ||
                              name.includes("rent") ||
                              id.includes("rent")
                            ) {
                              return <FileText className="h-4 w-4" />;
                            } else if (
                              name.includes("work") ||
                              name.includes("order") ||
                              id.includes("workorder") ||
                              id.includes("work_order")
                            ) {
                              return <Wrench className="h-4 w-4" />;
                            } else if (
                              name.includes("parking") ||
                              name.includes("pass") ||
                              id.includes("parking") ||
                              id.includes("parking_pass")
                            ) {
                              return <Car className="h-4 w-4" />;
                            } else {
                              return <Home className="h-4 w-4" />;
                            }
                          };

                          return (
                            <Card
                              key={type.id}
                              className={`cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                                  : "border-border bg-muted/50 hover:bg-muted hover:border-primary/50"
                              }`}
                              onClick={() => {
                                if (!isReadOnly) {
                                  if (isSelected) {
                                    // If already selected, deselect it
                                    field.onChange("");
                                    setValue("billable_item_id", "");
                                  } else {
                                    // Otherwise, select it
                                    field.onChange(type.id);
                                    setValue("billable_item_id", "");
                                  }
                                }
                              }}
                            >
                              <CardContent className="p-3 flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-md transition-colors flex-shrink-0 ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-background"
                                  }`}
                                >
                                  {getIcon()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium transition-colors ${
                                      isSelected ? "text-primary" : ""
                                    }`}
                                  >
                                    {type.name}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                        ) : (
                          <div className="col-span-4 text-sm text-muted-foreground">
                            Loading invoice types...
                          </div>
                        )}
                      </div>
                      {errors.billable_item_type && (
                        <p className="text-sm text-red-500">
                          {errors.billable_item_type.message}
                        </p>
                      )}
                    </>
                  )}
                  {formMode !== "create" && field.value && (
                    <>
                      <Label className="text-sm font-semibold">
                        Invoice Type
                      </Label>
                      <div className="p-3 border rounded-md bg-muted/50">
                        <p className="text-sm font-medium">
                          {
                            invoiceTypeList.find(
                              (type) => type.id === field.value,
                            )?.name
                          }
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            />

            {formMode !== "create" && watchedBillableType && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Invoice Type</Label>
                <div className="p-4 border rounded-md bg-muted/50">
                  <p className="font-medium">
                    {
                      invoiceTypeList.find(
                        (type) => type.id === watchedBillableType,
                      )?.name
                    }
                  </p>
                </div>
              </div>
            )}

            <Separator />

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
                      {!isReadOnly && <TableHead className="w-16"></TableHead>}
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
                                  const selectedPeriod = billableItemList.find(
                                    (item) => item.name === value || item.id === value
                                  );
                                  if (selectedPeriod) {
                                    await loadPeriodTotals(selectedPeriod.id, index);
                                  }
                                }}
                                disabled={isReadOnly || !watchedSiteId || !watchedBillableType}
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
                                    <SelectItem key={item.id} value={item.name || item.id}>
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
                <p className="text-sm text-red-500">
                  {errors.items.message}
                </p>
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
    </ContentContainer>
  );
}
