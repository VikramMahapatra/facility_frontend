import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { SLAPolicyForm } from "@/components/SLAPolicyForm";
import { toast } from "sonner";
import { slaPoliciesApiService } from "@/services/ticketing_service/slapoliciesapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedPolicy, setSelectedPolicy] = useState<SLAPolicy | null>(null);
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [deletePolicyId, setDeletePolicyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [overview, setOverview] = useState<any>({
    total_sla_policies: 0,
    total_organizations: 0,
    average_response_time: 0,
  });
  const [siteList, setSiteList] = useState<any[]>([]);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const resource = "sla_policies"; // must match resource name from backend policies

  useEffect(() => {
    loadSiteLookup();
  }, []);

  useSkipFirstEffect(() => {
    loadPolicies();
    loadOverview();
  }, [page]);

  useEffect(() => {
    updatePoliciesPage();
  }, [searchQuery, selectedSite]);

  const loadSiteLookup = async () => {
    const lookup = await siteApiService.getSiteLookup();
    if (lookup.success) setSiteList(lookup.data || []);
  };

  const updatePoliciesPage = () => {
    if (page === 1) {
      loadPolicies();
      loadOverview();
    } else {
      setPage(1);
    }
  };

  const loadPolicies = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedSite && selectedSite !== "all") {
      params.append("site_id", selectedSite);
    }
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await slaPoliciesApiService.getSLAPolicies(params);
    });

    if (response?.success) {
      setPolicies(response.data?.sla_policies || response.data || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const loadOverview = async () => {
    const response = await slaPoliciesApiService.getSLAPoliciesOverview();
    if (response?.success) {
      setOverview(response.data || {});
    }
  };

  const totalPolicies = overview.total_sla_policies || 0;
  const activeslapolicies = overview.active_sla_policies || 0;
  const avgResponseTime = overview.average_response_time || 0;

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
      response = await slaPoliciesApiService.createSLAPolicy(policyData);
      if (response.success) updatePoliciesPage();
    } else if (formMode === "edit" && selectedPolicy) {
      const updatedPolicy = {
        ...selectedPolicy,
        ...policyData,
      };
      response = await slaPoliciesApiService.updateSLAPolicy(updatedPolicy);
      if (response.success) {
        loadOverview();
        setPolicies((prev) =>
          prev.map((p) => (p.id === updatedPolicy.id ? response.data : p))
        );
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `SLA Policy has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  const handleDelete = (policyId: string) => {
    setDeletePolicyId(policyId);
  };

  const confirmDelete = async () => {
    if (deletePolicyId) {
      const response = await slaPoliciesApiService.deleteSLAPolicy(
        deletePolicyId
      );
      if (response.success) {
        updatePoliciesPage();
        setDeletePolicyId(null);
        toast.success("SLA Policy deleted successfully");
      }
    }
  };

  const formatTime = (minutes: number) => {
    const totalMins = Math.round(minutes);
    if (totalMins < 60) return `${String(totalMins).padStart(2, "0")} min`;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${String(hours).padStart(1)} hr ${String(mins).padStart(
      2,
      "0"
    )} min`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
                <h1 className="text-lg font-semibold text-sidebar-primary">
                  Ticket Category SLA
                </h1>
              </div>
            </div>
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
                    Create Policy
                  </Button>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Total SLA Policies
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {totalPolicies}
                    </div>
                    <p className="text-sm text-blue-600">All policies</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Active SLA Policies
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {activeslapolicies}
                    </div>
                    <p className="text-sm text-blue-600">
                      Total Active SLA Policies
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-bold text-muted-foreground mb-3">
                      Avg Response Time
                    </p>
                    <div className="text-3xl font-bold text-sidebar-primary mb-1">
                      {formatTime(avgResponseTime)}
                    </div>
                    <p className="text-sm text-blue-600">
                      Average across all policies
                    </p>
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
                    <Select
                      value={selectedSite}
                      onValueChange={setSelectedSite}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Sites" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sites</SelectItem>
                        {siteList.map((site: any) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-md border">
                    <ContentContainer>
                      <LoaderOverlay />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Site</TableHead>
                            <TableHead>Service Category</TableHead>
                            <TableHead>Response Time</TableHead>
                            <TableHead>Resolution Time</TableHead>
                            <TableHead>Escalation Time</TableHead>
                            <TableHead>Reopen Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
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
                                  {policy.site_name || "-"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground capitalize">
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
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-purple-500" />
                                    {formatTime(policy.reopen_time_mins)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      policy.active ? "default" : "secondary"
                                    }
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
                    {formMode === "create"
                      ? "Create SLA Policy"
                      : formMode === "edit"
                      ? "Edit SLA Policy"
                      : "SLA Policy Details"}
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
