import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema, TenantFormValues } from "@/schemas/tenant.schema";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { Tenant, Lease } from "@/interfaces/leasing_tenants_interface";
import PhoneInput from "react-phone-input-2";
import { LeaseForm } from "@/components/LeasesForm";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { Switch } from "@/components/ui/switch";

const emptyFormData = {
  name: "",
  email: "",
  phone: "",
  tenant_type: "individual" as const,
  status: "inactive" as const,
  tenant_spaces: [
    {
      site_id: "",
      building_block_id: "",
      space_id: "",
    },
  ],
  contact_info: {
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    },
  },
  type: "",
  legal_name: "",
  family_info: [{ member: "", relation: "" }],
  vehicle_info: [{ type: "", number: "" }],
};

export default function TenantFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const [tenant, setTenant] = useState<Tenant | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddLeaseDialog, setShowAddLeaseDialog] = useState(false);
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);
  const [isLeaseFormOpen, setIsLeaseFormOpen] = useState(false);
  const [prefilledLeaseData, setPrefilledLeaseData] =
    useState<Partial<Lease> | null>(null);
  const { withLoader } = useLoader();

  // Extract mode from pathname
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
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting: formIsSubmitting, isValid, isSubmitted },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: emptyFormData as any,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [siteList, setSiteList] = useState([]);
  const [buildingList, setBuildingList] = useState<Record<string, any[]>>({});
  const [spaceList, setSpaceList] = useState<Record<string, any[]>>({});
  const [statusList, setStatusList] = useState([]);
  const [typeList, setTypeList] = useState([]);

  useEffect(() => {
    if (!id || formMode === "create") return;

    const loadTenant = async () => {
      const response = await withLoader(async () => {
        return await tenantsApiService.getTenantById(id);
      });

      if (response?.success) {
        setTenant(response.data);
      } else {
        toast.error("Failed to load tenant details");
        navigate(-1);
      }
    };

    loadTenant();
  }, [id, formMode]);

  const loadAll = async () => {
    await withLoader(async () => {
      // Clear building and space lists when in create mode
      if (formMode === "create") {
        setBuildingList({});
        setSpaceList({});
      }

      await Promise.all([
        loadSiteLookup(),
        loadStatusLookup(),
        loadTypeLookup(),
      ]);
    });

    // Reset form based on mode - if create mode or no tenant, use empty data
    reset(
      tenant && formMode !== "create"
        ? {
            name: tenant.name || "",
            email: tenant.email || "",
            phone: tenant.phone || "",
            kind: tenant.kind || "residential",
            status: tenant.status || "inactive",
            tenant_spaces:
              (tenant as any).tenant_spaces &&
              Array.isArray((tenant as any).tenant_spaces) &&
              (tenant as any).tenant_spaces.length > 0
                ? (tenant as any).tenant_spaces
                : [
                    {
                      site_id: "",
                      building_block_id: "",
                      space_id: "",
                    },
                  ],
            type: tenant.type || "",
            legal_name: tenant.legal_name || "",
            contact_info: tenant.contact_info
              ? {
                  name: tenant.contact_info.name || "",
                  email: tenant.contact_info.email || "",
                  phone: tenant.contact_info.phone || "",
                  address: tenant.contact_info.address
                    ? {
                        line1: tenant.contact_info.address.line1 || "",
                        line2: tenant.contact_info.address.line2 || "",
                        city: tenant.contact_info.address.city || "",
                        state: tenant.contact_info.address.state || "",
                        pincode: tenant.contact_info.address.pincode || "",
                      }
                    : {},
                }
              : emptyFormData.contact_info,
            family_info:
              (tenant as any).family_info &&
              Array.isArray((tenant as any).family_info) &&
              (tenant as any).family_info.length > 0
                ? (tenant as any).family_info
                : (tenant as any).family_info &&
                  typeof (tenant as any).family_info === "object"
                ? [(tenant as any).family_info]
                : [{ member: "", relation: "" }],
            vehicle_info:
              (tenant as any).vehicle_info &&
              Array.isArray((tenant as any).vehicle_info) &&
              (tenant as any).vehicle_info.length > 0
                ? (tenant as any).vehicle_info
                : (tenant as any).vehicle_info &&
                  typeof (tenant as any).vehicle_info === "object"
                ? [(tenant as any).vehicle_info]
                : [{ type: "", number: "" }],
          }
        : emptyFormData
    );

    // Preload building and space lists for existing tenant spaces (edit mode)
    if (tenant && formMode !== "create" && (tenant as any).tenant_spaces) {
      await withLoader(async () => {
        const spaces = (tenant as any).tenant_spaces;
        if (Array.isArray(spaces) && spaces.length > 0) {
          const loadPromises = spaces.map(async (space: any) => {
            if (space.site_id) {
              await loadBuildingLookup(space.site_id);
              if (space.building_block_id) {
                await loadSpaceLookup(space.site_id, space.building_block_id);
              } else {
                await loadSpaceLookup(space.site_id);
              }
            }
          });
          await Promise.all(loadPromises);
        }
      });
    }
  };

  useEffect(() => {
    if (tenant !== undefined || formMode === "create") {
      loadAll();
    }
  }, [tenant, formMode]);

  const selectedTenantType = watch("kind");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedStatus = watch("status");
  const tenantSpaces = watch("tenant_spaces") || [];
  const familyInfo = watch("family_info") || [];
  const vehicleInfo = watch("vehicle_info") || [];

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadBuildingLookup = async (siteId: string) => {
    if (siteId && !buildingList[siteId]) {
      const lookup = await buildingApiService.getBuildingLookup(siteId);
      if (lookup.success) {
        setBuildingList((prev) => ({
          ...prev,
          [siteId]: lookup.data || [],
        }));
      }
    }
  };

  const loadSpaceLookup = async (siteId: string, buildingId?: string) => {
    if (siteId) {
      const key = buildingId ? `${siteId}_${buildingId}` : siteId;
      if (!spaceList[key]) {
        const lookup = await spacesApiService.getSpaceLookup(
          siteId,
          buildingId || ""
        );
        if (lookup.success) {
          setSpaceList((prev) => ({
            ...prev,
            [key]: lookup.data || [],
          }));
        }
      }
    }
  };

  const loadStatusLookup = async () => {
    const lookup = await tenantsApiService.getTenantStatusLookup();
    if (lookup.success) setStatusList(lookup.data || []);
  };

  const loadTypeLookup = async () => {
    const lookup = await tenantsApiService.getTenantTypeLookup();
    if (lookup.success) setTypeList(lookup.data || []);
  };

  const handleSave = async (tenantData: Partial<Tenant>) => {
    setIsSubmitting(true);
    let response;
    if (formMode === "create") {
      response = await tenantsApiService.addTenant(tenantData);
    } else if (formMode === "edit" && tenant) {
      const updatedTenant = {
        ...tenant,
        ...tenantData,
        updated_at: new Date().toISOString(),
      };
      response = await tenantsApiService.updateTenant(updatedTenant);
    }

    if (response?.success) {
      const tenantId = response.data?.id || response.data?.data?.id;

      if (formMode === "create" && tenantId) {
        // Show dialog to ask if user wants to add lease
        setCreatedTenantId(tenantId);
        setShowAddLeaseDialog(true);
        toast.success(
          `Tenant ${tenantData.name} has been created successfully.`
        );
      } else {
        navigate(-1);
        toast.success(
          `Tenant ${tenantData.name} has been ${
            formMode === "create" ? "created" : "updated"
          } successfully.`
        );
      }
    } else if (response && !response.success) {
      if (response?.message) {
        toast.error(response.message);
      }
    }
    setIsSubmitting(false);
    return response;
  };

  const onSubmitForm = async (data: TenantFormValues) => {
    const allTenantSpaces = getValues("tenant_spaces") || [];

    const validTenantSpaces = allTenantSpaces.filter(
      (space: any) => space.site_id && space.space_id
    );

    // Ensure we have at least one valid space entry
    if (validTenantSpaces.length === 0) {
      toast.error("At least one valid space entry is required");
      return;
    }

    const duplicates: number[] = [];
    for (let i = 0; i < validTenantSpaces.length; i++) {
      for (let j = i + 1; j < validTenantSpaces.length; j++) {
        const space1 = validTenantSpaces[i];
        const space2 = validTenantSpaces[j];
        if (
          space1.site_id === space2.site_id &&
          (space1.building_block_id || "") ===
            (space2.building_block_id || "") &&
          space1.space_id === space2.space_id
        ) {
          if (!duplicates.includes(i)) duplicates.push(i);
          if (!duplicates.includes(j)) duplicates.push(j);
        }
      }
    }

    if (duplicates.length > 0) {
      toast.error(
        `Duplicate space entries detected at Space #${duplicates
          .map((d) => d + 1)
          .join(", #")}. Please remove duplicate spaces.`
      );
      return;
    }

    // Prepare the data with all valid tenant spaces
    const formData = {
      ...data,
      tenant_spaces: validTenantSpaces,
    };

    await handleSave(formData as Partial<Tenant>);
  };

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList({});
    setSpaceList({});
    navigate(-1);
  };

  // Family info helpers: add, remove multiple members
  const addFamilyMember = () => {
    const currentFamilyInfo = getValues("family_info") || [];
    const newMember = { member: "", relation: "" };
    setValue("family_info", [...currentFamilyInfo, newMember]);
  };

  const removeFamilyMember = (index: number) => {
    const currentFamilyInfo = getValues("family_info") || [];
    const remaining = currentFamilyInfo.filter((_, i) => i !== index);
    // Ensure at least one entry remains
    const ensured =
      remaining.length === 0 ? [{ member: "", relation: "" }] : remaining;
    setValue("family_info", ensured);
  };

  const updateFamilyMember = (
    index: number,
    field: "member" | "relation",
    value: string
  ) => {
    const currentFamilyInfo = getValues("family_info") || [];
    const updated = [...currentFamilyInfo];
    updated[index] = { ...updated[index], [field]: value };
    setValue("family_info", updated);
  };

  const addVehicle = () => {
    const currentVehicleInfo = getValues("vehicle_info") || [];
    const newVehicle = { type: "", number: "" };
    setValue("vehicle_info", [...currentVehicleInfo, newVehicle]);
  };

  const removeVehicle = (index: number) => {
    const currentVehicleInfo = getValues("vehicle_info") || [];
    const remaining = currentVehicleInfo.filter((_, i) => i !== index);
    // Ensure at least one entry remains
    const ensured =
      remaining.length === 0 ? [{ type: "", number: "" }] : remaining;
    setValue("vehicle_info", ensured);
  };

  const updateVehicle = (
    index: number,
    field: "type" | "number",
    value: string
  ) => {
    const currentVehicleInfo = getValues("vehicle_info") || [];
    const updated = [...currentVehicleInfo];
    updated[index] = { ...updated[index], [field]: value };
    setValue("vehicle_info", updated);
  };

  // Location info helpers: add, remove multiple location entries
  const addSpaceEntry = () => {
    const currentSpaceInfo = getValues("tenant_spaces") || [];
    const newEntry = {
      site_id: "",
      building_block_id: "",
      space_id: "",
    };
    setValue("tenant_spaces", [...currentSpaceInfo, newEntry], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeSpaceEntry = (index: number) => {
    const currentSpaceInfo = getValues("tenant_spaces") || [];
    const remaining = currentSpaceInfo.filter((_, i) => i !== index);
    // Ensure at least one entry remains
    const ensured =
      remaining.length === 0
        ? [
            {
              site_id: "",
              building_block_id: "",
              space_id: "",
            },
          ]
        : remaining;
    setValue("tenant_spaces", ensured, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateSpaceEntry = (
    index: number,
    field: "site_id" | "building_block_id" | "space_id",
    value: string | boolean
  ) => {
    const currentSpaceInfo = getValues("tenant_spaces") || [];
    const updated = [...currentSpaceInfo];

    updated[index] = { ...updated[index], [field]: value };

    // Reset building and space when site changes
    if (field === "site_id") {
      const siteId = value as string;
      updated[index].building_block_id = "";
      updated[index].space_id = "";
      // Load buildings and spaces for the new site (for any entry)
      if (siteId) {
        loadBuildingLookup(siteId);
        loadSpaceLookup(siteId);
      }
    }
    // Reset space when building changes
    if (field === "building_block_id") {
      updated[index].space_id = "";
      // Load spaces for the site and building (for any entry)
      if (updated[index].site_id) {
        loadSpaceLookup(updated[index].site_id, (value as string) || undefined);
      }
    }

    // Check for duplicate space entries (same site_id, building_block_id, and space_id)
    // Only check if all required fields are present
    if (
      (field === "space_id" && value && updated[index].site_id) ||
      (field === "site_id" && value && updated[index].space_id) ||
      (field === "building_block_id" &&
        updated[index].site_id &&
        updated[index].space_id)
    ) {
      const currentEntry = updated[index];
      // Only check for duplicates if the entry has both site_id and space_id
      if (currentEntry.site_id && currentEntry.space_id) {
        const duplicateIndex = updated.findIndex(
          (space: any, i: number) =>
            i !== index &&
            space.site_id &&
            space.space_id &&
            space.site_id === currentEntry.site_id &&
            (space.building_block_id || "") ===
              (currentEntry.building_block_id || "") &&
            space.space_id === currentEntry.space_id
        );

        if (duplicateIndex !== -1) {
          toast.error(
            "This space is already added. Please select a different space."
          );
          // Revert the change
          updated[index] = { ...currentSpaceInfo[index] };
          setValue("tenant_spaces", updated, {
            shouldValidate: true,
            shouldDirty: true,
          });
          return;
        }
      }
    }

    // Use setValue with shouldValidate and shouldDirty to ensure form tracks changes
    setValue("tenant_spaces", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const isReadOnly = formMode === "view";

  return (
    <>
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
                    ? "Create New Tenant"
                    : formMode === "edit"
                    ? "Edit Tenant"
                    : "Tenant Details"}
                </h1>
                <p className="text-muted-foreground">
                  {formMode === "create"
                    ? "Add a new tenant to the system"
                    : formMode === "edit"
                    ? "Update tenant information"
                    : "View tenant details"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || formIsSubmitting}
              >
                {formMode === "view" ? "Close" : "Cancel"}
              </Button>
              {formMode !== "view" && (
                <Button
                  type="submit"
                  form="tenant-form"
                  disabled={isSubmitting || formIsSubmitting}
                >
                  {isSubmitting || formIsSubmitting
                    ? formMode === "create"
                      ? "Creating..."
                      : "Updating..."
                    : formMode === "create"
                    ? "Create Tenant"
                    : "Update Tenant"}
                </Button>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="space-y-4"
            id="tenant-form"
          >
            <div className="space-y-4">
              {/* Row 1: Name, Email, Phone */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., John Smith"
                    disabled={isReadOnly}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message as any}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="e.g., john@example.com"
                    disabled={isReadOnly}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message as any}
                    </p>
                  )}
                </div>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <PhoneInput
                        country={"in"}
                        value={field.value || ""}
                        onChange={(value) => {
                          const digits = value.replace(/\D/g, "");
                          const finalValue = "+" + digits;
                          field.onChange(finalValue);
                        }}
                        disabled={isReadOnly}
                        inputProps={{
                          name: "phone",
                          required: true,
                        }}
                        containerClass="w-full relative"
                        inputClass={`!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm ${
                          errors.phone ? "!border-red-500" : ""
                        }`}
                        buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                        dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                        enableSearch={true}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">
                          {errors.phone.message as any}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Row 2: Tenant Type, Status */}
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="kind"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="tenant_type">Tenant Type</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenant type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">
                            Residential
                          </SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly || formMode === "create"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusList.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>
              {/* Commercial tenant specific fields */}
              {selectedTenantType === "commercial" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="legal_name">Legal Name *</Label>
                      <Input
                        id="legal_name"
                        {...register("legal_name")}
                        placeholder="e.g., ABC Company Ltd"
                        disabled={isReadOnly}
                        className={errors.legal_name ? "border-red-500" : ""}
                      />
                      {errors.legal_name && (
                        <p className="text-sm text-red-500">
                          {errors.legal_name.message as any}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="type">Business Type</Label>
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || "none"}
                            onValueChange={(v) =>
                              field.onChange(v === "none" ? "" : v)
                            }
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Select Type</SelectItem>
                              <SelectItem value="merchant">Merchant</SelectItem>
                              <SelectItem value="brand">Brand</SelectItem>
                              <SelectItem value="kiosk">Kiosk</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact_info">
                      Business Contact Information
                    </Label>
                    <div className="space-y-3 p-3 border rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact_name">Contact Name</Label>
                          <Input
                            id="contact_name"
                            {...register("contact_info.name")}
                            placeholder="e.g., Jane Doe"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact_email">Contact Email</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            {...register("contact_info.email")}
                            placeholder="e.g., jane@company.com"
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="contact_phone">Contact Phone</Label>
                        <Controller
                          name="contact_info.phone"
                          control={control}
                          render={({ field }) => (
                            <PhoneInput
                              country={"in"}
                              value={field.value || ""}
                              onChange={(value) => {
                                const digits = value.replace(/\D/g, "");
                                const finalValue = "+" + digits;
                                field.onChange(finalValue);
                              }}
                              disabled={isReadOnly}
                              inputProps={{
                                name: "contact_info.phone",
                                required: false,
                              }}
                              containerClass="w-full relative"
                              inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                              buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                              dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                              enableSearch={true}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Space Information - Multiple Entries */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location_info">Space(s)</Label>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={addSpaceEntry}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Space
                    </Button>
                  )}
                </div>

                {/* Location Cards */}
                <div className="space-y-4">
                  {tenantSpaces.map((location: any, index: number) => (
                    <Card
                      key={`${location.space_id}-${index}`}
                      className="relative"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Space #{index + 1}
                          </CardTitle>
                          {!isReadOnly && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSpaceEntry(index)}
                              disabled={tenantSpaces.length === 1}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {/* Site */}
                          <div className="space-y-2">
                            <Label>Site *</Label>
                            <Controller
                              name={`tenant_spaces.${index}.site_id` as any}
                              control={control}
                              render={({ field, fieldState }) => (
                                <Select
                                  value={field.value || ""}
                                  onValueChange={(value) => {
                                    updateSpaceEntry(index, "site_id", value);
                                  }}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger
                                    className={
                                      fieldState.error && fieldState.isTouched
                                        ? "border-red-500"
                                        : ""
                                    }
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
                          </div>

                          {/* Building */}
                          <div className="space-y-2">
                            <Label>Building</Label>
                            <Controller
                              name={
                                `tenant_spaces.${index}.building_block_id` as any
                              }
                              control={control}
                              render={({ field }) => (
                                <Select
                                  value={field.value ? field.value : "none"}
                                  onValueChange={(v) => {
                                    updateSpaceEntry(
                                      index,
                                      "building_block_id",
                                      v === "none" ? "" : v
                                    );
                                  }}
                                  disabled={isReadOnly || !location?.site_id}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        location?.site_id
                                          ? "Select building"
                                          : "Select site first"
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      Select building
                                    </SelectItem>
                                    {(
                                      buildingList[location?.site_id || ""] ||
                                      []
                                    ).map((building) => (
                                      <SelectItem
                                        key={building.id}
                                        value={building.id}
                                      >
                                        {building.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          {/* Space */}
                          <div className="space-y-2">
                            <Label>Space *</Label>
                            <Controller
                              name={`tenant_spaces.${index}.space_id` as any}
                              control={control}
                              render={({ field, fieldState }) => {
                                const showError =
                                  fieldState.error &&
                                  (fieldState.isTouched || isSubmitted);
                                return (
                                  <Select
                                    value={
                                      field.value ? String(field.value) : ""
                                    }
                                    onValueChange={(value) => {
                                      updateSpaceEntry(
                                        index,
                                        "space_id",
                                        value
                                      );
                                    }}
                                    disabled={isReadOnly || !location?.site_id}
                                  >
                                    <SelectTrigger
                                      className={
                                        fieldState.error &&
                                        (fieldState.isTouched || isSubmitted)
                                          ? "border-red-500"
                                          : ""
                                      }
                                    >
                                      <SelectValue
                                        placeholder={
                                          !location?.site_id
                                            ? "Select site first"
                                            : "Select space"
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(() => {
                                        const siteId = location?.site_id || "";
                                        const buildingId =
                                          location?.building_block_id || "";
                                        const key = buildingId
                                          ? `${siteId}_${buildingId}`
                                          : siteId;
                                        const availableSpaces =
                                          spaceList[key] || [];
                                        return availableSpaces.map((space) => (
                                          <SelectItem
                                            key={space.id}
                                            value={String(space.id)}
                                          >
                                            {space.name}
                                          </SelectItem>
                                        ));
                                      })()}
                                    </SelectContent>
                                  </Select>
                                );
                              }}
                            />
                            {errors.tenant_spaces?.[index]?.space_id &&
                              isSubmitted && (
                                <p className="text-sm text-red-500">
                                  {
                                    errors.tenant_spaces[index]?.space_id
                                      ?.message as any
                                  }
                                </p>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Family Information - Only for Individual tenants */}
              {selectedTenantType === "residential" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="family_info">Family Information</Label>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addFamilyMember}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Member
                      </Button>
                    )}
                  </div>
                  <div className="border rounded-md">
                    {/* Header row with labels */}
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-4 p-4 border-b bg-muted/50">
                      <Label>Member</Label>
                      <Label>Relation</Label>
                      <div></div>
                    </div>
                    {/* Data rows */}
                    {familyInfo.map((member, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-[1fr_1fr_auto] gap-4 items-center p-4 ${
                          index !== familyInfo.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <Input
                          value={member.member || ""}
                          onChange={(e) =>
                            updateFamilyMember(index, "member", e.target.value)
                          }
                          placeholder="Enter family member name"
                          disabled={isReadOnly}
                        />
                        <Input
                          value={member.relation || ""}
                          onChange={(e) =>
                            updateFamilyMember(
                              index,
                              "relation",
                              e.target.value
                            )
                          }
                          placeholder="Enter relation"
                          disabled={isReadOnly}
                        />
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeFamilyMember(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicle Information - Only for Individual tenants */}
              {(selectedTenantType === "residential" ||
                selectedTenantType === "commercial") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vehicle_info">Vehicle Information</Label>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addVehicle}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                      </Button>
                    )}
                  </div>
                  <div className="border rounded-md">
                    {/* Header row with labels */}
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-4 p-4 border-b bg-muted/50">
                      <Label>Type of Vehicle</Label>
                      <Label>Vehicle No.</Label>
                      <div></div>
                    </div>
                    {/* Data rows */}
                    {vehicleInfo.map((vehicle, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-[1fr_1fr_auto] gap-4 items-center p-4 ${
                          index !== vehicleInfo.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <Input
                          value={(vehicle as any).type || ""}
                          onChange={(e) =>
                            updateVehicle(index, "type", e.target.value)
                          }
                          placeholder="Enter vehicle type"
                          disabled={isReadOnly}
                        />
                        <Input
                          value={(vehicle as any).number || ""}
                          onChange={(e) =>
                            updateVehicle(index, "number", e.target.value)
                          }
                          placeholder="Enter vehicle number"
                          disabled={isReadOnly}
                        />
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeVehicle(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Information - Always at the end */}
              <div className="space-y-2">
                <Label htmlFor="contact_info">Address Information</Label>
                <div className="space-y-3 p-3 border rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Line 1</Label>
                      <Input
                        {...register("contact_info.address.line1")}
                        disabled={isReadOnly}
                        placeholder="Enter lane"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        {...register("contact_info.address.city")}
                        disabled={isReadOnly}
                        placeholder="Enter city"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>State</Label>
                      <Input
                        {...register("contact_info.address.state")}
                        disabled={isReadOnly}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Controller
                        name="contact_info.address.pincode"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            onChange={(e) => {
                              const numeric = e.target.value.replace(/\D/g, "");
                              field.onChange(numeric);
                            }}
                            disabled={isReadOnly}
                            className={
                              errors.contact_info?.address?.pincode
                                ? "border-red-500"
                                : ""
                            }
                            placeholder="Numbers only"
                          />
                        )}
                      />
                      {errors.contact_info?.address?.pincode && (
                        <p className="text-sm text-red-500">
                          {
                            errors.contact_info?.address?.pincode
                              ?.message as any
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </ContentContainer>

      <AlertDialog
        open={showAddLeaseDialog}
        onOpenChange={setShowAddLeaseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Lease?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to add a lease for this tenant?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowAddLeaseDialog(false);
                setCreatedTenantId(null);
                navigate(-1);
              }}
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowAddLeaseDialog(false);
                // Fetch tenant lease details
                if (createdTenantId) {
                  const response = await withLoader(async () => {
                    return await leasesApiService.getTenantLeaseDetail(
                      createdTenantId
                    );
                  });
                  if (
                    response?.success &&
                    response.data?.tenant_data?.length > 0
                  ) {
                    const tenantData = response.data.tenant_data[0];
                    setPrefilledLeaseData({
                      tenant_id: createdTenantId,
                      site_id: tenantData.site_id,
                      site_name: tenantData.site_name,
                      building_id: tenantData.building_id,
                      building_name: tenantData.building_name,
                      space_id: tenantData.space_id,
                      space_name: tenantData.space_name,
                    } as Lease);
                  } else {
                    // If no data, just set tenant_id
                    setPrefilledLeaseData({
                      tenant_id: createdTenantId,
                    } as Lease);
                  }
                }
                setIsLeaseFormOpen(true);
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LeaseForm
        lease={prefilledLeaseData ? (prefilledLeaseData as Lease) : undefined}
        isOpen={isLeaseFormOpen}
        disableLocationFields={true}
        onClose={() => {
          setIsLeaseFormOpen(false);
          setCreatedTenantId(null);
          setPrefilledLeaseData(null);
          navigate(-1);
        }}
        onSave={async (leaseData: Partial<Lease>) => {
          const response = await withLoader(async () => {
            return await leasesApiService.addLease(leaseData);
          });

          if (response?.success) {
            setIsLeaseFormOpen(false);
            setCreatedTenantId(null);
            setPrefilledLeaseData(null);
            toast.success(`Lease has been created successfully.`);
            navigate(-1);
          } else if (response && !response.success) {
            if (response?.message) {
              toast.error(response.message);
            } else {
              toast.error("Failed to create lease.");
            }
          }
          return response;
        }}
        mode="create"
      />
    </>
  );
}
