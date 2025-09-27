// components/LeaseForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";

interface Lease {
  id?: string;
  org_id?: string;
  site_id?: string;
  space_id?: string;
  partner_id?: string; // commercial
  user_id?: string;    // residential
  tenant_name?: string;
  lease_type?: "commercial" | "residential";
  start_date?: string;
  end_date?: string;
  rent_amount?: number;
  deposit?: number;
  cam_rate?: number;
  utilities?: { electricity?: string; water?: string };
  status?: 'active' | 'expired' | 'terminated' | 'draft';
  created_at?: string;
  updated_at?: string;
}

interface LeaseFormProps {
  lease?: Lease;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lease: Partial<Lease>) => void;
  mode: 'create' | 'edit' | 'view';
}

const emptyFormData: Partial<Lease> = {
  lease_type: "commercial",
  site_id: "",
  space_id: "",
  partner_id: "",
  user_id: "",
  tenant_name: "",
  start_date: "",
  end_date: "",
  rent_amount: undefined,
  deposit: undefined,
  cam_rate: undefined,
  utilities: { electricity: undefined, water: undefined },
  status: "draft"
};

export function LeaseForm({ lease, isOpen, onClose, onSave, mode }: LeaseFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Lease>>(emptyFormData);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [spaceList, setSpaceList] = useState<any[]>([]);
  const [partnerList] = useState<any[]>([]); // plug your partner lookup later if needed

  const isReadOnly = mode === 'view';

  useEffect(() => {
    setFormData(lease ? {
      ...emptyFormData,
      ...lease,
      utilities: {
        electricity: lease?.utilities?.electricity,
        water: lease?.utilities?.water
      }
    } : emptyFormData);
  }, [lease, isOpen]);

  useEffect(() => { loadSiteLookup(); }, []);
  useEffect(() => { loadSpaceLookup(formData.site_id); }, [formData.site_id]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  };

  const loadSpaceLookup = async (site_id?: string) => {
    const lookup = await spacesApiService.getSpaceLookup(site_id);
    setSpaceList(lookup);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.site_id || !formData.space_id || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Site, Space, Start and End Date are required",
        variant: "destructive"
      });
      return;
    }

    const payload: Partial<Lease> = {
      id: lease?.id,
      lease_type: formData.lease_type,
      site_id: formData.site_id,
      space_id: formData.space_id,
      partner_id: formData.lease_type === "commercial" ? formData.partner_id : undefined,
      user_id:     formData.lease_type === "residential" ? formData.user_id   : undefined,
      tenant_name: formData.tenant_name,
      start_date:  formData.start_date,
      end_date:    formData.end_date,
      rent_amount: formData.rent_amount,
      deposit:     formData.deposit,
      cam_rate:    formData.cam_rate,
      utilities: {
        electricity: formData.utilities?.electricity,
        water:       formData.utilities?.water
      },
      status:      formData.status,
      updated_at:  new Date().toISOString(),
    };

    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? "Create New Lease" : mode === 'edit' ? "Edit Lease" : "Lease Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Site *</Label>
              <Select value={formData.site_id} onValueChange={(v)=> setFormData({...formData, site_id: v})} disabled={isReadOnly}>
                <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                <SelectContent>
                  {siteList.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lease Type</Label>
              <Select value={formData.lease_type} onValueChange={(v)=> setFormData({...formData, lease_type: v as any})} disabled={isReadOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Space *</Label>
              <Select value={formData.space_id} onValueChange={(v)=> setFormData({...formData, space_id: v})} disabled={isReadOnly}>
                <SelectTrigger><SelectValue placeholder="Select space" /></SelectTrigger>
                <SelectContent>
                  {spaceList.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name || s.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Partner (commercial)</Label>
              <Input
                placeholder="Partner ID (optional)"
                value={formData.partner_id || ""}
                onChange={e=> setFormData({...formData, partner_id: e.target.value})}
                disabled={isReadOnly || formData.lease_type !== 'commercial'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Resident/User (residential)</Label>
              <Input
                placeholder="User ID (optional)"
                value={formData.user_id || ""}
                onChange={e=> setFormData({...formData, user_id: e.target.value})}
                disabled={isReadOnly || formData.lease_type !== 'residential'}
              />
            </div>

            <div>
              <Label>Tenant Name</Label>
              <Input
                placeholder="Display name"
                value={formData.tenant_name || ""}
                onChange={e=> setFormData({...formData, tenant_name: e.target.value})}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input type="date" value={formData.start_date || ""} onChange={e=> setFormData({...formData, start_date: e.target.value})} disabled={isReadOnly} />
            </div>
            <div>
              <Label>End Date *</Label>
              <Input type="date" value={formData.end_date || ""} onChange={e=> setFormData({...formData, end_date: e.target.value})} disabled={isReadOnly} />
            </div>
            <div>
              <Label>Rent Amount</Label>
              <Input type="number" value={formData.rent_amount ?? ""} onChange={e=> setFormData({...formData, rent_amount: Number(e.target.value)})} disabled={isReadOnly} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Deposit</Label>
              <Input type="number" value={formData.deposit ?? ""} onChange={e=> setFormData({...formData, deposit: Number(e.target.value)})} disabled={isReadOnly} />
            </div>
            <div>
              <Label>CAM Rate (per sq ft)</Label>
              <Input type="number" value={formData.cam_rate ?? ""} onChange={e=> setFormData({...formData, cam_rate: Number(e.target.value)})} disabled={isReadOnly} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v)=> setFormData({...formData, status: v as any})} disabled={isReadOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Utilities split into two simple selects */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Electricity</Label>
              <Select
                value={formData.utilities?.electricity || ""}
                onValueChange={(v)=> setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, electricity: v } }))}
                disabled={isReadOnly}
              >
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="submeter">Submeter</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Water</Label>
              <Select
                value={formData.utilities?.water || ""}
                onValueChange={(v)=> setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, water: v } }))}
                disabled={isReadOnly}
              >
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="submeter">Submeter</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && <Button type="submit">{mode === 'create' ? 'Create Lease' : 'Update Lease'}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
