import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Download, Eye, Edit, Send, Trash2, CreditCard, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { Invoice, Payment, InvoiceOverview } from "@/interfaces/invoices_interfaces";
import { Pagination } from "@/components/Pagination";
import { useToast } from "@/hooks/use-toast";
import { InvoiceForm } from "@/components/InvoiceForm";




export default function Invoices() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [invoiceOverview, setInvoiceOverview] = useState<InvoiceOverview>({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0
  });
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(5); // items per page
  const [totalItems, setTotalItems] = useState(0);

  const [paymentPage, setPaymentPage] = useState(1); // current page
  const [paymentPageSize] = useState(5); // items per page
  const [totalPaymentItems, setTotalPaymentItems] = useState(0);

  useEffect(() => {
    loadInvoices();
  }, [page]);

  useEffect(() => {
    loadPayments();
  }, [paymentPage]);

  useEffect(() => {
    updateInvoicesPage();
  }, [searchTerm, statusFilter, customerTypeFilter]);

  const updateInvoicesPage = () => {
    if (page === 1) {
      loadInvoices();  // already page 1 → reload
    } else {
      setPage(1);    // triggers the page effect
    }
    loadInvoicesOverView();
  }

  const loadInvoicesOverView = async () => {
    const response = await invoiceApiService.getInvoiceOverview();
    setInvoiceOverview(response);
  }

  const loadInvoices = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter) params.append("status", statusFilter);
    if (customerTypeFilter) params.append("kind", customerTypeFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await invoiceApiService.getInvoices(params);
    setInvoices(response.invoices);
    setTotalItems(response.total);
  }

  const loadPayments = async () => {
    const skip = (paymentPage - 1) * paymentPageSize;
    const limit = paymentPageSize;

    // build query params
    const params = new URLSearchParams();
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await invoiceApiService.getPayments(params);
    setPayments(response.payments);
    setTotalPaymentItems(response.total);
  }


  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      issued: "secondary",
      partial: "outline",
      draft: "outline",
      void: "destructive"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>;
  };

  const getCustomerTypeBadge = (type: string) => {
    const variants = {
      resident: "default",
      partner: "secondary",
      guest: "outline"
    } as const;

    return <Badge variant={variants[type as keyof typeof variants] || "outline"}>{type}</Badge>;
  };

  const handleCreate = () => {
    setSelectedInvoice(undefined);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);

    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = (invoiceId: string) => {
    setDeleteInvoiceId(invoiceId);
  };

  const confirmDelete = () => {
    if (deleteInvoiceId) {
      setInvoices(invoices.filter(invoice => invoice.id !== deleteInvoiceId));
      toast({
        title: "Space Deleted",
        description: "Space has been deleted successfully.",
      });
      setDeleteInvoiceId(null);
    }
  };

  const handleSave = async (invoiceData: Partial<Invoice>) => {
    try {
      if (formMode === 'create') {
        await invoiceApiService.addInvoice(invoiceData);
      } else if (formMode === 'edit' && selectedInvoice) {
        const updatedInvoice = { ...selectedInvoice, ...invoiceData };
        await invoiceApiService.updateInvoice(updatedInvoice);
      }
      setIsFormOpen(false);
      toast({
        title: formMode === 'create' ? "Invoice Created" : "Invoice Updated",
        description: `Invoice ${invoiceData.invoice_no} has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      updateInvoicesPage();
    } catch (error) {
      toast({
        title: "Techical Error!",
        variant: "destructive",
      });
    }
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
                  <h1 className="text-2xl font-bold">Invoices & Payments</h1>
                  <p className="text-sm text-muted-foreground">Manage billing and payment collection</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="container mx-auto py-6 space-y-6">

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{invoiceOverview.totalInvoices}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{invoiceOverview.totalAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Invoiced amount</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collected</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">₹{invoiceOverview.paidAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Paid invoices</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">₹{invoiceOverview.outstandingAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Pending payment</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter & Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by invoice number or customer..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="issued">Issued</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="void">Void</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Customer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="resident">Residents</SelectItem>
                        <SelectItem value="partner">Partners</SelectItem>
                        <SelectItem value="guest">Guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Invoices Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>
                    {totalItems} invoice(s) found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No.</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                          <TableCell>{invoice.customer_name}</TableCell>
                          <TableCell>{getCustomerTypeBadge(invoice.customer_kind)}</TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>₹{invoice.totals.grand.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleView(invoice)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {invoice.status === 'draft' && (
                                <Button variant="ghost" size="sm">
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
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

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No.</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.slice(0, 5).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.invoice_no}</TableCell>
                          <TableCell>{payment.customer_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.method.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{payment.ref_no}</TableCell>
                          <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(payment.paid_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    page={paymentPage}
                    pageSize={paymentPageSize}
                    totalItems={totalPaymentItems}
                    onPageChange={(newPage) => setPaymentPage(newPage)}
                  />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <InvoiceForm
        invoice={selectedInvoice}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />
    </SidebarProvider>
  );
}