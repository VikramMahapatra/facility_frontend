import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Play,
  Mail,
  Phone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TenantForm } from "@/components/TenantForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/Pagination";
import { tenantsApiService } from "@/services/Leasing_Tenants/tenantsapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { Tenant, TenantOverview } from "@/interfaces/tenants_interface";

export default function Tenants() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTenantId, setDeleteTenantId] = useState<string | null>(
    null
  );
  const [selectedTenant, setSelectedTenant] = useState<
    Tenant | undefined
  >();
  const [tenantOverview, setTenantOverview] = useState<TenantOverview>({
    totalTenants: 0,
    activeTenants: 0,
    commercialTenants: 0,
    individualTenants: 0,
  });
  const [statusList, setStatusList] = useState([]);
  const [typeList, setTypeList] = useState([]);

  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);

  useSkipFirstEffect(() => {
    loadTenants();
    loadTenantOverview();
  }, [page]);

  useEffect(() => {
    loadStatusLookup();
    loadTypeLookup();
  }, []);

  useEffect(() => {
    updateTenantPage();
  }, [searchTerm, selectedSite, selectedStatus, selectedType]);

  const updateTenantPage = () => {
    if (page === 1) {
      loadTenants();
      loadTenantOverview();
    } else {
      setPage(1); // triggers the page effect
    }
  };

  const loadTenantOverview = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all")
      params.append("site_id", selectedSite);
    if (selectedStatus && selectedStatus !== "all")
      params.append("status", selectedStatus);
    if (selectedType && selectedType !== "all")
      params.append("type", selectedType);
    const response = await tenantsApiService.getTenantOverview(params);
    setTenantOverview(response);
  };

  const loadStatusLookup = async () => {
    const lookup = await tenantsApiService.getTenantStatusLookup();
    setStatusList(lookup || []);
  };

  const loadTypeLookup = async () => {
    const lookup = await tenantsApiService.getTenantTypeLookup();
    setTypeList(lookup || []);
  };

  const loadTenants = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedSite && selectedSite !== "all")
      params.append("site_id", selectedSite);
    if (selectedStatus && selectedStatus !== "all")
      params.append("status", selectedStatus);
    if (selectedType && selectedType !== "all")
      params.append("type", selectedType);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await tenantsApiService.getTenants(params);

    setTenants(response.tenants || []);
    setTotalItems(response.total || 0);
  };

  // Form handlers
  const handleCreate = () => {
    setSelectedTenant(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleView = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleDelete = (tenantId: string) => {
    setDeleteTenantId(tenantId);
  };

  const confirmDelete = async () => {
    if (deleteTenantId) {
      try {
        await tenantsApiService.deleteTenant(deleteTenantId);
        updateTenantPage();
        setDeleteTenantId(null);
        toast({
          title: "Tenant Deleted",
          description: "Tenant has been deleted successfully.",
        });
        setDeleteTenantId(null);
      } catch (error) {
        toast({
          title: "Technical Error!",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async (tenantData: Partial<Tenant>) => {
    try {
      if (formMode === "create") {
        await tenantsApiService.addTenant(tenantData);
      } else if (formMode === "edit" && selectedTenant) {
        const updatedTenant = { ...selectedTenant, ...tenantData };
        await tenantsApiService.updateTenant(
          selectedTenant.id!,
          updatedTenant
        );
      }
      setIsFormOpen(false);
      toast({
        title:
          formMode === "create" ? "Tenant Created" : "Tenant Updated",
        description: `Tenant ${tenantData.name} has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`,
      });
      updateTenantPage();
    } catch (error) {
      toast({
        title: "Technical Error!",
        variant: "destructive",
      });
    }
  };

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
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                  Tenants
                </h2>
                <p className="text-muted-foreground">
                  Manage tenant information and relationships
                </p>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Tenant
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
              >
                <option value="all">All Status</option>
                {statusList.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm w-[160px]"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tenants
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tenantOverview.totalTenants}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tenantOverview.activeTenants}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Commercial
                  </CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tenantOverview.commercialTenants}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Individual</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tenantOverview.individualTenants}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tenants Table */}
            <Card>
              <CardHeader>
                <CardTitle>Tenants</CardTitle>
                <CardDescription>
                  Manage tenant information and relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Business Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-muted-foreground">
                              #{tenant.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {tenant.email}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="w-4 h-4 mr-2" />
                              {tenant.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tenant.tenant_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {tenant.tenant_type === "commercial" && (
                              <>
                                <div className="font-medium">
                                  {tenant.legal_name || "No Legal Name"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {tenant.type || "No Type"}
                                </div>
                              </>
                            )}
                            {tenant.tenant_type === "individual" && (
                              <div className="text-sm text-muted-foreground">
                                Individual Tenant
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tenant.status === "active"
                                ? "default"
                                : tenant.status === "inactive"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {tenant.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(tenant)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(tenant)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(tenant.id!)}
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
          </div>
        </SidebarInset>
      </div>

      {/* Tenant Form Dialog */}
      <TenantForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
        tenant={selectedTenant}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteTenantId}
        onOpenChange={() => setDeleteTenantId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tenant? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}