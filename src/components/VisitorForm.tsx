import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisitorFormValues, visitorSchema } from "@/schemas/visitor.schema";
import { toast } from "sonner";
import { Visitor } from "@/interfaces/parking_access_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { utcToLocal, localToUTC } from "@/helpers/dateHelpers";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import PhoneInput from "react-phone-input-2";
import { withFallback } from "@/helpers/commonHelper";
import { AsyncAutocompleteRQ } from "./common/async-autocomplete-rq";

interface VisitorFormProps {
  visitor?: Visitor;
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitor: Partial<Visitor>) => void;
  mode: "create" | "edit" | "view";
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
  is_expected: true,
};

export function VisitorForm({
  visitor,
  isOpen,
  onClose,
  onSave,
  mode,
}: VisitorFormProps) {
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

  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);

  const selectedSiteId = watch("site_id");
  const selectedStatus = watch("status");

  const loadAll = async () => {
    setFormLoading(true);

    // Reset form first
    reset(
      visitor && mode !== "create"
        ? {
            name: visitor.name || "",
            phone: visitor.phone || "",
            site_id: visitor.site_id || "",
            space_id: visitor.space_id || "",
            purpose: visitor.purpose || "",
            status: visitor.status || "expected",
            vehicle_no: visitor.vehicle_no || "",
            entry_time: visitor.entry_time
              ? utcToLocal(visitor.entry_time)
              : new Date().toISOString().slice(0, 16),
            exit_time: visitor.exit_time ? utcToLocal(visitor.exit_time) : "",
            is_expected:
              visitor.is_expected !== undefined ? visitor.is_expected : true,
          }
        : emptyFormData
    );

    setFormLoading(false);

    // Load lookups in the background
    const sitesResponse = await siteApiService.getSiteLookup();
    const sites = sitesResponse.success ? sitesResponse.data || [] : [];
    setSiteList(sites);

    // For edit/view mode, load spaces based on visitor's site
    if (visitor && mode !== "create" && visitor.site_id) {
      loadSpaceLookup(visitor.site_id);
    } else {
      setSpaceList([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [visitor, mode, isOpen, reset]);

  useEffect(() => {
    if (selectedSiteId) {
      loadSpaceLookup(selectedSiteId);
    } else {
      setSpaceList([]);
      setValue("space_id", "");
    }
  }, [selectedSiteId, setValue]);

  const loadSpaceLookup = async (siteId?: string) => {
    const targetSiteId = siteId || selectedSiteId;
    if (!targetSiteId) return;
    const lookup = await spacesApiService.getSpaceWithBuildingLookup(
      targetSiteId
    );
    if (lookup.success) setSpaceList(lookup.data || []);
  };

  const onSubmitForm = async (data: VisitorFormValues) => {
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
      is_expected: data.is_expected,
    };

    await onSave(visitorData);
  };

  const isReadOnly = mode === "view";

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };

  const fallbackSite = visitor?.site_id
    ? {
        id: visitor.site_id,
        name: (visitor as any).site_name || `Site (${visitor.site_id.slice(0, 6)})`,
      }
    : null;

  const fallbackSpace = visitor?.space_id
    ? {
        id: visitor.space_id,
        name: (visitor as any).space_name || `Space (${visitor.space_id.slice(0, 6)})`,
      }
    : null;

  const spaces = withFallback(spaceList, fallbackSpace);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Visitor"}
            {mode === "edit" && "Edit Visitor"}
            {mode === "view" && "Visitor Details"}
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Visitor's full name"
                    disabled={isReadOnly}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <PhoneInput
                        country={"in"}
                        value={field.value || ""}
                        onChange={(value) => {
                          const digits = value.replace(/\D/g, "");
                          const finalValue = digits ? "+" + digits : "";
                          field.onChange(finalValue);
                        }}
                        disabled={isReadOnly}
                        inputProps={{
                          name: "phone",
                          required: true,
                          id: "phone",
                        }}
                        containerClass="w-full relative"
                        inputClass={`!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm ${
                          errors.phone ? "!border-red-500" : ""
                        }`}
                        buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                        dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                        enableSearch={true}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">
                          {errors.phone.message}
                        </p>
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
                    <AsyncAutocompleteRQ
                      value={field.value || ""}
                      onChange={(value) => {
                        field.onChange(value);
                        setValue("space_id", "");
                      }}
                      disabled={isReadOnly}
                      placeholder="Select site"
                      queryKey={["visitor-sites"]}
                      queryFn={async (search) => {
                        const res = await siteApiService.getSiteLookup(search);
                        if (res.success) {
                          return res.data.map((s: any) => ({
                            id: s.id,
                            label: s.name,
                          }));
                        }
                        return [];
                      }}
                      fallbackOption={
                        visitor?.site_id
                          ? {
                              id: visitor.site_id,
                              label:
                                (visitor as any).site_name,
                            }
                          : undefined
                      }
                      minSearchLength={1}
                    />
                    {errors.site_id && (
                      <p className="text-sm text-red-500">
                        {errors.site_id.message}
                      </p>
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
                      <SelectTrigger
                        className={errors.space_id ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select visiting place" />
                      </SelectTrigger>
                      <SelectContent>
                        {spaces.map((space) => (
                          <SelectItem key={space.id} value={space.id}>
                            {space.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.space_id && (
                      <p className="text-sm text-red-500">
                        {errors.space_id.message}
                      </p>
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
                          <SelectItem value="checked_out">
                            Checked Out
                          </SelectItem>
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
                {selectedStatus === "checked_out" && (
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
                      ? "Create Visitor"
                      : "Update Visitor"}
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