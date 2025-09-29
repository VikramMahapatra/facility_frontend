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
import { useToast } from "@/hooks/use-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";

export interface LeaseFormModel {
  id?: string;
  org_id?: string;
  site_id?: string;
  space_id?: string;

  kind?: "commercial" | "residential";
  partner_id?: string; // when kind = commercial
  tenant_id?: string;  // when kind = residential

  start_date?: string;
  end_date?: string;
  rent_amount?: number;
  deposit_amount?: number;
  cam_rate?: number;
  utilities?: { electricity?: string; water?: string };
  status?: "active" | "expired" | "terminated" | "draft";
  created_at?: string;
  updated_at?: string;
}

interface LeaseFormProps {
  lease?: LeaseFormModel;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lease: Partial<LeaseFormModel>) => void;
  mode: "create" | "edit" | "view";
}

const EMPTY: Partial<LeaseFormModel> = {
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
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<LeaseFormModel>>(EMPTY);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const isReadOnly = mode === "view";

  // hydrate form on open/change
  useEffect(() => {
    setFormData(
      lease
        ? {
            ...EMPTY,
            ...lease,
            utilities: {
              electricity: lease?.utilities?.electricity,
              water: lease?.utilities?.water,
            },
          }
        : EMPTY
    );
  }, [lease, isOpen]);

  // load sites once
  useEffect(() => {
    (async () => {
      try {
        const lookup = await siteApiService.getSiteLookup();
        setSiteList(lookup || []);
      } catch {
        setSiteList([]);
      }
    })();
  }, []);

  // load spaces whenever site changes
  useEffect(() => {
    (async () => {
      if (!formData.site_id) {
        setSpaceList([]);
        return;
      }
      try {
        const spaces = await spacesApiService.getSpaceLookup(formData.site_id);
        setSpaceList(spaces || []);
      } catch {
        setSpaceList([]);
      }
    })();
  }, [formData.site_id]);

  // when kind changes, clear the unrelated id field to avoid accidental submit
  useEffect(() => {
    if (formData.kind === "commercial") {
      setFormData(prev => ({ ...prev, tenant_id: "" }));
    } else if (formData.kind === "residential") {
      setFormData(prev => ({ ...prev, partner_id: "" }));
    }
  }, [formData.kind]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kind) {
      toast({ title: "Validation Error", description: "Lease Type is required", variant: "destructive" });
      return;
    }
    if (!formData.site_id || !formData.space_id || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Site, Space, Start Date and End Date are required",
        variant: "destructive",
      });
      return;
    }
    if (formData.kind === "commercial" && !formData.partner_id) {
      toast({
        title: "Validation Error",
        description: "Partner ID is required for commercial lease",
        variant: "destructive",
      });
      return;
    }
    if (formData.kind === "residential" && !formData.tenant_id) {
      toast({
        title: "Validation Error",
        description: "Tenant ID is required for residential lease",
        variant: "destructive",
      });
      return;
    }

    const payload: Partial<LeaseFormModel> = {
      id: lease?.id,
      kind: formData.kind,
      site_id: formData.site_id,
      space_id: formData.space_id,
      partner_id: formData.kind === "commercial" ? formData.partner_id : undefined,
      tenant_id: formData.kind === "residential" ? formData.tenant_id : undefined,
      start_date: formData.start_date,
      end_date: formData.end_date,
      rent_amount: formData.rent_amount,
      deposit_amount: formData.deposit_amount,
      cam_rate: formData.cam_rate,
      utilities: {
        electricity: formData.utilities?.electricity,
        water: formData.utilities?.water,
      },
      status: formData.status,
      updated_at: new Date().toISOString(),
    };

    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Lease" : mode === "edit" ? "Edit Lease" : "Lease Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Site *</Label>
              <Select
                value={formData.site_id}
                onValueChange={(v) => setFormData({ ...formData, site_id: v })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
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
            </div>

            <div>
              <Label>Lease Type *</Label>
              <Select
                value={formData.kind}
                onValueChange={(v) => setFormData({ ...formData, kind: v as any })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Space *</Label>
              <Select
                value={formData.space_id}
                onValueChange={(v) => setFormData({ ...formData, space_id: v })}
                disabled={isReadOnly || !formData.site_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.site_id ? "Select space" : "Select site first"} />
                </SelectTrigger>
                <SelectContent>
                  {spaceList.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name || s.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* simple text input for IDs (can replace with modal/lookup later) */}
            <div>
              <Label>{formData.kind === "commercial" ? "Partner ID *" : "Tenant ID *"}</Label>
              <Input
                placeholder={formData.kind === "commercial" ? "Partner ID" : "Tenant ID"}
                value={(formData.kind === "commercial" ? formData.partner_id : formData.tenant_id) || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ...(formData.kind === "commercial"
                      ? { partner_id: e.target.value }
                      : { tenant_id: e.target.value }),
                  })
                }
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>Rent Amount</Label>
              <Input
                type="number"
                value={formData.rent_amount ?? ""}
                onChange={(e) => setFormData({ ...formData, rent_amount: Number(e.target.value) })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Deposit Amount</Label>
              <Input
                type="number"
                value={formData.deposit_amount ?? ""}
                onChange={(e) => setFormData({ ...formData, deposit_amount: Number(e.target.value) })}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>CAM Rate (per sq ft)</Label>
              <Input
                type="number"
                value={formData.cam_rate ?? ""}
                onChange={(e) => setFormData({ ...formData, cam_rate: Number(e.target.value) })}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                disabled={isReadOnly}
              >
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
            </div>
          </div>

          {/* Utilities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Electricity</Label>
              <Select
                value={formData.utilities?.electricity || ""}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, utilities: { ...prev.utilities, electricity: v } }))
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submeter">Submeter</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Water</Label>
              <Select
                value={formData.utilities?.water || ""}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, utilities: { ...prev.utilities, water: v } }))
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submeter">Submeter</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit">{mode === "create" ? "Create Lease" : "Update Lease"}</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
