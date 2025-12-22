import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Edit, Mail, Phone, Star, Building, Filter, User, MapPin, Trash2 } from "lucide-react";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { vendorsApiService } from "@/services/procurements/vendorsapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import { VendorForm } from "@/components/VendorForm";
import { Pagination } from "@/components/Pagination";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";

export default function Vendors() {
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
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const resource = "vendors"; // must match resource name from backend policies


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

  // build query params - same pattern as site
  const params = new URLSearchParams();
  if (searchTerm) params.append("search", searchTerm);
  if (statusFilter !== "all") params.append("status", statusFilter);
  if (categoryFilter !== "all") params.append("category", categoryFilter);
  params.append("skip", skip.toString());
  params.append("limit", limit.toString());

  const response = await withLoader(async () => {
    return await vendorsApiService.getVendors(params);
  });
  
  if (response?.success) {
    setVendors(response.data?.vendors || []);
    setTotalItems(response.data?.total || 0);
  }
};

  const loadOverview = async () => {
  const response = await withLoader(async () => {
    return await vendorsApiService.getVendorsOverview();
  });
  
  if (response?.success) {
    // Map API response to expected format
    const overviewData = {
      total_vendors: response.data?.totalVendors || 0,
      active_vendors: response.data?.activeVendors || 0,
      avg_rating: response.data?.avgRating || 0,
      distinct_categories: response.data?.Categories || 0
    };
    
    setOverview(overviewData);
  }
};
  const loadStatusLookup = async () => {
    const lookup = await withLoader(async () => {
      return await vendorsApiService.getStatusLookup();
    });
  if (lookup?.success) setStatusList(lookup.data || []);
};

const loadCategoriesLookup = async () => {
  const lookup = await withLoader(async () => {
    return await vendorsApiService.getCategoriesLookup();
  });
  if (lookup?.success) setCategoriesList(lookup.data || []); 
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
    const response = await vendorsApiService.deleteVendor(deleteVendorId);

    if (response.success) {
      // Success - refresh data
      updateVendorsPage();
      setDeleteVendorId(null);
      toast.success("Vendor has been deleted successfully.");
    } else {
      const errorMessage = response?.data?.message || "Failed to delete vendor";
      toast.error(errorMessage);
    }

    setDeleteVendorId(null);
  }
};

  const handleSave = async (vendorData: any) => {
  let response;
  if (formMode === "create") {
    const vendorPayload = {
      ...vendorData,
      rating: undefined,
    };
    response = await vendorsApiService.addVendor(vendorPayload);

    if (response.success)
      updateVendorsPage();
  } else if (formMode === "edit" && selectedVendor) {
    const updatedVendor = {
      ...selectedVendor,
      ...vendorData,
      rating: undefined,
      updated_at: new Date().toISOString(),
    };
    response = await vendorsApiService.updateVendor(updatedVendor);

    if (response.success) {
      setVendors((prev) =>
        prev.map((v) => (v.id === updatedVendor.id ? response.data : v))
      );
    }
  }

  if (response.success) {
    setIsCreateDialogOpen(false);
    toast.success(
      `Vendor ${vendorData.name || ""} has been ${formMode === "create" ? "created" : "updated"} successfully.`
    );
  }
  return response;
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
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Building className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">
                Vendors
              </h1>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.account_type}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

          </header>


          <div className="flex-1 space-y-6 p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                  All Vendors
                </h2>
                <p className="text-muted-foreground">
                  Manage your vendor relationships
                </p>
              </div>
              {canWrite(resource) && (
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Vendor
                </Button>
              )}
            </div>

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

              <ContentContainer>
                <LoaderOverlay />
                <div className="space-y-6">
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
                                {Array.isArray(vendor.categories) && vendor.categories.slice(0, 2).map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                                {Array.isArray(vendor.categories) && vendor.categories.length > 2 && (
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
                                {canWrite(resource) && <Button size="sm" variant="outline" onClick={() => handleEdit(vendor)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                 }
                                 {canDelete(resource) &&
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(vendor.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
}
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
                </div>
              </ContentContainer>
            </div>
          </div>
        </SidebarInset>
      </div>

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
    </SidebarProvider>
  );
}