import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  meterReadingSchema,
  MeterReadingFormValues,
} from "@/schemas/meterReading.schema";
import { MeterReading } from "@/interfaces/energy_iot_interface";
import { meterReadingApiService } from "@/services/energy_iot/meterreadingsapi";
import { utcToLocal } from "@/helpers/dateHelpers";

interface MeterReadingFormProps {
  meterReading?: MeterReading | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meterReading: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: MeterReadingFormValues = {
  meter_id: "",
  ts: new Date().toISOString().slice(0, 16),
  reading: 0,
  delta: undefined,
  source: "manual",
  metadata: undefined,
};

// Hardcoded dropdown options
const readingSources = [
  { id: "manual", name: "Manual" },
  { id: "iot", name: "IoT" },
];

export function MeterReadingForm({
  meterReading,
  isOpen,
  onClose,
  onSave,
  mode,
}: MeterReadingFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeterReadingFormValues>({
    resolver: zodResolver(meterReadingSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [meterList, setMeterList] = useState<any[]>([]);

  const loadAll = async () => {
    setFormLoading(true);

    const metersResponse = await meterReadingApiService.getMeterReadingLookup();
    const meters = metersResponse?.success ? metersResponse.data || [] : [];
    setMeterList(meters);

    reset(
      meterReading && mode !== "create"
        ? {
            meter_id: meterReading.meter_id || "",
            ts: meterReading.ts
              ? utcToLocal(meterReading.ts)
              : new Date().toISOString().slice(0, 16),
            reading: meterReading.reading || 0,
            delta: meterReading.delta,
            source: meterReading.source || "manual",
            metadata: meterReading.metadata,
          }
        : emptyFormData
    );

    setFormLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [meterReading, mode, isOpen, reset]);

  const onSubmitForm = async (data: MeterReadingFormValues) => {
    await onSave({
      ...meterReading,
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
            {mode === "create" && "Create New Meter Reading"}
            {mode === "edit" && "Edit Meter Reading"}
            {mode === "view" && "Meter Reading Details"}
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
                  <Label htmlFor="meter_id">Meter *</Label>
                  <Controller
                    name="meter_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.meter_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select meter" />
                        </SelectTrigger>
                        <SelectContent>
                          {meterList.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No meters available
                            </SelectItem>
                          ) : (
                            meterList.map((meter) => (
                              <SelectItem key={meter.id} value={meter.id}>
                                {meter.name ||
                                  meter.code ||
                                  `Meter ${meter.id}`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.meter_id && (
                    <p className="text-sm text-red-500">
                      {errors.meter_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>
                  <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={errors.source ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {readingSources.map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.source && (
                    <p className="text-sm text-red-500">
                      {errors.source.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ts">Timestamp *</Label>
                  <Controller
                    name="ts"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="ts"
                        type="datetime-local"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isReadOnly}
                        className={errors.ts ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.ts && (
                    <p className="text-sm text-red-500">{errors.ts.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reading">Reading Value *</Label>
                  <Input
                    id="reading"
                    type="number"
                    step="0.000001"
                    min="0"
                    {...register("reading", { valueAsNumber: true })}
                    placeholder="0.000000"
                    disabled={isReadOnly}
                    className={errors.reading ? "border-red-500" : ""}
                  />
                  {errors.reading && (
                    <p className="text-sm text-red-500">
                      {errors.reading.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delta">Delta</Label>
                  <Input
                    id="delta"
                    type="number"
                    step="0.000001"
                    {...register("delta", { valueAsNumber: true })}
                    placeholder="Auto-calculated if not provided"
                    disabled={isReadOnly}
                    className={errors.delta ? "border-red-500" : ""}
                  />
                  <p className="text-sm text-muted-foreground">
                    Difference from previous reading (auto-calculated if not
                    provided)
                  </p>
                  {errors.delta && (
                    <p className="text-sm text-red-500">
                      {errors.delta.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {isReadOnly ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting || formLoading}>
                    {isSubmitting
                      ? "Saving..."
                      : mode === "create"
                      ? "Create Reading"
                      : "Update Reading"}
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
