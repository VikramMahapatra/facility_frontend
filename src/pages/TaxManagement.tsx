import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, FileText, Calculator, TrendingUp, AlertCircle, Download, Eye } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { mockTaxCodes } from "@/data/mockFinancialsData";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import { TaxCode, TaxOverview } from "@/interfaces/tax_interfaces";
import { taxCodeApiService } from "@/services/financials/taxcodesapi";
import { Pagination } from "@/components/Pagination";
import { TaxCodeForm } from "@/components/TaxCodeForm";
import { useToast } from "@/hooks/use-toast";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext"; 

export default function TaxManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [taxReturns, setTaxReturns] = useState<any[]>([]);
  const [selectedTaxCode, setSelectedTaxCode] = useState<TaxCode | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTaxCodeId, setDeleteTaxCodeId] = useState<string | null>(null);
  const { canRead, canWrite, canDelete } = useAuth();
  const resource = "tax_codes";
  const [taxOverview, setTaxOverview] = useState<TaxOverview>({
    activeTaxCodes: 0,
    totalTaxCollected: 0,
    avgTaxRate: 0,
    pendingReturns: 0,
    lastMonthActiveTaxCodes: 0
  });
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(5); // items per page
  const [totalItems, setTotalItems] = useState(0);

  const [returnsPage, setReturnsPage] = useState(1); // current page
  const [returnsPageSize] = useState(5); // items per page
  const [totalReturnsItems, setTotalReturnsItems] = useState(0);

  useEffect(() => {
    loadTaxOverView();
  }, []);

  useSkipFirstEffect(() => {
    loadTaxCodes();
  }, [page]);

  useEffect(() => {
    loadTaxReturns();
  }, [returnsPage]);

  useEffect(() => {
    updateTaxPage();
  }, [searchTerm, jurisdictionFilter]);

  const updateTaxPage = () => {
    if (page === 1) {
      loadTaxCodes();
    } else {
      setPage(1);
    }
  }

  const loadTaxOverView = async () => {
    const response = await taxCodeApiService.getTaxOverview();
    if (response.success) setTaxOverview(response.data || {});
  }

  const loadTaxCodes = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (jurisdictionFilter) params.append("jurisdiction", jurisdictionFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await taxCodeApiService.getTaxCodes(params);
    if (response.success) setTaxCodes(response.data?.tax_codes || []);
    setTotalItems(response.data?.total || 0);
  }

  const loadTaxReturns = async () => {
    const skip = (returnsPage - 1) * returnsPageSize;
    const limit = returnsPageSize;

    // build query params
    const params = new URLSearchParams();
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await taxCodeApiService.getTaxReturns(params);
    if (response.success) setTaxReturns(response.data?.tax_returns || []);
    setTotalReturnsItems(response.data?.total || 0);
  }

  const handleCreate = () => {
    setSelectedTaxCode(undefined);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleView = (taxCode: TaxCode) => {
    setSelectedTaxCode(taxCode);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEdit = (taxCode: TaxCode) => {
    setSelectedTaxCode(taxCode);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = (taxCodeId: string) => {
    setDeleteTaxCodeId(taxCodeId);
  };

  const confirmDelete = async () => {
    if (deleteTaxCodeId) {
      const response = await taxCodeApiService.deleteTaxCode(deleteTaxCodeId);       
      if (response.success) {
        updateTaxPage();
        loadTaxOverView();
        setDeleteTaxCodeId(null);
        toast({ title: "Tax Code Deleted", description: "The tax code has been removed successfully." });
      }
    }
  };

  const handleSave = async (taxCodeData: Partial<TaxCode>) => {
    let response;
    if (formMode === 'create') {
      response = await taxCodeApiService.addTaxCode(taxCodeData);

      if (response.success) {
        updateTaxPage();
        loadTaxOverView();
      }
    } else if (formMode === 'edit' && selectedTaxCode) {
      const updatedTaxCode = {
        ...selectedTaxCode,
        ...taxCodeData,
        updated_at: new Date().toISOString(),
      };
      response = await taxCodeApiService.updateTaxCode(updatedTaxCode);

      if (response.success) {
        // Update the edited tax code in local state
        setTaxCodes((prev) =>
          prev.map((tc) => (tc.id === updatedTaxCode.id ? updatedTaxCode : tc))
        );
        loadTaxOverView();
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast({
        title: formMode === 'create' ? "Tax Code Created" : "Tax Code Updated",
        description: `Tax code ${taxCodeData.code} has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`,
      });
    }
    return response;
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
              <Calculator className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Tax Management</h1>
            </div>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                  Tax Management
                </h2>
                <p className="text-muted-foreground">
                  Manage tax codes, rates and compliance
                </p>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Tax Code
              </Button>
            </div>

            <div className="space-y-6">

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Tax Codes</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{taxOverview.activeTaxCodes}</div>
                    <p className="text-xs text-muted-foreground">+{taxOverview.lastMonthActiveTaxCodes} from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{taxOverview.totalTaxCollected}</div>
                    <p className="text-xs text-muted-foreground">Last 3 months</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Tax Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{taxOverview.avgTaxRate}%</div>
                    <p className="text-xs text-muted-foreground">Effective rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{taxOverview.pendingReturns}</div>
                    <p className="text-xs text-muted-foreground">Due for filing</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tax Codes Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Tax Codes</CardTitle>
                  <CardDescription>Manage tax codes and their rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tax codes..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Jurisdictions</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tax Code</TableHead>
                        <TableHead>Rate %</TableHead>
                        <TableHead>Jurisdiction</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxCodes.map((taxCode) => (
                        <TableRow key={taxCode.id}>
                          <TableCell className="font-medium">{taxCode.code}</TableCell>
                          <TableCell>{taxCode.rate}%</TableCell>
                          <TableCell>{taxCode.jurisdiction}</TableCell>
                          <TableCell>
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(taxCode)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canWrite(resource) && <Button variant="ghost" size="sm" onClick={() => handleEdit(taxCode)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              }
                              {canDelete(resource) && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(taxCode.id)}>
                                <Trash2 className="h-4 w-4" />
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

              {/* Tax Reports Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Tax Returns & Reports</CardTitle>
                  <CardDescription>Monthly tax filings and compliance status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Total Sales</TableHead>
                        <TableHead>GST 18%</TableHead>
                        <TableHead>GST 12%</TableHead>
                        <TableHead>GST 5%</TableHead>
                        <TableHead>Total Tax</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxReturns.map((report) => (
                        <TableRow key={report.month}>
                          <TableCell className="font-medium">{report.period}</TableCell>
                          <TableCell>₹{report.total_sales.toLocaleString()}</TableCell>
                          <TableCell>₹{report.gst18.toLocaleString()}</TableCell>
                          <TableCell>₹{report.gst12.toLocaleString()}</TableCell>
                          <TableCell>₹{report.gst5.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">₹{report.total_tax.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={report.filed ? "default" : "destructive"}>
                              {report.filed ? "Filed" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              {!report.filed && (
                                <Button variant="default" size="sm">
                                  File Return
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={(newPage) => setPage(newPage)}
                  />
                </CardContent>
              </Card>

              {/* Tax Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Tax Calendar & Deadlines</CardTitle>
                  <CardDescription>Important tax filing dates and reminders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Monthly GST Return</h4>
                        <Badge variant="destructive">Due Soon</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">GSTR-1 for March 2024</p>
                      <p className="text-sm font-medium text-red-600">Due: April 11, 2024</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">TDS Return</h4>
                        <Badge variant="secondary">Upcoming</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Quarterly TDS filing</p>
                      <p className="text-sm font-medium">Due: April 30, 2024</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Income Tax Advance</h4>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Q4 advance tax payment</p>
                      <p className="text-sm font-medium text-green-600">Paid: March 15, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Pagination
                page={returnsPage}
                pageSize={returnsPageSize}
                totalItems={totalReturnsItems}
                onPageChange={(newPage) => setReturnsPage(newPage)}
              />
            </div>
          </div>
        </SidebarInset>
      </div>

      <TaxCodeForm
        taxCode={selectedTaxCode}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTaxCodeId} onOpenChange={() => setDeleteTaxCodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tax code? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}