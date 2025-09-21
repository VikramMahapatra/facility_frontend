"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockSites } from "@/data/mockSpacesData";

interface BuildingFormProps {
  building?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (building: any) => void;
  mode: "create" | "edit" | "view";
}

export function BuildingForm({ building, isOpen, onClose, onSave, mode }: BuildingFormProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    siteId: "",
    floors: 1,
    totalSpaces: 0,
    occupiedSpaces: 0,
  });

  useEffect(() => {
    if (building) {
      setFormData(building);
    } else {
      setFormData({ name: "", siteId: "", floors: 1, totalSpaces: 0, occupiedSpaces: 0 });
    }
  }, [building]);

  const isReadOnly = mode === "view";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({
      ...(building || {}),
      ...formData,
      updated_at: new Date().toISOString(),
      created_at: building?.created_at || new Date().toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Building" : mode === "edit" ? "Edit Building" : "View Building"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Building Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="Enter building name"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Site</label>
            <select
              name="siteId"
              value={formData.siteId}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full border rounded p-2"
            >
              <option value="">Select Site</option>
              {mockSites.map(site => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Floors</label>
            <Input
              type="number"
              name="floors"
              value={formData.floors}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Total Spaces</label>
            <Input
              type="number"
              name="totalSpaces"
              value={formData.totalSpaces}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Occupied Spaces</label>
            <Input
              type="number"
              name="occupiedSpaces"
              value={formData.occupiedSpaces}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {mode !== "view" && (
            <Button onClick={handleSubmit}>
              {mode === "create" ? "Create" : "Update"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
