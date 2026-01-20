import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  slaPolicySchema,
  SLAPolicyFormValues,
} from "@/schemas/sla_policy.schema";
import { SLAPolicy } from "@/interfaces/sla_policy_interface";
import { slaPoliciesApiService } from "@/services/ticketing_service/slapoliciesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { withFallback } from "@/helpers/commonHelper";
import { AsyncAutocompleteRQ } from "./common/async-autocomplete-rq";
interface SLAPolicyFormProps {
  policy?: SLAPolicy | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (policy: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: SLAPolicyFormValues = {
  service_category: "",
  site_name: "",
  default_contact: "",
  escalation_contact: "",
  response_time_mins: 0,
  resolution_time_mins: 0,
  escalation_time_mins: 0,
  reopen_time_mins: 0,
  active: true,
};

export function SLAPolicyForm({
  policy,
  isOpen,
  onClose,
  onSave,
  mode,
}: SLAPolicyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,

    formState: { errors, isSubmitting },
  } = useForm<SLAPolicyFormValues>({
    resolver: zodResolver(slaPolicySchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [defaultContactList, setDefaultContactList] = useState<any[]>([]);
  const [escalationContactList, setEscalationContactList] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  const selectedSiteName = watch("site_name");

  const loadAll = async () => {
    setFormLoading(true);

    // Clear contact lists when opening form in create mode
    if (mode === "create") {
      setDefaultContactList([]);
      setEscalationContactList([]);
    }

    reset(
      policy && mode !== "create"
        ? {
            service_category: policy.service_category || "",
            site_name: policy.site_name || "",
            default_contact: policy.default_contact
              ? String(policy.default_contact)
              : "",
            escalation_contact: policy.escalation_contact
              ? String(policy.escalation_contact)
              : "",
            response_time_mins: policy.response_time_mins || 0,
            resolution_time_mins: policy.resolution_time_mins || 0,
            escalation_time_mins: policy.escalation_time_mins || 0,
            reopen_time_mins: (policy as any).reopen_time_mins || 0,
            active: policy.active ?? true,
          }
        : emptyFormData
    );

    setFormLoading(false);

    // Load sites for fallback and site lookup
    const sitesResponse = await siteApiService.getSiteLookup();
    const sites = sitesResponse.success ? sitesResponse.data || [] : [];
    setSiteList(sites);

    // Set selectedSiteId if editing
    if (policy && mode !== "create" && policy.site_name) {
      const site = sites.find((s: any) => s.name === policy.site_name);
      if (site) {
        setSelectedSiteId(site.id);
        await Promise.all([
          loadDefaultContactLookup(site.id),
          loadEscalationContactLookup(site.id),
        ]);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [policy, mode, isOpen, reset]);

  useEffect(() => {
    if (!selectedSiteId) {
      setDefaultContactList([]);
      setEscalationContactList([]);
      return;
    }

    loadDefaultContactLookup(selectedSiteId);
    loadEscalationContactLookup(selectedSiteId);
  }, [selectedSiteId]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const loadDefaultContactLookup = async (siteId: string) => {
    const lookup = await slaPoliciesApiService.getUserContactLookup(siteId);
    if (lookup.success) setDefaultContactList(lookup.data || []);
  };

  const loadEscalationContactLookup = async (siteId: string) => {
    const lookup = await slaPoliciesApiService.getUserContactLookup(siteId);
    if (lookup.success) setEscalationContactList(lookup.data || []);
  };

  const onSubmitForm = async (data: SLAPolicyFormValues) => {
    // Find site by ID (from AsyncAutocompleteRQ) or by name (fallback)
    const selectedSite = selectedSiteId
      ? siteList.find((site) => site.id === selectedSiteId)
      : siteList.find((site) => site.name === data.site_name);

    await onSave({
      ...policy,
      ...data,
      site_name: selectedSite?.name || data.site_name,
      site_id: selectedSite?.id || undefined,
    });
  };

  const isReadOnly = mode === "view";

  // Create fallback options for fields that might not be in lookup lists

  const fallbackDefaultContact = policy?.default_contact
    ? {
        id: String(policy.default_contact),
        name:
          (policy as any).default_contact_name ||
          (policy as any).default_contact_email ||
          `User ${String(policy.default_contact).slice(0, 6)}`,
        email: (policy as any).default_contact_email,
      }
    : null;

  const fallbackEscalationContact = policy?.escalation_contact
    ? {
        id: String(policy.escalation_contact),
        name:
          (policy as any).escalation_contact_name ||
          (policy as any).escalation_contact_email ||
          `User ${String(policy.escalation_contact).slice(0, 6)}`,
        email: (policy as any).escalation_contact_email,
      }
    : null;

  const defaultContacts = withFallback(
    defaultContactList,
    fallbackDefaultContact
  );
  const escalationContacts = withFallback(
    escalationContactList,
    fallbackEscalationContact
  );

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Policy"}
            {mode === "edit" && "Edit SLA Policy"}
            {mode === "view" && "SLA Policy Details"}
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
                  <Label htmlFor="site_name">Site Name *</Label>
                  <Controller
                    name="site_name"
                    control={control}
                    render={({ field }) => (
                      <AsyncAutocompleteRQ
                        value={selectedSiteId || ""}
                        onChange={(value) => {
                          setSelectedSiteId(value);
                          // Find site by ID and set the name in the form
                          const selectedSite = siteList.find(
                            (site) => site.id === value
                          );
                          if (selectedSite) {
                            field.onChange(selectedSite.name);
                          } else {
                            field.onChange("");
                          }
                        }}
                        placeholder="Select site"
                        disabled={isReadOnly}
                        queryKey={["sites"]}
                        queryFn={async (search) => {
                          const res = await siteApiService.getSiteLookup(
                            search
                          );
                          return res.data.map((s: any) => ({
                            id: s.id,
                            label: s.name,
                          }));
                        }}
                        fallbackOption={
                          policy?.site_id || policy?.site_name
                            ? {
                                id: policy.site_id || "",
                                label:
                                  policy.site_name ||
                                  `Site (${policy.site_id?.slice(0, 6)})`,
                              }
                            : undefined
                        }
                        minSearchLength={1}
                      />
                    )}
                  />
                  {errors.site_name && (
                    <p className="text-sm text-red-500">
                      {errors.site_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_category">Service Category *</Label>
                  <Input
                    id="service_category"
                    {...register("service_category")}
                    placeholder="Enter service category"
                    disabled={isReadOnly}
                    className={errors.service_category ? "border-red-500" : ""}
                  />
                  {errors.service_category && (
                    <p className="text-sm text-red-500">
                      {errors.service_category.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Default Contact and Escalation Contact Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_contact">Default Contact *</Label>
                  <Controller
                    name="default_contact"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly || !selectedSiteName}
                      >
                        <SelectTrigger
                          className={
                            errors.default_contact ? "border-red-500" : ""
                          }
                        >
                          <SelectValue
                            placeholder={
                              !selectedSiteName
                                ? "Select site first"
                                : "Select default contact"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultContacts.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No contacts available
                            </SelectItem>
                          ) : (
                            defaultContacts.map((contact) => (
                              <SelectItem
                                key={contact.id}
                                value={String(contact.id)}
                              >
                                {contact.name ||
                                  contact.email ||
                                  `User ${contact.id}`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.default_contact && (
                    <p className="text-sm text-red-500">
                      {errors.default_contact.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="escalation_contact">
                    Escalation Contact *
                  </Label>
                  <Controller
                    name="escalation_contact"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly || !selectedSiteName}
                      >
                        <SelectTrigger
                          className={
                            errors.escalation_contact ? "border-red-500" : ""
                          }
                        >
                          <SelectValue
                            placeholder={
                              !selectedSiteName
                                ? "Select site first"
                                : "Select escalation contact"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {escalationContacts.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No contacts available
                            </SelectItem>
                          ) : (
                            escalationContacts.map((contact) => (
                              <SelectItem
                                key={contact.id}
                                value={String(contact.id)}
                              >
                                {contact.name ||
                                  contact.email ||
                                  `User ${contact.id}`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.escalation_contact && (
                    <p className="text-sm text-red-500">
                      {errors.escalation_contact.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resolution_time_mins">
                      Resolution Time (Minutes) *
                    </Label>
                    <Input
                      id="resolution_time_mins"
                      type="number"
                      {...register("resolution_time_mins", {
                        valueAsNumber: true,
                      })}
                      min="1"
                      placeholder="e.g., 240"
                      disabled={isReadOnly}
                      className={
                        errors.resolution_time_mins ? "border-red-500" : ""
                      }
                    />
                    {errors.resolution_time_mins && (
                      <p className="text-sm text-red-500">
                        {errors.resolution_time_mins.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reopen_time_mins">
                      Reopen Time (Minutes) *
                    </Label>
                    <Input
                      id="reopen_time_mins"
                      type="number"
                      {...register("reopen_time_mins", { valueAsNumber: true })}
                      min="1"
                      placeholder="e.g., 120"
                      disabled={isReadOnly}
                      className={
                        errors.reopen_time_mins ? "border-red-500" : ""
                      }
                    />
                    {errors.reopen_time_mins && (
                      <p className="text-sm text-red-500">
                        {errors.reopen_time_mins.message}
                      </p>
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
                    <Label htmlFor="response_time_mins">
                      Response Time (Minutes) *
                    </Label>
                    <Input
                      id="response_time_mins"
                      type="number"
                      {...register("response_time_mins", {
                        valueAsNumber: true,
                      })}
                      min="1"
                      placeholder="e.g., 60"
                      disabled={isReadOnly}
                      className={
                        errors.response_time_mins ? "border-red-500" : ""
                      }
                    />
                    {errors.response_time_mins && (
                      <p className="text-sm text-red-500">
                        {errors.response_time_mins.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escalation_time_mins">
                      Escalation Time (Minutes) *
                    </Label>
                    <Input
                      id="escalation_time_mins"
                      type="number"
                      {...register("escalation_time_mins", {
                        valueAsNumber: true,
                      })}
                      min="1"
                      placeholder="e.g., 300"
                      disabled={isReadOnly}
                      className={
                        errors.escalation_time_mins ? "border-red-500" : ""
                      }
                    />
                    {errors.escalation_time_mins && (
                      <p className="text-sm text-red-500">
                        {errors.escalation_time_mins.message}
                      </p>
                    )}
                  </div>
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
                      ? "Create Policy"
                      : "Update Policy"}
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
