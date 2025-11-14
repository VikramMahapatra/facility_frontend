import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteFormValues, siteSchema } from "@/schemas/site.schema";
import { toast } from "sonner";

export interface Site {
  id: string;
  org_id: string;
  name: string;
  code: string;
  kind: 'residential' | 'commercial' | 'hotel' | 'mall' | 'mixed' | 'campus';
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country?: string;
    pincode: string;
  };
  geo: { lat: number; lng: number };
  opened_on: string;
  status: 'active' | 'inactive';
  total_spaces?: string;
  buildings?: string;
  occupied_percent?: string;
  created_at: string;
  updated_at: string;
}

interface SiteFormProps {
  site?: Site;
  isOpen: boolean;
  onClose: () => void;
  onSave: (site: Partial<Site>) => void;
  mode: "create" | "edit" | "view";
}

const siteKinds = ["residential", "commercial", "hotel", "mall", "mixed", "campus"];

const emptyFormData: SiteFormValues = {
  code: "",
  name: "",
  kind: "residential",
  status: "active",
  opened_on: "",
  address: {
    line1: "",
    city: "",
    state: "",
    pincode: "",
  },
};

export function SiteForm({ site, isOpen, onClose, onSave, mode }: SiteFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (site && mode !== "create") {
      reset({
        code: site.code || "",
        name: site.name || "",
        kind: site.kind || "residential",
        status: site.status || "active",
        opened_on: site.opened_on || "",
        address: {
          line1: site.address?.line1 || "",
          line2: site.address?.line2,
          city: site.address?.city || "",
          state: site.address?.state || "",
          country: site.address?.country,
          pincode: site.address?.pincode || "",
        },
        geo: site.geo ? {
          lat: site.geo.lat,
          lng: site.geo.lng,
        } : undefined,
      });
    } else {
      reset(emptyFormData);
    }
    setIsSubmitted(false);
  }, [site, mode, reset, isOpen]);

  const onSubmitForm = async (data: SiteFormValues) => {
    setIsSubmitted(true);
    try {
      await onSave({
        ...site,
        ...data,
        updated_at: new Date().toISOString(),
      } as Partial<Site>);
      reset(emptyFormData);
      onClose();
    } catch (error) {
      reset(undefined, { keepErrors: true, keepValues: true });
      toast("Failed to save site");
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Site"}
            {mode === "edit" && "Edit Site"}
            {mode === "view" && "Site Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name *</Label>
            <Input
              id="name"
              {...register("name")}
              disabled={isReadOnly}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Enter Site name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="kind">Type</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.kind ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {siteKinds.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.kind && (
                    <p className="text-sm text-red-500">{errors.kind.message}</p>
                  )}
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
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opened_on">Launch Date</Label>
              <Input
                id="opened_on"
                type="date"
                {...register("opened_on")}
                disabled={isReadOnly}
                className={errors.opened_on ? 'border-red-500' : ''}
              />
              {errors.opened_on && (
                <p className="text-sm text-red-500">{errors.opened_on.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code"> Site Code</Label>
              <Input
                id="code"
                {...register("code")}
                disabled={isReadOnly}
                className={errors.code ? 'border-red-500' : ''}
                placeholder="e.g., SITE001, HQ-001, BLD-2024"
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="line1">Address Line *</Label>
              <Input
                id="line1"
                {...register("address.line1")}
                disabled={isReadOnly}
                className={errors.address?.line1 ? 'border-red-500' : ''}
              />
              {errors.address?.line1 && (
                <p className="text-sm text-red-500">{errors.address.line1.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register("address.city")}
                disabled={isReadOnly}
                className={errors.address?.city ? 'border-red-500' : ''}
              />
              {errors.address?.city && (
                <p className="text-sm text-red-500">{errors.address.city.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                {...register("address.state")}
                disabled={isReadOnly}
                className={errors.address?.state ? 'border-red-500' : ''}
              />
              {errors.address?.state && (
                <p className="text-sm text-red-500">{errors.address.state.message}</p>
              )}
            </div>
            <Controller
              name="address.pincode"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    {...field}
                    onChange={(e) => {
                      // Filter out non-numeric characters
                      const numericValue = e.target.value.replace(/\D/g, '');
                      field.onChange(numericValue);
                    }}
                    disabled={isReadOnly}
                    className={errors.address?.pincode ? 'border-red-500' : ''}
                    placeholder="Enter pincode (numbers only)"
                  />
                  {errors.address?.pincode && (
                    <p className="text-sm text-red-500">{errors.address.pincode.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting || isSubmitted}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Site" : "Update Site"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}