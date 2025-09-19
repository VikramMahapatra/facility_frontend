import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { mockLeases, mockSpaces, mockSites, mockCommercialPartners, mockContacts, getPartnerById, getContactById } from "@/data/mockLeasingData";
import { Plus, Search, Filter, Edit, Eye, Trash2, FileText, DollarSign, Calendar, Building2, Users } from "lucide-react";

const Leases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredLeases = mockLeases.filter(lease => {
    const matchesSearch = lease.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || lease.status === selectedStatus;
    const matchesSite = selectedSite === "all" || lease.site_id === selectedSite;
    const matchesType = selectedType === "all" || 
      (selectedType === "commercial" && lease.partner_id) ||
      (selectedType === "residential" && lease.resident_id);
    
    return matchesSearch && matchesStatus && matchesSite && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "expired": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "terminated": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "draft": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSpaceName = (spaceId: string) => {
    const space = mockSpaces.find(s => s.id === spaceId);
    return space ? `${space.code} - ${space.name || space.code}` : spaceId;
  };

  const getSiteName = (siteId: string) => {
    const site = mockSites.find(s => s.id === siteId);
    return site ? site.name : siteId;
  };

  const getTenantName = (lease: any) => {
    if (lease.partner_id) {
      const partner = getPartnerById(lease.partner_id);
      return partner ? partner.legal_name : 'Unknown Partner';
    } else if (lease.resident_id) {
      const contact = getContactById(lease.resident_id);
      return contact ? contact.name : 'Unknown Resident';
    }
    return 'Unknown Tenant';
  };

  const activeLeases = mockLeases.filter(l => l.status === 'active').length;
  const totalRentValue = mockLeases.reduce((sum, l) => sum + l.rent_amount, 0);
  const expiringLeases = mockLeases.filter(l => {
    const endDate = new Date(l.end_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return endDate <= threeMonthsFromNow && l.status === 'active';
  }).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Leases</h1>
            </div>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeLeases}</div>
                  <p className="text-xs text-muted-foreground">
                    Total active agreements
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Rent Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalRentValue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Combined rental income
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{expiringLeases}</div>
                  <p className="text-xs text-muted-foreground">
                    Within 3 months
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Lease Term</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.5 years</div>
                  <p className="text-xs text-muted-foreground">
                    Average duration
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
                    placeholder="Search leases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {mockSites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
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
                  Add Lease
                </Button>
              </div>
            </div>

            {/* Leases Grid */}
            <div className="grid gap-6">
              {filteredLeases.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No leases found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      No leases match your current filters. Try adjusting your search criteria.
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Lease
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredLeases.map((lease) => (
                  <Card key={lease.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {getTenantName(lease)}
                          </CardTitle>
                          <CardDescription>
                            {getSpaceName(lease.space_id)} • {getSiteName(lease.site_id)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(lease.status)}>
                            {lease.status}
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
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Rent Amount</div>
                          <div className="text-lg font-semibold">{formatCurrency(lease.rent_amount)}</div>
                          <div className="text-xs text-muted-foreground">per {lease.frequency}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Lease Term</div>
                          <div className="text-sm">
                            {new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.ceil((new Date(lease.end_date).getTime() - new Date(lease.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Deposit</div>
                          <div className="text-sm">
                            {lease.deposit_amount ? formatCurrency(lease.deposit_amount) : 'N/A'}
                          </div>
                          {lease.escalation && (
                            <div className="text-xs text-muted-foreground">
                              +{lease.escalation.pct}% every {lease.escalation.every_months}mo
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground">CAM Method</div>
                          <div className="text-sm capitalize">{lease.cam_method.replace('_', ' ')}</div>
                          {lease.cam_rate && (
                            <div className="text-xs text-muted-foreground">
                              Rate: {lease.cam_method === 'area_share' ? `₹${lease.cam_rate}/sq ft` : formatCurrency(lease.cam_rate)}
                            </div>
                          )}
                        </div>
                      </div>

                      {lease.revenue_share && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium">Revenue Share</div>
                          <div className="text-sm text-muted-foreground">
                            {lease.revenue_share.pct}% revenue share with minimum guarantee of {formatCurrency(lease.revenue_share.min_guarantee)}
                          </div>
                        </div>
                      )}

                      {lease.utilities && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Utilities</div>
                          <div className="flex gap-4 text-sm">
                            <span>Electricity: <span className="capitalize">{lease.utilities.electricity}</span></span>
                            <span>Water: <span className="capitalize">{lease.utilities.water}</span></span>
                            {lease.utilities.gas && (
                              <span>Gas: <span className="capitalize">{lease.utilities.gas}</span></span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Leases;