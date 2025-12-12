import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { leaseChargeApiService } from "@/services/leasing_tenants/leasechargeapi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leaseChargeSchema,
  LeaseChargeFormValues,
} from "@/schemas/leaseCharge.schema";


export interface LeaseCharge {
  id: string;
  lease_id: string;
  charge_code:  string;
  period_start: string; // yyyy-mm-dd
  period_end: string; // yyyy-mm-dd
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
  charge_code: "",
  period_start: "",
  period_end: "",
  amount: undefined as unknown as number,
  tax_pct: 0,
};

export function LeaseChargeForm({
  charge,
  isOpen,
  onClose,
  onSave,
  mode,
}: LeaseChargeFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LeaseChargeFormValues>({
    resolver: zodResolver(leaseChargeSchema),
    defaultValues: {
      lease_id: "",
      charge_code: "",
      period_start: "",
      period_end: "",
      amount: undefined as any,
      tax_pct: 0 as any,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const [leaseList, setLeaseList] = useState([]);
  const [chargeCodeList, setChargeCodeList] = useState([]);
  const [formLoading, setFormLoading] = useState(true);

  const periodStart = watch("period_start");
  const periodEnd = watch("period_end");

  const isReadOnly = mode === "view";

  // Trigger validation when either date changes
  useEffect(() => {
    if (periodStart && periodEnd) {
      // Only trigger validation when both dates are filled
      setTimeout(() => {
        trigger("period_end");
      }, 0);
    }
  }, [periodStart, periodEnd, trigger]);

 
  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [charge, isOpen, mode, reset]);

  const loadAll = async () => {
    setFormLoading(true);

    await Promise.all([loadLeaseLookup(), loadLeaseChargeLookup()]);

    if (charge && mode !== "create") {
      reset({
        lease_id: (charge.lease_id as any) || "",
        charge_code: (charge.charge_code as any) || "",
        period_start: charge.period_start || "",
        period_end: charge.period_end || "",
        amount: charge.amount as any,
        tax_pct: (charge.tax_pct as any) ?? 0,
      });
    } else {
      reset({
        lease_id: "",
        charge_code: "",
        period_start: "",
        period_end: "",
        amount: undefined as any,
        tax_pct: 0 as any,
      });
    }

    setFormLoading(false);
  };

  const loadLeaseLookup = async () => {
    const lookup = await leasesApiService.getLeaseLookup();
    if (lookup.success) setLeaseList(lookup.data || []);
  };

  const loadLeaseChargeLookup = async () => {
    const lookup = await leaseChargeApiService.getLeaseChargeLookup();
    if (lookup.success) setChargeCodeList(lookup.data || []);
  };

  const onSubmitForm = async (data: LeaseChargeFormValues) => {
    const formResponse = await onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Lease Charge"}
            {mode === "edit" && "Edit Lease Charge"}
            {mode === "view" && "Lease Charge Details"}
          </DialogTitle>
        </DialogHeader>

        {formLoading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
        <form
          onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
          className="space-y-4"
        >
          {/* Lease */}
          <div>
            <Label htmlFor="lease">Lease *</Label>
            <Controller
              name="lease_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className={errors.lease_id ? "border-red-500" : ""}
                  >
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
            {errors.lease_id && (
              <p className="text-sm text-red-500">
                {errors.lease_id.message as any}
              </p>
            )}
          </div>

          {/* Charge Code */}
          <div>
            <Label htmlFor="charge_code">Charge Code *</Label>
            <Controller
              name="charge_code"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isReadOnly}
                >
                  <SelectTrigger
                    className={errors.charge_code ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {chargeCodeList.map((code: any) => (
                      <SelectItem key={code.id} value={code.id}>
                        {code.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.charge_code && (
              <p className="text-sm text-red-500">
                {errors.charge_code.message as any}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Period Start *</Label>
              <Input
                type="date"
                disabled={isReadOnly}
                {...register("period_start", {
                  onBlur: () => {
                    if (periodEnd) trigger("period_end");
                  }
                })}
                className={errors.period_start ? "border-red-500" : ""}
              />
              {errors.period_start && (
                <p className="text-sm text-red-500">
                  {errors.period_start.message as any}
                </p>
              )}
            </div>
            <div>
              <Label>Period End *</Label>
              <Input
                type="date"
                disabled={isReadOnly}
                {...register("period_end", {
                  onBlur: () => {
                    if (periodStart) trigger("period_end");
                  }
                })}
                className={errors.period_end ? "border-red-500" : ""}
              />
              {errors.period_end && (
                <p className="text-sm text-red-500">
                  {errors.period_end.message as any}
                </p>
              )}
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
                {...register("amount", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                disabled={isReadOnly}
                className={errors.amount ? "border-red-500" : ""}
                min="0"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">
                  {errors.amount.message as any}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="tax_pct">Tax %</Label>
              <Input
                id="tax_pct"
                type="number"
                step="any"
                {...register("tax_pct", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                disabled={isReadOnly}
                className={errors.tax_pct ? "border-red-500" : ""}
                min="0"
              />
              {errors.tax_pct && (
                <p className="text-sm text-red-500">
                  {errors.tax_pct.message as any}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Charge"
                  : "Update Charge"}
              </Button>
            )}
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
