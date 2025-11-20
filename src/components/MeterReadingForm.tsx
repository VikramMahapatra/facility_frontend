import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { meterReadingApiService } from "@/services/energy_iot/meterreadingsapi";
import { MeterReading } from "@/interfaces/energy_iot_interface";
import { utcToLocal } from "@/helpers/dateHelpers";
import { Controller, useForm } from "react-hook-form";
import { MeterReadingFormValues, meterReadingSchema } from "@/schemas/meterReading.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface MeterReadingFormProps {
  meterReading?: MeterReading;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meterReading:any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData = {
  meter_id: '',
  ts: new Date().toISOString().slice(0, 16),
  reading: 0,
  delta: undefined,
  source: 'manual' as MeterReading["source"],
  metadata: undefined
};

export function MeterReadingForm({
  meterReading,
  isOpen,
  onClose,
  onSave,
  mode
}: MeterReadingFormProps) {

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<MeterReadingFormValues>({
    resolver: zodResolver(meterReadingSchema),
    defaultValues: emptyFormData,
    mode: "onChange", // ✅ important for real-time validation
    reValidateMode: "onChange",
  });

  // Dropdown data states
  const [meters, setMeters] = useState<any[]>([]);

  // Hardcoded dropdown options
  const readingSources = [
    { id: 'manual', name: 'Manual' },
    { id: 'iot', name: 'IoT' }
  ];

  useEffect(() => {
    loadDropdownData();
  }, [])

  useEffect(() => {
    if (meterReading) {
      reset({
        meter_id: meterReading.meter_id,
        ts: utcToLocal(meterReading.ts),
        reading: meterReading.reading,
        delta: meterReading.delta,
        source: meterReading.source || "manual",
        metadata: meterReading.metadata
      });
    } else {
      reset(emptyFormData);
    }
  }, [meterReading]);

  const loadDropdownData = async () => {
    const response = await meterReadingApiService.getMeterReadingLookup();
    if (response) setMeters(response.data || []);
  };


  const onSubmitForm = async (data: MeterReadingFormValues) => {
    const formResponse = await onSave({
      ...meterReading,
      ...data,
    });
  };


  const handleInputChange = (field: any, value: any) => {
    setValue(field, value)
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Add New Meter Reading"}
            {mode === "edit" && "Edit Meter Reading"}
            {mode === "view" && "View Meter Reading"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meter */}
            <Controller
              name="meter_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="meter_id">Meter *</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.meter_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select meter" />
                    </SelectTrigger>
                    <SelectContent>
                      {meters.map((meter) => (
                        <SelectItem key={meter.id} value={meter.id}>
                          {meter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.meter_id && (
                    <p className="text-sm text-red-500">{errors.meter_id.message}</p>
                  )}
                </div>
              )}
            />

            {/* Source */}

            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>

                  <Select
                    value={field.value}
                    onValueChange={field.onChange}  // ✅ updates RHF state
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.source ? "border-red-500" : ""}>
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

                  {errors.source && (
                    <p className="text-sm text-red-500">{errors.source.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timestamp */}
            <div className="space-y-2">
              <Label htmlFor="ts">Timestamp </Label>
              <Controller
                name="ts"
                control={control}
                render={({ field }) => (
                  <Input
                    id="ts"
                    type="datetime-local"
                    value={utcToLocal(field.value)} // ✅ convert before showing
                    onChange={(e) => field.onChange(e.target.value)} // ✅ update RHF state
                    className={errors.ts ? 'border-red-500' : ''}
                    disabled={isReadOnly}
                  />
                )}
              />
              {errors.ts && (
                <p className="text-sm text-red-500">{errors.ts.message}</p>
              )}
            </div>

            {/* Reading Value */}
            <div className="space-y-2">
              <Label htmlFor="reading">Reading Value </Label>
              <Controller
                name="ts"
                control={control}
                render={({ field }) => (
                  <Input
                    id="reading"
                    type="number"
                    step="0.000001"
                    min="0"
                    {...register("reading", { valueAsNumber: true })}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="0.000000"
                    className={errors.reading ? 'border-red-500' : ''}
                    disabled={isReadOnly}
                  />
                )}
              />
              {errors.reading && (
                <p className="text-sm text-red-500">{errors.reading.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delta */}
            <div className="space-y-2">
              <Label htmlFor="delta">Delta</Label>
              <Controller
                name="delta"
                control={control}
                render={({ field }) => (
                  <Input
                    id="delta"
                    type="number"
                    step="0.000001"
                    {...register("delta")}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isReadOnly}
                  />
                )}
              />
              <p className="text-sm text-muted-foreground">
                Difference from previous reading (auto-calculated if not provided)
              </p>
              {errors.delta && (
                <p className="text-sm text-red-500">{errors.delta.message}</p>
              )}
            </div>


          </div>

          {/* Form Actions */}
          {!isReadOnly && (
            <DialogFooter className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[120px]"
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : mode === "create" ? "Add Reading" : "Update Reading"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
