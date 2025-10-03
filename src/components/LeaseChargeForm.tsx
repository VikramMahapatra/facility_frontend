import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { leasesApiService } from "@/services/Leasing_Tenants/leasesapi";

// ---- Types (kept minimal and local to the form, mirroring SpaceForm style) ----
export type ChargeCode =
  | "RENT"
  | "CAM"
  | "ELEC"
  | "WATER"
  | "PARK"
  | "PENALTY"
  | "MAINTENANCE";

export interface LeaseCharge {
  id: string;
  lease_id: string;
  charge_code: ChargeCode | string;
  period_start: string; // yyyy-mm-dd
  period_end: string;   // yyyy-mm-dd
  amount: number;
  tax_pct?: number;
  created_at?: string;
  updated_at?: string;
}

interface LeaseChargeFormProps {
  charge?: Partial<LeaseCharge>;
  isOpen: boolean;
  onClose: () => void;
  // Keep the same signature pattern as SpaceForm
  onSave: (leasecharge: Partial<LeaseCharge>) => void;
  mode: "create" | "edit" | "view";
}



// ---- Empty (default) form data, styled like SpaceForm's emptyFormData) ----
const emptyFormData: Partial<LeaseCharge> = {
  lease_id: "",
  charge_code: "RENT",
  period_start: "",
  period_end: "",
  amount: undefined as unknown as number,
  tax_pct: 0,
};

export function LeaseChargeForm({ charge, isOpen, onClose, onSave, mode }: LeaseChargeFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<LeaseCharge>>(emptyFormData);
  const [leaseList, setLeaseList] = useState([]);

  const isReadOnly = mode === "view";

  // hydrate form data like SpaceForm
  useEffect(() => {
    if (charge) {
      setFormData({ ...emptyFormData, ...charge });
    } else {
      setFormData(emptyFormData);
    }
    loadLeaseLookup();
    
  }, [charge, isOpen]);

  // ---- Lookups ----
  const loadLeaseLookup = async () => {
      const lookup = await leasesApiService.getLeaseLookup();
      setLeaseList(lookup);
    }

  // ---- Submit ----
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validation (single toast per SpaceForm pattern)
    if (!formData.lease_id || !formData.charge_code || !formData.period_start || !formData.period_end || formData.amount == null || Number.isNaN(Number(formData.amount))) {
      toast({
        title: "Validation Error",
        description: "Lease, Charge Code, Dates and Amount are required",
        variant: "destructive",
      });
      return;
    }

    const payload: Partial<LeaseCharge> = {
      ...charge,
      lease_id: formData.lease_id,
      charge_code: formData.charge_code,
      period_start: formData.period_start,
      period_end: formData.period_end,
      amount: Number(formData.amount),
      tax_pct: Number(formData.tax_pct || 0),
      updated_at: new Date().toISOString(),
    };

    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Lease Charge"}
            {mode === "edit" && "Edit Lease Charge"}
            {mode === "view" && "Lease Charge Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lease */}
          <div>
            <Label htmlFor="lease">Lease *</Label>
            <Select
              value={formData.lease_id || ""}
              onValueChange={(v) => setFormData((p) => ({ ...p, lease_id: v }))}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lease" />
              </SelectTrigger>
              <SelectContent>
                {leaseList.map((lease) => (
                  <SelectItem key={lease.id} value={lease.id}>
                    {lease.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Charge Code */}
          <div>
            <Label htmlFor="charge_code">Charge Code *</Label>
            <Select
              value={(formData.charge_code as string) || ""}
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
              <Label htmlFor="period_start">Period Start *</Label>
              <Input
                id="period_start"
                type="date"
                value={formData.period_start || ""}
                onChange={(e) => setFormData((p) => ({ ...p, period_start: e.target.value }))}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="period_end">Period End *</Label>
              <Input
                id="period_end"
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
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, amount: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="tax_pct">Tax %</Label>
              <Input
                id="tax_pct"
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
