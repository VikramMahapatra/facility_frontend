import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { SpaceKind, spaceKinds } from "@/data/interfaces";

interface Space {
  id: string;
  org_id: string;
  site_id: string;
  code: string;
  name?: string;
  kind: SpaceKind;
  floor?: string;
  building_block_id?: string;
  building_block?: string;
  area_sqft?: number;
  beds?: number;
  baths?: number;
  attributes?: {
    view?: string;
    smoking?: boolean;
    furnished?: string;
    star_rating?: string;
  };
  status: 'available' | 'occupied' | 'out_of_service';
  created_at: string;
  updated_at: string;
}

interface SpaceFormProps {
  space?: Space;
  isOpen: boolean;
  onClose: () => void;
  onSave: (space: Partial<Space>) => void;
  mode: 'create' | 'edit' | 'view';
}

const emptyFormData = {
  code: "",
  name: "",
  kind: "room" as SpaceKind,
  site_id: "",
  floor: "",
  building_block_id: "",
  area_sqft: 0,
  beds: 0,
  baths: 0,
  status: "available" as const,
  attributes: {
    view: "",
    smoking: false,
    furnished: "",
    star_rating: "",
  }
}

export function SpaceForm({ space, isOpen, onClose, onSave, mode }: SpaceFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Space>>(emptyFormData);
  const [siteList, setSiteList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);

  useEffect(() => {
    if (space) {
      setFormData(space);
    } else {
      setFormData(emptyFormData);
    }
    loadSiteLookup();
    loadBuildingLookup();
  }, [space]);

  useEffect(() => {
    loadBuildingLookup();
  }, [formData.site_id]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  }

  const loadBuildingLookup = async () => {
    const lookup = await buildingApiService.getBuildingLookup(formData.site_id);
    setBuildingList(lookup);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.site_id || !formData.building_block_id) {
      toast({
        title: "Validation Error",
        description: "Code and Site are required fields",
        variant: "destructive",
      });
      return;
    }

    const spaceData = {
      ...space,
      code: formData.code,
      name: formData.name,
      kind: formData.kind,
      site_id: formData.site_id,
      floor: formData.floor,
      building_block_id: formData.building_block_id,
      area_sqft: formData.area_sqft,
      beds: formData.beds,
      baths: formData.baths,
      status: formData.status,
      attributes: {
        view: formData.attributes.view,
        smoking: formData.attributes.smoking,
        furnished: formData.attributes.furnished,
        star_rating: formData.attributes.star_rating,
      },
      updated_at: new Date().toISOString(),
    };

    onSave(spaceData);

  };

  const handleAttributesFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, attributes: { ...prev.attributes, [field]: value, } }));
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && "Create New Space"}
            {mode === 'edit' && "Edit Space"}
            {mode === 'view' && "Space Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., 101, A-1203, SH-12"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Space name"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="kind">Type</Label>
              <Select
                value={formData.kind}
                onValueChange={(value: SpaceKind) => setFormData({ ...formData, kind: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {spaceKinds.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {kind.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="e.g., Ground, 1st, B1"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="building_block">Building Block</Label>
              <Select
                value={formData.building_block_id}
                onValueChange={(value) => setFormData({ ...formData, building_block_id: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select building block" />
                </SelectTrigger>
                <SelectContent>
                  {buildingList.map((building_block) => (
                    <SelectItem key={building_block.id} value={building_block.id}>
                      {building_block.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="area_sqft">Area (sq ft)</Label>
              <Input
                id="area_sqft"
                type="number"
                value={formData.area_sqft}
                onChange={(e) => setFormData({ ...formData, area_sqft: Number(e.target.value) })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {['room', 'apartment'].includes(formData.kind) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="beds">Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="baths">Baths</Label>
                <Input
                  id="baths"
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: Number(e.target.value) })}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "available" | "occupied" | "out_of_service") => setFormData({ ...formData, status: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="view">View</Label>
              <Input
                id="view"
                value={formData.attributes.view}
                onChange={(e) => handleAttributesFieldChange('view', e.target.value)}
                placeholder="e.g., Sea, Garden, City"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="furnished">Furnished</Label>
              <Select
                value={formData.attributes.furnished}
                onValueChange={(value) => handleAttributesFieldChange('furnished', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  <SelectItem value="semi">Semi Furnished</SelectItem>
                  <SelectItem value="fully">Fully Furnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="star_rating">Star Rating</Label>
              <Select
                value={formData.attributes.star_rating}
                onValueChange={(value) => handleAttributesFieldChange('star_rating', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating === 0 ? "No Rating" : `${rating} Star${rating > 1 ? 's' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit">
                {mode === 'create' ? 'Create Space' : 'Update Space'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}