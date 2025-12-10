import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assetCategorySchema,
  AssetCategoryFormValues,
} from "@/schemas/assetCategory.schema";
import { assetCategoriesApiService } from "@/services/maintenance_assets/assetcategoriesapi";

interface AssetCategoryFormProps {
  category?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: AssetCategoryFormValues = {
  name: "",
  code: "",
  parent_id: "",
  attributes: undefined,
};

export default function AssetCategoryForm({
  category,
  isOpen,
  onClose,
  onSave,
  mode,
}: AssetCategoryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssetCategoryFormValues>({
    resolver: zodResolver(assetCategorySchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [formLoading, setFormLoading] = useState(true);
  const [parentCategoryList, setParentCategoryList] = useState<any[]>([]);

  const loadAll = async () => {
    await loadParentCategoryLookup();
    setFormLoading(false);
    reset(
      category
        ? {
            name: category.name || "",
            code: category.code || "",
            parent_id: category.parent_id || "",
            attributes: category.attributes || undefined,
          }
        : emptyFormData
    );
  };

  const loadParentCategoryLookup = async () => {
    const categoryId = mode === "edit" && category ? category.id : undefined;
    const lookup = await assetCategoriesApiService.getAssetParentCategoryLookup(categoryId);
    if (lookup.success) setParentCategoryList(lookup.data || []);
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [category, mode, isOpen, reset]);

  const onSubmitForm = async (data: AssetCategoryFormValues) => {
    const submitData: any = {
      name: data.name,
      code: data.code,
      parent_id: data.parent_id && data.parent_id !== "" ? data.parent_id : null,
      attributes: data.attributes || "",
    };
    await onSave(submitData);
  };

  const isReadOnly = mode === "view";

  return (
    <form
      onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)}
      className="space-y-4"
    >
      {formLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., HVAC Equipment"
              className={errors.name ? "border-red-500" : ""}
              disabled={isReadOnly}
              maxLength={128}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="e.g., HVAC-001"
              className={errors.code ? "border-red-500" : ""}
              disabled={isReadOnly}
              maxLength={32}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="parent_id">Parent Category</Label>
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category " />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {parentCategoryList.map((parent: any) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parent_id && (
                  <p className="text-sm text-red-500">
                    {errors.parent_id.message}
                  </p>
                )}
              </div>
            )}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                  ? "Create "
                  : "Update "}
              </Button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
