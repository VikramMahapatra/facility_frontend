import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SpaceGroup, SpaceKind } from "@/pages/SpaceGroups";
import { useToast } from "@/hooks/use-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";


type SpaceAmenities =
  | 'parking'
  | 'club_access'
  | 'pool'
  | 'terrace'
  | 'private_lift'
  | 'private_garden'
  | 'garage'
  | 'balcony'
  | 'security'
  | 'gym'
  | 'power_backup'
  | 'wifi'
  | 'elevator'
  | 'cctv'
  | 'intercom'
  | 'garden'
  | 'barbecue_area'
  | 'rooftop_access'
  | 'solar_power'
  | 'fireplace'
  | 'storage_room'
  | 'lobby'
  | 'conference_room'
  | 'cafeteria'
  | 'restrooms'
  | 'playground'
  | 'laundry_room'
  | 'visitor_parking';

export const amenitiesByKind: Record<SpaceKind, SpaceAmenities[]> = {
  apartment: [
    'parking',
    'balcony',
    'security',
    'gym',
    'power_backup',
    'wifi',
    'elevator',
    'cctv',
    'intercom',
    'club_access',
    'pool',
    'terrace',
    'private_lift',
  ],
  row_house: [
    'parking',
    'garage',
    'private_garden',
    'garden',
    'barbecue_area',
    'rooftop_access',
    'solar_power',
    'fireplace',
    'storage_room',
    'terrace',
  ],
  common_area: [
    'visitor_parking',
    'lobby',
    'conference_room',
    'cafeteria',
    'restrooms',
    'playground',
    'laundry_room',
    'security',
    'cctv',
  ],
};

interface Props {
  group?: SpaceGroup;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SpaceGroup>) => void;
  mode: "create" | "edit" | "view";
}

export function SpaceGroupForm({ group, isOpen, onClose, onSave, mode }: Props) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<SpaceGroup>>({
    name: "",
    site_id: "",
    kind: "apartment" as SpaceKind,
    specs: {
      base_rate: 0,
      amenities: []
    }
  });
  const [siteList, setSiteList] = useState([]);

  useEffect(() => {
    if (group) {
      setFormData(group);
    } else {
      setFormData({
        name: "",
        site_id: "",
        kind: "apartment" as SpaceKind,
        specs: {
          base_rate: 0,
          amenities: []
        }
      });
    }
    loadSiteLookup();
  }, [group]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenitiesFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, specs: { ...prev.specs, [field]: value, } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.site_id || !formData.name || !formData.kind) {
      toast({
        title: "Validation Error",
        description: "Name, Site & Apartment are required fields",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
  };

  const isView = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Group" : mode === "edit" ? "Edit Group" : "View Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Group Name"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={isView}
          />

          <select
            value={formData.site_id || ""}
            onChange={(e) => handleChange("site_id", e.target.value)}
            disabled={isView}
            className="w-full border rounded p-2"
          >
            <option value="">Select Site</option>
            {siteList.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>

          <select
            value={formData.kind || ""}
            onChange={(e) => handleChange("kind", e.target.value)}
            disabled={isView}
            className="w-full border rounded p-2"
          >
            <option value="">Select Kind</option>
            <option value="apartment">Apartment</option>
            <option value="row_house">Row House</option>
            <option value="common_area">Common Area</option>
          </select>

          <Input
            placeholder="Base Rate"
            type="number"
            value={formData.specs.base_rate || ""}
            onChange={(e) => handleAmenitiesFieldChange("base_rate", e.target.value)}
            disabled={isView}
          />
          <select
            multiple
            value={formData.specs.amenities || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value as SpaceAmenities);
              handleAmenitiesFieldChange("amenities", selected);
            }}
            disabled={isView}
            className="w-full border rounded p-2 h-32"
          >
            <option value="" disabled>Select Amenities</option>
            {formData.kind && amenitiesByKind[formData.kind as SpaceKind].map((amenity) => (
              <option key={amenity} value={amenity}>
                {amenity.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {!isView && (
            <Button onClick={handleSubmit}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
