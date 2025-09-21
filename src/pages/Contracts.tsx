import { useState } from "react";
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
import { mockContracts, mockVendors, type Contract } from "@/data/mockVendorData";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    const matchesType = typeFilter === "all" || contract.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Contract
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Create New Contract</DialogTitle>
                    <DialogDescription>
                      Set up a new contract with vendor terms and conditions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Contract Title *</Label>
                        <Input id="title" placeholder="Annual Maintenance Contract" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendor">Vendor *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockVendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Contract Type *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AMC">AMC</SelectItem>
                            <SelectItem value="SLA">SLA</SelectItem>
                            <SelectItem value="Cleaning">Cleaning</SelectItem>
                            <SelectItem value="Security">Security</SelectItem>
                            <SelectItem value="Rent Share">Rent Share</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input id="start_date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date *</Label>
                        <Input id="end_date" type="date" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="value">Contract Value (₹)</Label>
                        <Input id="value" type="number" placeholder="500000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="response_hrs">SLA Response Hours</Label>
                        <Input id="response_hrs" type="number" placeholder="4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea id="terms" placeholder="Contract terms and conditions..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(false)}>
                      Create Contract
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="AMC">AMC</SelectItem>
                    <SelectItem value="SLA">SLA</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Rent Share">Rent Share</SelectItem>
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
                    <div className="text-2xl font-bold">{mockContracts.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockContracts.filter(c => c.status === 'active').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockContracts.filter(c => getDaysUntilExpiry(c.end_date) <= 30 && c.status === 'active').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(mockContracts.reduce((sum, c) => sum + c.value, 0))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contracts Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract Management</CardTitle>
                  <CardDescription>
                    Showing {filteredContracts.length} contracts
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
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{contract.title}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                {contract.documents.length} document(s)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{contract.vendor_name}</div>
                              <div className="text-sm text-muted-foreground">
                                SLA: {contract.terms.sla?.response_hrs || 'N/A'}h response
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
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}