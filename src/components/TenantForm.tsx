import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { tenantsApiService } from "@/services/Leasing_Tenants/tenantsapi";
import { Tenant } from "@/interfaces/leasing_tenants_interface";

interface TenantFormProps {
  tenant?: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Partial<Tenant>) => void;
  mode: "create" | "edit" | "view";
}

const emptyFormData = {
  site_id: "",
  building_id: "",
  space_id: "",
  name: "",
  email: "",
  phone: "",
  tenant_type: "individual" as const,
  status: "active" as const,
  contact_info: {
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    },
  },
  type: "",
  legal_name: "",
};

export function TenantForm({
  tenant,
  isOpen,
  onClose,
  onSave,
  mode,
}: TenantFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Tenant>>(emptyFormData);
  const [siteList, setSiteList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [spaceList, setSpaceList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [typeList, setTypeList] = useState([]);

  useEffect(() => {
    if (tenant) {
      setFormData(tenant);
    } else {
      setFormData(emptyFormData);
    }
    loadSiteLookup();
    loadStatusLookup();
    loadTypeLookup();
  }, [tenant]);

  useEffect(() => {
    loadBuildingLookup();
  }, [formData.site_id]);

  useEffect(() => {
    loadSpaceLookup();
  }, [formData.site_id, formData.building_id]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    setSiteList(lookup);
  };

  const loadBuildingLookup = async () => {
    if (!formData.site_id) {
      setBuildingList([]);
      return;
    }
    const lookup = await buildingApiService.getBuildingLookup(formData.site_id);
    setBuildingList(lookup);
  };

  const loadSpaceLookup = async () => {
    if (!formData.building_id) {
      setSpaceList([]);
      return;
    }
    const lookup = await spacesApiService.getSpaceLookup(formData.site_id, formData.building_id);
    setSpaceList(lookup);
  };

  const loadStatusLookup = async () => {
    const lookup = await tenantsApiService.getTenantStatusLookup();
    setStatusList(lookup);
  };

  const loadTypeLookup = async () => {
    const lookup = await tenantsApiService.getTenantTypeLookup();
    setTypeList(lookup);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.site_id) {
      toast({
        title: "Validation Error",
        description: "Name, Email, Phone, and Site are required fields",
        variant: "destructive",
      });
      return;
    }

    let contactInfo = formData.contact_info;
    if (contactInfo) {
      const { name, email, phone, address } = contactInfo;

      contactInfo = {
        name: name?.trim() || undefined,
        email: email?.trim() || undefined,
        phone: phone?.trim() || undefined,
        address: {
          line1: address?.line1?.trim() || "",
          line2: address?.line2?.trim() || "",
          city: address?.city?.trim() || "",
          state: address?.state?.trim() || "",
          pincode: address?.pincode?.trim() || "",
        }
      };

      // if everything empty, drop contact_info
      if (!contactInfo.name && !contactInfo.email && !contactInfo.phone && !contactInfo.address) {
        contactInfo = undefined;
      }
    }

    const tenantData: any = {
      ...(tenant?.id && { id: tenant.id }), 
      name: formData.name?.trim(),
      email: formData.email?.trim(),
      phone: formData.phone?.trim(),
      tenant_type: formData.tenant_type,
      status: formData.status,
      site_id: formData.site_id,
      space_id: formData.space_id || undefined,
      building_block_id: formData.building_id || undefined, 
      contact_info: contactInfo,
      ...(formData.tenant_type === "commercial" && {
        type: formData.type || undefined,
        legal_name: formData.legal_name?.trim() || undefined,
      }),
    };

    onSave(tenantData);
  };


  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create New Tenant"}
            {mode === "edit" && "Edit Tenant"}
            {mode === "view" && "Tenant Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., John Smith"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="site">Site *</Label>
              <Select
                value={formData.site_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, site_id: value, building_id: "", space_id: "" })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {siteList.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="building">Building</Label>
              <Select
                value={formData.building_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, building_id: value, space_id: "" })
                }
                disabled={isReadOnly || !formData.site_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.site_id ? "Select building" : "Select site first"} />
                </SelectTrigger>
                <SelectContent>
                  {buildingList.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="space">Space</Label>
              <Select
                value={formData.space_id || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, space_id: value })
                }
                disabled={isReadOnly || !formData.building_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!formData.building_id ? "Select building first" : "Select space"} />
                </SelectTrigger>
                <SelectContent>
                  {spaceList.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="e.g., john@example.com"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="e.g., +91-9876543210"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tenant_type">Tenant Type</Label>
              <Select
                value={formData.tenant_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, tenant_type: value as "individual" | "commercial" })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "active" | "inactive" | "suspended" })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusList.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.tenant_type === "commercial" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="legal_name">Legal Name</Label>
                <Input
                  id="legal_name"
                  value={formData.legal_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, legal_name: e.target.value })
                  }
                  placeholder="e.g., ABC Company Ltd"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="type">Business Type</Label>
                <Select
                  value={formData.type || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value === "none" ? "" : value,
                    })
                  }
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Type</SelectItem>
                    <SelectItem value="merchant">Merchant</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                    <SelectItem value="kiosk">Kiosk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formData.tenant_type === "commercial" && (
            <div>
              <Label htmlFor="contact_info">Business Contact Information</Label>
              <div className="space-y-3 p-3 border rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name">Contact Name</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_info?.name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_info: {
                            ...formData.contact_info,
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Jane Doe"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_info?.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_info: {
                            ...formData.contact_info,
                            email: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., jane@company.com"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_info?.phone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_info: {
                          ...formData.contact_info,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., +91-9876543210"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="contact_info">Address Information</Label>
            <div className="space-y-3 p-3 border rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Line 1</Label>
                  <Input
                    value={formData.contact_info?.address?.line1 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_info: {
                          ...formData.contact_info,
                          address: {
                            ...formData.contact_info.address,
                            line1: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.contact_info?.address?.city || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_info: {
                          ...formData.contact_info,
                          address: {
                            ...formData.contact_info.address,
                            city: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State</Label>
                  <Input
                    value={formData.contact_info?.address?.state || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_info: {
                          ...formData.contact_info,
                          address: {
                            ...formData.contact_info.address,
                            state: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={formData.contact_info?.address?.pincode || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_info: {
                          ...(formData.contact_info),
                          address: {
                            ...formData.contact_info.address,
                            pincode: e.target.value,
                          },
                        },
                      })
                    }
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setFormData(emptyFormData);
              onClose();
            }}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button type="submit">
                {mode === "create" ? "Create Tenant" : "Update Tenant"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
