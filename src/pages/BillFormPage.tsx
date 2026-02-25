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
import { Plus, X, ArrowLeft, Paperclip } from "lucide-react";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { vendorsApiService } from "@/services/procurements/vendorsapi";
import { Bill, PaymentInput } from "@/interfaces/invoices_interfaces";
import { billsApiService } from "@/services/financials/billsapi";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { billSchema, BillFormValues } from "@/schemas/bill.schema";
import { toast } from "@/components/ui/app-toast";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useSettings } from "@/context/SettingsContext";

const emptyFormData: BillFormValues = {
  bill_no: "",
  site_id: "",
  building_id: "",
  space_id: "",
  vendor_id: "",
  vendor_name: "",
  vendor_email: "",
  vendor_phone: "",
  date: new Date().toISOString().split("T")[0],
  status: "draft",
  currency: "INR",
  code: "workorder",
  billable_item_type: "workorder",
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

export default function BillFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const { withLoader } = useLoader();
  const [bill, setBill] = useState<Bill | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);
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
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    mode: "onSubmit",
    defaultValues: emptyFormData,
  });

  const watchedSiteId = watch("site_id");
  const watchedBuildingId = watch("building_id");
  const watchedSpaceId = watch("space_id");
  const watchedVendorId = watch("vendor_id");
  const watchedBillableType = watch("billable_item_type");
  const watchedItems = watch("items");

  // Sync code to billable_item_type - hardcoded to workorder
  useEffect(() => {
    setValue("code", "workorder");
    setValue("billable_item_type", "workorder");
  }, [setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    loadSiteLookup();
    loadVendorLookup();
    // Load preview bill number for create mode
    if (formMode === "create") {
      loadBillPreviewNumber();
    }
  }, [formMode]);

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
    if (watchedSpaceId && watchedBillableType && watchedSiteId) {
      loadBillableItemLookup();
    } else {
      setBillableItemList([]);
    }
  }, [watchedSpaceId, watchedBillableType, watchedSiteId]);

  // Load vendor details when vendor is selected
  useEffect(() => {
    if (watchedVendorId) {
      const selectedVendor = vendorList.find(
        (vendor) => vendor.id === watchedVendorId,
      );
      if (selectedVendor) {
        setValue("vendor_name", selectedVendor.name || "");
        setValue(
          "vendor_email",
          selectedVendor.contact?.email || selectedVendor.email || "",
        );
        setValue(
          "vendor_phone",
          selectedVendor.contact?.phone || selectedVendor.phone || "",
        );
      }
    } else {
      setValue("vendor_name", "");
      setValue("vendor_email", "");
      setValue("vendor_phone", "");
    }
  }, [watchedVendorId, vendorList, setValue]);

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
    loadBill();
  }, [id, formMode]);

  useEffect(() => {
    if (bill && formMode !== "create") {
      loadAll();
    }
  }, [bill?.id]);

  const loadBill = async () => {
    const response = await withLoader(async () => {
      return await billsApiService.getBillById(id!);
    });

    if (response?.success && response.data) {
      setBill(response.data);
    } else {
      toast.error("Failed to load bill details");
      navigate("/bills");
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

  const loadVendorLookup = async () => {
    try {
      const lookup = await vendorsApiService.getVendorLookup();
      if (lookup.success) {
        setVendorList(lookup.data || []);
      }
    } catch (error) {
      console.error("Failed to load vendors:", error);
      setVendorList([]);
    }
  };

  const loadBillPreviewNumber = async () => {
    try {
      // Note: This endpoint may need to be added to billsApiService
      // For now, we'll leave it empty or use a placeholder
      // You may need to add getBillPreviewNumber() to billsApiService
      const response = await withLoader(async () => {
        // Placeholder - you may need to implement this endpoint
        return { success: true, data: { bill_no: "" } };
      });
      if (response?.success && response.data) {
        const billNo = response.data.bill_no || response.data;
        if (billNo) {
          setValue(
            "bill_no",
            typeof billNo === "string" ? billNo : String(billNo),
          );
        }
      }
    } catch (error) {
      console.error("Failed to load preview bill number:", error);
    }
  };

  const loadBillableItemLookup = async () => {
    if (!watchedSpaceId || !watchedBillableType || !watchedSiteId) {
      setBillableItemList([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("site_id", watchedSiteId);
      params.append("billable_item_type", watchedBillableType);

      const response = await billsApiService.getBillEntityLookup(params);

      if (response?.success && response.data) {
        const items =
          response.data?.items ||
          response.data?.entities ||
          response.data ||
          [];

        setBillableItemList(
          items.map((item: any) => ({
            id: item.id,
            name: item.name || item.code || item.label || item.id,
            period: item.period,
            type: item.type,
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

  // Load totals when period is selected for an item
  const loadPeriodTotals = async (
    periodId: string,
    vendorId: string,
    index: number,
  ) => {
    if (!periodId || !vendorId || !watchedBillableType) return;

    try {
      const params = new URLSearchParams();
      params.append("billable_item_id", periodId);
      params.append("vendor_id", vendorId);
      params.append("billable_item_type", watchedBillableType);

      const response = await billsApiService.getBillTotals(params);
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
      bill && formMode !== "create"
        ? {
            bill_no: bill.bill_no || "",
            site_id: bill.site_id || "",
            building_id: (bill as any).building_id || "",
            space_id: (bill as any).space_id || "",
            vendor_id: bill.vendor_id || "",
            vendor_name: bill.vendor_name || "",
            vendor_email: (bill as any).vendor_email || "",
            vendor_phone: (bill as any).vendor_phone || "",
            date: bill.date || new Date().toISOString().split("T")[0],
            status:
              (bill.status as "draft" | "approved" | "paid" | "partial") ||
              "draft",
            currency: bill.currency || "INR",
            code: "workorder",
            billable_item_type: "workorder",
            billable_item_id: bill.billable_item_id || "",
            items:
              bill.lines && bill.lines.length > 0
                ? bill.lines.map((line: any) => ({
                    item: line.description || "",
                    description: line.description || "",
                    amount: line.amount || line.price || 0,
                    tax: line.tax_pct || line.taxPct || 0,
                  }))
                : emptyFormData.items,
            totals: bill.totals || { sub: 0, tax: 5, grand: 0 },
            payments: [],
            notes: (bill as any).notes || "",
          }
        : emptyFormData,
    );

    if (bill && formMode !== "create") {
      if (bill.site_id) {
        await loadBuildingLookup();
      }
      if ((bill as any).building_id && bill.site_id) {
        await loadSpaceLookup();
      }
      if ((bill as any).space_id) {
        await loadBillableItemLookup();
      }
    }

    setFormLoading(false);
  };

  const isReadOnly = formMode === "view";
  const billable_items = billableItemList;

  const onSubmitForm = async (
    data: BillFormValues,
    saveAsDraft: boolean = false,
  ) => {
    setIsSubmitting(true);
    try {
      // Build bill data according to backend schema
      const billData: any = {
        vendor_id: data.vendor_id,
        bill_no: data.bill_no || "",
        date: data.date,
        status: saveAsDraft ? "draft" : data.status || "approved",
        totals: {
          sub: data.totals?.sub ?? 0,
          tax: data.totals?.tax ?? 0,
          grand: data.totals?.grand ?? 0,
        },
        // Bill lines according to BillLine schema
        lines: data.items.map((item) => ({
          description: item.description || item.item || "",
          amount: item.amount || 0,
          tax_pct: item.tax || 0,
        })),
        // Bill payments according to BillPayment schema
        payments:
          data.payments
            ?.filter((p) => p.paid_at)
            .map((p) => ({
              method: p.method,
              amount: p.amount || 0,
              paid_at: p.paid_at!,
            })) || [],
      };

      let response;
      if (formMode === "create") {
        response = await withLoader(async () => {
          return await billsApiService.addBill(billData);
        });
      } else if (formMode === "edit" && bill) {
        const updatedBill = {
          ...bill,
          ...billData,
          id: bill.id || id,
          bill_no: bill.bill_no,
          updated_at: new Date().toISOString(),
        };
        response = await withLoader(async () => {
          return await billsApiService.updateBill(updatedBill);
        });
      }

      if (response?.success) {
        toast.success(
          `Bill has been ${
            formMode === "create" ? "created" : "updated"
          } successfully${saveAsDraft ? " as draft" : ""}.`,
        );
        if (!saveAsDraft) {
          navigate("/bills");
        } else {
          // If saving as draft, stay on the page
          setShowSaveDialog(false);
        }
      } else if (response && !response.success) {
        if (response?.message) {
          toast.error(response.message);
        } else {
          toast.error("Failed to save bill.");
        }
      }
    } catch (error) {
      console.error("Error saving bill:", error);
      toast.error("Failed to save bill.");
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
    navigate("/bills");
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
                  ? "Create New Bill"
                  : formMode === "edit"
                    ? "Edit Bill"
                    : "View Bill"}
              </h1>
              <p className="text-muted-foreground">
                {formMode === "create"
                  ? "Add a new bill to the system"
                  : formMode === "edit"
                    ? "Update bill information"
                    : "View bill details"}
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
                {isSubmitting || formIsSubmitting ? "Saving..." : "Save Bill"}
              </Button>
            )}
          </div>
        </div>

        {formLoading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <form className="space-y-6" id="bill-form">
            {/* Header Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill_no">Bill No</Label>
                <Input
                  id="bill_no"
                  {...register("bill_no")}
                  disabled={isReadOnly}
                  placeholder="Auto-generated"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Bill Date *</Label>
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
                          setValue("vendor_id", "");
                          setValue("vendor_name", "");
                          setValue("vendor_email", "");
                          setValue("vendor_phone", "");
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
                          setValue("vendor_id", "");
                          setValue("vendor_name", "");
                          setValue("vendor_email", "");
                          setValue("vendor_phone", "");
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

            {/* Vendor Details Section */}
            {watchedSpaceId && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vendor Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor_id">Vendor Name *</Label>
                    <Controller
                      name="vendor_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger
                            className={errors.vendor_id ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {vendorList.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.vendor_id && (
                      <p className="text-sm text-red-500">
                        {errors.vendor_id.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <p className="font-medium">
                        {watch("vendor_email") || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <p className="font-medium">
                        {watch("vendor_phone") || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Bill Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Bill Items</h3>
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
                                    const vendorId = watch("vendor_id") || "";
                                    await loadPeriodTotals(
                                      selectedPeriod.id,
                                      vendorId,
                                      index,
                                    );
                                  }
                                }}
                                disabled={
                                  isReadOnly ||
                                  !watchedSpaceId ||
                                  !watchedBillableType ||
                                  !watchedVendorId
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
                                        : !watchedVendorId
                                          ? "Select vendor first"
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

        {/* Save Bill Dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Bill</AlertDialogTitle>
              <AlertDialogDescription>
                How would you like to save this bill?
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
