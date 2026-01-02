import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Send,
  Trash2,
  CreditCard,
  FileText,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
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
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { Invoice, InvoiceOverview } from "@/interfaces/invoices_interfaces";
import { Pagination } from "@/components/Pagination";
import { toast } from "sonner";
import { InvoiceForm } from "@/components/InvoiceForm";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import ContentContainer from "@/components/ContentContainer";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  //const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workOrderInvoices, setWorkOrderInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const { canWrite, canDelete } = useAuth();
  const resource = "invoices";
  const [invoiceOverview, setInvoiceOverview] = useState<InvoiceOverview>({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0,
  });
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const { user, handleLogout } = useAuth();

  const [workOrderInvoicePage, setWorkOrderInvoicePage] = useState(1); // current page
  const [workOrderInvoicePageSize] = useState(6); // items per page
  const [totalWorkOrderInvoiceItems, setTotalWorkOrderInvoiceItems] =
    useState(0);
  const [loadingLeaseInvoices, setLoadingLeaseInvoices] = useState(false);
  const [loadingWorkOrderInvoices, setLoadingWorkOrderInvoices] =
    useState(false);

  useEffect(() => {
    loadInvoicesOverView();
    loadWorkOrderInvoices();
  }, []);

  useSkipFirstEffect(() => {
    loadInvoices();
  }, [page]);

  useSkipFirstEffect(() => {
    loadWorkOrderInvoices();
  }, [workOrderInvoicePage]);

  useEffect(() => {
    updateInvoicesPage();
    if (workOrderInvoicePage === 1) {
      loadWorkOrderInvoices();
    } else {
      setWorkOrderInvoicePage(1);
    }
  }, [searchTerm, statusFilter]);

  const updateInvoicesPage = () => {
    if (page === 1) {
      loadInvoices();
    } else {
      setPage(1);
    }
  };

  const loadInvoicesOverView = async () => {
    const response = await invoiceApiService.getInvoiceOverview();
    if (response?.success) setInvoiceOverview(response.data || {});
  };

  const loadInvoices = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter) params.append("status", statusFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    setLoadingLeaseInvoices(true);
    try {
      const response = await invoiceApiService.getLeaseChargeInvoices(params);

      if (response?.success) {
        const invoices =
          response.data?.data?.invoices || response.data?.invoices || [];
        const total = response.data?.data?.total || response.data?.total || 0;
        setInvoices(invoices);
        setTotalItems(total);
      }
    } finally {
      setLoadingLeaseInvoices(false);
    }
  };

  const loadWorkOrderInvoices = async () => {
    const skip = (workOrderInvoicePage - 1) * workOrderInvoicePageSize;
    const limit = workOrderInvoicePageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter && statusFilter !== "all")
      params.append("status", statusFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    setLoadingWorkOrderInvoices(true);
    try {
      const response = await invoiceApiService.getWorkOrderInvoices(params);

      if (response?.success) {
        const invoices =
          response.data?.data?.invoices || response.data?.invoices || [];
        const total = response.data?.data?.total || response.data?.total || 0;
        setWorkOrderInvoices(invoices);
        setTotalWorkOrderInvoiceItems(total);
      }
    } finally {
      setLoadingWorkOrderInvoices(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      issued: "secondary",
      partial: "outline",
      draft: "outline",
      void: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const handleCreate = () => {
    setSelectedInvoice(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);

    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDelete = (invoiceId: string) => {
    setDeleteInvoiceId(invoiceId);
  };

  const confirmDelete = async () => {
    if (!deleteInvoiceId) return;

    const response = await invoiceApiService.deleteInvoice(deleteInvoiceId);
    if (response.success) {
      const authResponse = response.data;
      if (authResponse?.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== deleteInvoiceId));
        setWorkOrderInvoices((prev) =>
          prev.filter((inv) => inv.id !== deleteInvoiceId)
        );

        toast.success("The invoice has been deleted successfully.");
        setDeleteInvoiceId(null);
        updateInvoicesPage();
        loadWorkOrderInvoices();
        loadInvoicesOverView();
      } else {
        toast.error(`Cannot Delete Invoice\n${authResponse?.message}`, {
          style: { whiteSpace: "pre-line" },
        });
      }
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (markingPaidId) return;

    setMarkingPaidId(invoice.id);

    const updatedInvoice: Invoice = {
      ...invoice,
      status: "paid",
      is_paid: true,
      updated_at: new Date().toISOString(),
    };

    try {
      const response = await invoiceApiService.updateInvoice(updatedInvoice);

      if (response.success) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === updatedInvoice.id ? updatedInvoice : inv
          )
        );
        setWorkOrderInvoices((prev) =>
          prev.map((inv) =>
            inv.id === updatedInvoice.id ? updatedInvoice : inv
          )
        );
        loadInvoicesOverView();
        toast.success(`Invoice ${invoice.invoice_no} has been marked as paid.`);
      }
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleSave = async (invoiceData: Partial<Invoice>) => {
    let response;
    if (formMode === "create") {
      response = await invoiceApiService.addInvoice(invoiceData);
      if (response.success) updateInvoicesPage();
      loadWorkOrderInvoices();
    } else if (formMode === "edit" && selectedInvoice) {
      const updatedInvoice = {
        ...selectedInvoice,
        ...invoiceData,
      };
      response = await invoiceApiService.updateInvoice(updatedInvoice);
      if (response.success) {
        loadInvoicesOverView();
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === updatedInvoice.id ? response.data : inv
          )
        );
        setWorkOrderInvoices((prev) =>
          prev.map((inv) =>
            inv.id === updatedInvoice.id ? response.data : inv
          )
        );
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `Invoice has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
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
              <h1 className="text-lg font-semibold">Invoices</h1>
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
                  Invoices & Payments
                </h2>
                <p className="text-muted-foreground">
                  Manage billing and payment collection
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Invoices
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {invoiceOverview.totalInvoices}
                    </div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Amount
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{invoiceOverview.totalAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Invoiced amount
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Collected
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{invoiceOverview.paidAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paid invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Outstanding
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{invoiceOverview.outstandingAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pending payment
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by invoice number or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-[500px]"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
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
                  </div>
                </CardContent>
              </Card>

              <div className="relative rounded-md border">
                <ContentContainer>
                  <div className="space-y-6">
                    {/* Invoices Table */}
                    <Card className="relative">
                      {loadingLeaseInvoices && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>Lease Invoices</CardTitle>
                        <CardDescription>
                          {totalItems} invoice(s) found
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice No.</TableHead>
                              <TableHead>Lease Charge</TableHead>
                              <TableHead>Site Name</TableHead>
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
                                <TableCell className="font-medium">
                                  {invoice.invoice_no}
                                </TableCell>
                                <TableCell>
                                  {invoice.billable_item_name}
                                </TableCell>
                                <TableCell>
                                  {invoice.site_name || "-"}
                                </TableCell>
                                <TableCell>
                                  {new Date(invoice.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    invoice.due_date
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  ₹{invoice?.totals?.grand ?? 0}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(invoice.status)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleView(invoice)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {canWrite(resource) &&
                                      invoice.status !== "paid" && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEdit(invoice)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      )}
                                    {canDelete(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(invoice.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {invoice.status === "issued" &&
                                      canWrite(resource) && (
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleMarkAsPaid(invoice)
                                          }
                                          disabled={
                                            markingPaidId === invoice.id
                                          }
                                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                          Mark as Paid
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

                    {/* Work Order Invoices */}
                    <Card className="relative">
                      {loadingWorkOrderInvoices && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>Work Order Invoices</CardTitle>
                        <CardDescription>
                          {totalWorkOrderInvoiceItems} invoice(s) found
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice No.</TableHead>
                              <TableHead>Work Order</TableHead>
                              <TableHead>Site Name</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workOrderInvoices.map((invoice) => (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-medium">
                                  {invoice.invoice_no}
                                </TableCell>
                                <TableCell>
                                  {invoice.billable_item_name || "-"}
                                </TableCell>
                                <TableCell>
                                  {invoice.site_name || "-"}
                                </TableCell>
                                <TableCell>
                                  {new Date(invoice.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    invoice.due_date
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  ₹
                                  {Number(
                                    invoice?.totals?.grand ?? 0
                                  ).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(invoice.status)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleView(invoice)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {canWrite(resource) &&
                                      invoice.status !== "paid" && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEdit(invoice)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      )}
                                    {canDelete(resource) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(invoice.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {invoice.status === "issued" &&
                                      canWrite(resource) && (
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleMarkAsPaid(invoice)
                                          }
                                          disabled={
                                            markingPaidId === invoice.id
                                          }
                                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                          Mark as Paid
                                        </Button>
                                      )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <Pagination
                          page={workOrderInvoicePage}
                          pageSize={workOrderInvoicePageSize}
                          totalItems={totalWorkOrderInvoiceItems}
                          onPageChange={(newPage) =>
                            setWorkOrderInvoicePage(newPage)
                          }
                        />
                      </CardContent>
                    </Card>
                  </div>
                </ContentContainer>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>

      <InvoiceForm
        invoice={selectedInvoice}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog
        open={!!deleteInvoiceId}
        onOpenChange={() => setDeleteInvoiceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot
              be undone.
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
