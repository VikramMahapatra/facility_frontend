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
import { Upload, X } from "lucide-react";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { tenantsApiService } from "@/services/Leasing_Tenants/tenantsapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { ticketsApiService } from "@/services/ticketing_service/ticketsapi";
import { useToast } from "@/hooks/use-toast";

interface TicketFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function TicketForm({
  onSubmit,
  onCancel,
  initialData,
}: TicketFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id || "",
    priority: initialData?.priority || "medium",
    request_type: initialData?.request_type || "unit",
    site_id: initialData?.site_id || "",
    space_id: initialData?.space_id || "",
    tenant_id: initialData?.tenant_id || "",
    preferred_time: initialData?.preferred_time || "",
    
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock preferred time slots
  const preferredTimeSlots = [
    { value: "10am-12pm", label: "10am - 12pm" },
    { value: "12pm-2pm", label: "12pm - 2pm" },
    { value: "2pm-4pm", label: "2pm - 4pm" },
    { value: "4pm-6pm", label: "4pm - 6pm" },
  ];

  useEffect(() => {
    loadSiteLookup();
    loadCategoryLookup();
    if (formData.site_id) {
      loadSpaceLookup(formData.site_id);
    }
  }, []);

  useEffect(() => {
    if (formData.site_id) {
      loadSpaceLookup(formData.site_id);
    } else {
      setSpaceList([]);
    }
  }, [formData.site_id]);

  useEffect(() => {
    if (formData.site_id && formData.space_id) {
      loadTenantLookup(formData.site_id, formData.space_id);
    } else {
      setTenantList([]);
    }
  }, [formData.site_id, formData.space_id]);

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) {
      setSiteList(response.data || []);
    }
  };

  const loadCategoryLookup = async () => {
    const response = await ticketsApiService.getCategoryLookup();
    if (response.success) {
      setCategoryList(response.data || []);
    }
  };

  const loadSpaceLookup = async (siteId: string) => {
    const response = await spacesApiService.getSpaceLookup(siteId);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategory = categoryList.find(
        (cat: any) => cat.id === formData.category_id
      );
      const orgData = await organisationApiService.getOrg();

      const ticketFormData = new FormData();

      ticketFormData.append("title", formData.title);
      ticketFormData.append("description", formData.description);
      ticketFormData.append("category_id", formData.category_id);
      ticketFormData.append(
        "category",
        selectedCategory?.category_name || selectedCategory?.name || ""
      );
      ticketFormData.append("priority", formData.priority);
      ticketFormData.append("request_type", formData.request_type);
      ticketFormData.append("site_id", formData.site_id);
      ticketFormData.append("space_id", formData.space_id);
      ticketFormData.append("tenant_id", formData.tenant_id);
      ticketFormData.append("preferred_time", formData.preferred_time);

      if (uploadedImages.length > 0) {
        uploadedImages.forEach((file) => {
          ticketFormData.append("file", file);
        });
      }

      console.log("Ticket Form Data", ticketFormData);

      await onSubmit(ticketFormData);
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of the issue"
          required
        />
      </div>

      {/* 2. Site, Space */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="site_id">Site *</Label>
          <Select
            value={formData.site_id}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                site_id: value,
                space_id: "",
                tenant_id: "",
              })
            }
          >
            <SelectTrigger>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="space_id">Space *</Label>
          <Select
            value={formData.space_id || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, space_id: value, tenant_id: "" })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  formData.site_id ? "Select space" : "Select site first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {spaceList.map((space: any) => (
                <SelectItem key={space.id} value={space.id}>
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. Tenant, Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tenant_id">Tenant *</Label>
          <Select
            value={formData.tenant_id || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, tenant_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  formData.space_id ? "Select tenant" : "Select space first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {tenantList.map((tenant: any) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Category *</Label>
          <Select
            value={formData.category_id || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, category_id: value })
            }
          >
            <SelectTrigger>
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
        </div>
      </div>

      {/* 4. Request type, Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="request_type">Request Type *</Label>
          <Select
            value={formData.request_type}
            onValueChange={(value) =>
              setFormData({ ...formData, request_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Request Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit">unit</SelectItem>
              <SelectItem value="community">community</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) =>
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 5. Preferred time */}
      <div className="space-y-2">
        <Label htmlFor="preferred_time">Preferred Time</Label>
        <Select
          value={formData.preferred_time || ""}
          onValueChange={(value) =>
            setFormData({ ...formData, preferred_time: value })
          }
        >
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

      {/* 6. Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Detailed description of the issue"
          rows={4}
          required
        />
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
                  toast({
                    title: "File size error",
                    description: `${file.name} exceeds 2MB limit. Please choose a smaller file.`,
                    variant: "destructive",
                  });
                  return;
                }

                // Validation 2: File type (png, jpeg, jpg)
                const fileType = file.type.toLowerCase();
                if (!ALLOWED_TYPES.includes(fileType)) {
                  toast({
                    title: "File type error",
                    description: `${file.name} is not a valid image type. Only PNG, JPEG, and JPG are allowed.`,
                    variant: "destructive",
                  });
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

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Submitting " : initialData ? "Update" : "Create"} Ticket
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
