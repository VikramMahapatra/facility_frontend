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
import { withFallback } from '@/helpers/commonHelper';
import { AsyncAutocompleteRQ } from './common/async-autocomplete-rq';


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
    watch,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [formLoading, setFormLoading] = useState(true);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const readOnly = mode === 'view';

  const loadAll = async () => {
    setFormLoading(true);

   

    reset(
      asset && mode !== "create"
        ? {
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
          }
        : emptyFormData
    );

    setFormLoading(false);
    await Promise.all([loadSites(), loadCategories(), loadStatuses()]);
  };

  


  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [asset, mode, isOpen, reset]);

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
    const assetData: any = {
      ...asset,
      ...data,
    };
    if (assetData.space_id === "" || !assetData.space_id) {
      assetData.space_id = null;
    }
    
    if (assetData.attributes === "" || assetData.attributes === undefined) {
      assetData.attributes = null;
    }
    
    await onSave(assetData as Partial<Asset>);
  };

  const handleClose = () => {
    reset(emptyFormData);
    onClose();
  };


  const fallbackCategories = asset?.category_id
    ? {
        id: asset.category_id,
        name: asset.category_name,
        value: asset.category_id,
      }
    : null;
  const categoriesWithFallback = withFallback(categories, fallbackCategories);

  const fallbackStatuses = asset?.status
    ? {
        id: asset.status,
        name: asset.status,
        value: asset.status,
      }
    : null;

  const statusesWithFallback = withFallback(statuses, fallbackStatuses);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Asset' : mode === 'edit' ? 'Edit Asset' : 'Asset Details'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
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
                  <AsyncAutocompleteRQ
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={readOnly}
                    placeholder="Select site"
                    queryKey={["sites"]}
                    queryFn={async (search) => {
                      const response = await siteApiService.getSiteLookup(search);
                      return response.data.map((s: any) => ({
                        id: s.id,
                        label: s.name,
                      }));
                    }}
                    fallbackOption={
                      asset?.site_id
                        ? {
                            id: asset.site_id,
                            label: asset.name || `Site (${asset.site_id.slice(0, 6)})`,
                          }
                        : undefined
                    }
                    minSearchLength={1}
                  />
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
                  <Label htmlFor="category_id">Category *</Label>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={readOnly}
                  >
                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesWithFallback.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-red-500">{errors.category_id.message}</p>
                  )}
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
                placeholder="e.g., SN123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                {...register("model")}
                disabled={readOnly}
                placeholder="e.g., Model x-2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                {...register("manufacturer")}
                disabled={readOnly}
                placeholder="e.g., abc Corporation"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date *</Label>
              <Input
                id="purchase_date"
                type="date"
                {...register("purchase_date", {
                  onChange: () => trigger("warranty_expiry"),
                })}
                disabled={readOnly}
                className={errors.purchase_date ? "border-red-500" : ""}
              />
              {errors.purchase_date && (
                <p className="text-sm text-red-500">
                  {errors.purchase_date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_expiry">Warranty Expiry *</Label>
              <Input
                id="warranty_expiry"
                type="date"
                {...register("warranty_expiry")}
                disabled={readOnly}
                className={errors.warranty_expiry ? "border-red-500" : ""}
              />
              {errors.warranty_expiry && (
                <p className="text-sm text-red-500">
                  {errors.warranty_expiry.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost *</Label>
              <Input
                id="cost"
                type="number"
                {...register("cost", { setValueAs: (v) => v === '' ? undefined : Number(v) })}
                disabled={readOnly}
                className={errors.cost ? 'border-red-500' : ''}
                min="0.01"
                step="0.01"
                placeholder="e.g., 5000.00"
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
                      {statusesWithFallback.map((s) => (
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
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
