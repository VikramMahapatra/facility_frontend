import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mockSites } from "@/data/mockParkingData";
import { useToast } from "@/hooks/use-toast";
import { Visitor } from "@/interfaces/parking_access_interface";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { utcToLocal, localToUTC } from "@/helpers/dateHelpers"
import { spacesApiService } from "@/services/spaces_sites/spacesapi";

interface VisitorFormProps {
  visitor?: Visitor;
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitor: Partial<Visitor>) => void;
  mode: 'create' | 'edit' | 'view';
}

const emptyFormData: Partial<Visitor> = {
  name: "",
  phone: "",
  site_id: "",
  space_id: "",
  purpose: "",
  status: "expected" as const,
  vehicle_no: "",
  entry_time: new Date().toISOString().slice(0, 16),
  exit_time: "",
  is_expected: true
};

export function VisitorForm({ visitor, isOpen, onClose, onSave, mode }: VisitorFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Visitor>>(emptyFormData);
  const [siteList, setSiteList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);

  useEffect(() => {
    if (visitor) {
      setFormData(visitor);
    } else {
      setFormData(emptyFormData);
    }
    loadSiteLookup();
    setSpaceList([]);
  }, [visitor]);

  useEffect(() => {
    loadSpaceLookup();
  }, [formData.site_id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.site_id || !formData.space_id) {
      toast({
        title: "Validation Error",
        description: "Name, phone, site, and visiting location are required fields",
        variant: "destructive",
      });
      return;
    }

    const visitorData = {
      ...visitor,
      name: formData.name,
      phone: formData.phone,
      site_id: formData.site_id,
      space_id: formData.space_id,
      visiting: formData.visiting,
      purpose: formData.purpose,
      status: formData.status,
      vehicle_no: formData.vehicle_no || undefined,
      entry_time: localToUTC(formData.entry_time),
      exit_time: localToUTC(formData.exit_time) || undefined,
      is_expected: formData.is_expected
    };

    onSave(visitorData);
  };

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  }

  const loadSpaceLookup = async () => {
    const lookup = await spacesApiService.getSpaceWithBuildingLookup(formData.site_id);
    setSpaceList(lookup);
  }

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && "Add New Visitor"}
            {mode === 'edit' && "Edit Visitor"}
            {mode === 'view' && "Visitor Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Visitor's full name"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91-9876543210"
                disabled={isReadOnly}
              />
            </div>
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
                {siteList.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="visiting">Visiting *</Label>
            <Select
              name="space_id"
              value={formData.space_id}
              onValueChange={(value) => setFormData({ ...formData, space_id: value })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visiting place" />
              </SelectTrigger>
              <SelectContent>
                {spaceList.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g., Meeting, Delivery, Maintenance"
              disabled={isReadOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "checked_in" | "checked_out" | "expected") => setFormData({ ...formData, status: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expected">Expected</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vehicle_no">Vehicle Number</Label>
              <Input
                id="vehicle_no"
                value={formData.vehicle_no}
                onChange={(e) => setFormData({ ...formData, vehicle_no: e.target.value })}
                placeholder="e.g., KA01AB1234"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_time">Entry Time</Label>
              <Input
                id="entry_time"
                type="datetime-local"
                value={utcToLocal(formData.entry_time)}
                onChange={(e) => setFormData({ ...formData, entry_time: e.target.value })}
                disabled={isReadOnly}
              />
            </div>
            {formData.status === 'checked_out' && (
              <div>
                <Label htmlFor="exit_time">Exit Time</Label>
                <Input
                  id="exit_time"
                  type="datetime-local"
                  value={utcToLocal(formData.exit_time)}
                  onChange={(e) => setFormData({ ...formData, exit_time: e.target.value })}
                  disabled={isReadOnly}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit">
                {mode === 'create' ? 'Add Visitor' : 'Update Visitor'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}