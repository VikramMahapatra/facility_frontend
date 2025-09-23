import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface Site {
  id: string;
  org_id: string;
  name: string;
  code: string;
  kind: 'residential' | 'commercial' | 'hotel' | 'mall' | 'mixed' | 'campus';
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country?: string;
    pincode: string;
  };
  geo: { lat: number; lng: number };
  opened_on: string;
  status: 'active' | 'inactive';
  total_spaces?: string;
  buildings?: string;
  occupied_percent?: string;
  created_at: string;
  updated_at: string;
}

interface SiteFormProps {
  site?: Site;
  isOpen: boolean;
  onClose: () => void;
  onSave: (site: Partial<Site>) => void;
  mode: "create" | "edit" | "view";
}

const siteKinds = ["residential", "commercial", "hotel", "mall", "mixed", "campus"];

export function SiteForm({ site, isOpen, onClose, onSave, mode }: SiteFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    kind: "residential" as Site["kind"],
    status: "active" as Site["status"],
    opened_on: new Date().toISOString().split("T")[0],
    address: {
      line1: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  useEffect(() => {
    if (site) {
      setFormData({
        code: site?.code,
        name: site?.name,
        kind: site?.kind,
        status: site?.status,
        opened_on: site?.opened_on || new Date().toISOString().split("T")[0],
        address: {
          line1: site?.address.line1 || "",
          city: site?.address.city || "",
          state: site?.address.state || "",
          pincode: site?.address.pincode || "",
        },
      })
    } else {
      setFormData({
        code: "",
        name: "",
        kind: "residential" as Site["kind"],
        status: "active" as Site["status"],
        opened_on: new Date().toISOString().split("T")[0],
        address: {
          line1: "",
          city: "",
          state: "",
          pincode: "",
        },
      });
    }
  }, [site, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      toast({
        title: "Validation Error",
        description: "Code and Name are required fields",
        variant: "destructive",
      });
      return;
    }

    onSave({
      ...site,
      ...formData,
      updated_at: new Date().toISOString(),
    });
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Site"}
            {mode === "edit" && "Edit Site"}
            {mode === "view" && "Site Details"}
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
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kind">Type</Label>
              <Select
                value={formData.kind}
                onValueChange={(value) => setFormData({ ...formData, kind: value as Site["kind"] })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {siteKinds.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Site["status"] })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="line1">Address Line</Label>
              <Input
                id="line1"
                value={formData.address.line1}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.address.state}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.address.pincode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit">
                {mode === "create" ? "Create Site" : "Update Site"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}