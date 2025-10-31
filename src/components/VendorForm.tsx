import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { vendorsApiService } from "@/services/pocurments/vendorsapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorFormProps {
  vendor?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendor: any) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData = {
  name: "",
  gst_vat_id: "",
  status: "active",
  categories: [] as string[],
  contact: {
    name: "",
    email: "",
    phone: "",
    address: "",
  },
};

export function VendorForm({ vendor, isOpen, onClose, onSave, mode }: VendorFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>(emptyFormData);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        ...emptyFormData,
        ...vendor,
        categories: vendor.categories || [],
      });
    } else {
      setFormData(emptyFormData);
    }
    loadStatusLookup();
    loadCategoriesLookup();
  }, [vendor]);

  const loadStatusLookup = async () => {
  const response = await vendorsApiService.getStatusLookup();
  if (response.success) setStatusList(response.data || []);
};

const loadCategoriesLookup = async () => {
  const response = await vendorsApiService.getCategoriesLookup();
  if (response.success) setCategoriesList(response.data || []);
};

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = formData.categories || [];
    const isSelected = currentCategories.includes(categoryId);
    
    if (isSelected) {
      setFormData({
        ...formData,
        categories: currentCategories.filter((id: string) => id !== categoryId)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...currentCategories, categoryId]
      });
    }
  };

  const handleCategoryRemove = (categoryId: string) => {
    const currentCategories = formData.categories || [];
    setFormData({
      ...formData,
      categories: currentCategories.filter((id: string) => id !== categoryId)
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesList.find(c => (c.id ?? c.value ?? c).toString() === categoryId);
    return category?.name ?? category?.label ?? category ?? categoryId;
  };

  const handleContactFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
      return;
    }
    try {
      const orgData = await organisationApiService.getOrg();
      const payload: any = {
        name: formData.name,
        gst_vat_id: formData.gst_vat_id,
        status: formData.status,
        categories: formData.categories,
        contact: formData.contact,
        org_id: orgData?.data?.id,
      };
      
      if (mode === "edit" && vendor?.id) {
        payload.id = vendor.id;
      }
      
      console.log("Vendor payload:", payload);
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
            {mode === "create" && "Create Vendor"}
            {mode === "edit" && "Edit Vendor"}
            {mode === "view" && "Vendor Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor Details Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Vendor Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={isReadOnly} />
            </div>
            <div>
              <Label htmlFor="gst">GST/VAT ID</Label>
              <Input id="gst" value={formData.gst_vat_id} onChange={(e) => setFormData({ ...formData, gst_vat_id: e.target.value })} disabled={isReadOnly} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })} disabled={isReadOnly}>
                <SelectTrigger>
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
            </div>
            <div>
              <Label>Category</Label>
              <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryPopoverOpen}
                    className="w-full justify-between"
                    disabled={isReadOnly}
                  >
                    {formData.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {formData.categories.slice(0, 2).map((categoryId: string) => (
                          <Badge key={categoryId} variant="secondary" className="text-xs">
                            {getCategoryName(categoryId)}
                          </Badge>
                        ))}
                        {formData.categories.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{formData.categories.length - 2} more
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
                        const isSelected = formData.categories.includes(categoryId);
                        
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
              {formData.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.categories.map((categoryId: string) => (
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
          </div>

          {/* Contact Information Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Contact Info:</h3>
            <div>
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input 
                id="contact_name" 
                value={formData.contact?.name || ""} 
                onChange={(e) => handleContactFieldChange("name", e.target.value)} 
                disabled={isReadOnly} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.contact?.email || ""} 
                  onChange={(e) => handleContactFieldChange("email", e.target.value)} 
                  disabled={isReadOnly} 
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.contact?.phone || ""} 
                  onChange={(e) => handleContactFieldChange("phone", e.target.value)} 
                  disabled={isReadOnly} 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                value={formData.contact?.address || ""} 
                onChange={(e) => handleContactFieldChange("address", e.target.value)} 
                disabled={isReadOnly} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && <Button type="submit">{mode === "create" ? "Create Vendor" : "Update Vendor"}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


