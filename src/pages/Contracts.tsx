import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Eye, Edit, FileText, Calendar, Building, Filter, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { contractApiService } from "@/services/procurements/contractapi";
import { vendorsApiService } from "@/services/procurements/vendorsapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Pagination } from "@/components/Pagination";
import { toast } from "sonner";
import { ContractForm } from "@/components/ContractsForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [overview, setOverview] = useState({ total_contracts: 0, active_contracts: 0, expiring_soon: 0, total_value: 0 });
  const [statusList, setStatusList] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedContract, setSelectedContract] = useState<any | undefined>();
  const [deleteContractId, setDeleteContractId] = useState<string | null>(null);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const { user, handleLogout } = useAuth();
  const resource = "contracts"; // must match resource name from backend policies

  useEffect(() => {
    loadStatusLookup();
    loadTypeLookup();
    loadVendorLookup();
    loadOverview();
  }, []);

  useSkipFirstEffect(() => {
    loadContracts();
  }, [page]);

  useEffect(() => {
    updateContractsPage();
  }, [searchTerm, statusFilter, typeFilter]);

  const updateContractsPage = () => {
    if (page === 1) {
      loadContracts();
      loadOverview();
    } else {
      setPage(1);
    }
  };

  const loadContracts = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (typeFilter !== "all") params.append("type", typeFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await contractApiService.getContracts(params);
    });
    
    if (response?.success) {
      setContracts(response.data?.contracts || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const loadOverview = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (typeFilter !== "all") params.append("type", typeFilter);

    const response = await withLoader(async () => {
      return await contractApiService.getContractsOverview(params);
    });
    
    // Map API response to expected format
    const overviewData = {
      total_contracts: response?.data?.totalContracts || response?.data?.total_contracts || 0,
      active_contracts: response?.data?.activeContracts || response?.data?.active_contracts || 0,
      expiring_soon: response?.data?.expiringSoon || response?.data?.expiring_soon || 0,
      total_value: response?.data?.totalValue || response?.data?.total_value || 0
    };
    
    setOverview(overviewData);
  };

  const loadStatusLookup = async () => {
    const lookup = await withLoader(async () => {
      return await contractApiService.getStatusLookup();
    });
    if (lookup?.success) setStatusList(lookup.data || []);
  };

  const loadTypeLookup = async () => {
    const lookup = await withLoader(async () => {
      return await contractApiService.getTypeLookup();
    });
    if (lookup?.success) setTypeList(lookup.data || []);
  };

  const loadVendorLookup = async () => {
    const response = await withLoader(async () => {
      return await vendorsApiService.getVendorLookup();
    });
    if (response?.success) setVendorList(response.data || []);
    
  };

  const getVendorName = (vendorId: string) => {
    if (!vendorId) return "No Vendor";
    const vendor = vendorList.find((v: any) => v.id === vendorId);
    return vendor ? vendor.name : vendorId;
  };

  const handleCreate = () => {
    setSelectedContract(undefined);
    setFormMode("create");
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (contract: any) => {
    setSelectedContract(contract);
    setFormMode("edit");
    setIsCreateDialogOpen(true);
  };

  const handleView = (contract: any) => {
    setSelectedContract(contract);
    setFormMode("view");
    setIsCreateDialogOpen(true);
  };

 const handleDelete = (contractId: string) => {
  setDeleteContractId(contractId);
};

const confirmDelete = async () => {
  if (deleteContractId) {
    const response = await contractApiService.deleteContract(deleteContractId);

    if (response.success) {
      // Success - refresh data
      updateContractsPage();
      setDeleteContractId(null);
      toast.success("Contract has been deleted successfully.");
    } else {
      const errorMessage = response?.data?.message || "Failed to delete contract";
      toast.error(errorMessage);
    }

    setDeleteContractId(null);
  }
};

  const handleSave = async (contractData: any) => {
  let response;
  if (formMode === "create") {
    response = await contractApiService.addContract(contractData);

    if (response.success)
      updateContractsPage();
  } else if (formMode === "edit" && selectedContract) {
    const updatedContract = {
      ...selectedContract,
      ...contractData,
      updated_at: new Date().toISOString(),
    };
    response = await contractApiService.updateContract(updatedContract);

    if (response.success) {
      // Update the edited contract in local state
      setContracts((prev) =>
        prev.map((c) => (c.id === updatedContract.id ? response.data : c))
      );
    }
  }

  if (response?.success) {
    setIsCreateDialogOpen(false);
    setSelectedContract(undefined);
    setFormMode("create");
    toast.success(
      `Contract ${contractData.title || contractData.code || contractData.contract_number || ""} has been ${formMode === "create" ? "created" : "updated"} successfully.`
    );
  }
  return response;
};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      expired: 'destructive',
      terminated: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'expired') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">
                Contracts
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
                  All Contracts
                </h2>
                <p className="text-muted-foreground">
                  Manage vendor contracts and agreements
                </p>
              </div>
              {canWrite(resource) && (
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Contract
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusList.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {typeList.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ContentContainer>
                <LoaderOverlay />
                <div className="space-y-6">
                  {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.total_contracts}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.active_contracts}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.expiring_soon}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(overview.total_value)}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contracts Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Management</CardTitle>
                    <CardDescription>
                      Showing {contracts.length} contracts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contracts.map((contract) => (
                          <TableRow key={contract.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{contract.title}</div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {contract.documents?.length || 0} document(s)
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{getVendorName(contract.vendor_name)}</div>
                                <div className="text-sm text-muted-foreground">
                                  SLA: {contract.terms?.sla?.response_hrs || 'N/A'}h response
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{contract.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{formatDate(contract.start_date)}</div>
                                <div className="text-muted-foreground">to {formatDate(contract.end_date)}</div>
                                {contract.status === 'active' && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {getDaysUntilExpiry(contract.end_date)} days left
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {formatCurrency(contract.value)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(contract.status)}
                                {getStatusBadge(contract.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleView(contract)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {canWrite(resource) &&<Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                 }
                                 {canDelete(resource) &&
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(contract.id)}
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

                    {/* Pagination */}
                    <div className="mt-4">
                      <Pagination
                        page={page}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={setPage}
                      />
                    </div>
                  </CardContent>
                </Card>
                </div>
              </ContentContainer>
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Create/Edit/View Form */}
      <ContractForm
        contract={selectedContract}
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setSelectedContract(undefined);
          setFormMode("create");
        }}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog open={!!deleteContractId} onOpenChange={() => setDeleteContractId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract? This action cannot be undone.
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