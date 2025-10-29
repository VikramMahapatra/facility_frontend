"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BuildingFormValues, buildingSchema } from "@/schemas/building.schema";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { toast } from "sonner";

interface BuildingFormProps {
  building?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (building: any) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData: BuildingFormValues = {
  name: "",
  site_id: "",
  floors: 1,
  status: 'active',
  attributes: {
    lifts: 0,
    fireSafety: true
  }
};

export function BuildingForm({ building, isOpen, onClose, onSave, mode }: BuildingFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [siteList, setSiteList] = useState<any[]>([]);

  useEffect(() => {
    loadSiteLookup();
  }, []);

  useEffect(() => {
    if (building && mode !== "create") {
      reset({
        name: building.name || "",
        site_id: building.site_id || "",
        floors: building.floors || 1,
        status: building.status || 'active',
        attributes: {
          lifts: building.attributes?.lifts || 0,
          fireSafety: building.attributes?.fireSafety ?? true,
        },
      });
    } else {
      reset(emptyFormData);
    }
  }, [building, mode, reset]);

  const isReadOnly = mode === "view";

  const loadSiteLookup = async () => {
    try {
      const lookup = await siteApiService.getSiteLookup();
      setSiteList(lookup || []);
    } catch (error) {
      console.error('Failed to load sites:', error);
      setSiteList([]);
    }
  };

  const onSubmitForm = async (data: BuildingFormValues) => {
    try {
      await onSave({
        ...building,
        ...data,
        updated_at: new Date().toISOString(),
        created_at: building?.created_at || new Date().toISOString(),
      });
      reset(emptyFormData);
      onClose();
    } catch (error) {
      reset(undefined, { keepErrors: true, keepValues: true });
      toast("Failed to save building");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Building" : mode === "edit" ? "Edit Building" : "View Building"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Building Name *</Label>
            <Input
              id="name"
              {...register("name")}
              disabled={isReadOnly}
              placeholder="Enter building name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <Controller
            name="site_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="site_id">Site *</Label>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={errors.site_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    {siteList.length === 0 ? (
                      <SelectItem value="none" disabled>No sites available</SelectItem>
                    ) : (
                      siteList.map(site => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.site_id && (
                  <p className="text-sm text-red-500">{errors.site_id.message}</p>
                )}
              </div>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="floors">Floors *</Label>
            <Input
              id="floors"
              type="number"
              {...register("floors", { valueAsNumber: true })}
              disabled={isReadOnly}
              className={errors.floors ? 'border-red-500' : ''}
              min="1"
            />
            {errors.floors && (
              <p className="text-sm text-red-500">{errors.floors.message}</p>
            )}
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lifts">No. Of Lifts</Label>
              <Input
                id="lifts"
                type="number"
                {...register("attributes.lifts", { valueAsNumber: true })}
                disabled={isReadOnly}
                className={errors.attributes?.lifts ? 'border-red-500' : ''}
                min="0"
              />
              {errors.attributes?.lifts && (
                <p className="text-sm text-red-500">{errors.attributes.lifts.message}</p>
              )}
            </div>

            <Controller
              name="attributes.fireSafety"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox.Root
                    id="fireSafety"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isReadOnly}
                    className="
                      h-5 w-5 shrink-0 rounded border border-gray-300 
                      data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 
                      flex items-center justify-center
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                  >
                    <Checkbox.Indicator>
                      <Check className="h-4 w-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <Label
                    htmlFor="fireSafety"
                    className="text-sm leading-none cursor-pointer"
                  >
                    Fire Safety Available
                  </Label>
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
