import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { slaPolicySchema, SLAPolicyFormValues } from "@/schemas/sla_policy.schema";
import { SLAPolicy } from "@/interfaces/sla_policy_interface";

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

  const onSubmitForm = async (data: SLAPolicyFormValues) => {
    const formResponse = await onSave({
      ...policy,
      ...data,
    });
  };

  const isReadOnly = mode === "view";

  return (
    <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization Name</Label>
            <Input
              id="organization_name"
              {...register("organization_name")}
              placeholder="e.g., ABC Corporation"
              disabled={isReadOnly}
              className={errors.organization_name ? 'border-red-500' : ''}
            />
            {errors.organization_name && (
              <p className="text-sm text-red-500">{errors.organization_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_category">Service Category *</Label>
            <Input
              id="service_category"
              {...register("service_category")}
              placeholder="e.g., Electrical"
              disabled={isReadOnly}
              className={errors.service_category ? 'border-red-500' : ''}
            />
            {errors.service_category && (
              <p className="text-sm text-red-500">{errors.service_category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalation_contact">Escalation Contact (User ID)</Label>
            <Input
              id="escalation_contact"
              type="number"
              {...register("escalation_contact", { valueAsNumber: true })}
              placeholder="e.g., 102"
              disabled={isReadOnly}
              className={errors.escalation_contact ? 'border-red-500' : ''}
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
            <Input
              id="site_name"
              {...register("site_name")}
              placeholder="e.g., Downtown Tower"
              disabled={isReadOnly}
              className={errors.site_name ? 'border-red-500' : ''}
            />
            {errors.site_name && (
              <p className="text-sm text-red-500">{errors.site_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_contact">Default Contact (User ID)</Label>
            <Input
              id="default_contact"
              type="number"
              {...register("default_contact", { valueAsNumber: true })}
              placeholder="e.g., 101"
              disabled={isReadOnly}
              className={errors.default_contact ? 'border-red-500' : ''}
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

      <div className="flex justify-end gap-2 pt-4">
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
      </div>
    </form>
  );
}

