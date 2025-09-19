import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { mockContacts, mockCommercialPartners, mockLeases, mockLeaseTenants, getContactById } from "@/data/mockLeasingData";
import { Plus, Search, Filter, Edit, Eye, Trash2, Users, Building2, Mail, Phone, MapPin } from "lucide-react";

const Tenants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Combine contacts and commercial partners
  const allTenants = [
    ...mockContacts.map(contact => ({
      ...contact,
      tenant_type: 'individual' as const,
      legal_name: contact.name,
      status: 'active' as const,
      contact_info: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        address: contact.address
      }
    })),
    ...mockCommercialPartners.map(partner => ({
      ...partner,
      tenant_type: 'commercial' as const,
      name: partner.legal_name,
      email: partner.contact.email,
      phone: partner.contact.phone,
      type: partner.type,
      contact_info: partner.contact
    }))
  ];

  const filteredTenants = allTenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || tenant.tenant_type === selectedType;
    const matchesStatus = selectedStatus === "all" || tenant.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "suspended": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTenantLeases = (tenantId: string, tenantType: 'individual' | 'commercial') => {
    if (tenantType === 'individual') {
      return mockLeases.filter(lease => lease.resident_id === tenantId);
    } else {
      return mockLeases.filter(lease => lease.partner_id === tenantId);
    }
  };

  const getTenantTypeColor = (type: string) => {
    switch (type) {
      case "individual": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "commercial": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "merchant": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "brand": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "kiosk": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const totalTenants = allTenants.length;
  const activeTenants = allTenants.filter(t => t.status === 'active').length;
  const commercialTenants = allTenants.filter(t => t.tenant_type === 'commercial').length;
  const individualTenants = allTenants.filter(t => t.tenant_type === 'individual').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Tenants</h1>
            </div>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    All registered tenants
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{activeTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commercial</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{commercialTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    Business tenants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Individual</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{individualTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    Individual tenants
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tenant
                </Button>
              </div>
            </div>

            {/* Tenants Grid */}
            <div className="grid gap-6">
              {filteredTenants.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      No tenants match your current filters. Try adjusting your search criteria.
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Tenant
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredTenants.map((tenant) => {
                  const tenantLeases = getTenantLeases(tenant.id, tenant.tenant_type);
                  
                  return (
                    <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {tenant.name}
                              <div className="flex gap-2">
                                <Badge className={getTenantTypeColor(tenant.tenant_type)}>
                                  {tenant.tenant_type}
                                </Badge>
                                {tenant.tenant_type === 'commercial' && 'type' in tenant && (
                                  <Badge className={getTenantTypeColor(tenant.type)}>
                                    {tenant.type}
                                  </Badge>
                                )}
                              </div>
                            </CardTitle>
                            <CardDescription>
                              {tenantLeases.length} active lease{tenantLeases.length !== 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(tenant.status)}>
                              {tenant.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Contact Information */}
                          <div className="space-y-3">
                            <div className="text-sm font-medium">Contact Information</div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{tenant.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{tenant.phone}</span>
                              </div>
                              {tenant.contact_info?.address && (
                                <div className="flex items-start gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <div>{tenant.contact_info.address.line1}</div>
                                    {tenant.contact_info.address.line2 && (
                                      <div>{tenant.contact_info.address.line2}</div>
                                    )}
                                    <div>
                                      {tenant.contact_info.address.city}, {tenant.contact_info.address.state} {tenant.contact_info.address.pincode}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Lease Information */}
                          <div className="space-y-3">
                            <div className="text-sm font-medium">Active Leases</div>
                            {tenantLeases.length > 0 ? (
                              <div className="space-y-2">
                                {tenantLeases.slice(0, 2).map((lease) => (
                                  <div key={lease.id} className="p-2 bg-muted rounded text-sm">
                                    <div className="font-medium">
                                      Lease {lease.id.slice(-6)}
                                    </div>
                                    <div className="text-muted-foreground">
                                      ₹{lease.rent_amount.toLocaleString()} • {lease.frequency}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                ))}
                                {tenantLeases.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{tenantLeases.length - 2} more lease{tenantLeases.length - 2 !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No active leases
                              </div>
                            )}
                          </div>
                        </div>

                        {tenant.tenant_type === 'commercial' && 'contact_info' in tenant && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium mb-1">Business Contact</div>
                            <div className="text-sm text-muted-foreground">
                              {tenant.contact_info.name} • {tenant.contact_info.email}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Tenants;