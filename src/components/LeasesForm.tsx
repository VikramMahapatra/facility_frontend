import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Upload,
  X,
  FileText,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  Calendar,
} from "lucide-react";
import { toast } from "@/components/ui/app-toast";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leaseSchema, LeaseFormValues } from "@/schemas/lease.schema";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { Lease } from "@/interfaces/leasing_tenants_interface";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { withFallback } from "@/helpers/commonHelper";

const emptyFormData: Partial<LeaseFormValues> = {
  kind: "residential",
  site_id: "",
  building_id: "",
  space_id: "",
  partner_id: "",
  tenant_id: "",
  start_date: "",
  lease_frequency: "monthly",
  frequency: "monthly",
  lease_term_duration: undefined,
  rent_amount: "" as any,
  deposit_amount: "" as any,
  cam_rate: "" as any,
  utilities: { electricity: undefined, water: undefined },
  status: "draft",
  auto_move_in: false,
  description: "",
  payment_method: "UPI" as any,
  payment_ref_no: "",
  payment_date: "",
  payment_amount: undefined,
  number_of_installments: undefined,
  payments: [],
};

interface LeaseFormProps {
  lease?: Lease;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lease: Partial<Lease>) => Promise<any>;
  mode: "create" | "edit" | "view";
  disableLocationFields?: boolean;
}

