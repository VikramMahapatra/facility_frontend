// components/LeaseForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseSchema, LeaseFormValues } from "@/schemas/lease.schema";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { leasesApiService } from "@/services/Leasing_Tenants/leasesapi";
import { Lease } from "@/interfaces/leasing_tenants_interface";

interface LeaseFormProps {
  lease?: Lease;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lease: Partial<Lease>) => void;
  mode: "create" | "edit" | "view";
}

const EMPTY: Partial<Lease> = {
  kind: "commercial",
  site_id: "",
  space_id: "",
  partner_id: "",
  tenant_id: "",
  start_date: "",
  end_date: "",
  rent_amount: undefined,
  deposit_amount: undefined,
  cam_rate: undefined,
  utilities: { electricity: undefined, water: undefined },
  status: "draft",
};

export function LeaseForm({ lease, isOpen, onClose, onSave, mode }: LeaseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue, // ✅ add this
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      kind: "commercial",
      site_id: "",
      space_id: "",
      partner_id: "",
      tenant_id: "",
      start_date: "",
      end_date: "",
      rent_amount: undefined,
      deposit_amount: undefined,
      cam_rate: undefined,
      utilities: { electricity: undefined, water: undefined },
      status: "draft",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [siteList, setSiteList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [leasePartnerList, setLeasePartnerList] = useState<any[]>([]);
  const isReadOnly = mode === "view";

  // hydrate form on open/change
  useEffect(() => {
    if (lease && mode !== "create") {
      console.log("Hydrating lease form with:", lease);
      reset({
        kind: (lease.kind as any) || "commercial",
        site_id: lease.site_id || "",
        space_id: lease.space_id || "",
        partner_id: lease.partner_id ? String(lease.partner_id) : "",
        tenant_id: lease.tenant_id ? String(lease.tenant_id) : "",
        start_date: lease.start_date || "",
        end_date: lease.end_date || "",
        rent_amount: lease.rent_amount as any,
        deposit_amount: lease.deposit_amount as any,
        cam_rate: lease.cam_rate as any,
        utilities: {
          electricity: lease.utilities?.electricity as any,
          water: lease.utilities?.water as any,
        },
        status: (lease.status as any) || "draft",
      });
    } else {
      reset({
        kind: "commercial",
        site_id: "",
        space_id: "",
        partner_id: "",
        tenant_id: "",
        start_date: "",
        end_date: "",
        rent_amount: undefined,
        deposit_amount: undefined,
        cam_rate: undefined,
        utilities: { electricity: undefined, water: undefined },
        status: "draft",
      });
    }
    loadSites();
  }, [lease, mode, reset]);

  const selectedSiteId = watch("site_id");
  const selectedKind = watch("kind");

  useEffect(() => {
    if (selectedSiteId) {
      loadSpaces(selectedSiteId);
      if (selectedKind) loadLeasePartners(selectedKind, selectedSiteId);
    } 
  }, [selectedSiteId, selectedKind]);

  useEffect(() => {
    if (lease) {
      if(lease.kind === "commercial") {      // When leasePartnerList loads, update partner_id in form
      setValue("partner_id", String(lease.partner_id));
    }
    else if(lease.kind === "residential") {
      setValue("tenant_id", String(lease.tenant_id));
    }
  }
  }, [leasePartnerList]);


  const loadSpaces = async (siteId: string) => {
    const spaces = await spacesApiService.getSpaceLookup(siteId);
    if (spaces.success) setSpaceList(spaces.data || []);
  }

  const loadSites = async () => {
    const sites = await siteApiService.getSiteLookup();
    if (sites.success) setSiteList(sites.data || []);
  }

  const loadLeasePartners = async (kind?: string, site_id?: string) => {
    if (!kind || !site_id) return;
    const partners = await leasesApiService.getLeasePartnerLookup(kind, site_id);
    if (partners?.success) setLeasePartnerList(partners.data || []);
  }

  const onSubmitForm = async (data: LeaseFormValues) => {
    const payload: Partial<Lease> = {
      id: lease?.id,
      kind: data.kind,
      site_id: data.site_id,
      space_id: data.space_id,
      partner_id: data.kind === "commercial" ? data.partner_id : undefined,
      tenant_id: data.kind === "residential" ? data.tenant_id : undefined,
      start_date: data.start_date,
      end_date: data.end_date,
      rent_amount: data.rent_amount as any,
      deposit_amount: data.deposit_amount as any,
      cam_rate: data.cam_rate as any,
      utilities: {
        electricity: data.utilities?.electricity,
        water: data.utilities?.water,
      },
      status: data.status as any,
      updated_at: new Date().toISOString(),
    };
    try {
      await onSave(payload);
    } catch (error) {
      toast.error("Failed to save lease");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Lease" : mode === "edit" ? "Edit Lease" : "Lease Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Site *</Label>
              <Controller
                name="site_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger className={errors.site_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {siteList.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.site_id && (<p className="text-sm text-red-500">{errors.site_id.message as any}</p>)}
            </div>

            <div>
              <Label>Lease Type *</Label>
              <Controller
                name="kind"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger className={errors.kind ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.kind && (<p className="text-sm text-red-500">{errors.kind.message as any}</p>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Space *</Label>
              <Controller
                name="space_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger className={errors.space_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={selectedSiteId ? "Select space" : "Select site first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {spaceList.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.space_id && (<p className="text-sm text-red-500">{errors.space_id.message as any}</p>)}
            </div>

            {/* simple text input for IDs (can replace with modal/lookup later) */}
            <div>
              <Label>{selectedKind === "commercial" ? "Partner *" : "Tenant *"}</Label>
              {selectedKind === "commercial" ? (
                <Controller
                  name="partner_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly}>
                      <SelectTrigger className={errors.partner_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select partner" />
                      </SelectTrigger>
                      <SelectContent>
                        {leasePartnerList.map((s: any) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <Controller
                  name="tenant_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly}>
                      <SelectTrigger className={errors.tenant_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {leasePartnerList.map((s: any) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {(errors.partner_id || errors.tenant_id) && (
                <p className="text-sm text-red-500">{(errors.partner_id?.message || errors.tenant_id?.message) as any}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                disabled={isReadOnly}
                {...register("start_date")}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message as any}</p>
              )}
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="date"
                disabled={isReadOnly}
                {...register("end_date")}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date.message as any}</p>
              )}
            </div>
            <div>
              <Label>Rent Amount</Label>
              <Input
                type="number"
                disabled={isReadOnly}
                {...register("rent_amount")}
                className={errors.rent_amount ? 'border-red-500' : ''}
              />
              {errors.rent_amount && (
                <p className="text-sm text-red-500">{errors.rent_amount.message as any}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Deposit Amount</Label>
              <Input
                type="number"
                disabled={isReadOnly}
                {...register("deposit_amount")}
                className={errors.deposit_amount ? 'border-red-500' : ''}
              />
              {errors.deposit_amount && (
                <p className="text-sm text-red-500">{errors.deposit_amount.message as any}</p>
              )}
            </div>
            <div>
              <Label>CAM Rate (per sq ft)</Label>
              <Input
                type="number"
                disabled={isReadOnly}
                {...register("cam_rate")}
                className={errors.cam_rate ? 'border-red-500' : ''}
              />
              {errors.cam_rate && (
                <p className="text-sm text-red-500">{errors.cam_rate.message as any}</p>
              )}
            </div>
            <div>
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Utilities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Electricity</Label>
              <Controller
                name="utilities.electricity"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submeter">Submeter</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="na">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Water</Label>
              <Controller
                name="utilities.water"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submeter">Submeter</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="na">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Lease" : "Update Lease"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
