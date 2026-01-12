import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema, TenantFormValues } from "@/schemas/tenant.schema";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { Tenant } from "@/interfaces/leasing_tenants_interface";
import PhoneInput from "react-phone-input-2";
import { Trash2, Plus } from "lucide-react";

interface TenantFormProps {
  tenant?: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData = {
  name: "",
  email: "",
  phone: "",
  tenant_type: "individual" as const,
  status: "active" as const,
  location_info: [
    { site_id: "", building_id: "", space_id: "", role: "owner" as any },
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

export function TenantForm({
  tenant,
  isOpen,
  onClose,
  onSave,
  mode,
}: TenantFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: emptyFormData as any,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [typeList, setTypeList] = useState([]);

  const loadAll = async () => {
    setFormLoading(true);

    // Clear building and space lists when in create mode
    if (mode === "create") {
      setBuildingList([]);
      setSpaceList([]);
    }

    await Promise.all([loadSiteLookup(), loadStatusLookup(), loadTypeLookup()]);

    // Reset form based on mode - if create mode or no tenant, use empty data
    reset(
      tenant && mode !== "create"
        ? {
          name: tenant.name || "",
          email: tenant.email || "",
          phone: tenant.phone || "",
          kind: tenant.kind || "residential",
          status: tenant.status || "active",
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
                  role: "owner",
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
            : emptyFormData,
          family_info:
            (tenant as any).family_info &&
              Array.isArray((tenant as any).family_info) &&
              (tenant as any).family_info.length > 0
              ? (tenant as any).family_info
              : (tenant as any).family_info &&
                typeof (tenant as any).family_info === "object"
                ? [(tenant as any).family_info] // Convert old format to array
                : [{ member: "", relation: "" }], // Default one entry
          vehicle_info:
            (tenant as any).vehicle_info &&
              Array.isArray((tenant as any).vehicle_info) &&
              (tenant as any).vehicle_info.length > 0
              ? (tenant as any).vehicle_info
              : (tenant as any).vehicle_info &&
                typeof (tenant as any).vehicle_info === "object"
                ? [(tenant as any).vehicle_info] // Convert old format to array
                : [{ type: "", number: "" }], // Default one entry
        }
        : emptyFormData
    );
    setFormLoading(false);
    const result = tenantSchema.safeParse(tenant);

    if (!result.success) {
      console.log("ZOD ERRORS 👉", result.error.format());
      return;
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [tenant, mode, isOpen, reset]);

  const selectedTenantType = watch("kind");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedStatus = watch("status");
  const tenantSpaces = watch("tenant_spaces") || [];
  const familyInfo = watch("family_info") || [];
  const vehicleInfo = watch("vehicle_info") || [];
  // Get first location's site_id for building/space loading
  const selectedSiteId = tenantSpaces[0]?.site_id || "";
  const selectedBuildingId = tenantSpaces[0]?.building_block_id || "";
  const canSubmitCreate = Boolean(
    watchedName &&
    watchedEmail &&
    watchedPhone &&
    tenantSpaces.length > 0 &&
    tenantSpaces.some((loc: any) => loc.site_id) &&
    watchedStatus
  );

  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup();
      loadSpaceLookup();
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId, selectedBuildingId]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadBuildingLookup = async () => {
    if (selectedSiteId) {
      const lookup = await buildingApiService.getBuildingLookup(selectedSiteId);
      if (lookup.success) setBuildingList(lookup.data || []);
    }
  };

  const loadSpaceLookup = async () => {
    if (selectedSiteId) {
      const lookup = await spacesApiService.getSpaceLookup(
        selectedSiteId,
        selectedBuildingId
      );
      if (lookup.success) setSpaceList(lookup.data || []);
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

  const onSubmitForm = async (data: TenantFormValues) => {
    const formResponse = await onSave(data);
  };

  const handleClose = () => {
    reset(emptyFormData);
    setBuildingList([]);
    setSpaceList([]);
    onClose();
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
      role: "owner" as any,
    };
    setValue("tenant_spaces", [...currentSpaceInfo, newEntry]);
  };

  const removeSpaceEntry = (index: number) => {
    const currentSpaceInfo = getValues("tenant_spaces") || [];
    const remaining = currentSpaceInfo.filter((_, i) => i !== index);
    // Ensure at least one entry remains
    const ensured =
      remaining.length === 0
        ? [{ site_id: "", building_block_id: "", space_id: "", role: "owner" as any }]
        : remaining;
    setValue("tenant_spaces", ensured);
  };

  const updateSpaceEntry = (
    index: number,
    field: "site_id" | "building_block_id" | "space_id" | "role",
    value: string
  ) => {
    const currentSpaceInfo = getValues("tenant_spaces") || [];
    const updated = [...currentSpaceInfo];
    updated[index] = { ...updated[index], [field]: value };
    // Reset building and space when site changes
    if (field === "site_id") {
      updated[index].building_block_id = "";
      updated[index].space_id = "";
      // Load buildings and spaces for the new site (if it's the first entry)
      if (value && index === 0) {
        loadBuildingLookup();
        loadSpaceLookup();
      }
    }
    // Reset space when building changes
    if (field === "building_block_id") {
      updated[index].space_id = "";
      // Load spaces for the site and building (if it's the first entry)
      if (updated[index].site_id && index === 0) {
        loadSpaceLookup();
      }
    }
    setValue("tenant_spaces", updated);
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Tenant"}
            {mode === "edit" && "Edit Tenant"}
            {mode === "view" && "Tenant Details"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2 -mr-2">
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="space-y-4"
            id="tenant-form"
          >
            {formLoading ? (
              <p className="text-center">Loading...</p>
            ) : (
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
                          inputClass={`!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm ${errors.phone ? "!border-red-500" : ""
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
                            <SelectItem value="commercial">
                              Commercial
                            </SelectItem>
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
                          disabled={isReadOnly}
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
                                <SelectItem value="none">
                                  Select Type
                                </SelectItem>
                                <SelectItem value="merchant">
                                  Merchant
                                </SelectItem>
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
                      <Card key={index} className="relative">
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
                          <div className="grid grid-cols-4 gap-4">
                            {/* Site */}
                            <div className="space-y-2">
                              <Label>Site *</Label>
                              <Controller
                                name={`tenant_spaces.${index}.site_id` as any}
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    value={field.value || ""}
                                    onValueChange={(value) => {
                                      updateSpaceEntry(
                                        index,
                                        "site_id",
                                        value
                                      );
                                    }}
                                    disabled={isReadOnly}
                                  >
                                    <SelectTrigger
                                      className={
                                        errors.tenant_spaces?.[index]?.site_id
                                          ? "border-red-500"
                                          : ""
                                      }
                                    >
                                      <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {siteList.map((site) => (
                                        <SelectItem
                                          key={site.id}
                                          value={site.id}
                                        >
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
                                      {buildingList.map((building) => (
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
                              <Label>Space</Label>
                              <Controller
                                name={`tenant_spaces.${index}.space_id` as any}
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    value={field.value || ""}
                                    onValueChange={(value) => {
                                      updateSpaceEntry(
                                        index,
                                        "space_id",
                                        value
                                      );
                                    }}
                                    disabled={isReadOnly || !location?.site_id}
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          !location?.site_id
                                            ? "Select site first"
                                            : "Select space"
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {spaceList.map((space) => (
                                        <SelectItem
                                          key={space.id}
                                          value={space.id}
                                        >
                                          {space.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Controller
                                name={`tenant_spaces.${index}.role` as any}
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    value={field.value || "owner"}
                                    onValueChange={(value) => {
                                      updateSpaceEntry(index, "role", value);
                                    }}
                                    disabled={isReadOnly}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="owner">
                                        Owner
                                      </SelectItem>
                                      <SelectItem value="occupant">
                                        Occupant
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
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
                          className={`grid grid-cols-[1fr_1fr_auto] gap-4 items-center p-4 ${index !== familyInfo.length - 1 ? "border-b" : ""
                            }`}
                        >
                          <Input
                            value={member.member || ""}
                            onChange={(e) =>
                              updateFamilyMember(
                                index,
                                "member",
                                e.target.value
                              )
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
                            className={`grid grid-cols-[1fr_1fr_auto] gap-4 items-center p-4 ${index !== vehicleInfo.length - 1 ? "border-b" : ""
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
                                const numeric = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
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
            )}
          </form>
        </div>
        {!formLoading && (
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
              <Button type="submit" form="tenant-form" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Tenant"
                    : "Update Tenant"}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
