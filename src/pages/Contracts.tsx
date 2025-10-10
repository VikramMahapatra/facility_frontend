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
import { Plus, Search, Eye, Edit, FileText, Calendar, Building, Filter, AlertCircle, CheckCircle } from "lucide-react";
import { contractApiService } from "@/services/pocurments/contractapi";
import { vendorsApiService } from "@/services/pocurments/vendorsapi";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Pagination } from "@/components/Pagination";
import { useToast } from "@/hooks/use-toast";
import { ContractForm } from "@/components/ContractsForm";

export default function Contracts() {
  const { toast } = useToast();
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

    const response = await contractApiService.getContracts(params);
    const contractsList = response.contracts || [];
    setContracts(contractsList);
    setTotalItems(response.total || 0);
  };

  const loadOverview = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (typeFilter !== "all") params.append("type", typeFilter);
    const response = await contractApiService.getContractsOverview(params);
    
    // Map API response to expected format
    const overviewData = {
      total_contracts: response?.totalContracts || response?.total_contracts || 0,
      active_contracts: response?.activeContracts || response?.active_contracts || 0,
      expiring_soon: response?.expiringSoon || response?.expiring_soon || 0,
      total_value: response?.totalValue || response?.total_value || 0
    };
    
    setOverview(overviewData);
  };

  const loadStatusLookup = async () => {
    const lookup = await contractApiService.getFilterStatusLookup();
    setStatusList(lookup || []);
  };

  const loadTypeLookup = async () => {
    const lookup = await contractApiService.getFilterTypeLookup();
    setTypeList(lookup || []);
  };

  const loadVendorLookup = async () => {
    const vendors = await vendorsApiService.getVendorLookup().catch(() => []);
    setVendorList(vendors || []);
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

  const handleSave = async (contractData: any) => {
    try {
      if (formMode === 'create') {
        await contractApiService.addContract(contractData);
      } else if (formMode === 'edit' && selectedContract) {
        const updatedContract = { ...selectedContract, ...contractData };
        await contractApiService.updateContract(updatedContract);
      }
      setIsCreateDialogOpen(false);
      toast({
        title: formMode === 'create' ? "Contract Created" : "Contract Updated",
        description: `Contract has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      updateContractsPage();
    } catch (error) {
      toast({ title: "Technical Error!", variant: "destructive" });
    }
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
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Contracts</h1>
                  <p className="text-sm text-muted-foreground">Manage vendor contracts and agreements</p>
                </div>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                New Contract
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
                              <div className="font-medium">{getVendorName(contract.vendor_id || contract.vendor_name)}</div>
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
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>
                                <Edit className="w-4 h-4" />
                              </Button>
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
          </main>
        </div>
      </div>

      {/* Create/Edit/View Form */}
      <ContractForm
        contract={selectedContract}
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />
    </SidebarProvider>
  );
}