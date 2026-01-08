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
import { Invoice, InvoiceOverview, Payment } from "@/interfaces/invoices_interfaces";
import { Pagination } from "@/components/Pagination";
import { toast } from "sonner";
import { InvoiceForm } from "@/components/InvoiceForm";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import ContentContainer from "@/components/ContentContainer";
import { PageHeader } from "@/components/PageHeader";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  //const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
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
  const [pageSize] = useState(5); // items per page
  const [totalItems, setTotalItems] = useState(0);

  const [paymentPage, setPaymentPage] = useState(1); // current page
  const [paymentPageSize] = useState(5); // items per page
  const [totalPaymentItems, setTotalPaymentItems] = useState(0);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    loadInvoicesOverView();
    loadInvoices();
    loadPayments();
  }, []);

  useSkipFirstEffect(() => {
    loadInvoices();
  }, [page]);

  useSkipFirstEffect(() => {
    loadPayments();
  }, [paymentPage]);

  useSkipFirstEffect(() => {
    updateInvoicesPage();
    if (paymentPage === 1) {
      loadPayments();
    } else {
      setPaymentPage(1);
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

    setLoadingInvoices(true);
    try {
      const response = await invoiceApiService.getInvoices(params);

      if (response?.success) {
        const invoices =
          response.data?.data?.invoices || response.data?.invoices || [];
        const total = response.data?.total || response.data?.total || 0;
        setInvoices(invoices);
        setTotalItems(total);
      }
    } finally {
      setLoadingInvoices(false);
    }
  };

  const loadPayments = async () => {
    const skip = (paymentPage - 1) * paymentPageSize;
    const limit = paymentPageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter && statusFilter !== "all")
      params.append("status", statusFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    setLoadingPayments(true);
    try {
      const response = await invoiceApiService.getPayments(params);

      if (response?.success) {
        const invoices =
          response.data?.data?.payments || response.data?.payments || [];
        const total = response.data?.total || response.data?.total || 0;
        setPayments(invoices);
        setTotalPaymentItems(total);
      }
    } finally {
      setLoadingPayments(false);
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
        setPayments((prev) => prev.filter((inv) => inv.id !== deleteInvoiceId));

        toast.success("The invoice has been deleted successfully.");
        setDeleteInvoiceId(null);
        updateInvoicesPage();
        loadInvoicesOverView();
      } else {
        toast.error(`Cannot Delete Invoice\n${authResponse?.message}`, {
          style: { whiteSpace: "pre-line" },
        });
      }
    }
  };

  const handleSave = async (invoiceData: Partial<Invoice>) => {
    let response;
    if (formMode === "create") {
      response = await invoiceApiService.addInvoice(invoiceData);
      if (response.success) {
        updateInvoicesPage();
        loadPayments()
      }
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
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `Invoice has been ${formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  return (
    <div className="flex-1 space-y-6">
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
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by invoice number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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

        <div className="relative ">
          <div className="space-y-6">
            {/* Invoices Table */}
            <Card className="relative">
              {loadingInvoices && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                  <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
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
            <Card className="relative">
              {loadingPayments && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
                  <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>{totalPaymentItems} payment(s) found</CardDescription>
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
                    {payments.map((payment) => (
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
        </div>
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
    </div>
  );
}
