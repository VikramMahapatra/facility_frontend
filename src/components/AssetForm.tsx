// components/AssetForm.tsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { assetApiService } from '@/services/maintenance_assets/assetsapi';
import { siteApiService } from '@/services/spaces_sites/sitesapi';

export interface AssetFormValues {
  id?: string;
  org_id?: string;
  site_id: string;
  space_id?: string | null;
  category_id?: string | null;           // optional if you store ID
  category_name?: string | null;         // for display / choose by name
  tag: string;
  name: string;
  serial_no?: string;
  model?: string;
  manufacturer?: string;
  purchase_date?: string;                // ISO date (yyyy-mm-dd)
  warranty_expiry?: string;              // ISO date
  cost?: number;
  attributes?: Record<string, any>;
  status?: string;                       // "active" | "retired" | "in_repair" | ...
}

type Mode = 'create' | 'edit' | 'view';

interface Props {
  isOpen: boolean;
  mode: Mode;
  asset?: AssetFormValues;
  onClose: () => void;
  onSave: (values: Partial<AssetFormValues>) => void;
}

const empty: AssetFormValues = {
  site_id: '',
  tag: '',
  name: '',
  status: 'active',
};

export function AssetForm({ isOpen, mode, asset, onClose, onSave }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<AssetFormValues>(empty);

  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  const readOnly = mode === 'view';

  useEffect(() => {
    setForm(asset ? { ...empty, ...asset } : empty);
  }, [asset, isOpen]);

  useEffect(() => {
    (async () => {
      try {
        const [siteLookup, cats, stats] = await Promise.all([
          siteApiService.getSiteLookup(),
          assetApiService.getCategories(),
          assetApiService.getStatuses(),
        ]);
        setSites(siteLookup || []);
        setCategories(cats || []);
        setStatuses(stats || []);
      } catch {
        toast({ title: 'Failed to load lookups', variant: 'destructive' });
      }
    })();
  }, [toast]);

  const update = (patch: Partial<AssetFormValues>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tag || !form.name || !form.site_id) {
      toast({ title: 'Code, Name and Site are required', variant: 'destructive' });
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Asset' : mode === 'edit' ? 'Edit Asset' : 'Asset Details'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Asset Tag *</Label>
              <Input
                value={form.tag}
                onChange={(e) => update({ tag: e.target.value })}
                disabled={readOnly}
                placeholder="e.g., CH-01, PUMP-12"
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                disabled={readOnly}
                placeholder="Chiller 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Site *</Label>
              <Select
                value={form.site_id}
                onValueChange={(v) => update({ site_id: v })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category_name || ''}
                onValueChange={(v) => update({ category_name: v })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Serial No.</Label>
              <Input
                value={form.serial_no || ''}
                onChange={(e) => update({ serial_no: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={form.model || ''}
                onChange={(e) => update({ model: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label>Manufacturer</Label>
              <Input
                value={form.manufacturer || ''}
                onChange={(e) => update({ manufacturer: e.target.value })}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Purchase Date</Label>
              <Input
                type="date"
                value={form.purchase_date || ''}
                onChange={(e) => update({ purchase_date: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label>Warranty Expiry</Label>
              <Input
                type="date"
                value={form.warranty_expiry || ''}
                onChange={(e) => update({ warranty_expiry: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label>Cost</Label>
              <Input
                type="number"
                value={form.cost ?? ''}
                onChange={(e) => update({ cost: e.target.value ? Number(e.target.value) : undefined })}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={form.status || ''}
                onValueChange={(v) => update({ status: v })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && <Button type="submit">{mode === 'create' ? 'Create Asset' : 'Update Asset'}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
