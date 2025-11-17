import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ticketCategoriesApiService } from "@/services/ticketing_service/ticketcategoriesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";

interface TicketCategoryFormProps {
  onSubmit: (data: any) => Promise<any>;
  onCancel: () => void;
  initialData?: any;
}

export default function TicketCategoryForm({ onSubmit, onCancel, initialData }: TicketCategoryFormProps) {
  const [formData, setFormData] = useState({
    category_name: initialData?.category_name || "",
    site_id: initialData?.site_id || "",
    auto_assign_role: initialData?.auto_assign_role || "",
    sla_hours: initialData?.sla_hours || 24,
    is_active: initialData?.is_active ?? true,
    sla_id: initialData?.sla_id || "",
    status: initialData?.status || "",
  });
  const [autoAssignRoleList, setAutoAssignRoleList] = useState<any[]>([]);
  const [slaPolicyList, setSlaPolicyList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAutoAssignRoleLookup();
    loadStatusLookup();
    loadSiteLookup();
    if (formData.site_id) {
      loadSlaPolicyLookup(formData.site_id);
    }
  }, []);

  useEffect(() => {
    if (formData.site_id) {
      loadSlaPolicyLookup(formData.site_id);
    } else {
      setSlaPolicyList([]);
    }
  }, [formData.site_id]);

  const loadAutoAssignRoleLookup = async () => {
    const response = await ticketCategoriesApiService.getAutoAssignRoleLookup();
    if (response.success) {
      setAutoAssignRoleList(response.data);
    }
  };

  const loadSlaPolicyLookup = async (siteId: string) => {
    const response = await ticketCategoriesApiService.getSlaPolicyLookup(siteId);
    if (response.success) {
      setSlaPolicyList(response.data || []);
    } else {
      setSlaPolicyList([]);
    }
  };

  const loadStatusLookup = async () => {
    const response = await ticketCategoriesApiService.getStatusLookup();
    if (response.success) {
      setStatusList(response.data);
    
      setFormData(prev => {
        if (prev.status && response.data?.length > 0) {
          const activeStatus = response.data.find((s: any) => s.name?.toLowerCase() === 'active');
          if (activeStatus) {
            return {
              ...prev,
              is_active: prev.status === activeStatus.id
            };
          }
        }
        return prev;
      });
    }
  };

  const getActiveStatusId = () => {
    return statusList.find((s: any) => s.name?.toLowerCase() === 'active')?.id;
  };

  const getInactiveStatusId = () => {
    return statusList.find((s: any) => s.name?.toLowerCase() === 'inactive')?.id;
  };

  const handleActiveToggle = (checked: boolean) => {
    const activeId = getActiveStatusId();
    const inactiveId = getInactiveStatusId();
    setFormData({ 
      ...formData, 
      is_active: checked,
      status: checked ? activeId : inactiveId 
    });
  };

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) {
      setSiteList(response.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formResponse = await onSubmit(formData);
      if (formResponse?.success) {
        // Form will be closed by parent component
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      // Re-enable buttons on any error
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category_name">Category Name *</Label>
        <Input
          id="category_name"
          value={formData.category_name}
          onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
          placeholder="e.g., Electrical Issues"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="site_id">Site *</Label>
        <Select
          value={formData.site_id || ""}
          onValueChange={(value) => setFormData({ ...formData, site_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select site " />
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
        <Label htmlFor="auto_assign_role">Auto-Assign Role</Label>
        <Select
          value={formData.auto_assign_role || ""}
          onValueChange={(value) => setFormData({ ...formData, auto_assign_role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select auto-assign role" />
          </SelectTrigger>
          <SelectContent>
            {autoAssignRoleList.map((role: any) => (
              <SelectItem key={role.id } value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sla_hours">SLA Hours *</Label>
        <Input
          id="sla_hours"
          type="number"
          value={formData.sla_hours}
          onChange={(e) => setFormData({ ...formData, sla_hours: parseInt(e.target.value) })}
          min="1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sla_id">SLA Policy</Label>
        <Select
          value={formData.sla_id?.toString() || ""}
          onValueChange={(value) => setFormData({ ...formData, sla_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select SLA Policy" />
          </SelectTrigger>
          <SelectContent>
            {slaPolicyList.map((policy: any) => (
              <SelectItem key={policy.id} value={policy.id}>
                {policy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={handleActiveToggle}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : initialData ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
