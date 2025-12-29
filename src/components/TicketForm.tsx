import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Upload, X } from "lucide-react";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { ticketsApiService } from "@/services/ticketing_service/ticketsapi";
import { vendorsApiService } from "@/services/procurements/vendorsapi";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { slaPoliciesApiService } from "@/services/ticketing_service/slapoliciesapi";
import { toast } from "sonner";
import { ticketSchema, TicketFormValues } from "@/schemas/ticket.schema";
//import { toast as sonnerToast } from "sonner";

interface TicketFormProps {
  onSubmit: (data: any) => Promise<any>;
  onCancel: () => void;
  initialData?: any;
}

const emptyFormData: TicketFormValues = {
  title: "",
  description: "",
  category_id: "",
  priority: "low",
  request_type: "unit",
  site_id: "",
  building_id: "",
  space_id: "",
  tenant_id: "",
  preferred_date: "",
  preferred_time: "",
  assigned_to: "",
  vendor_id: "",
};

export default function TicketForm({
  onSubmit,
  onCancel,
  initialData,
}: TicketFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: initialData
      ? {
          title: initialData.title || "",
          description: initialData.description || "",
          category_id: initialData.category_id || "",
          priority: initialData.priority || "low",
          request_type: initialData.request_type || "unit",
          site_id: initialData.site_id || "",
          building_id: initialData.building_id || "",
          space_id: initialData.space_id || "",
          tenant_id: initialData.tenant_id || "",
          preferred_date:
            initialData.preferred_date ||
            new Date().toISOString().split("T")[0],
          preferred_time: initialData.preferred_time || "",
          assigned_to: initialData.assigned_to || "",
          vendor_id: initialData.vendor_id || "",
        }
      : {
          ...emptyFormData,
          preferred_date: new Date().toISOString().split("T")[0],
        },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);

  const selectedSiteId = watch("site_id");
  const selectedBuildingId = watch("building_id");
  const selectedSpaceId = watch("space_id");

  // Mock preferred time slots
  const preferredTimeSlots = [
    { value: "10am-12pm", label: "10am - 12pm" },
    { value: "12pm-2pm", label: "12pm - 2pm" },
    { value: "2pm-4pm", label: "2pm - 4pm" },
    { value: "4pm-6pm", label: "4pm - 6pm" },
  ];

  useEffect(() => {
    loadSiteLookup();
    loadCategoryLookup(initialData?.site_id || "all");
    loadStaffLookup(initialData?.site_id);
    loadVendorLookup();
    if (initialData?.site_id) {
      loadBuildingLookup(initialData.site_id);
      loadSpaceLookup(initialData.site_id, initialData.building_id);
    }
  }, []);

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
      loadSpaceLookup(selectedSiteId, selectedBuildingId);
      loadCategoryLookup(selectedSiteId);
      loadStaffLookup(selectedSiteId);
      setValue("space_id", "");
      setValue("tenant_id", "");
    } else {
      setSpaceList([]);
      setTenantList([]);
      setStaffList([]);
      loadCategoryLookup("all");
    }
  }, [selectedSiteId, selectedBuildingId, setValue]);

  useEffect(() => {
    if (selectedSiteId && selectedSpaceId) {
      loadTenantLookup(selectedSiteId, selectedSpaceId);
      setValue("tenant_id", "");
    } else {
      setTenantList([]);
    }
  }, [selectedSiteId, selectedSpaceId, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        category_id: initialData.category_id || "",
        priority: initialData.priority || "low",
        request_type: initialData.request_type || "unit",
        site_id: initialData.site_id || "",
        building_id: initialData.building_id || "",
        space_id: initialData.space_id || "",
        tenant_id: initialData.tenant_id || "",
        preferred_date:
          initialData.preferred_date || new Date().toISOString().split("T")[0],
        preferred_time: initialData.preferred_time || "",
        assigned_to: initialData.assigned_to || "",
        vendor_id: initialData.vendor_id || "",
      });
      if (initialData.site_id) {
        loadBuildingLookup(initialData.site_id);
        loadSpaceLookup(initialData.site_id, initialData.building_id);
        loadCategoryLookup(initialData.site_id);
        loadStaffLookup(initialData.site_id);
        if (initialData.space_id) {
          loadTenantLookup(initialData.site_id, initialData.space_id);
        }
      }
    } else {
      reset({
        ...emptyFormData,
        preferred_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, reset]);

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) {
      setSiteList(response.data || []);
    }
  };

  const loadCategoryLookup = async (siteId?: string | null) => {
    const response = await ticketsApiService.getCategoryLookup(siteId || "all");
    if (response.success) {
      setCategoryList(response.data || []);
    }
  };

  const loadBuildingLookup = async (siteId: string) => {
    const lookup = await buildingApiService.getBuildingLookup(siteId);
    if (lookup.success) setBuildingList(lookup.data || []);
  };

  const loadSpaceLookup = async (siteId: string, buildingId?: string) => {
    const response = await spacesApiService.getSpaceLookup(siteId, buildingId);
    if (response.success) {
      setSpaceList(response.data || []);
    }
  };

  const loadTenantLookup = async (siteId: string, spaceId: string) => {
    const params = new URLSearchParams();
    params.append("site_id", siteId);
    params.append("space_id", spaceId);
    const response = await tenantsApiService.getTenantsBySiteSpace(params);
    if (response.success) {
      setTenantList(response.data || []);
    }
  };

  const loadStaffLookup = async (siteId?: string) => {
    const response = await slaPoliciesApiService.getUserContactLookup(siteId);
    if (response.success) {
      setStaffList(response.data || []);
    }
  };

  const loadVendorLookup = async () => {
    const response = await vendorsApiService.getVendorWorkOrderLookup();
    if (response.success) setVendorList(response.data || []);
  };

  const onSubmitForm = async (data: TicketFormValues) => {
    const selectedCategory = categoryList.find(
      (cat: any) => cat.id === data.category_id
    );

    const ticketFormData = new FormData();

    ticketFormData.append("title", data.title);
    ticketFormData.append("description", data.description);
    ticketFormData.append("category_id", data.category_id);
    ticketFormData.append(
      "category",
      selectedCategory?.category_name || selectedCategory?.name || ""
    );
    ticketFormData.append("priority", data.priority);
    ticketFormData.append("request_type", data.request_type);
    ticketFormData.append("site_id", data.site_id);
    if (data.building_id && data.building_id !== "") {
      ticketFormData.append("building_id", data.building_id);
    }
    ticketFormData.append("space_id", data.space_id);
    if (data.tenant_id && data.tenant_id !== "none") {
      ticketFormData.append("tenant_id", data.tenant_id);
    }
    if (data.preferred_date) {
      ticketFormData.append("preferred_date", data.preferred_date);
    }
    if (data.preferred_time) {
      ticketFormData.append("preferred_time", data.preferred_time);
    }
    if (data.assigned_to && data.assigned_to !== "none") {
      ticketFormData.append("assigned_to", data.assigned_to);
    }
    if (data.vendor_id && data.vendor_id !== "none") {
      ticketFormData.append("vendor_id", data.vendor_id);
    }

    if (uploadedImages.length > 0) {
      uploadedImages.forEach((file) => {
        ticketFormData.append("file", file);
      });
    }

    await onSubmit(ticketFormData);
  };

  return (
    <form
      onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
      className="space-y-4"
    >
      {/* 1. Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Brief description of the issue"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* 2. Site, Building, Space */}
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
              >
                <SelectTrigger
                  className={errors.site_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {siteList.map((site: any) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.site_id && (
                <p className="text-sm text-red-500">{errors.site_id.message}</p>
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
                disabled={!selectedSiteId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedSiteId ? "Select site first" : "Select building"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {buildingList.map((building: any) => (
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
                disabled={!selectedSiteId}
              >
                <SelectTrigger
                  className={errors.space_id ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !selectedSiteId ? "Select site first" : "Select space"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {spaceList.map((space: any) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name || space.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.space_id && (
                <p className="text-sm text-red-500">
                  {errors.space_id.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* 3. Tenant, Category, Request Type */}
      <div className="grid grid-cols-3 gap-4">
        <Controller
          name="tenant_id"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant</Label>
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
                disabled={!selectedSpaceId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedSpaceId ? "Select Tenant" : "Select space first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Tenant</SelectItem>
                  {tenantList.map((tenant: any) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger
                  className={errors.category_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.category_name || category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-500">
                  {errors.category_id.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="request_type"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="request_type">Request Type *</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={errors.request_type ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">Unit</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
              {errors.request_type && (
                <p className="text-sm text-red-500">
                  {errors.request_type.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* 4. Priority, Preferred Date, Preferred Time */}
      <div className="grid grid-cols-3 gap-4">
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="preferred_date">Preferred Date *</Label>
          <Input
            id="preferred_date"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            {...register("preferred_date")}
            className={errors.preferred_date ? "border-red-500" : ""}
          />
          {errors.preferred_date && (
            <p className="text-sm text-red-500">
              {errors.preferred_date.message}
            </p>
          )}
        </div>

        <Controller
          name="preferred_time"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="preferred_time">Preferred Time</Label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  {preferredTimeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      {/* 6. Assigned To (Staff) and Vendor */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="assigned_to"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To (Staff)</Label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder=" Select Staff " />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Staff</SelectItem>
                  {staffList.map((staff: any) => (
                    <SelectItem key={staff.id} value={String(staff.id)}>
                      {staff.name ||
                        staff.email ||
                        staff.full_name ||
                        `User ${staff.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <Controller
          name="vendor_id"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="vendor_id">Vendor</Label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Vendor</SelectItem>
                  {vendorList.map((vendor: any) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      {/* 7. Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Detailed description of the issue"
          rows={4}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* 7. Attach Image */}
      <div className="space-y-2">
        <Label>Attach Image</Label>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Only JPG, PNG, JPEG files must be uploaded</p>
            <p>• Uploaded files must be less than 2MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
              const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

              const validFiles: File[] = [];
              const validPreviews: string[] = [];

              files.forEach((file) => {
                // Validation 1: File size (2MB)
                if (file.size > MAX_FILE_SIZE) {
                  toast.error(
                    `${file.name} exceeds 2MB limit. Please choose a smaller file.`
                  );
                  return;
                }

                // Validation 2: File type (png, jpeg, jpg)
                const fileType = file.type.toLowerCase();
                if (!ALLOWED_TYPES.includes(fileType)) {
                  toast.error(
                    `${file.name} is not a valid image type. Only PNG, JPEG, and JPG are allowed.`
                  );
                  return;
                }

                // If file passes both validations, add it
                validFiles.push(file);
                validPreviews.push(URL.createObjectURL(file));
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
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imagePreviews[index]}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setUploadedImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        setImagePreviews((prev) => {
                          URL.revokeObjectURL(prev[index]);
                          return prev.filter((_, i) => i !== index);
                        });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <p>
                  Total: {uploadedImages.length} image(s),{" "}
                  {(
                    uploadedImages.reduce((sum, file) => sum + file.size, 0) /
                    1024
                  ).toFixed(2)}{" "}
                  KB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Update Ticket"
            : "Create Ticket"}
        </Button>
      </div>
    </form>
  );
}