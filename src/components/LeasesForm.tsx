import { useState, useEffect, useRef } from "react";
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
import { Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
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
  frequency: "monthly",
  lease_term_months: undefined,
  rent_amount: "" as any,
  deposit_amount: "" as any,
  cam_rate: "" as any,
  utilities: { electricity: undefined, water: undefined },
  status: "draft",
  auto_move_in: false,
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
      lease_term_months: undefined,
      rent_amount: "" as any,
      deposit_amount: "" as any,
      cam_rate: "" as any,
      utilities: { electricity: undefined, water: undefined },
      status: "draft",
      auto_move_in: false,
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
            frequency: (lease.frequency as "monthly" | "annually") || "monthly",
            lease_term_months: (lease as any).lease_term_months || undefined,
            rent_amount: lease.rent_amount as any,
            deposit_amount: lease.deposit_amount as any,
            cam_rate: lease.cam_rate as any,
            utilities: {
              electricity: lease.utilities?.electricity as any,
              water: lease.utilities?.water as any,
            },
            status: (lease.status as any) || "draft",
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
  const selectedFrequency = watch("frequency");

  useEffect(() => {
    if (selectedTenantId && selectedKind !== "residential") {
      setValue("kind", "residential", { shouldValidate: true });
    }
  }, [selectedTenantId, selectedKind, setValue]);

  // Load buildings when site changes
  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup(selectedSiteId);
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId]);

  // Load spaces when site or building changes
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

  // Create fallback options for site, building, and space from lease prop
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
                if (nestedValue !== undefined && nestedValue !== null && nestedValue !== "") {
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
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
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
            <div className="space-y-4">
              {/* Row 1: Site, Building */}
              <div className="grid grid-cols-2 gap-4">
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
                          isReadOnly || !selectedSiteId || disableLocationFields
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
              </div>

              {/* Row 2: Space, Tenant */}
              <div className="grid grid-cols-2 gap-4">
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
                          isReadOnly || !selectedSiteId || disableLocationFields
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
              </div>

              <div
                className={`grid gap-4 ${
                  selectedFrequency === "monthly"
                    ? "grid-cols-4"
                    : "grid-cols-3"
                }`}
              >
                <div>
                  <Label>Frequency *</Label>
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
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
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
                <div>
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
                {selectedFrequency === "monthly" && (
                  <div>
                    <Label>Lease Term (Months) *</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter number of months"
                      disabled={isReadOnly}
                      {...register("lease_term_months")}
                      className={
                        errors.lease_term_months ? "border-red-500" : ""
                      }
                    />
                    {errors.lease_term_months && (
                      <p className="text-sm text-red-500">
                        {errors.lease_term_months.message as any}
                      </p>
                    )}
                  </div>
                )}
                <div>
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
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
                <div>
                  <Label>CAM Rate (per sq ft)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Enter CAM rate"
                    disabled={isReadOnly}
                    {...register("cam_rate")}
                    className={errors.cam_rate ? "border-red-500" : ""}
                  />
                  {errors.cam_rate && (
                    <p className="text-sm text-red-500">
                      {errors.cam_rate.message as any}
                    </p>
                  )}
                </div>
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
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Utilities */}
              <div
                className={`grid gap-4 ${
                  mode === "create" ? "grid-cols-3" : "grid-cols-2"
                }`}
              >
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
                {/* Auto Move In Space Occupancy Checkbox - Only show when creating */}
                {mode === "create" && (
                  <div className="flex flex-col gap-2">
                    {/* spacer to match Label height */}
                    <Label className="invisible">Auto move-in occupancy</Label>

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
                    <p>• Only JPG, PNG, JPEG, and PDF files must be uploaded</p>
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
                        setImagePreviews((prev) => [...prev, ...validPreviews]);
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
                          const isPdf = file.type.toLowerCase() === "application/pdf";
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
                                      return prev.filter((_, i) => i !== index);
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
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
