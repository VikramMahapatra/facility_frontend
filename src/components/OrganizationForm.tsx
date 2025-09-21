import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
  legal_name: string;
  gst_vat_id?: string;
  billing_email: string;
  contact_phone?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  locale: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

interface OrganizationFormProps {
  organization?: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSave: (organization: Partial<Organization>) => void;
  mode: 'create' | 'edit' | 'view';
}

export function OrganizationForm({ organization, isOpen, onClose, onSave, mode }: OrganizationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    legal_name: organization?.legal_name || "",
    gst_vat_id: organization?.gst_vat_id || "",
    billing_email: organization?.billing_email || "",
    contact_phone: organization?.contact_phone || "",
    plan: organization?.plan || "basic" as const,
    locale: organization?.locale || "en-IN",
    timezone: organization?.timezone || "Asia/Kolkata",
    status: organization?.status || "active" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.legal_name || !formData.billing_email) {
      toast({
        title: "Validation Error",
        description: "Name, Legal Name, and Billing Email are required fields",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    toast({
      title: mode === 'create' ? "Organization Created" : "Organization Updated",
      description: `Organization ${formData.name} has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
    });
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && "Create New Organization"}
            {mode === 'edit' && "Edit Organization"}
            {mode === 'view' && "Organization Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Taj Hotels, Gera"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="legal_name">Legal Name *</Label>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                placeholder="e.g., Indian Hotels Company Ltd"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billing_email">Billing Email *</Label>
              <Input
                id="billing_email"
                type="email"
                value={formData.billing_email}
                onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                placeholder="billing@company.com"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+91-1234567890"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gst_vat_id">GST/VAT ID</Label>
              <Input
                id="gst_vat_id"
                value={formData.gst_vat_id}
                onChange={(e) => setFormData({ ...formData, gst_vat_id: e.target.value })}
                placeholder="27AAACI1234K1Z1"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="plan">Plan</Label>
              <Select
                value={formData.plan}
                onValueChange={(value: "basic" | "pro" | "enterprise") => setFormData({ ...formData, plan: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locale">Locale</Label>
              <Select
                value={formData.locale}
                onValueChange={(value) => setFormData({ ...formData, locale: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-IN">English (India)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive" | "suspended") => setFormData({ ...formData, status: value })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit">
                {mode === 'create' ? 'Create Organization' : 'Update Organization'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}