export function LeaseForm({
  lease,
  isOpen,
  onClose,
  onSave,
  mode,
  disableLocationFields = false,
}: LeaseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    clearErrors,
    trigger,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      kind: "residential",
      site_id: "",
      building_id: "",
      space_id: "",
      partner_id: "",
      tenant_id: "",
      start_date: "",
      frequency: "monthly",
      lease_frequency: "monthly",
      lease_term_duration: undefined,
      rent_amount: "" as any,
      deposit_amount: "" as any,
      cam_rate: "" as any,
      utilities: { electricity: undefined, water: undefined },
      status: "draft",
      auto_move_in: false,
      description: "",
      payment_method: undefined,
      payment_ref_no: "",
      payment_date: "",
      payment_amount: undefined,
      number_of_installments: undefined,
      payments: [],
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [leasePartnerList, setLeasePartnerList] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isReadOnly = mode === "view";
  const loadAll = async () => {
    setFormLoading(true);

    // Reset file uploads when form opens
    setUploadedImages([]);
    setImagePreviews([]);
    // Clean up previous preview URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    // Get site_id and building_id from lease prop, regardless of mode
    const leaseSiteId = lease?.site_id;
    const leaseBuildingId =
      (lease as any)?.building_id || (lease as any)?.building_block_id;

    // Reset form first (like SLAPolicyForm pattern)
    reset(
      lease
        ? {
          kind: (lease.kind as any) || "commercial",
          site_id: lease.site_id || "",
          building_id: leaseBuildingId || "",
          space_id: lease.space_id || "",
          partner_id: lease.partner_id ? String(lease.partner_id) : "",
          tenant_id: lease.tenant_id ? String(lease.tenant_id) : "",
          start_date: lease.start_date || "",
          frequency:
            (lease.frequency as "monthly" | "quaterly" | "annually") ||
            "monthly",
          lease_frequency:
            (lease.lease_frequency as "monthly" | "annually") || "monthly",
          lease_term_duration: (lease as any).lease_term_duration || undefined,
          rent_amount: lease.rent_amount as any,
          deposit_amount: lease.deposit_amount as any,
          cam_rate: lease.cam_rate as any,
          utilities: {
            electricity: lease.utilities?.electricity as any,
            water: lease.utilities?.water as any,
          },
          status: (lease.status as any) || "draft",
          description: (lease as any).description || "",
          payment_method: (lease as any).payment_method || undefined,
          payment_ref_no: (lease as any).payment_ref_no || "",
          payment_date: (lease as any).payment_date || "",
          payment_amount: (lease as any).payment_amount || undefined,
          number_of_installments:
            (lease as any).number_of_installments || undefined,
          payments: (lease as any).payments || [],
        }
        : emptyFormData,
    );

    setFormLoading(false);

    // Load sites first
    await loadSites();

    // Then load buildings and spaces if site_id is provided
    if (leaseSiteId) {
      await loadBuildingLookup(leaseSiteId);
      if (leaseSiteId) {
        const spaces = await spacesApiService.getSpaceLookup(
          leaseSiteId,
          leaseBuildingId,
        );
        if (spaces.success) setSpaceList(spaces.data || []);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    } else {
      reset(emptyFormData);
      setBuildingList([]);
      setSpaceList([]);
      setLeasePartnerList([]);
    }
  }, [isOpen, lease, mode, reset]);

  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_id");
  const selectedSpaceId = watch("space_id");
  const selectedKind = watch("kind");
  const selectedTenantId = watch("tenant_id");
  const selectedFrequency = watch("lease_frequency");

  useEffect(() => {
    if (selectedTenantId && selectedKind !== "residential") {
      setValue("kind", "residential", { shouldValidate: true });
    }
  }, [selectedTenantId, selectedKind, setValue]);

  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup(selectedSiteId);
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (selectedSiteId) {
      loadSpaces();
    } else {
      setSpaceList([]);
    }
  }, [selectedSiteId, selectedBuildingId]);

  useEffect(() => {
    loadLeaseTenants();
  }, [selectedSiteId, selectedSpaceId]);

  const rentAmount = watch("rent_amount");
  const leaseTermMonths = watch("lease_term_duration");
  const frequency = watch("frequency");
  const derivedFrequency = watch("lease_frequency");
  const startDate = watch("start_date");
  const numberOfInstallments = watch("number_of_installments");

  const displayFrequency = derivedFrequency || frequency;

  const getLeaseTermInMonths = (): number | undefined => {
    if (!leaseTermMonths || isNaN(Number(leaseTermMonths))) return undefined;
    const term = Number(leaseTermMonths);
    if (derivedFrequency === "annually") {
      return term * 12;
    }
    return term;
  };

  const leaseTermInMonths = getLeaseTermInMonths();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "payments",
  });

  useEffect(() => {
    if (leaseTermMonths && frequency && derivedFrequency) {
      let calculatedInstallments: number;

      const termInMonths =
        derivedFrequency === "annually"
          ? leaseTermMonths * 12
          : leaseTermMonths;

      if (frequency === "monthly") {
        if (derivedFrequency === "annually") {
          calculatedInstallments = leaseTermMonths;
        } else {
          calculatedInstallments = termInMonths;
        }
      } else if (frequency === "quaterly") {
        calculatedInstallments = 4;
      } else if (frequency === "annually") {
        if (derivedFrequency === "monthly") {
          calculatedInstallments = 1;
        } else {
          calculatedInstallments = leaseTermMonths;
        }
      } else {
        calculatedInstallments = termInMonths;
      }

      if (!numberOfInstallments || numberOfInstallments === 0) {
        setValue("number_of_installments", calculatedInstallments, {
          shouldValidate: false,
        });
      } else {
        setValue("number_of_installments", calculatedInstallments, {
          shouldValidate: false,
        });
      }
    }
  }, [
    leaseTermMonths,
    frequency,
    derivedFrequency,
    numberOfInstallments,
    setValue,
  ]);

  useEffect(() => {
    if (numberOfInstallments && numberOfInstallments > 0) {
      const currentPayments = watch("payments") || [];
      let paymentAmountPerInstallment: number | undefined = undefined;

      if (
        rentAmount &&
        leaseTermInMonths &&
        numberOfInstallments &&
        !isNaN(Number(rentAmount)) &&
        !isNaN(Number(leaseTermInMonths)) &&
        !isNaN(Number(numberOfInstallments)) &&
        Number(rentAmount) > 0 &&
        Number(leaseTermInMonths) > 0 &&
        Number(numberOfInstallments) > 0
      ) {
        const total = Number(rentAmount) * Number(leaseTermInMonths);
        paymentAmountPerInstallment =
          Math.round((total / numberOfInstallments) * 100) / 100;
      }

      const calculatePaymentDate = (index: number): string => {
        if (!startDate) return "";
        const start = new Date(startDate);
        if (frequency === "monthly") {
          start.setMonth(start.getMonth() + index);
        } else if (frequency === "quaterly") {
          if (leaseTermInMonths && numberOfInstallments === 4) {
            const monthsPerInstallment = leaseTermInMonths / 4;
            start.setMonth(start.getMonth() + index * monthsPerInstallment);
          } else {
            start.setMonth(start.getMonth() + index * 3);
          }
        } else if (frequency === "annually") {
          start.setFullYear(start.getFullYear() + index);
        }
        return start.toISOString().split("T")[0];
      };

      if (currentPayments.length < numberOfInstallments) {
        for (let i = currentPayments.length; i < numberOfInstallments; i++) {
          append({
            method: "cheque",
            ref_no: "",
            date: calculatePaymentDate(i),
            amount: paymentAmountPerInstallment,
          });
        }
      } else if (currentPayments.length > numberOfInstallments) {
        for (
          let i = currentPayments.length - 1;
          i >= numberOfInstallments;
          i--
        ) {
          remove(i);
        }
      } else {
        currentPayments.forEach((payment: any, index: number) => {
          const updatedAmount =
            paymentAmountPerInstallment !== undefined
              ? paymentAmountPerInstallment
              : undefined;

          const recalculatedDate = calculatePaymentDate(index);
          const finalDate = recalculatedDate || payment.date || "";

          update(index, {
            method: payment.method || "cheque",
            ref_no: payment.ref_no || "",
            date: finalDate,
            amount: updatedAmount,
          });
        });
      }
    }
  }, [
    numberOfInstallments,
    rentAmount,
    leaseTermMonths,
    leaseTermInMonths,
    frequency,
    startDate,
    append,
    remove,
    update,
    watch,
  ]);

  // Ensure payment dates are set when startDate becomes available
  useEffect(() => {
    if (startDate && numberOfInstallments && numberOfInstallments > 0) {
      const currentPayments = watch("payments") || [];
      if (currentPayments.length === numberOfInstallments) {
        const calculatePaymentDate = (index: number): string => {
          if (!startDate) return "";
          const start = new Date(startDate);

          if (frequency === "monthly") {
            start.setMonth(start.getMonth() + index);
          } else if (frequency === "quaterly") {
            // Divide lease term into 4 equal parts
            if (leaseTermInMonths && numberOfInstallments === 4) {
              const monthsPerInstallment = leaseTermInMonths / 4;
              start.setMonth(start.getMonth() + index * monthsPerInstallment);
            } else {
              // Fallback to quarterly (every 3 months)
              start.setMonth(start.getMonth() + index * 3);
            }
          } else if (frequency === "annually") {
            start.setFullYear(start.getFullYear() + index);
          }
          return start.toISOString().split("T")[0];
        };

        // Update dates and set default payment method for all payments
        currentPayments.forEach((payment: any, index: number) => {
          const updates: any = {};
          if (!payment.date || payment.date === "") {
            const calculatedDate = calculatePaymentDate(index);
            if (calculatedDate) {
              updates.date = calculatedDate;
            }
          }
          if (!payment.method) {
            updates.method = "upi";
          }
          if (Object.keys(updates).length > 0) {
            update(index, {
              ...payment,
              ...updates,
            });
          }
        });
      }
    }
  }, [
    startDate,
    numberOfInstallments,
    frequency,
    leaseTermInMonths,
    update,
    watch,
  ]);

  useEffect(() => {
    if (
      numberOfInstallments &&
      numberOfInstallments > 0 &&
      rentAmount &&
      leaseTermInMonths &&
      !isNaN(Number(rentAmount)) &&
      !isNaN(Number(leaseTermInMonths)) &&
      Number(rentAmount) > 0 &&
      Number(leaseTermInMonths) > 0
    ) {
      const currentPayments = watch("payments") || [];
      if (currentPayments.length === numberOfInstallments) {
        const total = Number(rentAmount) * Number(leaseTermInMonths);
        const paymentAmountPerInstallment =
          Math.round((total / numberOfInstallments) * 100) / 100;

        currentPayments.forEach((payment: any, index: number) => {
          update(index, {
            method: payment.method || " cheque",
            ref_no: payment.ref_no || "",
            date: payment.date || "",
            amount: paymentAmountPerInstallment,
          });
        });
      }
    }
  }, [rentAmount, leaseTermInMonths, numberOfInstallments, update, watch]);

  useEffect(() => {
    if (
      rentAmount &&
      leaseTermMonths &&
      numberOfInstallments &&
      numberOfInstallments > 0
    ) {
      const totalRentAmount = Number(rentAmount) * Number(leaseTermMonths);
      const paymentAmountPerInstallment =
        totalRentAmount / numberOfInstallments;

      // Set payment amount (round to 2 decimal places)
      setValue(
        "payment_amount",
        Math.round(paymentAmountPerInstallment * 100) / 100,
        { shouldValidate: false },
      );
    }
  }, [rentAmount, leaseTermMonths, numberOfInstallments, setValue]);

  const currentPaymentDate = watch("payment_date");
  useEffect(() => {
    if (startDate && !currentPaymentDate) {
      setValue("payment_date", startDate, { shouldValidate: false });
    }
  }, [startDate, currentPaymentDate, setValue]);

  useEffect(() => {
    if (lease && leasePartnerList.length > 0) {
      if (lease.kind === "commercial" && lease.partner_id) {
        const partnerIdStr = String(lease.partner_id);
        clearErrors("partner_id");
        setValue("partner_id", partnerIdStr, { shouldValidate: true });
        trigger("partner_id");
      } else if (lease.kind === "residential" && lease.tenant_id) {
        const tenantIdStr = String(lease.tenant_id);
        clearErrors("tenant_id");
        setValue("tenant_id", tenantIdStr, { shouldValidate: true });
        trigger("tenant_id");
      }
    }
  }, [leasePartnerList, lease, setValue, clearErrors, trigger]);

  const fallbackSite = lease?.site_id
    ? {
      id: lease.site_id,
      name: (lease as any).site_name,
    }
    : null;

  const fallbackBuilding =
    lease?.building_id || (lease as any)?.building_block_id
      ? {
        id: (lease as any).building_id || (lease as any).building_block_id,
        name: (lease as any).building_name,
      }
      : null;

  const fallbackSpace = lease?.space_id
    ? {
      id: lease.space_id,
      name: (lease as any).space_name,
    }
    : null;
  const fallbackTenant = lease?.tenant_id
    ? {
      id: lease.tenant_id,
      name: (lease as any).tenant_name,
    }
    : null;

  const tenants = withFallback(leasePartnerList, fallbackTenant);
  const sites = withFallback(siteList, fallbackSite);
  const buildings = withFallback(buildingList, fallbackBuilding);
  const spaces = withFallback(spaceList, fallbackSpace);

  const loadBuildingLookup = async (siteId: string) => {
    const lookup = await buildingApiService.getBuildingLookup(siteId);
    if (lookup.success) setBuildingList(lookup.data || []);
  };

  const loadSpaces = async () => {
    if (selectedSiteId) {
      const spaces = await spacesApiService.getSpaceLookup(
        selectedSiteId,
        selectedBuildingId,
      );
      if (spaces.success) setSpaceList(spaces.data || []);
    }
  };

  const loadSites = async () => {
    const sites = await siteApiService.getSiteLookup();
    if (sites.success) setSiteList(sites.data || []);
  };

  const loadLeaseTenants = async () => {
    if (!selectedSiteId) return;
    const tenants = await leasesApiService.getLeaseTenantLookup(
      selectedSiteId,
      selectedSpaceId,
    );
    if (tenants?.success) setLeasePartnerList(tenants.data || []);
  };

  const onSubmitForm = async (data: LeaseFormValues) => {
    try {
      const { kind, ...updated } = data;
      console.log("Submitting lease data:", updated);

      // Create FormData if there are uploaded files, otherwise use JSON
      let submitData: any;

      if (uploadedImages.length > 0) {
        const formData = new FormData();
        Object.keys(updated).forEach((key) => {
          const value = (updated as any)[key];
          if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "object" && !Array.isArray(value)) {
              // Handle nested objects like utilities
              Object.keys(value).forEach((nestedKey) => {
                const nestedValue = (value as any)[nestedKey];
                if (
                  nestedValue !== undefined &&
                  nestedValue !== null &&
                  nestedValue !== ""
                ) {
                  formData.append(`${key}.${nestedKey}`, String(nestedValue));
                }
              });
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Append files
        uploadedImages.forEach((file) => {
          formData.append("files", file);
        });

        submitData = formData;
      } else {
        submitData = updated;
      }

      const formResponse = await onSave(submitData);
      console.log("Lease save response:", formResponse);

      if (formResponse?.success) {
        // Clean up preview URLs
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setUploadedImages([]);
        setImagePreviews([]);
      }
    } catch (error) {
      console.error("Error submitting lease form:", error);
      toast.error("Failed to submit lease form. Please try again.");
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setUploadedImages([]);
    setImagePreviews([]);
    reset(emptyFormData);
    setBuildingList([]);
    setSpaceList([]);
    setLeasePartnerList([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create New Lease"
              : mode === "edit"
                ? "Edit Lease"
                : "Lease Details"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={
            isSubmitting
              ? undefined
              : handleSubmit(onSubmitForm, (errors) => {
                console.log("Form validation errors:", errors);
                const firstError = Object.values(errors)[0];
                if (firstError?.message) {
                  toast.error(firstError.message as string);
                } else {
                  toast.error(
                    "Please fill in all required fields correctly.",
                  );
                }
              })
          }
          className="space-y-4"
        >
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <Tabs defaultValue="lease-details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lease-details">Lease Details</TabsTrigger>
                <TabsTrigger value="payment-details">
                  Payment Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lease-details" className="space-y-4 mt-4">
                {/* Row 1: Site, Building */}
                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="site_id"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="site_id">Site *</Label>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset building and space when site changes
                            setValue("building_id", "");
                            setValue("space_id", "");
                          }}
                          disabled={isReadOnly || disableLocationFields}
                        >
                          <SelectTrigger
                            className={errors.site_id ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select site" />
                          </SelectTrigger>
                          <SelectContent>
                            {sites.map((site: any) => (
                              <SelectItem key={site.id} value={site.id}>
                                {site.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.site_id && (
                          <p className="text-sm text-red-500">
                            {errors.site_id.message as any}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="building_id"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="building_id">Building</Label>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset space when building changes
                            setValue("space_id", "");
                          }}
                          disabled={
                            isReadOnly ||
                            !selectedSiteId ||
                            disableLocationFields
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !selectedSiteId
                                  ? "Select site first"
                                  : "Select building"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {buildings.map((building: any) => (
                              <SelectItem key={building.id} value={building.id}>
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  <Controller
                    name="space_id"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="space_id">Space *</Label>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={
                            isReadOnly ||
                            !selectedSiteId ||
                            disableLocationFields
                          }
                        >
                          <SelectTrigger
                            className={errors.space_id ? "border-red-500" : ""}
                          >
                            <SelectValue
                              placeholder={
                                !selectedSiteId
                                  ? "Select site first"
                                  : "Select space"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {spaces.map((space: any) => (
                              <SelectItem key={space.id} value={space.id}>
                                {space.name || space.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.space_id && (
                          <p className="text-sm text-red-500">
                            {errors.space_id.message as any}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Row 2: Tenant, Lease Frequency, Start Date, Lease Term */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Tenant *</Label>
                    <Controller
                      name="tenant_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={isReadOnly || disableLocationFields}
                        >
                          <SelectTrigger
                            className={errors.tenant_id ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select tenant" />
                          </SelectTrigger>
                          <SelectContent>
                            {tenants.map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.tenant_id && (
                      <p className="text-sm text-red-500">
                        {errors.tenant_id?.message as any}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Lease Frequency*</Label>
                    <Controller
                      name="lease_frequency"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger
                            className={errors.frequency ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select tenure frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.lease_frequency && (
                      <p className="text-sm text-red-500">
                        {errors.lease_frequency.message as any}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      disabled={isReadOnly}
                      {...register("start_date")}
                      className={errors.start_date ? "border-red-500" : ""}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500">
                        {errors.start_date.message as any}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Lease Term{" "}
                      {displayFrequency === "annually" ? "(Years)" : "(Months)"}{" "}
                      *
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder={
                        displayFrequency === "annually"
                          ? "Enter number of years"
                          : "Enter number of months"
                      }
                      disabled={isReadOnly}
                      {...register("lease_term_duration")}
                      className={
                        errors.lease_term_duration ? "border-red-500" : ""
                      }
                    />
                    {errors.lease_term_duration && (
                      <p className="text-sm text-red-500">
                        {errors.lease_term_duration.message as any}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Deposit Amount</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Enter deposit amount"
                      disabled={isReadOnly}
                      {...register("deposit_amount")}
                      className={errors.deposit_amount ? "border-red-500" : ""}
                    />
                    {errors.deposit_amount && (
                      <p className="text-sm text-red-500">
                        {errors.deposit_amount.message as any}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Rent Amount *</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Enter rent amount"
                      disabled={isReadOnly}
                      {...register("rent_amount")}
                      className={errors.rent_amount ? "border-red-500" : ""}
                    />
                    {errors.rent_amount && (
                      <p className="text-sm text-red-500">
                        {errors.rent_amount.message as any}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Rent Frequency*</Label>
                    <Controller
                      name="frequency"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger
                            className={errors.frequency ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select rent frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quaterly">Quaterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.frequency && (
                      <p className="text-sm text-red-500">
                        {errors.frequency.message as any}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="terminated">
                              Terminated
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {/* Utilities */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Electricity</Label>
                      <Controller
                        name="utilities.electricity"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submeter">Submeter</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="na">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Label>Water</Label>
                      <Controller
                        name="utilities.water"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submeter">Submeter</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="na">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                  {/* Auto Move In Space Occupancy Checkbox - Only show when creating */}
                  {mode === "create" && (
                    <div className="flex flex-col gap-2">
                      {/* spacer to match Label height */}
                      <Label className="invisible">
                        Auto move-in occupancy
                      </Label>

                      <div className="flex items-center gap-2 h-10">
                        <Controller
                          name="auto_move_in"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="auto_move_in"
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              disabled={isReadOnly}
                            />
                          )}
                        />
                        <Label
                          htmlFor="auto_move_in"
                          className="text-sm font-normal cursor-pointer leading-none"
                        >
                          Auto move tenant to space
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter lease description or notes..."
                    rows={4}
                    disabled={isReadOnly}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Document Upload */}
                <div className="space-y-2">
                  <Label>Attach Documents</Label>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      disabled={isReadOnly}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        • Only JPG, PNG, JPEG, and PDF files must be uploaded
                      </p>
                      <p>• Uploaded files must be less than 2MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,application/pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
                        const ALLOWED_TYPES = [
                          "image/png",
                          "image/jpeg",
                          "image/jpg",
                          "application/pdf",
                        ];

                        const validFiles: File[] = [];
                        const validPreviews: string[] = [];

                        files.forEach((file) => {
                          // Validation 1: File size (2MB)
                          if (file.size > MAX_FILE_SIZE) {
                            toast.error(
                              `${file.name} exceeds 2MB limit. Please choose a smaller file.`,
                            );
                            return;
                          }

                          // Validation 2: File type (png, jpeg, jpg, pdf)
                          const fileType = file.type.toLowerCase();
                          if (!ALLOWED_TYPES.includes(fileType)) {
                            toast.error(
                              `${file.name} is not a valid file type. Only PNG, JPEG, JPG, and PDF are allowed.`,
                            );
                            return;
                          }

                          // If file passes both validations, add it
                          validFiles.push(file);
                          // For PDFs, we don't create a preview URL, we'll use empty string
                          if (fileType === "application/pdf") {
                            validPreviews.push("");
                          } else {
                            validPreviews.push(URL.createObjectURL(file));
                          }
                        });

                        if (validFiles.length > 0) {
                          setUploadedImages((prev) => [...prev, ...validFiles]);
                          setImagePreviews((prev) => [
                            ...prev,
                            ...validPreviews,
                          ]);
                        }

                        // Reset file input to allow selecting the same file again
                        if (e.target) {
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    {uploadedImages.length > 0 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {uploadedImages.map((file, index) => {
                            const isPdf =
                              file.type.toLowerCase() === "application/pdf";
                            return (
                              <div key={index} className="relative group">
                                {isPdf ? (
                                  <div className="w-full h-24 flex items-center justify-center bg-muted rounded border">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                ) : (
                                  <img
                                    src={imagePreviews[index]}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-24 object-cover rounded border"
                                  />
                                )}
                                {!isReadOnly && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      setUploadedImages((prev) =>
                                        prev.filter((_, i) => i !== index),
                                      );
                                      setImagePreviews((prev) => {
                                        if (prev[index]) {
                                          URL.revokeObjectURL(prev[index]);
                                        }
                                        return prev.filter(
                                          (_, i) => i !== index,
                                        );
                                      });
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          <p>
                            Total: {uploadedImages.length} file(s),{" "}
                            {(
                              uploadedImages.reduce(
                                (sum, file) => sum + file.size,
                                0,
                              ) / 1024
                            ).toFixed(2)}{" "}
                            KB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payment-details" className="space-y-4 mt-4">
                {/* Calculation Summary */}
                {rentAmount && leaseTermMonths && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Rent Amount:
                        </span>
                        <span className="font-semibold ml-2">
                          ₹{Number(rentAmount).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Lease Term:
                        </span>
                        <span className="font-semibold ml-2">
                          {displayFrequency === "annually"
                            ? `${leaseTermMonths} ${leaseTermMonths === 1 ? "year" : "years"} (${leaseTermInMonths} months)`
                            : `${leaseTermMonths} ${leaseTermMonths === 1 ? "month" : "months"}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Total Rent Amount:
                        </span>
                        <span className="font-semibold ml-2">
                          ₹
                          {leaseTermInMonths
                            ? (
                              Number(rentAmount) * Number(leaseTermInMonths)
                            ).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Rows - One per Installment */}
                {numberOfInstallments && numberOfInstallments > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="number_of_installments" className="text-sm font-semibold whitespace-nowrap">
                          No. of Installments:
                        </Label>
                        <Input
                          id="number_of_installments"
                          type="number"
                          {...register("number_of_installments", {
                            valueAsNumber: true,
                            min: 1,
                          })}
                          placeholder="Enter installments"
                          disabled={isReadOnly}
                          className={`w-32 ${errors.number_of_installments ? "border-red-500" : ""}`}
                        />
                        {errors.number_of_installments && (
                          <p className="text-sm text-red-500">
                            {errors.number_of_installments.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] gap-4 font-semibold text-sm border-b pb-2">
                      <div className="text-center">#</div>
                      <div>Payment Date</div>
                      <div>Payment Method</div>
                      <div>Reference No.</div>
                      <div>Amount</div>
                    </div>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] gap-4 items-start"
                      >
                        <div className="flex items-center justify-center pt-2">
                          <span className="text-xs text-muted-foreground font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Controller
                              name={`payments.${index}.date`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="date"
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  className={`pl-10 ${errors.payments?.[index]?.date ? "border-red-500" : ""}`}
                                  disabled={isReadOnly}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Controller
                            name={`payments.${index}.method`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                                disabled={isReadOnly}
                              >
                                <SelectTrigger>
                                  <div className="flex items-center gap-2">
                                    {field.value === "cash" && (
                                      <Wallet className="h-4 w-4" />
                                    )}
                                    {field.value === "card" && (
                                      <CreditCard className="h-4 w-4" />
                                    )}
                                    {field.value === "bank" && (
                                      <Building2 className="h-4 w-4" />
                                    )}
                                    {field.value === "upi" && (
                                      <Smartphone className="h-4 w-4" />
                                    )}
                                    {field.value === "cheque" && (
                                      <FileText className="h-4 w-4" />
                                    )}
                                    <SelectValue placeholder="Select method" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="card">Card</SelectItem>
                                  <SelectItem value="bank">
                                    Bank Transfer
                                  </SelectItem>
                                  <SelectItem value="cheque">Cheque</SelectItem>
                                  <SelectItem value="upi">UPI</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            {...register(`payments.${index}.ref_no`)}
                            placeholder="Enter reference"
                            disabled={
                              isReadOnly ||
                              watch(`payments.${index}.method`) === "cash"
                            }
                            className={
                              errors.payments?.[index]?.ref_no
                                ? "border-red-500"
                                : ""
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center pt-2">
                            <span className="text-sm font-medium">
                              {(() => {
                                const amount = watch(`payments.${index}.amount`);
                                if (
                                  amount === undefined ||
                                  amount === null ||
                                  isNaN(Number(amount))
                                ) {
                                  return "₹0.00";
                                }
                                return `₹${Number(amount).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`;
                              })()}
                            </span>
                            <input
                              type="hidden"
                              {...register(`payments.${index}.amount`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting || formLoading}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Lease"
                    : "Update Lease"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
