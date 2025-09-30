// components/LeaseChargeForm.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { leaseChargeApiService } from "@/services/Leasing_Tenants/leasechargeapi";
import { leasesApiService } from "@/services/Leasing_Tenants/leasesapi";

type ChargeCode = "RENT" | "CAM" | "ELEC" | "WATER" | "PARK" | "PENALTY" | "MAINTENANCE";

export interface LeaseChargeFormModel {
  id?: string;
  lease_id?: string;
  charge_code?: ChargeCode | string;
  period_start?: string; // yyyy-mm-dd
  period_end?: string;   // yyyy-mm-dd
  amount?: number;
  tax_pct?: number;
}

interface LeaseChargeFormProps {
  charge?: LeaseChargeFormModel;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void; // tell parent to refresh list
  mode: "create" | "edit" | "view";
}

const EMPTY: LeaseChargeFormModel = {
  lease_id: "",
  charge_code: "RENT",
  period_start: "",
  period_end: "",
  amount: undefined,
  tax_pct: 0,
};

export function LeaseChargeForm({ charge, isOpen, onClose, onSaved, mode }: LeaseChargeFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<LeaseChargeFormModel>(EMPTY);
  const [leaseOptions, setLeaseOptions] = useState<Array<{ id: string; label: string }>>([]);
  const isReadOnly = mode === "view";

  // hydrate form when opening
  useEffect(() => {
    setFormData(charge ? { ...EMPTY, ...charge } : EMPTY);
  }, [charge, isOpen]);

  // load leases for dropdown (simple: first page big limit)
  useEffect(() => {
    (async () => {
      try {
        const res = await leasesApiService.getLeases(`/leases?skip=0&limit=500`);
        const opts = (res.leases || []).map((l: any) => ({
          id: l.id,
          // choose a friendly label; adjust if you have better fields
          label:
            (l.kind === "commercial" ? (l.partner_id || "Commercial") : (l.tenant_id || "Residential")) +
            (l.space_code ? ` • ${l.space_code}` : "") +
            (l.site_name ? ` • ${l.site_name}` : ""),
        }));
        setLeaseOptions(opts);
      } catch {
        setLeaseOptions([]);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // basic validation
    if (!formData.lease_id) {
      toast({ title: "Validation Error", description: "Lease is required", variant: "destructive" });
      return;
    }
    if (!formData.charge_code) {
      toast({ title: "Validation Error", description: "Charge code is required", variant: "destructive" });
      return;
    }
    if (!formData.period_start || !formData.period_end) {
      toast({ title: "Validation Error", description: "Start & End dates are required", variant: "destructive" });
      return;
    }
    if (formData.amount == null || Number.isNaN(formData.amount)) {
      toast({ title: "Validation Error", description: "Amount is required", variant: "destructive" });
      return;
    }

    try {
      if (mode === "create") {
        await leaseChargeApiService.create({
          lease_id: formData.lease_id,
          charge_code: formData.charge_code,
          period_start: formData.period_start,
          period_end: formData.period_end,
          amount: Number(formData.amount),
          tax_pct: Number(formData.tax_pct || 0),
        });
        toast({ title: "Charge created" });
      } else if (mode === "edit" && formData.id) {
        await leaseChargeApiService.update(formData.id, {
          lease_id: formData.lease_id,
          charge_code: formData.charge_code,
          period_start: formData.period_start,
          period_end: formData.period_end,
          amount: Number(formData.amount),
          tax_pct: Number(formData.tax_pct || 0),
        });
        toast({ title: "Charge updated" });
      }
      onClose();
      onSaved(); // tell parent to reload
    } catch (err: any) {
      toast({ title: err?.message || "Technical Error!", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Lease Charge" : mode === "edit" ? "Edit Lease Charge" : "Lease Charge Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lease */}
          <div>
            <Label>Lease *</Label>
            <Select
              value={formData.lease_id || ""}
              onValueChange={(v) => setFormData((p) => ({ ...p, lease_id: v }))}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lease" />
              </SelectTrigger>
              <SelectContent>
                {leaseOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Charge Code */}
          <div>
            <Label>Charge Code *</Label>
            <Select
              value={formData.charge_code || ""}
              onValueChange={(v) => setFormData((p) => ({ ...p, charge_code: v as ChargeCode }))}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RENT">RENT</SelectItem>
                <SelectItem value="CAM">CAM</SelectItem>
                <SelectItem value="ELEC">ELEC</SelectItem>
                <SelectItem value="WATER">WATER</SelectItem>
                <SelectItem value="PARK">PARK</SelectItem>
                <SelectItem value="PENALTY">PENALTY</SelectItem>
                <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Period Start *</Label>
              <Input
                type="date"
                value={formData.period_start || ""}
                onChange={(e) => setFormData((p) => ({ ...p, period_start: e.target.value }))}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>Period End *</Label>
              <Input
                type="date"
                value={formData.period_end || ""}
                onChange={(e) => setFormData((p) => ({ ...p, period_end: e.target.value }))}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                value={formData.amount ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, amount: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>Tax %</Label>
              <Input
                type="number"
                value={formData.tax_pct ?? 0}
                onChange={(e) => setFormData((p) => ({ ...p, tax_pct: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit">{mode === "create" ? "Create Charge" : "Update Charge"}</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
