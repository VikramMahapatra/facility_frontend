import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { leasesApiService } from "@/services/Leasing_Tenants/leasesapi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseChargeSchema, LeaseChargeFormValues } from "@/schemas/leaseCharge.schema";

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
  onSave: (leasecharge: any) => Promise<any>;
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
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LeaseChargeFormValues>({ 
    resolver: zodResolver(leaseChargeSchema),
    defaultValues: {
      lease_id: "",
      charge_code: "RENT",
      period_start: "",
      period_end: "",
      amount: undefined as any,
      tax_pct: 0 as any,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [leaseList, setLeaseList] = useState([]);

  const isReadOnly = mode === "view";

  // hydrate form data like SpaceForm
  useEffect(() => {
    if (charge && mode !== "create") {
      reset({
        lease_id: (charge.lease_id as any) || "",
        charge_code: (charge.charge_code as any) || "RENT",
        period_start: charge.period_start || "",
        period_end: charge.period_end || "",
        amount: charge.amount as any,
        tax_pct: (charge.tax_pct as any) ?? 0,
      });
    } else {
      reset({
        lease_id: "",
        charge_code: "RENT",
        period_start: "",
        period_end: "",
        amount: undefined as any,
        tax_pct: 0 as any,
      });
    }
    loadLeaseLookup();
  }, [charge, isOpen, mode, reset]);

  const loadLeaseLookup = async () => {
    const lookup = await leasesApiService.getLeaseLookup();
    if (lookup.success) setLeaseList(lookup.data || []);
  }

  const onSubmitForm = async (data: LeaseChargeFormValues) => {
    const formResponse = await onSave(data);
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

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Lease */}
          <div>
            <Label htmlFor="lease">Lease *</Label>
            <Controller
              name="lease_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                  <SelectTrigger className={errors.lease_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select lease" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaseList.map((lease: any) => (
                      <SelectItem key={lease.id} value={lease.id}>
                        {lease.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.lease_id && (<p className="text-sm text-red-500">{errors.lease_id.message as any}</p>)}
          </div>

          {/* Charge Code */}
          <div>
            <Label htmlFor="charge_code">Charge Code *</Label>
            <Controller
              name="charge_code"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                  <SelectTrigger className={errors.charge_code ? 'border-red-500' : ''}>
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
              )}
            />
            {errors.charge_code && (<p className="text-sm text-red-500">{errors.charge_code.message as any}</p>)}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period_start">Period Start *</Label>
              <Input
                id="period_start"
                type="date"
                {...register("period_start")}
                disabled={isReadOnly}
                className={errors.period_start ? 'border-red-500' : ''}
              />
              {errors.period_start && (<p className="text-sm text-red-500">{errors.period_start.message as any}</p>)}
            </div>
            <div>
              <Label htmlFor="period_end">Period End *</Label>
              <Input
                id="period_end"
                type="date"
                {...register("period_end")}
                disabled={isReadOnly}
                className={errors.period_end ? 'border-red-500' : ''}
              />
              {errors.period_end && (<p className="text-sm text-red-500">{errors.period_end.message as any}</p>)}
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                {...register("amount", { setValueAs: (v) => v === '' ? undefined : Number(v) })}
                disabled={isReadOnly}
                className={errors.amount ? 'border-red-500' : ''}
                min="0"
              />
              {errors.amount && (<p className="text-sm text-red-500">{errors.amount.message as any}</p>)}
            </div>
            <div>
              <Label htmlFor="tax_pct">Tax %</Label>
              <Input
                id="tax_pct"
                type="number"
                step="any"
                {...register("tax_pct", { setValueAs: (v) => v === '' ? undefined : Number(v) })}
                disabled={isReadOnly}
                className={errors.tax_pct ? 'border-red-500' : ''}
                min="0"
              />
              {errors.tax_pct && (<p className="text-sm text-red-500">{errors.tax_pct.message as any}</p>)}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Charge" : "Update Charge"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
