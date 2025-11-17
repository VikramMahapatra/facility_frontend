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
import { tenantsApiService } from "@/services/Leasing_Tenants/tenantsapi";
import { Tenant } from "@/interfaces/leasing_tenants_interface";

interface TenantFormProps {
  tenant?: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Partial<Tenant>) => void;
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
    setValue, // ✅ add this
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: emptyFormData as any,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [siteList, setSiteList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [typeList, setTypeList] = useState([]);

  useEffect(() => {
    if (tenant && mode !== "create") {
      console.log("Hydrating tenant form with:", tenant);
      reset({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        tenant_type: tenant.tenant_type || "individual",
        status: tenant.status || "active",
        site_id: tenant.site_id || "",
        building_id: tenant.building_block_id || (tenant as any).building_block_id || "",
        space_id: tenant.space_id || "",
        type: tenant.type || "",
        legal_name: tenant.legal_name || "",
        contact_info: tenant.contact_info ? {
          name: tenant.contact_info.name || "",
          email: tenant.contact_info.email || "",
          phone: tenant.contact_info.phone || "",
          address: tenant.contact_info.address ? {
            line1: tenant.contact_info.address.line1 || "",
            line2: tenant.contact_info.address.line2 || "",
            city: tenant.contact_info.address.city || "",
            state: tenant.contact_info.address.state || "",
            pincode: tenant.contact_info.address.pincode || "",
          } : undefined,
        } : undefined,
      } as any);
    } else {
      reset(emptyFormData as any);
    }
    loadSiteLookup();
    loadStatusLookup();
    loadTypeLookup();
  }, [tenant, mode, reset]);

  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_id");
  const selectedTenantType = watch("tenant_type");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedStatus = watch("status");
  const selectedSpaceId = watch("space_id");
  const canSubmitCreate = Boolean(watchedName && watchedEmail && watchedPhone && selectedSiteId && selectedSpaceId && watchedStatus);

  useEffect(() => {
    if (selectedSiteId) {
      loadBuildingLookup(selectedSiteId);
    } else {
      setBuildingList([]);
      setSpaceList([]);
    }
  }, [selectedSiteId]);

  // ✅ Load spaces when building changes
  useEffect(() => {
    if (selectedSiteId && selectedBuildingId) {
      loadSpaceLookup(selectedSiteId, selectedBuildingId);
    } else {
      setSpaceList([]);
    }
  }, [selectedSiteId, selectedBuildingId]);

   
  useEffect(() => {
    console.log("Building list updated:", buildingList);
    console.log("Tenant's building ID:", tenant?.building_id);
    if (tenant?.building_id && buildingList.length > 0) {
      setValue("building_id", String(tenant.building_id));
    }
  }, [buildingList]);

  // ✅ Set space_id when space list is loaded
  useEffect(() => {
    if (tenant && spaceList.length > 0) {
      setValue("space_id", String(tenant.space_id));
    }
  }, [spaceList]);


  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadBuildingLookup = async (siteId: string) => {
    const lookup = await buildingApiService.getBuildingLookup(siteId);
    if (lookup.success) setBuildingList(lookup.data || []);
  };

  const loadSpaceLookup = async (siteId: string, buildingId: string) => {
    const lookup = await spacesApiService.getSpaceLookup(siteId, buildingId);
    if (lookup.success) setSpaceList(lookup.data || []);
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
    const payload: Partial<Tenant> = {
      ...(tenant?.id && { id: tenant.id }),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      tenant_type: data.tenant_type,
      status: data.status as any,
      site_id: data.site_id,
      space_id: data.space_id || undefined,
      building_block_id: (data as any).building_id || undefined,
      contact_info: data.contact_info ? {
        name: data.contact_info.name || undefined,
        email: data.contact_info.email || undefined,
        phone: data.contact_info.phone || undefined,
        address: data.contact_info.address ? {
          line1: data.contact_info.address.line1 || "",
          line2: data.contact_info.address.line2 || "",
          city: data.contact_info.address.city || "",
          state: data.contact_info.address.state || "",
          pincode: data.contact_info.address.pincode || "",
        } : undefined,
      } : undefined,
      ...(data.tenant_type === "commercial" && {
        type: data.type || undefined,
        legal_name: data.legal_name?.trim() || undefined,
      }),
    };
    try {
      await onSave(payload);
    } catch (error) {
      toast.error("Failed to save tenant");
    }
  };


  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Tenant"}
            {mode === "edit" && "Edit Tenant"}
            {mode === "view" && "Tenant Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., John Smith"
                disabled={isReadOnly}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (<p className="text-sm text-red-500">{errors.name.message as any}</p>)}
            </div>
            <div>
              <Label htmlFor="site">Site *</Label>
              <Controller
                name="site_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger className={errors.site_id ? 'border-red-500' : ''}>
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
              {errors.site_id && (<p className="text-sm text-red-500">{errors.site_id.message as any}</p>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="building">Building</Label>
              <Controller
                name="building_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly || !selectedSiteId}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedSiteId ? "Select building" : "Select site first"} />
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
            <div>
              <Label htmlFor="space">Space *</Label>
              <Controller
                name="space_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly || !selectedBuildingId}>
                    <SelectTrigger className={errors.space_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={!selectedBuildingId ? "Select building first" : "Select space"} />
                    </SelectTrigger>
                    <SelectContent>
                      {spaceList.map((space) => (
                        <SelectItem key={space.id} value={space.id}>
                          {space.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.space_id && (<p className="text-sm text-red-500">{errors.space_id.message as any}</p>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="e.g., john@example.com"
                disabled={isReadOnly}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (<p className="text-sm text-red-500">{errors.email.message as any}</p>)}
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    id="phone"
                    type="tel"
                    value={field.value || ""}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, "").slice(0, 10);
                      field.onChange(numeric);
                    }}
                    placeholder="e.g., 9876543210"
                    disabled={isReadOnly}
                    className={errors.phone ? 'border-red-500' : ''}
                    maxLength={10}
                  />
                )}
              />
              {errors.phone && (<p className="text-sm text-red-500">{errors.phone.message as any}</p>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tenant_type">Tenant Type</Label>
              <Controller
                name="tenant_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
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
                )}
              />
            </div>
          </div>

          {selectedTenantType === "commercial" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="legal_name">Legal Name</Label>
                <Input
                  id="legal_name"
                  {...register("legal_name")}
                  placeholder="e.g., ABC Company Ltd"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="type">Business Type</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Type</SelectItem>
                        <SelectItem value="merchant">Merchant</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                        <SelectItem value="kiosk">Kiosk</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}

          {selectedTenantType === "commercial" && (
            <div>
              <Label htmlFor="contact_info">Business Contact Information</Label>
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
                  <Input
                    id="contact_phone"
                    type="tel"
                    {...register("contact_info.phone")}
                    placeholder="e.g., +91-9876543210"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="contact_info">Address Information</Label>
            <div className="space-y-3 p-3 border rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Line 1</Label>
                  <Input
                    {...register("contact_info.address.line1")}
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <Label>City</Label>
                  <Input
                    {...register("contact_info.address.city")}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State</Label>
                  <Input
                    {...register("contact_info.address.state")}
                    disabled={isReadOnly}
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
                        className={errors.contact_info?.address?.pincode ? 'border-red-500' : ''}
                        placeholder="Numbers only"
                      />
                    )}
                  />
                  {errors.contact_info?.address?.pincode && (
                    <p className="text-sm text-red-500">{errors.contact_info?.address?.pincode?.message as any}</p>
                  )}
                </div>
              </div>
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Tenant" : "Update Tenant"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
