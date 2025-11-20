import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Clock, AlertCircle, ShieldCheck } from "lucide-react";
import { SLAPolicyForm } from "@/components/SLAPolicyForm";
import { mockSLAPolicies } from "@/data/mockSLAPoliciesData";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useLoader } from "@/context/LoaderContext";
import { useAuth } from "../context/AuthContext";
import { SLAPolicy } from "@/interfaces/sla_policy_interface";

export default function SLAPolicies() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPolicy, setSelectedPolicy] = useState<SLAPolicy | null>(null);
  const [allPolicies, setAllPolicies] = useState<SLAPolicy[]>(mockSLAPolicies);
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("all");
  const [siteList] = useState<any[]>([
    { id: "site-1", name: "Site 1" },
    { id: "site-2", name: "Site 2" },
  ]);
  const [deletePolicyId, setDeletePolicyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const resource = "sla_policies"; // must match resource name from backend policies

  useEffect(() => {
    loadPolicies();
  }, []);

  useSkipFirstEffect(() => {
    loadPolicies();
  }, [page]);

  useEffect(() => {
    updatePoliciesPage();
  }, [searchQuery, selectedSite, selectedOrganization]);

  const updatePoliciesPage = () => {
    if (page === 1) {
      loadPolicies();
    } else {
      setPage(1);
    }
  };


  const loadPolicies = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // For now using mock data, but structured to match API pattern
    const response = await withLoader(async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let filtered = [...allPolicies];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (policy) =>
            policy.service_category?.toLowerCase().includes(query) ||
            policy.organization_name?.toLowerCase().includes(query) ||
            policy.site_name?.toLowerCase().includes(query)
        );
      }

      if (selectedOrganization && selectedOrganization !== "all") {
        filtered = filtered.filter(
          (policy) => policy.organization_name === selectedOrganization
        );
      }

      if (selectedSite && selectedSite !== "all") {
        filtered = filtered.filter(
          (policy) => policy.site_name === selectedSite
        );
      }

      const paginated = filtered.slice(skip, skip + limit);

      return {
        success: true,
        data: {
          sla_policies: paginated,
          total: filtered.length
        }
      };
    });

    if (response?.success) {
      setPolicies(response.data?.sla_policies || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const totalPolicies = allPolicies.length;
  const activePolicies = allPolicies.filter((p) => p.active).length;
  const uniqueOrganizations = new Set(allPolicies.map((p) => p.organization_name).filter(Boolean)).size;
  const uniqueSites = new Set(allPolicies.map((p) => p.site_name).filter(Boolean)).size;
  const avgResponseTime = allPolicies.length > 0
    ? Math.round(allPolicies.reduce((sum, p) => sum + p.response_time_mins, 0) / allPolicies.length)
    : 0;

  const handleCreate = () => {
    setSelectedPolicy(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (policy: SLAPolicy) => {
    setSelectedPolicy(policy);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleSave = async (policyData: any) => {
    let response;
    if (formMode === "create") {
      const newPolicy: SLAPolicy = {
        id: String(Date.now()),
        organization_name: policyData.organization_name || undefined,
        service_category: policyData.service_category,
        site_name: policyData.site_name || undefined,
        site_id: policyData.site_id || undefined,
        default_contact: policyData.default_contact || undefined,
        escalation_contact: policyData.escalation_contact || undefined,
        response_time_mins: policyData.response_time_mins,
        resolution_time_mins: policyData.resolution_time_mins,
        escalation_time_mins: policyData.escalation_time_mins,
        active: policyData.active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAllPolicies((prev) => [newPolicy, ...prev]);
      
      if (page === 1) {
        loadPolicies();
      } else {
        setPage(1);
      }
      
      setIsFormOpen(false);
      toast.success("SLA Policy has been created successfully.");
      response = { success: true };
    } else if (formMode === "edit" && selectedPolicy) {
      const updatedPolicy: SLAPolicy = {
        ...selectedPolicy,
        ...policyData,
        updated_at: new Date().toISOString(),
      };
      setAllPolicies((prev) =>
        prev.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p))
      );
      
      setPolicies((prev) =>
        prev.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p))
      );
      
      setIsFormOpen(false);
      toast.success("SLA Policy has been updated successfully.");
      response = { success: true };
    }
    return response || { success: false };
  };

  const handleDelete = (policyId: string) => {
    setDeletePolicyId(policyId);
  };

  const confirmDelete = async () => {
    if (deletePolicyId) {
      setAllPolicies((prev) => prev.filter((p) => p.id !== deletePolicyId));
      updatePoliciesPage();
      toast.success("SLA Policy deleted successfully");
      setDeletePolicyId(null);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />

        <SidebarInset>
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
                <h1 className="text-lg font-semibold text-sidebar-primary">
                  Ticket Category SLA
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-sidebar-primary">
                    Ticket Category SLA
                  </h2>
                  <p className="text-muted-foreground">
                    Manage service level agreements for ticket categories.
                  </p>
                </div>
                {canWrite(resource) && (
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket Category SLA
                  </Button>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">Total SLA Policies</p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">{totalPolicies}</div>
                    <p className="text-sm text-blue-600">{activePolicies} active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">Organizations</p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">{uniqueOrganizations}</div>
                    <p className="text-sm text-blue-600">Across {uniqueSites} sites</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">Avg Response Time</p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">{formatTime(avgResponseTime)}</div>
                    <p className="text-sm text-blue-600">Average across all policies</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  {/* <div>
                    <CardTitle className="text-2xl font-semibold mb-1">SLA Policies</CardTitle>
                    <p className="text-sm text-muted-foreground mb-4">
                      Filter and manage SLA policies by organization and site.
                    </p>
                  </div> */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search by category, org, or site..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="All Organizations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Organizations</SelectItem>
                          {Array.from(new Set(allPolicies.map((p) => p.organization_name).filter(Boolean))).map((org) => (
                            <SelectItem key={org} value={org as string}>
                              {org}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedSite} onValueChange={setSelectedSite}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="All Sites" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sites</SelectItem>
                          {Array.from(new Set(allPolicies.map((p) => p.site_name).filter(Boolean))).map((site) => (
                            <SelectItem key={site} value={site as string}>
                              {site}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-md border">
                    <ContentContainer>
                      <LoaderOverlay />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Organization</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Service Category</TableHead>
                            <TableHead>Response Time</TableHead>
                            <TableHead>Resolution Time</TableHead>
                            <TableHead>Escalation Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {policies.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="text-center text-muted-foreground"
                              >
                                No SLA policies found
                              </TableCell>
                            </TableRow>
                          ) : (
                            policies.map((policy) => (
                              <TableRow key={policy.id}>
                                <TableCell className="font-medium">
                                  {policy.organization_name || "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {policy.site_name || "—"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium capitalize">
                                      {policy.service_category}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-blue-500" />
                                    {formatTime(policy.response_time_mins)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-green-500" />
                                    {formatTime(policy.resolution_time_mins)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-orange-500" />
                                    {formatTime(policy.escalation_time_mins)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={policy.active ? "default" : "secondary"}
                                  >
                                    {policy.active ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {canWrite(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(policy)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {canDelete(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(policy.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ContentContainer>
                  </div>
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

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {formMode === "create" ? "Create SLA Policy" : formMode === "edit" ? "Edit SLA Policy" : "SLA Policy Details"}
                  </DialogTitle>
                  <DialogDescription>
                    {formMode === "create"
                      ? "Create a new SLA policy for service categories."
                      : formMode === "edit"
                      ? "Update SLA policy details."
                      : "View SLA policy details."}
                  </DialogDescription>
                </DialogHeader>
                <SLAPolicyForm
                  policy={selectedPolicy}
                  isOpen={isFormOpen}
                  onClose={() => {
                    setIsFormOpen(false);
                    setSelectedPolicy(null);
                  }}
                  onSave={handleSave}
                  mode={formMode}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog
              open={!!deletePolicyId}
              onOpenChange={() => setDeletePolicyId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete SLA Policy</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this SLA policy? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

