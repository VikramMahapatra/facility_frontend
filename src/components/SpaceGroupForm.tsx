import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SpaceGroup } from "@/pages/SpaceGroups";
import { mockSites } from "@/data/mockSpacesData";

interface Props {
  group?: SpaceGroup;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SpaceGroup>) => void;
  mode: "create" | "edit" | "view";
}

export function SpaceGroupForm({ group, isOpen, onClose, onSave, mode }: Props) {
  const [formData, setFormData] = useState<Partial<SpaceGroup>>({});

  useEffect(() => {
    if (group) {
      setFormData(group);
    } else {
      setFormData({});
    }
  }, [group]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
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
            {mockSites.map(site => (
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
