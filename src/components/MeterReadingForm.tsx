import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { meterReadingApiService } from "@/services/energy_iot/meterreadingsapi";

export interface MeterReading {
  id?: string;
  meter_id: string;
  ts: string;
  reading: number;
  delta?: number;
  source?: string;
  metadata?: any;
}

interface MeterReadingFormProps {
  meterReading?: MeterReading;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meterReading: Partial<MeterReading>) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData = {
  meter_id: '',
  ts: new Date().toISOString().slice(0, 16), 
  reading: 0,
  delta: undefined,
  source: 'manual',
  metadata: undefined
};

export function MeterReadingForm({ 
  meterReading,
  isOpen,
  onClose,
  onSave,
  mode
}: MeterReadingFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown data states
  const [meters, setMeters] = useState<any[]>([]);

  // Hardcoded dropdown options
  const readingSources = [
    { id: 'manual', name: 'Manual Entry' },
    { id: 'automatic', name: 'Automatic Reading' },
    { id: 'imported', name: 'Imported Data' },
    { id: 'api', name: 'API Integration' },
    { id: 'sensor', name: 'Sensor Reading' }
  ];

  useEffect(() => {
    if (meterReading && mode !== "create") {
      setFormData({
        meter_id: meterReading.meter_id || "",
        ts: meterReading.ts ? new Date(meterReading.ts).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        reading: meterReading.reading || 0,
        delta: meterReading.delta,
        source: meterReading.source || 'manual',
        metadata: meterReading.metadata,
        ...meterReading
      });
    } else {
      setFormData(emptyFormData);
    }
    setErrors({});
  }, [meterReading, mode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  const loadDropdownData = async () => {
    const metersData = await meterReadingApiService.getMeterReadingLookup();
    setMeters(metersData);
  };
  

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.meter_id) {
      newErrors.meter_id = 'Meter is required';
    }
    if (!formData.ts) {
      newErrors.ts = 'Timestamp is required';
    }
    if (formData.reading === undefined || formData.reading === null) {
      newErrors.reading = 'Reading value is required';
    }
    if (formData.reading < 0) {
      newErrors.reading = 'Reading value cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving meter reading:', error);
      toast({
        title: "Error",
        description: `Failed to save meter reading: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof MeterReading, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meter */}
            <div className="space-y-2">
              <Label htmlFor="meter_id">Meter *</Label>
              <Select 
                value={formData.meter_id} 
                onValueChange={(value) => handleInputChange('meter_id', value)}
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
                <p className="text-sm text-red-500">{errors.meter_id}</p>
              )}
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select 
                value={formData.source || 'manual'} 
                onValueChange={(value) => handleInputChange('source', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timestamp */}
            <div className="space-y-2">
              <Label htmlFor="ts">Timestamp *</Label>
              <Input
                id="ts"
                type="datetime-local"
                value={formData.ts}
                onChange={(e) => handleInputChange('ts', e.target.value)}
                className={errors.ts ? 'border-red-500' : ''}
                disabled={isReadOnly}
              />
              {errors.ts && (
                <p className="text-sm text-red-500">{errors.ts}</p>
              )}
            </div>

            {/* Reading Value */}
            <div className="space-y-2">
              <Label htmlFor="reading">Reading Value *</Label>
              <Input
                id="reading"
                type="number"
                step="0.000001"
                min="0"
                value={formData.reading || ''}
                onChange={(e) => handleInputChange('reading', parseFloat(e.target.value) || 0)}
                placeholder="0.000000"
                className={errors.reading ? 'border-red-500' : ''}
                disabled={isReadOnly}
              />
              {errors.reading && (
                <p className="text-sm text-red-500">{errors.reading}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delta */}
            <div className="space-y-2">
              <Label htmlFor="delta">Delta (Optional)</Label>
              <Input
                id="delta"
                type="number"
                step="0.000001"
                value={formData.delta || ''}
                onChange={(e) => handleInputChange('delta', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Auto-calculated"
                disabled={isReadOnly}
              />
              <p className="text-sm text-muted-foreground">
                Difference from previous reading (auto-calculated if not provided)
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (Optional)</Label>
              <Input
                id="metadata"
                value={formData.metadata ? JSON.stringify(formData.metadata) : ''}
                onChange={(e) => {
                  try {
                    const value = e.target.value ? JSON.parse(e.target.value) : undefined;
                    handleInputChange('metadata', value);
                  } catch {
                    // Invalid JSON, keep as string for now
                    handleInputChange('metadata', e.target.value);
                  }
                }}
                placeholder='{"key": "value"}'
                disabled={isReadOnly}
              />
              <p className="text-sm text-muted-foreground">
                Additional data in JSON format
              </p>
            </div>
          </div>

          {/* Form Actions */}
          {!isReadOnly && (
            <DialogFooter className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[120px]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {mode === "create" ? 'Add Reading' : 'Update Reading'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
