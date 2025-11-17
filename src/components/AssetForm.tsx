// components/AssetForm.tsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssetFormValues, assetSchema } from '@/schemas/asset.schema';
import { toast } from "sonner";
import { assetApiService } from '@/services/maintenance_assets/assetsapi';
import { siteApiService } from '@/services/spaces_sites/sitesapi';
import { Asset } from '@/interfaces/assets_interface';

type Mode = 'create' | 'edit' | 'view';

interface Props {
  isOpen: boolean;
  mode: Mode;
  asset?: Asset;
  onClose: () => void;
  onSave: (values: Partial<Asset>) => void;
}

const emptyFormData: AssetFormValues = {
  site_id: '',
  tag: '',
  name: '',
  category_id: '',
  serial_no: '',
  model: '',
  manufacturer: '',
  purchase_date: '',
  warranty_expiry: '',
  cost: undefined,
  status: 'active',
};

export function AssetForm({ isOpen, mode, asset, onClose, onSave }: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const readOnly = mode === 'view';

  useEffect(() => {
    if (asset && mode !== "create") {
      reset({
        tag: asset.tag || "",
        name: asset.name || "",
        site_id: asset.site_id || "",
        category_id: asset.category_id || "",
        serial_no: asset.serial_no || "",
        model: asset.model || "",
        manufacturer: asset.manufacturer || "",
        purchase_date: asset.purchase_date || "",
        warranty_expiry: asset.warranty_expiry || "",
        cost: asset.cost,
        status: asset.status || "active",
      });
    } else {
      reset(emptyFormData);
    }
  }, [asset, mode, reset]);

  useEffect(() => {
    loadSites();
    loadCategories();
    loadStatuses();
  }, []);

  const loadSites = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) setSites(response.data || []);
  }

  const loadCategories = async () => {
    const response = await assetApiService.getCategories();
    if (response.success) setCategories(response.data || []);
  }

  const loadStatuses = async () => {
    const response = await assetApiService.getStatuses();
    if (response.success) setStatuses(response.data || []);
  }

  const onSubmitForm = async (data: AssetFormValues) => {
    try {
      await onSave({
        ...asset,
        ...data,
      } as Partial<Asset>);
      reset(emptyFormData);
      onClose();
    } catch (error) {
      reset(undefined, { keepErrors: true, keepValues: true });
      toast.error("Failed to save asset");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Asset' : mode === 'edit' ? 'Edit Asset' : 'Asset Details'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag">Asset Tag *</Label>
              <Input
                id="tag"
                {...register("tag")}
                disabled={readOnly}
                placeholder="e.g., CH-01, PUMP-12"
                className={errors.tag ? 'border-red-500' : ''}
              />
              {errors.tag && (
                <p className="text-sm text-red-500">{errors.tag.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={readOnly}
                placeholder="Chiller 1"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="site_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="site_id">Site *</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={readOnly}
                  >
                    <SelectTrigger className={errors.site_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.site_id && (
                    <p className="text-sm text-red-500">{errors.site_id.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial_no">Serial No.</Label>
              <Input
                id="serial_no"
                {...register("serial_no")}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                {...register("model")}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                {...register("manufacturer")}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                {...register("purchase_date")}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
              <Input
                id="warranty_expiry"
                type="date"
                {...register("warranty_expiry")}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                {...register("cost", { setValueAs: (v) => v === '' ? undefined : Number(v) })}
                disabled={readOnly}
                className={errors.cost ? 'border-red-500' : ''}
                min="0"
              />
              {errors.cost && (
                <p className="text-sm text-red-500">{errors.cost.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === 'create' ? 'Create Asset' : 'Update Asset'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
