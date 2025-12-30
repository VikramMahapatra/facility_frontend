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
  site_id: "",
  building_id: "",
  space_id: "",
  name: "",
  email: "",
  phone: "",
  tenant_type: "individual" as const,
  status: "active" as const,
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
            tenant_type: tenant.tenant_type || "individual",
            status: tenant.status || "active",
            site_id: tenant.site_id || "",
            building_id:
              tenant.building_block_id ||
              (tenant as any).building_block_id ||
              "",
            space_id: tenant.space_id || "",
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
    console.log("tenant data:", tenant);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [tenant, mode, isOpen, reset]);

  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_id");
  const selectedTenantType = watch("tenant_type");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedStatus = watch("status");
  const selectedSpaceId = watch("space_id");
  const familyInfo = watch("family_info") || [];
  const vehicleInfo = watch("vehicle_info") || [];
  const canSubmitCreate = Boolean(
    watchedName &&
      watchedEmail &&
      watchedPhone &&
      selectedSiteId &&
      selectedSpaceId &&
      watchedStatus
  );

  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup();
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (selectedSiteId) {
      loadSpaceLookup();
    } else {
      setSpaceList([]);
    }
  }, [selectedSiteId, selectedBuildingId]);

  useEffect(() => {
    if (tenant?.building_block_id && buildingList.length > 0) {
      setValue("building_id", String(tenant.building_block_id));
    }
  }, [buildingList]);

  useEffect(() => {
    if (tenant && spaceList.length > 0) {
      setValue("space_id", String(tenant.space_id));
    }
  }, [spaceList]);

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

                {/* Row 2: Site, Building, Space */}
                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="site_id"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="site">Site *</Label>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                        <Label htmlFor="building">Building</Label>
                        <Select
                          value={field.value ? field.value : "none"}
                          onValueChange={(v) =>
                            field.onChange(v === "none" ? "" : v)
                          }
                          disabled={isReadOnly || !selectedSiteId}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedSiteId
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
                        <Label htmlFor="space">Space *</Label>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={isReadOnly || !selectedSiteId}
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
                            {spaceList.map((space) => (
                              <SelectItem key={space.id} value={space.id}>
                                {space.name}
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

                {/* Row 3: Tenant Type, Status */}
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="tenant_type"
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
                            <SelectItem value="individual">
                              Individual
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

                {/* Family Information - Only for Individual tenants */}
                {selectedTenantType === "individual" && (
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
                {(selectedTenantType === "individual" ||
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
