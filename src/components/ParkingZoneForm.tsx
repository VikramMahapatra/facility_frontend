import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mockSites, ParkingZone } from "@/data/mockParkingData";
import { useToast } from "@/hooks/use-toast";

interface ParkingZoneFormProps {
  zone?: ParkingZone;
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: Partial<ParkingZone>) => void;
  mode: 'create' | 'edit' | 'view';
}

export function ParkingZoneForm({ zone, isOpen, onClose, onSave, mode }: ParkingZoneFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: zone?.name || "",
    site_id: zone?.site_id || "",
    capacity: zone?.capacity || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.site_id || formData.capacity <= 0) {
      toast({
        title: "Validation Error",
        description: "All fields are required and capacity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    toast({
      title: mode === 'create' ? "Zone Created" : "Zone Updated",
      description: `Parking zone "${formData.name}" has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
    });
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && "Create New Parking Zone"}
            {mode === 'edit' && "Edit Parking Zone"}
            {mode === 'view' && "Parking Zone Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Zone Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Underground Garage A"
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="site">Site *</Label>
            <Select
              value={formData.site_id}
              onValueChange={(value) => setFormData({ ...formData, site_id: value })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                {mockSites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="capacity">Capacity (spots) *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              placeholder="e.g., 150"
              disabled={isReadOnly}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit">
                {mode === 'create' ? 'Create Zone' : 'Update Zone'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}