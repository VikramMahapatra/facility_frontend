import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VendorFormValues, vendorSchema } from "@/schemas/vendor.schema";
import { toast } from "sonner";
import { vendorsApiService } from "@/services/pocurments/vendorsapi";
import { ChevronsUpDown, X } from "lucide-react";
import PhoneInput from "react-phone-input-2";

interface VendorFormProps {
  vendor?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendor: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

const emptyFormData: VendorFormValues = {
  name: "",
  gst_vat_id: "",
  status: "",
  categories: [],
  contact: {
    name: "",
    email: "",
    phone: "",
    address: "",
  },
};

export function VendorForm({ vendor, isOpen, onClose, onSave, mode }: VendorFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid },
    trigger,
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [statusList, setStatusList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  const selectedCategories = watch("categories") || [];

  useEffect(() => {
    if (vendor && mode !== "create") {
      reset({
        name: vendor.name || "",
        gst_vat_id: vendor.gst_vat_id || "",
        status: vendor.status || "",
        categories: vendor.categories || [],
        contact: vendor.contact || {
          name: "",
          email: "",
          phone: "",
          address: "",
        },
      });
    
      setTimeout(() => trigger(), 100);
    } else {
      reset(emptyFormData);
    }
    loadStatusLookup();
    loadCategoriesLookup();
  }, [vendor, mode, reset, trigger]);

  const loadStatusLookup = async () => {
  const response = await vendorsApiService.getStatusLookup();
  if (response.success) setStatusList(response.data || []);
};

const loadCategoriesLookup = async () => {
  const response = await vendorsApiService.getCategoriesLookup();
  if (response.success) setCategoriesList(response.data || []);
};

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = getValues("categories") || [];
    const isSelected = currentCategories.includes(categoryId);
    
    if (isSelected) {
      setValue("categories", currentCategories.filter((id: string) => id !== categoryId));
    } else {
      setValue("categories", [...currentCategories, categoryId]);
    }
  };

  const handleCategoryRemove = (categoryId: string) => {
    const currentCategories = getValues("categories") || [];
    setValue("categories", currentCategories.filter((id: string) => id !== categoryId));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesList.find(c => (c.id ?? c.value ?? c).toString() === categoryId);
    return category?.name ?? category?.label ?? category ?? categoryId;
  };

  const onSubmitForm = async (data: VendorFormValues) => {
    const formResponse = await onSave({
      ...vendor,
      ...data,
    });
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Vendor"}
            {mode === "edit" && "Edit Vendor"}
            {mode === "view" && "Vendor Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={isSubmitting ? undefined : handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Vendor Details Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={isReadOnly}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_vat_id">GST/VAT ID</Label>
              <Input
                id="gst_vat_id"
                {...register("gst_vat_id")}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusList.map((s: any) => (
                        <SelectItem key={(s.id ?? s.value ?? s).toString()} value={(s.id ?? s.value ?? s).toString()}>
                          {s.name ?? s.label ?? s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryPopoverOpen}
                        className="w-full justify-between"
                        disabled={isReadOnly}
                      >
                        {selectedCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedCategories.slice(0, 2).map((categoryId: string) => (
                              <Badge key={categoryId} variant="secondary" className="text-xs">
                                {getCategoryName(categoryId)}
                              </Badge>
                            ))}
                            {selectedCategories.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{selectedCategories.length - 2} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          "Select categories..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-1">
                          {categoriesList.map((c: any) => {
                            const categoryId = (c.id ?? c.value ?? c).toString();
                            const categoryName = c.name ?? c.label ?? c;
                            const isSelected = selectedCategories.includes(categoryId);
                            
                            return (
                              <div
                                key={categoryId}
                                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                                onClick={() => handleCategoryToggle(categoryId)}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleCategoryToggle(categoryId)}
                                />
                                <span className="text-sm">{categoryName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Selected Categories Display */}
                  {selectedCategories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedCategories.map((categoryId: string) => (
                        <Badge key={categoryId} variant="secondary" className="text-xs">
                          {getCategoryName(categoryId)}
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleCategoryRemove(categoryId)}
                              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Contact Information Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Contact Info:</h3>
            <div className="space-y-2">
              <Label htmlFor="contact.name">Contact Name</Label>
              <Input
                id="contact.name"
                {...register("contact.name")}
                disabled={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact.email">Email</Label>
                <Input
                  id="contact.email"
                  type="email"
                  {...register("contact.email")}
                  disabled={isReadOnly}
                  className={errors.contact?.email ? 'border-red-500' : ''}
                />
                {errors.contact?.email && (
                  <p className="text-sm text-red-500">{errors.contact.email.message}</p>
                )}
              </div>
              <Controller
                name="contact.phone"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="contact.phone">Phone</Label>
                    <PhoneInput
                      country={'in'}
                      value={field.value || ""}
                      onChange={(value) => {
                        const digits = value.replace(/\D/g, "");
                        const finalValue = "+" + digits;
                        field.onChange(finalValue);
                      }}
                      disabled={isReadOnly}
                      inputProps={{
                        name: 'contact.phone',
                        required: false,
                      }}
                      containerClass="w-full relative"
                      inputClass={`!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm ${errors.contact?.phone ? '!border-red-500' : ''}`}
                      buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                      dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                      enableSearch={true}
                    />
                    {errors.contact?.phone && (
                      <p className="text-sm text-red-500">{errors.contact.phone.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact.address">Address</Label>
              <Textarea
                id="contact.address"
                {...register("contact.address")}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Vendor" : "Update Vendor"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}