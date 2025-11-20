import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import PhoneInput from "react-phone-input-2";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizationSchema, OrganizationFormValues } from "@/schemas/organization.schema";

interface Organization {
  id: string;
  name: string;
  legal_name: string;
  gst_vat_id?: string;
  billing_email: string;
  contact_phone?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  locale: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

interface OrganizationFormProps {
  organization?: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSave: (organization: Partial<Organization>) => Promise<any>;
  mode: 'create' | 'edit' | 'view';
}

const emptyFormData: OrganizationFormValues = {
  name: "",
  legal_name: "",
  gst_vat_id: "",
  billing_email: "",
  contact_phone: "",
  plan: "basic",
  locale: "en-IN",
  timezone: "Asia/Kolkata",
  status: "active",
};

export function OrganizationForm({ organization, isOpen, onClose, onSave, mode }: OrganizationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (organization && mode !== "create") {
      reset({
        name: organization.name || "",
        legal_name: organization.legal_name || "",
        gst_vat_id: organization.gst_vat_id || "",
        billing_email: organization.billing_email || "",
        contact_phone: organization.contact_phone || "",
        plan: organization.plan || "basic",
        locale: organization.locale || "en-IN",
        timezone: organization.timezone || "Asia/Kolkata",
        status: organization.status || "active",
      });
    } else {
      reset(emptyFormData);
    }
  }, [organization, mode, reset, isOpen]);

  const onSubmitForm = async (data: OrganizationFormValues) => {
    const formResponse = await onSave({
      ...organization,
      ...data,
    });
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && "Create New Organization"}
            {mode === 'edit' && "Edit Organization"}
            {mode === 'view' && "Organization Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Taj Hotels, Gera"
                disabled={isReadOnly}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Name *</Label>
              <Input
                id="legal_name"
                {...register("legal_name")}
                placeholder="e.g., Indian Hotels Company Ltd"
                disabled={isReadOnly}
                className={errors.legal_name ? 'border-red-500' : ''}
              />
              {errors.legal_name && (
                <p className="text-sm text-red-500">{errors.legal_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing_email">Billing Email *</Label>
              <Input
                id="billing_email"
                type="email"
                {...register("billing_email")}
                placeholder="billing@company.com"
                disabled={isReadOnly}
                className={errors.billing_email ? 'border-red-500' : ''}
              />
              {errors.billing_email && (
                <p className="text-sm text-red-500">{errors.billing_email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone *</Label>
              <Controller
                name="contact_phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    country={'in'}
                    value={field.value || ""}
                    onChange={(value) => {
                      const digits = value.replace(/\D/g, "");
                      const finalValue = "+" + digits;
                      field.onChange(finalValue);
                    }}
                    disabled={isReadOnly}
                    inputProps={{
                      name: 'contact_phone',
                      required: false,
                    }}
                    containerClass="w-full relative"
                    inputClass={`!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm ${errors.contact_phone ? '!border-red-500' : ''}`}
                    buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                    dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                    enableSearch={true}
                  />
                )}
              />
              {errors.contact_phone && (
                <p className="text-sm text-red-500">{errors.contact_phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gst_vat_id">GST/VAT ID *</Label>
              <Input
                id="gst_vat_id"
                {...register("gst_vat_id")}
                placeholder="27AAACI1234K1Z1"
                disabled={isReadOnly}
                className={errors.gst_vat_id ? 'border-red-500' : ''}
              />
              {errors.gst_vat_id && (
                <p className="text-sm text-red-500">{errors.gst_vat_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Controller
                name="plan"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.plan ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.plan && (
                <p className="text-sm text-red-500">{errors.plan.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locale">Locale *</Label>
              <Controller
                name="locale"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.locale ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.locale && (
                <p className="text-sm text-red-500">{errors.locale.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.timezone ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.timezone && (
                <p className="text-sm text-red-500">{errors.timezone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === 'create' ? 'Create Organization' : 'Update Organization'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}