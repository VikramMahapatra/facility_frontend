import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ticketCategoriesApiService } from "@/services/ticketing_service/ticketcategoriesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import {
  ticketCategorySchema,
  TicketCategoryFormValues,
} from "@/schemas/ticketCategory.schema";
import { toast } from "sonner";

interface TicketCategoryFormProps {
  category?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: TicketCategoryFormValues = {
  category_name: "",
  site_id: "",
  auto_assign_role: "",
  sla_hours: 24,
  is_active: true,
  sla_id: "",
  status: "",
};

export default function TicketCategoryForm({
  category,
  isOpen,
  onClose,
  onSave,
  mode,
}: TicketCategoryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketCategoryFormValues>({
    resolver: zodResolver(ticketCategorySchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [formLoading, setFormLoading] = useState(true);
  const [autoAssignRoleList, setAutoAssignRoleList] = useState<any[]>([]);
  const [slaPolicyList, setSlaPolicyList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);

  const selectedSiteId = watch("site_id");
  const isActive = watch("is_active");

  const loadAll = async () => {
    await Promise.all([
      loadAutoAssignRoleLookup(),
      loadStatusLookup(),
      loadSiteLookup(),
    ]);
    setFormLoading(false);
    reset(
      category
        ? {
            ...category,
            sla_hours: category.sla_hours || 24,
            is_active: category.is_active ?? true,
          }
        : emptyFormData
    );
  };

  useEffect(() => {
    console.log("category data :", category);
    loadAll();
  }, [category, mode, reset]);

  useEffect(() => {
    if (selectedSiteId) {
      loadSlaPolicyLookup(selectedSiteId);
    } else {
      setSlaPolicyList([]);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (category && siteList.length > 0) {
      setValue("site_id", category.site_id, { shouldValidate: true });
    }
  }, [siteList]);

  useEffect(() => {
    if (category && slaPolicyList.length > 0) {
      setValue("sla_id", category.sla_id, { shouldValidate: true });
    }
  }, [slaPolicyList]);

  const loadAutoAssignRoleLookup = async () => {
    const response = await ticketCategoriesApiService.getAutoAssignRoleLookup();
    if (response.success) {
      setAutoAssignRoleList(response.data);
    }
  };

  const loadSlaPolicyLookup = async (siteId: string) => {
    const response = await ticketCategoriesApiService.getSlaPolicyLookup(
      siteId
    );
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
    }
  };

  const getActiveStatusId = () => {
    return statusList.find((s: any) => s.name?.toLowerCase() === "active")?.id;
  };

  const getInactiveStatusId = () => {
    return statusList.find((s: any) => s.name?.toLowerCase() === "inactive")
      ?.id;
  };

  const handleActiveToggle = (checked: boolean) => {
    const activeId = getActiveStatusId();
    const inactiveId = getInactiveStatusId();
    setValue("is_active", checked);
    setValue("status", checked ? activeId : inactiveId);
  };

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) {
      setSiteList(response.data);
    }
  };

  const onSubmitForm = async (data: TicketCategoryFormValues) => {
    const formResponse = await onSave({
      ...category,
      ...data,
    });
  };

  const isReadOnly = mode === "view";

  return (
    <form
      onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
      className="space-y-4"
    >
      {formLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div>
          <div className="space-y-2">
            <Label htmlFor="category_name">Category Name *</Label>
            <Input
              id="category_name"
              {...register("category_name")}
              placeholder="e.g., Electrical Issues"
              className={errors.category_name ? "border-red-500" : ""}
              disabled={isReadOnly}
            />
            {errors.category_name && (
              <p className="text-sm text-red-500">
                {errors.category_name.message}
              </p>
            )}
          </div>
          <Controller
            name="site_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="site_id">Site *</Label>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
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
                  <p className="text-sm text-red-500">
                    {errors.site_id.message}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="auto_assign_role"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="auto_assign_role">Auto-Assign Role *</Label>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className={errors.auto_assign_role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select auto-assign role" />
                  </SelectTrigger>
                  <SelectContent>
                    {autoAssignRoleList.map((role: any) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.auto_assign_role && (
                  <p className="text-sm text-red-500">
                    {errors.auto_assign_role.message}
                  </p>
                )}
              </div>
            )}
          />
          <div className="space-y-2">
            <Label htmlFor="sla_hours">SLA Hours</Label>
            <Input
              id="sla_hours"
              type="number"
              {...register("sla_hours", { valueAsNumber: true })}
              min="1"
              className={errors.sla_hours ? "border-red-500" : ""}
              disabled={isReadOnly}
            />
            {errors.sla_hours && (
              <p className="text-sm text-red-500">{errors.sla_hours.message}</p>
            )}
          </div>
          <Controller
            name="sla_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="sla_id">SLA Policy *</Label>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                  required
                >
                  <SelectTrigger
                    className={errors.sla_id ? "border-red-500" : ""}
                  >
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
                {errors.sla_id && (
                  <p className="text-sm text-red-500">
                    {errors.sla_id.message}
                  </p>
                )}
              </div>
            )}
          />
          <div className="flex items-center space-x-2 pt-4">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={handleActiveToggle}
                  disabled={isReadOnly}
                />
              )}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Ticket Category"
                  : "Update Ticket Category"}
              </Button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
