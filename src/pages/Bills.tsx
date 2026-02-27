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
import { Bill, BillOverview } from "@/interfaces/invoices_interfaces";
import { Pagination } from "@/components/Pagination";
import { toast } from "@/components/ui/app-toast";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useSettings } from "@/context/SettingsContext";

export default function Bills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
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
  const { withLoader } = useLoader();
  const { systemCurrency } = useSettings();

  useEffect(() => {
    loadBillsOverView();
    loadBills();
  }, []);

  useSkipFirstEffect(() => {
    loadBills();
  }, [page]);

  useSkipFirstEffect(() => {
    updateBillsPage();
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
      const bills = response.data?.data?.bills || response.data?.bills || [];
      const total = response.data?.total || response.data?.total || 0;
      setBills(bills);
      setTotalItems(total);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "outline",
      approved: "secondary",
      paid: "default",
      partial: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const handleCreate = () => {
    navigate("/bills/create");
  };

  const handleView = (bill: Bill) => {
    navigate(`/bills/${bill.id}/view`);
  };

  const handleEdit = (bill: Bill) => {
    navigate(`/bills/${bill.id}/edit`);
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
              Bills
            </h2>
            <p className="text-muted-foreground">
              Manage vendor bills
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative ">
            <div className="space-y-6">
              {/* Bills Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Bills</CardTitle>
                  <CardDescription>{totalItems} bill(s) found</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill No.</TableHead>
                        <TableHead>Vendor Name</TableHead>
                        <TableHead>Site Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
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
                            <TableCell>{bill.vendor_name || "-"}</TableCell>
                            <TableCell>{bill.site_name || "-"}</TableCell>
                            <TableCell>
                              {new Date(bill.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(bill?.totals?.grand ?? 0)}
                            </TableCell>
                            <TableCell>{getStatusBadge(bill.status)}</TableCell>
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
                Are you sure you want to delete this bill? This action cannot be
                undone.
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
    </ContentContainer>
  );
}
