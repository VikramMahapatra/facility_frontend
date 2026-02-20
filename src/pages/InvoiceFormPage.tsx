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
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  X,
  ArrowLeft,
  FileText,
  Wrench,
  Home,
  Car,
  Paperclip,
} from "lucide-react";
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
  user_id: "",
  customer_id: "",
  customer_name: "",
  tenant_email: "",
  tenant_phone: "",
  date: new Date().toISOString().split("T")[0],
  due_date: "",
  status: "draft",
  currency: "INR",
  code: "",
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
  notes: "",
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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
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
  const watchedBillableType = watch("code");
  const watchedItems = watch("items");

  // Sync code to billable_item_type whenever code changes
  useEffect(() => {
    if (watchedBillableType) {
      setValue("billable_item_type", watchedBillableType);
    } else {
      setValue("billable_item_type", "");
    }
  }, [watchedBillableType, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    loadSiteLookup();
    loadInvoiceTypeLookup();
    // Load preview invoice number for create mode
    if (formMode === "create") {
      loadInvoicePreviewNumber();
    }
  }, [formMode]);

  // Hardcode invoice types
  const hardcodedInvoiceTypes: { id: string; name: string }[] = [
    { id: "rent", name: "Rent" },
    { id: "workorder", name: "Work Order" },
    { id: "owner_maintenance", name: "Owner Maintenance" },
    { id: "parking_pass", name: "Parking Pass" },
  ];

  // Use hardcoded types if API types are not loaded yet
  const displayInvoiceTypes =
    invoiceTypeList.length > 0 ? invoiceTypeList : hardcodedInvoiceTypes;

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
    if (watchedSpaceId && watchedBillableType) {
      loadBillableItemLookup();
    } else {
      setBillableItemList([]);
    }
  }, [watchedSpaceId, watchedBillableType]);

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

  // Removed useEffect for loadBillableItemTotals - no longer needed

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

  const loadInvoicePreviewNumber = async () => {
    try {
      const response = await withLoader(async () => {
        return await invoiceApiService.getInvoicePreviewNumber();
      });
      if (response?.success && response.data) {
        const invoiceNo =
          response.data.invoice_no ||
          response.data.invoiceNo ||
          response.data.invoice_number ||
          response.data;
        if (invoiceNo) {
          setValue(
            "invoice_no",
            typeof invoiceNo === "string" ? invoiceNo : String(invoiceNo),
          );
        }
      }
    } catch (error) {
      console.error("Failed to load preview invoice number:", error);
    }
  };

  const loadBillableItemLookup = async () => {
    if (!watchedSpaceId || !watchedBillableType) {
      setBillableItemList([]);
      return;
    }
    try {
      // Use the new endpoint: /api/invoices/customer-pending-charges
      // Need space_id and code (invoice type)
      const response = await invoiceApiService.getCustomerPendingCharges(
        watchedSpaceId,
        watchedBillableType,
      );

      if (response?.success && response.data) {
        // Response structure: { data: [{ customer_id, customer_name, charges: [{ type, id, period }] }] }
        const dataArray = Array.isArray(response.data) ? response.data : [];

        // Extract customer details from the first customer (if available)
        if (dataArray.length > 0) {
          const firstCustomer = dataArray[0];
          if (firstCustomer.customer_id) {
            setValue("customer_id", firstCustomer.customer_id);
          }
          if (firstCustomer.customer_name) {
            setValue("customer_name", firstCustomer.customer_name);
          }
        }

        // Extract all charges from all customers and filter by type
        const allCharges: any[] = [];
        dataArray.forEach((customer: any) => {
          if (customer.charges && Array.isArray(customer.charges)) {
            customer.charges.forEach((charge: any) => {
              // Filter charges that match the selected invoice type
              const chargeType = charge.type?.toLowerCase() || "";
              const selectedType = watchedBillableType?.toLowerCase() || "";

              // Match types (handle variations like "rent", "workorder", "owner_maintenance", "parking_pass")
              if (
                chargeType === selectedType ||
                chargeType.includes(selectedType) ||
                selectedType.includes(chargeType)
              ) {
                allCharges.push({
                  id: charge.id,
                  name: charge.period || charge.name || charge.id,
                  period: charge.period,
                  type: charge.type,
                  customer_id: customer.customer_id, // Store customer_id with each charge
                });
              }
            });
          }
        });

        setBillableItemList(allCharges);
      } else {
        setBillableItemList([]);
      }
    } catch (error) {
      console.error("Failed to load billable items:", error);
      setBillableItemList([]);
    }
  };

  // Removed loadBillableItemTotals - no longer needed

  // Load totals when period is selected for an item
  const loadPeriodTotals = async (
    periodId: string,
    customerId: string,
    index: number,
  ) => {
    if (!periodId || !customerId || !watchedBillableType) return;

    try {
      // Use period ID, customer_id, and billable_item_type to get the amount
      const params = new URLSearchParams();
      params.append("billable_item_id", periodId);
      params.append("customer_id", customerId);
      params.append("billable_item_type", watchedBillableType);

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
            user_id: (invoice as any).customer_id || "",
            customer_id: (invoice as any).customer_id || "",
            customer_name: (invoice as any).customer_name || "",
            tenant_email: "",
            tenant_phone: "",
            date: invoice.date || new Date().toISOString().split("T")[0],
            due_date: invoice.due_date || "",
            status: invoice.status || "draft",
            currency: invoice.currency || "INR",
            code: "",
            billable_item_type: "",
            billable_item_id: "",
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
      if ((invoice as any).space_id) {
        await loadBillableItemLookup();
      }
    }

    setFormLoading(false);
  };

  const isReadOnly = formMode === "view";
  const billable_items = billableItemList;

  const onSubmitForm = async (data: InvoiceFormValues, saveAsDraft: boolean = false) => {
    setIsSubmitting(true);
    try {
      const invoiceData: any = {
        invoice_no: data.invoice_no,
        site_id: data.site_id,
        building_id: data.building_id,
        space_id: data.space_id,
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        date: data.date,
        due_date: data.due_date,
        status: saveAsDraft ? "draft" : (data.status || "issued"),
        currency: data.currency || "INR",
        billable_item_type: data.code || "", // Pass code to billable_item_type
        billable_item_id: "", // No longer needed - using period IDs directly
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
        notes: data.notes || "",
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
          } successfully${saveAsDraft ? " as draft" : ""}.`,
        );
        if (!saveAsDraft) {
          navigate("/invoices");
        } else {
          // If saving as draft, stay on the page
          setShowSaveDialog(false);
        }
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

  const handleSaveClick = () => {
    // Trigger validation first
    handleSubmit((data) => {
      setShowSaveDialog(true);
    })();
  };

  const handleSaveAsDraft = () => {
    handleSubmit((data) => {
      onSubmitForm(data, true);
    })();
  };

  const handleSaveAndContinue = () => {
    handleSubmit((data) => {
      onSubmitForm(data, false);
    })();
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
                type="button"
                onClick={() => {
                  // Trigger form validation first
                  handleSubmit((data) => {
                    setShowSaveDialog(true);
                  })();
                }}
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
          <form className="space-y-6" id="invoice-form">
            {/* Invoice Type Selection */}
            {formMode === "create" && (
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Invoice Type *
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {displayInvoiceTypes.map((type) => {
                        const isSelected = field.value === type.id;
                        const getIcon = () => {
                          const name = type.name.toLowerCase();
                          const id = type.id?.toLowerCase() || "";

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
                                  field.onChange("");
                                  setValue("billable_item_type", "");
                                  setBillableItemList([]);
                                } else {
                                  field.onChange(type.id);
                                  setValue("billable_item_type", type.id);
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
                      })}
                    </div>
                    {errors.code && (
                      <p className="text-sm text-red-500">
                        {errors.code.message}
                      </p>
                    )}
                  </div>
                )}
              />
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
                  <p className="text-sm text-red-500">{errors.date.message}</p>
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
                          setValue("customer_id", "");
                          setValue("customer_name", "");
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
                          setValue("customer_id", "");
                          setValue("customer_name", "");
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
            {watchedSpaceId && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Customer Name
                    </Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <p className="font-medium">
                        {watch("customer_name") || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <p className="font-medium">
                        {watch("tenant_email") || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <p className="font-medium">
                        {watch("tenant_phone") || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      <TableHead className="w-64">Period</TableHead>
                      <TableHead className="min-w-[300px]">
                        Description
                      </TableHead>
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
                                    (item) =>
                                      item.name === value || item.id === value,
                                  );
                                  if (selectedPeriod) {
                                    const customerId =
                                      watch("customer_id") ||
                                      selectedPeriod.customer_id ||
                                      "";
                                    await loadPeriodTotals(
                                      selectedPeriod.id,
                                      customerId,
                                      index,
                                    );
                                  }
                                }}
                                disabled={
                                  isReadOnly ||
                                  !watchedSpaceId ||
                                  !watchedBillableType
                                }
                              >
                                <SelectTrigger
                                  className={`w-64 ${
                                    errors.items?.[index]?.item
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                >
                                  <SelectValue
                                    placeholder={
                                      !watchedSpaceId
                                        ? "Select space first"
                                        : !watchedBillableType
                                          ? "Select invoice type first"
                                          : billableItemList.length === 0
                                            ? "No periods available"
                                            : "Select period"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {billableItemList.map((item: any) => {
                                    // Check if this period is already selected in another row
                                    const isSelectedInOtherRow = fields.some(
                                      (field, otherIndex) =>
                                        otherIndex !== index &&
                                        watch(`items.${otherIndex}.item`) ===
                                          (item.name || item.id),
                                    );

                                    return (
                                      <SelectItem
                                        key={item.id}
                                        value={item.name || item.id}
                                        disabled={isSelectedInOtherRow}
                                      >
                                        {item.name}
                                        {isSelectedInOtherRow &&
                                          " (Already selected)"}
                                      </SelectItem>
                                    );
                                  })}
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
                            className="w-full min-w-[300px]"
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
                              errors.items?.[index]?.tax ? "border-red-500" : ""
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

            <Separator />

            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">
                Notes
              </Label>
              <Textarea
                id="notes"
                {...register("notes")}
                disabled={isReadOnly}
                placeholder="Add any additional notes or comments..."
                className="min-h-[100px]"
              />
            </div>

            <Separator />

            {/* Attachments Section */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Attachments</Label>
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Paperclip className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {attachments.length > 0
                        ? `${attachments.length} file(s) attached`
                        : "No attachments"}
                    </p>
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm bg-muted p-2 rounded"
                          >
                            <span className="truncate max-w-[300px]">
                              {file.name}
                            </span>
                            {!isReadOnly && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAttachments(
                                    attachments.filter((_, i) => i !== index),
                                  );
                                }}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {!isReadOnly && (
                    <div>
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setAttachments([...attachments, ...files]);
                          // Reset input
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          document.getElementById("file-upload")?.click();
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Attachment
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Save Invoice Dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Invoice</AlertDialogTitle>
              <AlertDialogDescription>
                How would you like to save this invoice?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel onClick={() => setShowSaveDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSaveAsDraft}
                disabled={isSubmitting || formIsSubmitting}
                className="bg-muted text-muted-foreground hover:bg-muted/80"
              >
                {isSubmitting || formIsSubmitting
                  ? "Saving..."
                  : "Save as Draft"}
              </AlertDialogAction>
              <AlertDialogAction
                onClick={handleSaveAndContinue}
                disabled={isSubmitting || formIsSubmitting}
              >
                {isSubmitting || formIsSubmitting
                  ? "Saving..."
                  : "Save & Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContentContainer>
  );
}
