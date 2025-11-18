import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisitorFormValues, visitorSchema } from "@/schemas/visitor.schema";
import { toast } from "sonner";
import { Visitor } from "@/interfaces/parking_access_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { utcToLocal, localToUTC } from "@/helpers/dateHelpers"
import { spacesApiService } from "@/services/spaces_sites/spacesapi";

interface VisitorFormProps {
  visitor?: Visitor;
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitor: Partial<Visitor>) => void;
  mode: 'create' | 'edit' | 'view';
}

const emptyFormData: VisitorFormValues = {
  name: "",
  phone: "",
  site_id: "",
  space_id: "",
  purpose: "",
  status: "expected",
  vehicle_no: "",
  entry_time: new Date().toISOString().slice(0, 16),
  exit_time: "",
  is_expected: true
};

export function VisitorForm({ visitor, isOpen, onClose, onSave, mode }: VisitorFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [siteList, setSiteList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);

  const selectedSiteId = watch("site_id");
  const selectedStatus = watch("status");

  useEffect(() => {
    if (visitor && mode !== "create") {
      reset({
        name: visitor.name || "",
        phone: visitor.phone || "",
        site_id: visitor.site_id || "",
        space_id: visitor.space_id || "",
        purpose: visitor.purpose || "",
        status: visitor.status || "expected",
        vehicle_no: visitor.vehicle_no || "",
        entry_time: visitor.entry_time ? utcToLocal(visitor.entry_time) : new Date().toISOString().slice(0, 16),
        exit_time: visitor.exit_time ? utcToLocal(visitor.exit_time) : "",
        is_expected: visitor.is_expected !== undefined ? visitor.is_expected : true,
      });
    } else {
      reset(emptyFormData);
    }
    loadSiteLookup();
    setSpaceList([]);
  }, [visitor, mode, reset]);

  useEffect(() => {
    if (selectedSiteId) {
      loadSpaceLookup();
    } else {
      setSpaceList([]);
      setValue("space_id", "");
    }
  }, [selectedSiteId, setValue]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  }

  const loadSpaceLookup = async () => {
    if (!selectedSiteId) return;
    const lookup = await spacesApiService.getSpaceWithBuildingLookup(selectedSiteId);
    if (lookup.success) setSpaceList(lookup.data || []);
  }

  const onSubmitForm = async (data: VisitorFormValues) => {
    try {
      const visitorData = {
        ...visitor,
        name: data.name,
        phone: data.phone,
        site_id: data.site_id,
        space_id: data.space_id,
        purpose: data.purpose,
        status: data.status,
        vehicle_no: data.vehicle_no || undefined,
        entry_time: localToUTC(data.entry_time || ""),
        exit_time: data.exit_time ? localToUTC(data.exit_time) : undefined,
        is_expected: data.is_expected
      };

      await onSave(visitorData);
      reset(emptyFormData);
      onClose();
    } catch (error: any) {
      reset(undefined, { keepErrors: true, keepValues: true });
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save visitor";
      toast.error(errorMessage);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && "Add New Visitor"}
            {mode === 'edit' && "Edit Visitor"}
            {mode === 'view' && "Visitor Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Visitor's full name"
                disabled={isReadOnly}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      field.onChange(value);
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={isReadOnly}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            name="site_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="site">Site *</Label>
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("space_id", "");
                  }}
                  disabled={isReadOnly}
                >
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
                {errors.site_id && (
                  <p className="text-sm text-red-500">{errors.site_id.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="space_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="visiting">Visiting *</Label>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isReadOnly || !selectedSiteId}
                >
                  <SelectTrigger className={errors.space_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select visiting place" />
                  </SelectTrigger>
                  <SelectContent>
                    {spaceList.map((space) => (
                      <SelectItem key={space.id} value={space.id}>
                        {space.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.space_id && (
                  <p className="text-sm text-red-500">{errors.space_id.message}</p>
                )}
              </div>
            )}
          />

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              {...register("purpose")}
              placeholder="e.g., Meeting, Delivery, Maintenance"
              disabled={isReadOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={field.value || "expected"}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expected">Expected</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <div>
              <Label htmlFor="vehicle_no">Vehicle Number</Label>
              <Input
                id="vehicle_no"
                {...register("vehicle_no")}
                placeholder="e.g., KA01AB1234"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_time">Entry Time</Label>
              <Input
                id="entry_time"
                type="datetime-local"
                {...register("entry_time")}
                disabled={isReadOnly}
              />
            </div>
            {selectedStatus === 'checked_out' && (
              <div>
                <Label htmlFor="exit_time">Exit Time</Label>
                <Input
                  id="exit_time"
                  type="datetime-local"
                  {...register("exit_time")}
                  disabled={isReadOnly}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === 'create' ? 'Add Visitor' : 'Update Visitor'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}