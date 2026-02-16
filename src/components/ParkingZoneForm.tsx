import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parkingZoneSchema,
  ParkingZoneFormValues,
} from "@/schemas/parkingZone.schema";
import { ParkingZone } from "@/interfaces/parking_access_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { AsyncAutocompleteRQ } from "./common/async-autocomplete-rq";

interface ParkingZoneFormProps {
  zone?: ParkingZone | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: ParkingZoneFormValues = {
  name: "",
  site_id: "",
};

export function ParkingZoneForm({
  zone,
  isOpen,
  onClose,
  onSave,
  mode,
}: ParkingZoneFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ParkingZoneFormValues>({
    resolver: zodResolver(parkingZoneSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);

  const loadAll = async () => {

    const sitesResponse = await siteApiService.getSiteLookup();
    const sites = sitesResponse.success ? sitesResponse.data || [] : [];
    setSiteList(sites);

    reset(
      zone && mode !== "create"
        ? {
          name: zone.name || "",
          site_id: zone.site_id || ""
        }
        : emptyFormData
    );

    setFormLoading(false);

  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [zone, mode, isOpen, reset]);

  const onSubmitForm = async (data: ParkingZoneFormValues) => {
    await onSave({
      ...zone,
      ...data,
    });
  };

  const isReadOnly = mode === "view";

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Zone"}
            {mode === "edit" && "Edit Parking Zone"}
            {mode === "view" && "Parking Zone Details"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
          className="space-y-4"
        >
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Zone Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Underground Garage A"
                    disabled={isReadOnly}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_id">Site *</Label>
                  <AsyncAutocompleteRQ
                    value={zone?.site_id || ""}
                    onChange={(value) => {
                      zone!.site_id = value;
                    }}
                    disabled={isReadOnly}
                    placeholder="Select site"
                    queryKey={["sites"]}
                    queryFn={async (search) => {
                      const res = await siteApiService.getSiteLookup(search);
                      return res.data.map((s: any) => ({
                        id: s.id,
                        label: s.name,
                      }));
                    }}
                    fallbackOption={
                      zone?.site_id
                        ? {
                          id: zone.site_id,
                          label: zone.site_name || "Selected Site",
                        }
                        : undefined
                    }
                    minSearchLength={1}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting || formLoading}>
                    {isSubmitting
                      ? "Saving..."
                      : mode === "create"
                        ? "Create Zone"
                        : "Update Zone"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}