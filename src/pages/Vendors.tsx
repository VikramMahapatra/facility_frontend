import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Edit, Mail, Phone, Star, Building, Filter, User, MapPin, Trash2 } from "lucide-react";
import { vendorsApiService } from "@/services/procurement/vendorsapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { VendorForm } from "@/components/VendorForm";
import { Pagination } from "@/components/Pagination";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Vendors() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [overview, setOverview] = useState({ total_vendors: 0, active_vendors: 0, avg_rating: 0, distinct_categories: 0 });
  const [statusList, setStatusList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(7);
  const [totalItems, setTotalItems] = useState(0);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedVendor, setSelectedVendor] = useState<any | undefined>();
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);

  useEffect(() => {
    loadStatusLookup();
    loadCategoriesLookup();
    loadOverview();
  }, []);

  useSkipFirstEffect(() => {
    loadVendors();
  }, [page]);

  useEffect(() => {
    updateVendorsPage();
  }, [searchTerm, statusFilter, categoryFilter]);

  const updateVendorsPage = () => {
    if (page === 1) {
      loadVendors();
      loadOverview();
    } else {
      setPage(1);
    }
  };

  const loadVendors = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (categoryFilter !== "all") params.append("category", categoryFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await vendorsApiService.getVendors(params);
    const vendorsList = response.vendors || [];
    setVendors(vendorsList);
    setTotalItems(response.total || 0);
  };

  const loadOverview = async () => {
    const response = await vendorsApiService.getVendorsOverview();
    
    // Map API response to expected format
    const overviewData = {
      total_vendors: response?.totalVendors || 0,
      active_vendors: response?.activeVendors || 0,
      avg_rating: response?.avgRating || 0,
      distinct_categories: response?.Categories || 0
    };
    
    setOverview(overviewData);
  };

  const loadStatusLookup = async () => {
    const lookup = await vendorsApiService.getVendorsStatusLookup();
    setStatusList(lookup || []);
  };

  const loadCategoriesLookup = async () => {
    const lookup = await vendorsApiService.getVendorsCatgoriesLookup();
    setCategoriesList(lookup || []);
  };

  const handleCreate = () => {
    setSelectedVendor(undefined);
    setFormMode("create");
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (vendor: any) => {
    setSelectedVendor(vendor);
    setFormMode("edit");
    setIsCreateDialogOpen(true);
  };

  const handleView = (vendor: any) => {
    setSelectedVendor(vendor);
    setFormMode("view");
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (vendorId: string) => {
    setDeleteVendorId(vendorId);
  };

  const confirmDelete = async () => {
    if (deleteVendorId) {
      try {
        await vendorsApiService.deleteVendors(deleteVendorId);
        updateVendorsPage();
        setDeleteVendorId(null);
        toast({
          title: "Vendor Deleted",
          description: "Vendor has been deleted successfully.",
        });
        setDeleteVendorId(null);

      } catch (error) {
        toast({
          title: "Techical Error!",
          variant: "destructive",
        });
      }

    }
  };

  const handleSave = async (vendorData: any) => {
    try {
      if (formMode === "create") {
        await vendorsApiService.addVendors(vendorData);
      } else if (formMode === "edit" && selectedVendor) {
        await vendorsApiService.updateVendors({ ...selectedVendor, ...vendorData });
      }
      setIsCreateDialogOpen(false);
      toast({
        title: formMode === "create" ? "Vendor Created" : "Vendor Updated",
        description: `Vendor ${vendorData.name || ""} has been ${formMode === "create" ? "created" : "updated"} successfully.`,
      });
      updateVendorsPage();
    } catch (error) {
      toast({ title: "Technical Error!", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Vendors</h1>
                  <p className="text-sm text-muted-foreground">Manage your vendor relationships</p>
                </div>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
                >
                  <option value="all">All Status</option>
                  {statusList.map((status: any) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{overview.total_vendors}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{overview.active_vendors}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{overview.avg_rating}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{overview.distinct_categories}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Vendors Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Directory</CardTitle>
                  <CardDescription>
                    Showing {vendors.length} vendors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Categories</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{vendor.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.gst_vat_id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {vendor.contact.name && (
                                <div className="flex items-center text-sm font-medium">
                                  <User className="w-3 h-3 mr-1" />
                                  {vendor.contact.name}
                                </div>
                              )}
                              {vendor.contact.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {vendor.contact.email}
                                </div>
                              )}
                              {vendor.contact.phone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {vendor.contact.phone}
                                </div>
                              )}
                              {vendor.contact.address && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  <span className="truncate max-w-[200px]" title={vendor.contact.address}>
                                    {vendor.contact.address}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {vendor.categories.slice(0, 2).map((category) => (
                                <Badge key={category} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {vendor.categories.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{vendor.categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getRatingStars(vendor.rating)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(vendor.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(vendor)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(vendor)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(vendor.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Pagination */}
              <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
              />
              
              <VendorForm
                vendor={selectedVendor}
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSave={handleSave}
                mode={formMode}
              />

              <AlertDialog open={!!deleteVendorId} onOpenChange={() => setDeleteVendorId(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this vendor? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}