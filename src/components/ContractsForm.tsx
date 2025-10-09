import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { contractsApiService } from "@/services/procurement/contractsapi";
import { vendorsApiService } from "@/services/procurement/vendorsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";

interface ContractFormProps {
  contract?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: any) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData = {
  title: "",
  type: "",
  vendor_id: "",
  site_id: "",
  start_date: "",
  end_date: "",
  value: "",
  terms: {
    sla: {
      response_hrs: "",
    },
  },
  documents: [],
};

export function ContractForm({ contract, isOpen, onClose, onSave, mode }: ContractFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>(emptyFormData);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);

  useEffect(() => {
    if (contract) {
      setFormData({
        ...emptyFormData,
        ...contract,
        terms: contract.terms || { sla: { response_hrs: "" } },
        documents: contract.documents || [],
      });
    } else {
      setFormData(emptyFormData);
    }
    loadTypeLookup();
    loadVendorLookup();
    loadSiteLookup();
  }, [contract]);

  const loadTypeLookup = async () => {
    const types = await contractsApiService.getContractsTypeLookup().catch(() => []);
    setTypeList(types || []);
  };

  const loadVendorLookup = async () => {
    const vendors = await vendorsApiService.getVendors(new URLSearchParams()).catch(() => []);
    setVendorList(vendors?.vendors || []);
  };

  const loadSiteLookup = async () => {
    const sites = await siteApiService.getSiteLookup().catch(() => []);
    setSiteList(sites || []);
  };

  const handleTermsFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      terms: { ...(prev.terms || {}), [field]: value },
    }));
  };

  const handleSLAFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      terms: { 
        ...(prev.terms || {}), 
        sla: { ...(prev.terms?.sla || {}), [field]: value } 
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!formData.vendor_id) {
      toast({ title: "Validation Error", description: "Vendor is required", variant: "destructive" });
      return;
    }
    if (!formData.start_date) {
      toast({ title: "Validation Error", description: "Start date is required", variant: "destructive" });
      return;
    }
    if (!formData.end_date) {
      toast({ title: "Validation Error", description: "End date is required", variant: "destructive" });
      return;
    }

    try {
      const orgData = await organisationApiService.getOrg();
      const payload: any = {
        title: formData.title,
        type: formData.type,
        vendor_id: formData.vendor_id,
        site_id: formData.site_id || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        value: formData.value ? parseFloat(formData.value) : null,
        terms: formData.terms,
        documents: formData.documents,
        org_id: orgData.id,
      };
      
      if (mode === "edit" && contract?.id) {
        payload.id = contract.id;
      }
      
      console.log("Contract payload:", payload);
      onSave(payload);
    } catch (error) {
      toast({ title: "Error", description: "Failed to get organization data", variant: "destructive" });
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Contract"}
            {mode === "edit" && "Edit Contract"}
            {mode === "view" && "Contract Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contract Details Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Contract Title *</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                disabled={isReadOnly} 
                placeholder="Annual Maintenance Contract"
              />
            </div>
            <div>
              <Label htmlFor="type">Contract Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  {typeList.map((type: any) => (
                    <SelectItem key={(type.id ?? type.value ?? type).toString()} value={(type.id ?? type.value ?? type).toString()}>
                      {type.name ?? type.label ?? type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendor">Vendor *</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(v) => setFormData({ ...formData, vendor_id: v })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendorList.map((vendor: any) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="site">Site</Label>
              <Select
                value={formData.site_id}
                onValueChange={(v) => setFormData({ ...formData, site_id: v })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {siteList.map((site: any) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input 
                id="start_date" 
                type="date" 
                value={formData.start_date} 
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} 
                disabled={isReadOnly} 
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input 
                id="end_date" 
                type="date" 
                value={formData.end_date} 
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} 
                disabled={isReadOnly} 
              />
            </div>
            <div>
              <Label htmlFor="value">Contract Value (₹)</Label>
              <Input 
                id="value" 
                type="number" 
                value={formData.value} 
                onChange={(e) => setFormData({ ...formData, value: e.target.value })} 
                disabled={isReadOnly} 
                placeholder="500000"
              />
            </div>
          </div>

          {/* SLA Terms Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">SLA Terms:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="response_hrs">Response Hours</Label>
                <Input 
                  id="response_hrs" 
                  type="number" 
                  value={formData.terms?.sla?.response_hrs || ""} 
                  onChange={(e) => handleSLAFieldChange("response_hrs", e.target.value)} 
                  disabled={isReadOnly} 
                  placeholder="4"
                />
              </div>
              <div>
                {/* Empty space for alignment */}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Documents:</h3>
            <div>
              <Label htmlFor="documents">Document URLs (one per line)</Label>
              <Textarea 
                id="documents" 
                value={Array.isArray(formData.documents) ? formData.documents.join('\n') : ''} 
                onChange={(e) => setFormData({ ...formData, documents: e.target.value.split('\n').filter(url => url.trim()) })} 
                disabled={isReadOnly} 
                placeholder="https://example.com/contract.pdf&#10;https://example.com/terms.pdf"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && <Button type="submit">{mode === "create" ? "Create Contract" : "Update Contract"}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}