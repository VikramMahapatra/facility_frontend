import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { assetApiService } from "@/services/maintenance_assets/assetsapi";
// Import your other API services here
// import { metersApiService } from "@/services/energy_iot/metersapi";

export interface Meter {
  id: string;
  org_id: string;
  site_id: string;
  kind: string;
  code: string;
  asset_id?: string;
  space_id?: string;
  unit: string;
  multiplier?: number;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  created_at?: string;
  updated_at?: string;
}

interface MeterFormProps {
  meter?: Meter;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meter: Partial<Meter>) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData = {
  site_id: "",
  kind: "",
  code: "",
  asset_id: "",
  space_id: "",
  unit: "",
  multiplier: 1,
  status: "active" as Meter["status"],
};

export function MeterForm({ meter, isOpen, onClose, onSave, mode }: MeterFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown data states
  const [sites, setSites] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  
  // Hardcoded dropdown options
  const meterUnits = [
    { id: 'kWh', name: 'kWh (Kilowatt Hours)' },
    { id: 'kW', name: 'kW (Kilowatts)' },
    { id: 'm3', name: 'm³ (Cubic Meters)' },
    { id: 'L', name: 'L (Liters)' },
    { id: 'gal', name: 'Gallons' },
    { id: 'therms', name: 'Therms' },
    { id: 'BTU', name: 'BTU (British Thermal Units)' },
    { id: 'tons', name: 'Tons' },
    { id: 'count', name: 'Count' },
    { id: 'hours', name: 'Hours' }
  ];

  const meterStatuses = [
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'faulty', name: 'Faulty' },
    { id: 'retired', name: 'Retired' }
  ];

  const meterKinds = [
    { id: 'electricity', name: 'Electricity' },
    { id: 'water', name: 'Water' },
    { id: 'gas', name: 'Gas' },
    { id: 'steam', name: 'Steam' },
    { id: 'cooling', name: 'Cooling' },
    { id: 'heating', name: 'Heating' },
    { id: 'compressed_air', name: 'Compressed Air' },
    { id: 'chilled_water', name: 'Chilled Water' },
    { id: 'hot_water', name: 'Hot Water' },
    { id: 'other', name: 'Other' }
  ];

  useEffect(() => {
    if (meter && mode !== "create") {
      setFormData({
        site_id: meter.site_id || "",
        kind: meter.kind || "",
        code: meter.code || "",
        asset_id: meter.asset_id || "",
        space_id: meter.space_id || "",
        unit: meter.unit || "",
        multiplier: meter.multiplier || 1,
        status: meter.status || "active",
      });
    } else {
      setFormData(emptyFormData);
    }
    setErrors({});
  }, [meter, mode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.site_id) {
      loadSpacesLookup();
    } else {
      setSpaces([]);
    }
  }, [formData.site_id]);

  const loadDropdownData = async () => {
    try {
      // Load sites and assets data from API
      const [sitesData, assetsData] = await Promise.all([
        siteApiService.getSiteLookup(),
        assetApiService.getAssetLookup()
      ]);
      
      setSites(sitesData || []);
      setAssets(assetsData || []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadSpacesLookup = async () => {
    try {
      const spacesData = await spacesApiService.getSpaceLookup(formData.site_id);
      setSpaces(spacesData || []);
    } catch (error) {
      console.error('Failed to load spaces:', error);
      setSpaces([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.site_id) {
      newErrors.site_id = "Site is required";
    }

    if (!formData.kind) {
      newErrors.kind = "Meter kind is required";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Meter code is required";
    } else if (formData.code.length < 3) {
      newErrors.code = "Meter code must be at least 3 characters";
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }

    if (formData.multiplier && formData.multiplier <= 0) {
      newErrors.multiplier = "Multiplier must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast({
        title: "Success",
        description: `Meter ${mode === "create" ? "created" : "updated"} successfully.`,
      });
      onClose();
    } catch (error) {
      console.error('Error saving meter:', error);
      toast({
        title: "Error",
        description: "Failed to save meter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
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
            {mode === "create" && "Create New Meter"}
            {mode === "edit" && "Edit Meter"}
            {mode === "view" && "View Meter"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Site */}
            <div className="space-y-2">
              <Label htmlFor="site_id">Site *</Label>
              <Select 
                value={formData.site_id} 
                onValueChange={(value) => handleInputChange('site_id', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger className={errors.site_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.site_id && (
                <p className="text-sm text-red-500">{errors.site_id}</p>
              )}
            </div>

            {/* Associated Space */}
            <div className="space-y-2">
              <Label htmlFor="space_id">Space</Label>
              <Select 
                value={formData.space_id || 'none'} 
                onValueChange={(value) => handleInputChange('space_id', value === 'none' ? undefined : value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select space (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Space</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meter Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Meter Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="e.g., ELEC-001, WATER-MAIN"
                className={errors.code ? 'border-red-500' : ''}
                disabled={isReadOnly}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => handleInputChange('unit', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {meterUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-red-500">{errors.unit}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meter Kind */}
            <div className="space-y-2">
              <Label htmlFor="kind">Meter Kind *</Label>
              <Select 
                value={formData.kind} 
                onValueChange={(value) => handleInputChange('kind', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger className={errors.kind ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select meter kind" />
                </SelectTrigger>
                <SelectContent>
                  {meterKinds.map((kind) => (
                    <SelectItem key={kind.id} value={kind.id}>
                      {kind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kind && (
                <p className="text-sm text-red-500">{errors.kind}</p>
              )}
            </div>

            {/* Associated Asset */}
            <div className="space-y-2">
              <Label htmlFor="asset_id">Asset</Label>
              <Select 
                value={formData.asset_id || 'none'} 
                onValueChange={(value) => handleInputChange('asset_id', value === 'none' ? undefined : value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Asset</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Multiplier */}
            <div className="space-y-2">
              <Label htmlFor="multiplier">Multiplier</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.0001"
                min="0"
                value={formData.multiplier || ''}
                onChange={(e) => handleInputChange('multiplier', parseFloat(e.target.value) || 1)}
                placeholder="1.0000"
                className={errors.multiplier ? 'border-red-500' : ''}
                disabled={isReadOnly}
              />
              {errors.multiplier && (
                <p className="text-sm text-red-500">{errors.multiplier}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Factor to multiply readings by (default: 1.0000)
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {meterStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : mode === "create" ? "Create Meter" : "Update Meter"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
