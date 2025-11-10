import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { tenantsApiService } from "@/services/Leasing_Tenants/tenantsapi";
import { ticketCategoriesApiService } from "@/services/ticketing_service/ticketcategoriesapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";

interface TicketFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function TicketForm({ onSubmit, onCancel, initialData }: TicketFormProps) {
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
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  
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
    const response = await ticketCategoriesApiService.getTicketCategories();
    if (response.success) {
      setCategoryList(response.data?.ticket_categories || []);
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
    
    const selectedCategory = categoryList.find((cat: any) => cat.id === formData.category_id);
    const orgData = await organisationApiService.getOrg();
    
    const payload = {
      ...formData,
      category_id: formData.category_id,
      category: selectedCategory?.category_name || selectedCategory?.name || "",
      org_id: orgData?.data?.id,
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the issue"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category_id">Category *</Label>
          <Select
            value={formData.category_id || ""}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
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

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="request_type">Request Type *</Label>
          <Select
            value={formData.request_type}
            onValueChange={(value) => setFormData({ ...formData, request_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit">unit</SelectItem>
              <SelectItem value="community">community</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_id">Site *</Label>
          <Select value={formData.site_id} onValueChange={(value) => setFormData({ ...formData, site_id: value, space_id: "", tenant_id: "" })}>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="space_id">Space *</Label>
          <Select
            value={formData.space_id || ""}
            onValueChange={(value) => setFormData({ ...formData, space_id: value, tenant_id: "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.site_id ? "Select space" : "Select site first"} />
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

        <div className="space-y-2">
          <Label htmlFor="tenant_id">Tenant *</Label>
          <Select
            value={formData.tenant_id || ""}
            onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.space_id ? "Select tenant" : "Select space first"} />
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferred_time">Preferred Time</Label>
        <Select
          value={formData.preferred_time || ""}
          onValueChange={(value) => setFormData({ ...formData, preferred_time: value })}
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

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? "Update" : "Create"} Ticket
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}