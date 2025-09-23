"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react"; // optional
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { useToast } from "@/hooks/use-toast";

interface BuildingFormProps {
  building?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (building: any) => void;
  mode: "create" | "edit" | "view";
}

export function BuildingForm({ building, isOpen, onClose, onSave, mode }: BuildingFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>({
    name: "",
    site_id: "",
    floors: 1,
    status: 'active',
    attributes: {
      lifts: 0,
      fireSafety: true
    }
  });
  const [siteList, setSiteList] = useState([]);

  useEffect(() => {
    if (building) {
      setFormData(building);
    } else {
      setFormData({
        name: "",
        site_id: "",
        floors: 1,
        status: 'active',
        attributes: {
          lifts: 0,
          fireSafety: true
        }
      });
    }
    loadSiteLookup();
  }, [building]);

  const isReadOnly = mode === "view";

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('name & value', name, value)
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.site_id) {
      toast({
        title: "Validation Error",
        description: "Name and Site are required fields",
        variant: "destructive",
      });
      return;
    }
    onSave({
      ...building,
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
              name="site_id"
              value={formData.site_id}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full border rounded p-2"
            >
              <option value="">Select Site</option>
              {siteList.map(site => (
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
            <label className="block text-sm mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full border rounded p-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">No. Of Lifts</label>
              <Input
                type="number"
                name="lifts"
                value={formData.lifts}
                onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, lifts: e.target.value } })}
                disabled={isReadOnly}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox.Root
                id="fireSafety"
                checked={formData.fireSafety}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, attributes: { ...formData.attributes, fireSafety: !!checked } })
                }
                disabled={isReadOnly}
                className="
                h-5 w-5 shrink-0 rounded border border-gray-300 
                data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              >
                <Checkbox.Indicator>
                  <Check className="h-4 w-4 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>

              <label
                htmlFor="fireSafety"
                className="text-sm leading-none cursor-pointer"
              >
                Fire Safety Available
              </label>
            </div>
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
