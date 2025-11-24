import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slaPolicySchema, SLAPolicyFormValues } from "@/schemas/sla_policy.schema";
import { SLAPolicy } from "@/interfaces/sla_policy_interface";
import { slaPoliciesApiService } from "@/services/ticketing_service/slapoliciesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";

interface SLAPolicyFormProps {
  policy?: SLAPolicy | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (policy: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: SLAPolicyFormValues = {
  organization_name: "",
  service_category: "",
  site_name: "",
  default_contact: undefined,
  escalation_contact: undefined,
  response_time_mins: 0,
  resolution_time_mins: 0,
  escalation_time_mins: 0,
  active: true,
};

export function SLAPolicyForm({ policy, isOpen, onClose, onSave, mode }: SLAPolicyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SLAPolicyFormValues>({
    resolver: zodResolver(slaPolicySchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [orgList, setOrgList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [serviceCategoryList, setServiceCategoryList] = useState<any[]>([]);
  const [userContactList, setUserContactList] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadAllLookups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (policy && mode !== "create") {
      reset({
        organization_name: policy.organization_name || "",
        service_category: policy.service_category || "",
        site_name: policy.site_name || "",
        default_contact: policy.default_contact || undefined,
        escalation_contact: policy.escalation_contact || undefined,
        response_time_mins: policy.response_time_mins || 0,
        resolution_time_mins: policy.resolution_time_mins || 0,
        escalation_time_mins: policy.escalation_time_mins || 0,
        active: policy.active ?? true,
      });
    } else {
      reset(emptyFormData);
    }
  }, [policy, mode, reset]);

  const loadAllLookups = async () => {
    try {
      const [orgs, sites, categories, contacts] = await Promise.all([
        slaPoliciesApiService.getOrgLookup(),
        siteApiService.getSiteLookup(),
        slaPoliciesApiService.getServiceCategoryLookup(),
        slaPoliciesApiService.getUserContactLookup(),
      ]);

      if (orgs.success) setOrgList(orgs.data || []);
      if (sites.success) setSiteList(sites.data || []);
      if (categories.success) setServiceCategoryList(categories.data || []);
      if (contacts.success) setUserContactList(contacts.data || []);
    } catch (error) {
      console.error("Failed to load lookup data:", error);
    }
  };

  const onSubmitForm = async (data: SLAPolicyFormValues) => {
    const formResponse = await onSave({
      ...policy,
      ...data,
    });
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New SLA Policy"}
            {mode === "edit" && "Edit SLA Policy"}
            {mode === "view" && "SLA Policy Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization Name</Label>
            <Controller
              name="organization_name"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className={errors.organization_name ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgList.map((org) => (
                      <SelectItem key={org.id} value={org.name || org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.organization_name && (
              <p className="text-sm text-red-500">{errors.organization_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_category">Service Category *</Label>
            <Controller
              name="service_category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className={errors.service_category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategoryList.map((category) => (
                      <SelectItem key={category.id} value={category.name || category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.service_category && (
              <p className="text-sm text-red-500">{errors.service_category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalation_contact">Escalation Contact</Label>
            <Controller
              name="escalation_contact"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className={errors.escalation_contact ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select escalation contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {userContactList.map((contact) => (
                      <SelectItem key={contact.id} value={String(contact.id)}>
                        {contact.name || contact.email || `User ${contact.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.escalation_contact && (
              <p className="text-sm text-red-500">{errors.escalation_contact.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution_time_mins">Resolution Time (Minutes) *</Label>
            <Input
              id="resolution_time_mins"
              type="number"
              {...register("resolution_time_mins", { valueAsNumber: true })}
              min="1"
              placeholder="e.g., 240"
              disabled={isReadOnly}
              className={errors.resolution_time_mins ? 'border-red-500' : ''}
            />
            {errors.resolution_time_mins && (
              <p className="text-sm text-red-500">{errors.resolution_time_mins.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isReadOnly}
                />
              )}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_name">Site Name</Label>
            <Controller
              name="site_name"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className={errors.site_name ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {siteList.map((site) => (
                      <SelectItem key={site.id} value={site.name || site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.site_name && (
              <p className="text-sm text-red-500">{errors.site_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_contact">Default Contact</Label>
            <Controller
              name="default_contact"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className={errors.default_contact ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select default contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {userContactList.map((contact) => (
                      <SelectItem key={contact.id} value={String(contact.id)}>
                        {contact.name || contact.email || `User ${contact.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.default_contact && (
              <p className="text-sm text-red-500">{errors.default_contact.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="response_time_mins">Response Time (Minutes) *</Label>
            <Input
              id="response_time_mins"
              type="number"
              {...register("response_time_mins", { valueAsNumber: true })}
              min="1"
              placeholder="e.g., 60"
              disabled={isReadOnly}
              className={errors.response_time_mins ? 'border-red-500' : ''}
            />
            {errors.response_time_mins && (
              <p className="text-sm text-red-500">{errors.response_time_mins.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalation_time_mins">Escalation Time (Minutes) *</Label>
            <Input
              id="escalation_time_mins"
              type="number"
              {...register("escalation_time_mins", { valueAsNumber: true })}
              min="1"
              placeholder="e.g., 300"
              disabled={isReadOnly}
              className={errors.escalation_time_mins ? 'border-red-500' : ''}
            />
            {errors.escalation_time_mins && (
              <p className="text-sm text-red-500">{errors.escalation_time_mins.message}</p>
            )}
          </div>
        </div>
      </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create SLA Policy" : "Update SLA Policy"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

