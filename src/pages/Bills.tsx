import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Download,
  Eye,
  Edit,
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
import { billsApiService } from "@/services/financials/billsapi";
import {
  Bill,
  BillOverview,
  Payment,
} from "@/interfaces/invoices_interfaces";
import { Pagination } from "@/components/Pagination";
import { toast } from "@/components/ui/app-toast";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import ContentContainer from "@/components/ContentContainer";
import { PageHeader } from "@/components/PageHeader";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { BillForm } from "@/components/BillForm";
import { useSettings } from "@/context/SettingsContext";

export default function Bills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const { canWrite, canDelete } = useAuth();
  const resource = "bills";
  const [billOverview, setBillOverview] = useState<BillOverview>({
    totalBills: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize] = useState(5);
  const [totalPaymentItems, setTotalPaymentItems] = useState(0);
  const { withLoader } = useLoader();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | undefined>();
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const { systemCurrency } = useSettings();

  useEffect(() => {
    loadBillsOverView();
    loadBills();
    loadPayments();
  }, []);

  useSkipFirstEffect(() => {
    loadBills();
  }, [page]);

  useSkipFirstEffect(() => {
    loadPayments();
  }, [paymentPage]);

  useSkipFirstEffect(() => {
    updateBillsPage();
    if (paymentPage === 1) {
      loadPayments();
    } else {
      setPaymentPage(1);
    }
  }, [searchTerm, statusFilter]);

  const updateBillsPage = () => {
    if (page === 1) {
      loadBills();
    } else {
      setPage(1);
    }
  };

  const loadBillsOverView = async () => {
    const response = await billsApiService.getBillOverview();
    if (response?.success) setBillOverview(response.data || {});
  };

  const loadBills = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter) params.append("status", statusFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await billsApiService.getBills(params);
    });

    if (response?.success) {
      const bills =
        response.data?.data?.bills || response.data?.bills || [];
      const total = response.data?.total || response.data?.total || 0;
      setBills(bills);
      setTotalItems(total);
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

    const response = await billsApiService.getPayments(params);

    if (response?.success) {
      const payments =
        response.data?.data?.payments || response.data?.payments || [];
      const total = response.data?.total || response.data?.total || 0;
      setPayments(payments);
      setTotalPaymentItems(total);
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
    setSelectedBill(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleView = (bill: Bill) => {
    navigate(`/bills/${bill.id}/view`);
  };

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleSave = async (billData: Partial<Bill>) => {
    let response;
    if (formMode === "create") {
      response = await withLoader(async () => {
        return await billsApiService.addBill(billData);
      });
    } else if (formMode === "edit" && selectedBill) {
      const updatedBill = {
        ...selectedBill,
        ...billData,
        id: selectedBill.id,
        bill_no: selectedBill.bill_no,
        updated_at: new Date().toISOString(),
      };
      response = await withLoader(async () => {
        return await billsApiService.updateBill(updatedBill);
      });
    }

    if (response?.success) {
      toast.success(
        `Bill has been ${
          formMode === "create" ? "created" : "updated"
        } successfully.`,
      );
      updateBillsPage();
      loadBillsOverView();
      setIsFormOpen(false);
      setSelectedBill(undefined);
    } else if (response && !response.success) {
      if (response?.message) {
        toast.error(response.message);
      } else {
        toast.error("Failed to save bill.");
      }
    }
    return response;
  };

  const handleDownload = async (billId: string) => {
    await billsApiService.downloadBill(billId);
  };

  const handleDelete = (billId: string) => {
    setDeleteBillId(billId);
  };

  const confirmDelete = async () => {
    if (!deleteBillId) return;

    const response = await billsApiService.deleteBill(deleteBillId);
    if (response.success) {
      const authResponse = response.data;
      if (authResponse?.success) {
        setBills((prev) => prev.filter((bill) => bill.id !== deleteBillId));
        setPayments((prev) => prev.filter((bill) => bill.id !== deleteBillId));

        toast.success("The bill has been deleted successfully.");
        setDeleteBillId(null);
        updateBillsPage();
        loadBillsOverView();
      } else {
        toast.error(`Cannot Delete Bill\n${authResponse?.message}`);
      }
    }
  };

  const formatCurrency = (val?: number) => {
    if (val == null) return "-";
    return systemCurrency.format(val);
  };

  return (
    <ContentContainer>
      <LoaderOverlay />
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sidebar-primary">
              Bills & Payments
            </h2>
            <p className="text-muted-foreground">
              Manage vendor bills and payments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Bill
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bills
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {billOverview.totalBills}
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
                  {formatCurrency(billOverview.totalAmount)}
                </div>
                <p className="text-xs text-muted-foreground">Billed amount</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(billOverview.paidAmount)}
                </div>
                <p className="text-xs text-muted-foreground">Paid bills</p>
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
                  {formatCurrency(billOverview.outstandingAmount)}
                </div>
                <p className="text-xs text-muted-foreground">Pending payment</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by bill number or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
          </div>

          <div className="relative ">
            <div className="space-y-6">
              {/* Bills Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Bills</CardTitle>
                  <CardDescription>
                    {totalItems} bill(s) found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill No.</TableHead>
                        <TableHead>Billable Type</TableHead>
                        <TableHead>Vendor Name</TableHead>
                        <TableHead>Site Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No bills found
                          </TableCell>
                        </TableRow>
                      ) : (
                        bills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-medium">
                              {bill.bill_no}
                            </TableCell>
                            <TableCell>{bill.billable_item_name}</TableCell>
                            <TableCell>{bill.vendor_name || "-"}</TableCell>
                            <TableCell>{bill.site_name || "-"}</TableCell>
                            <TableCell>
                              {new Date(bill.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(bill.due_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(bill?.totals?.grand ?? 0)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(bill.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(bill)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {canWrite(resource) &&
                                  bill.status !== "paid" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(bill)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                {canDelete(resource) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(bill.id!)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {bill.status === "paid" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(bill.id!)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
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
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>
                    {totalPaymentItems} payment(s) found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill No.</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No payments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {payment.invoice_no}
                            </TableCell>
                            <TableCell>{payment.customer_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {payment.method.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {payment.ref_no}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              {new Date(payment.paid_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
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

        <AlertDialog
          open={!!deleteBillId}
          onOpenChange={() => setDeleteBillId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Bill</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this bill? This action cannot
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

        <BillForm
          bill={selectedBill}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedBill(undefined);
          }}
          onSave={handleSave}
          mode={formMode}
        />
      </div>
    </ContentContainer>
  );
}
