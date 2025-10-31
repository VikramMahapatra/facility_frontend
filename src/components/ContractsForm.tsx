import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { contractApiService } from "@/services/pocurments/contractapi";
import { vendorsApiService } from "@/services/pocurments/vendorsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface ContractFormProps {
  contract?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: any) => void;
  mode: "create" | "edit" | "view";
}

interface Document {
  id: string;
  url: string;
  name: string;
}

const emptyFormData = {
  title: "",
  type: "",
  status: "",
  vendor_id: "",
  site_id: "",
  start_date: "",
  end_date: "",
  value: "",
  terms: {
    sla: {
      response_hrs: "",
    },
    penalty: {
      per_day: "",
    },
  },
  documents: [] as Document[],
};

export function ContractForm({ contract, isOpen, onClose, onSave, mode }: ContractFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>(emptyFormData);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);

  useEffect(() => {
    if (contract) {
      // Convert existing documents to new format
      const documents = (contract.documents || []).map((doc: any, index: number) => ({
        id: doc.id || `doc-${index}`,
        url: typeof doc === 'string' ? doc : doc.url || '',
        name: doc.name || (typeof doc === 'string' ? (doc.split('/').pop() || 'Document') : (doc.url?.split('/').pop() || 'Document')),
      }));
      
      setFormData({
        ...emptyFormData,
        ...contract,
        terms: contract.terms || { sla: { response_hrs: "" }, penalty: { per_day: "" } },
        documents: documents,
      });
    } else {
      setFormData(emptyFormData);
    }
    loadTypeLookup();
    loadStatusLookup();
    loadVendorLookup();
    loadSiteLookup();
  }, [contract]);

  const loadTypeLookup = async () => {
  const response = await contractApiService.getTypeLookup();
  if (response.success) setTypeList(response.data || []);
};

const loadStatusLookup = async () => {
  const response = await contractApiService.getStatusLookup();
  if (response.success) setStatusList(response.data || []);
};

const loadVendorLookup = async () => {
  const response = await vendorsApiService.getVendorLookup();
  if (response.success) setVendorList(response.data || []);
};

const loadSiteLookup = async () => {
  const response = await siteApiService.getSiteLookup();
  if (response.success) setSiteList(response.data || []);
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

  const handlePenaltyFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      terms: { 
        ...(prev.terms || {}), 
        penalty: { ...(prev.terms?.penalty || {}), [field]: value } 
      },
    }));
  };

  const addDocument = () => {
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      url: '',
      name: '',
    };
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, newDocument],
    }));
  };

  const removeDocument = (documentId: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== documentId),
    }));
  };

  const updateDocument = (documentId: string, field: keyof Document, value: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === documentId ? { ...doc, [field]: value } : doc
      ),
    }));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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
        org_id: orgData?.data?.id,
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
          <div className="grid grid-cols-3 gap-4">
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
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Contract Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract status" />
                </SelectTrigger>
                <SelectContent>
                  {statusList.map((status: any) => (
                    <SelectItem key={status.id} value={status.id }>
                      {status.name }
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
            <h3 className="text-sm font-medium text-gray-700">Terms:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="response_hrs">SLA - Response Hours</Label>
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
                <Label htmlFor="penalty_per_day">Penalty - Per Day (₹)</Label>
                <Input 
                  id="penalty_per_day" 
                  type="number" 
                  value={formData.terms?.penalty?.per_day || ""} 
                  onChange={(e) => handlePenaltyFieldChange("per_day", e.target.value)} 
                  disabled={isReadOnly} 
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Document URLs</h3>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDocument}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add URL
                </Button>
              )}
            </div>
            
            {/* URL Items */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {formData.documents.map((doc: Document, index: number) => (
                    <div key={doc.id} className="flex items-center space-x-3 p-3 bg-white rounded border">
                      {/* Step Number */}
                      <div className="flex-shrink-0 w-6 text-center">
                        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                      </div>
                      
                      {/* Name Field */}
                      <div className="w-56">
                        <Input
                          placeholder="Name"
                          value={doc.name}
                          onChange={(e) => updateDocument(doc.id, 'name', e.target.value)}
                          disabled={isReadOnly}
                          className="h-8"
                        />
                      </div>

                      {/* URL Field */}
                      <div className="flex-1">
                        <Input
                          placeholder="Enter document URL..."
                          value={doc.url}
                          onChange={(e) => updateDocument(doc.id, 'url', e.target.value)}
                          disabled={isReadOnly}
                          className="h-8"
                        />
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {doc.url && isValidUrl(doc.url) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {formData.documents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No URLs added yet</p>
                      <p className="text-xs">Click "Add URL" to add your first document URL</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
