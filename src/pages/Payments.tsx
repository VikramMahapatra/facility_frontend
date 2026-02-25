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
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  CreditCard,
  FileText,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { paymentsApiService } from "@/services/financials/paymentsapi";
import { Pagination } from "@/components/Pagination";
import { toast } from "@/components/ui/app-toast";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useSettings } from "@/context/SettingsContext";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ReceivedPayment {
  id: string;
  invoice_no: string;
  customer_name: string;
  method: string;
  ref_no: string;
  amount: number;
  paid_at: string;
}

interface MadePayment {
  id: string;
  bill_no: string;
  vendor_name: string;
  method: string;
  ref_no?: string;
  amount: number;
  paid_at: string;
}

const recordPaymentSchema = z.object({
  payment_type: z.enum(["received", "made"]),
  reference_id: z.string().min(1, "Please select an invoice or bill"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  method: z.enum(["upi", "card", "bank", "cash", "cheque", "gateway"], {
    required_error: "Payment method is required",
  }),
  ref_no: z.string().optional(),
  paid_at: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

type RecordPaymentValues = z.infer<typeof recordPaymentSchema>;

export default function Payments() {
  const { withLoader } = useLoader();
  const { systemCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState<"received" | "made">("received");
  const [searchTerm, setSearchTerm] = useState("");
  const [receivedPayments, setReceivedPayments] = useState<ReceivedPayment[]>(
    [],
  );
  const [madePayments, setMadePayments] = useState<MadePayment[]>([]);
  const [receivedPage, setReceivedPage] = useState(1);
  const [madePageNum, setMadePageNum] = useState(1);
  const [pageSize] = useState(5);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalMade, setTotalMade] = useState(0);
  const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);
  const [totalMadeAmount, setTotalMadeAmount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceLookup, setInvoiceLookup] = useState<any[]>([]);
  const [billLookup, setBillLookup] = useState<any[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RecordPaymentValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      payment_type: "received",
      paid_at: new Date().toISOString().split("T")[0],
    },
  });

  const watchedType = watch("payment_type");

  useEffect(() => {
    loadReceivedPayments();
    loadMadePayments();
  }, []);

  useSkipFirstEffect(() => {
    loadReceivedPayments();
  }, [receivedPage]);

  useSkipFirstEffect(() => {
    loadMadePayments();
  }, [madePageNum]);

  useSkipFirstEffect(() => {
    updatePaymentsPage();
  }, [searchTerm]);

  const updatePaymentsPage = () => {
    if (receivedPage === 1) {
      loadReceivedPayments();
    } else {
      setReceivedPage(1);
    }
    if (madePageNum === 1) {
      loadMadePayments();
    } else {
      setMadePageNum(1);
    }
  };

  const loadReceivedPayments = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    params.append("skip", ((receivedPage - 1) * pageSize).toString());
    params.append("limit", pageSize.toString());

    const response = await withLoader(() =>
      paymentsApiService.getReceivedPayments(params),
    );
    if (response?.success) {
      const data =
        response.data?.data?.payments || response.data?.payments || [];
      const total = response.data?.total || 0;
      setReceivedPayments(data);
      setTotalReceived(total);
      const sum = data.reduce(
        (acc: number, p: ReceivedPayment) => acc + (p.amount || 0),
        0,
      );
      if (receivedPage === 1) setTotalReceivedAmount(sum);
    }
  };

  const loadMadePayments = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    params.append("skip", ((madePageNum - 1) * pageSize).toString());
    params.append("limit", pageSize.toString());

    const response = await withLoader(() =>
      paymentsApiService.getMadePayments(params),
    );
    if (response?.success) {
      const data =
        response.data?.data?.payments || response.data?.payments || [];
      const total = response.data?.total || 0;
      setMadePayments(data);
      setTotalMade(total);
      const sum = data.reduce(
        (acc: number, p: MadePayment) => acc + (p.amount || 0),
        0,
      );
      if (madePageNum === 1) setTotalMadeAmount(sum);
    }
  };

  const loadInvoiceLookup = async () => {
    const params = new URLSearchParams();
    params.append("status", "issued");
    params.append("limit", "100");
    const response = await paymentsApiService.getInvoiceLookup(params);
    if (response?.success) {
      const data =
        response.data?.data?.invoices || response.data?.invoices || [];
      setInvoiceLookup(data);
    }
  };

  const loadBillLookup = async () => {
    const params = new URLSearchParams();
    params.append("status", "approved");
    params.append("limit", "100");
    const response = await paymentsApiService.getBillLookup(params);
    if (response?.success) {
      const data = response.data?.data?.bills || response.data?.bills || [];
      setBillLookup(data);
    }
  };

  const openDialog = () => {
    reset({
      payment_type: activeTab === "received" ? "received" : "made",
      paid_at: new Date().toISOString().split("T")[0],
    });
    loadInvoiceLookup();
    loadBillLookup();
    setShowDialog(true);
  };

  const onSubmit = async (data: RecordPaymentValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        reference_id: data.reference_id,
        amount: data.amount,
        method: data.method,
        ref_no: data.ref_no || "",
        paid_at: data.paid_at,
        notes: data.notes || "",
      };

      let response;
      if (data.payment_type === "received") {
        response = await paymentsApiService.recordInvoicePayment({
          invoice_id: data.reference_id,
          ...payload,
        });
      } else {
        response = await paymentsApiService.recordBillPayment({
          bill_id: data.reference_id,
          ...payload,
        });
      }

      if (response?.success) {
        toast.success("Payment recorded successfully.");
        setShowDialog(false);
        loadReceivedPayments();
        loadMadePayments();
      } else {
        toast.error(response?.message || "Failed to record payment.");
      }
    } catch (err) {
      toast.error("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sidebar-primary">
              Payments
            </h2>
            <p className="text-muted-foreground">
              Track payments received and made
            </p>
          </div>
          <Button onClick={openDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Received</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalReceivedAmount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalReceived} payment(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Made</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalMadeAmount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalMade} payment(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    totalReceivedAmount - totalMadeAmount >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(totalReceivedAmount - totalMadeAmount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Received minus made
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  All Payments
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalReceived + totalMade}
                </div>
                <p className="text-xs text-muted-foreground">Total count</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by reference or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="relative">
            <div className="space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "received" | "made")}
              >
                <TabsList>
                  <TabsTrigger value="received">Received</TabsTrigger>
                  <TabsTrigger value="made">Made</TabsTrigger>
                </TabsList>

                <TabsContent value="received">
                  <Card>
                    <CardHeader>
                      <CardTitle>Received Payments</CardTitle>
                      <CardDescription>
                        {totalReceived} payment(s) found
                      </CardDescription>
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
                          {receivedPayments.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No payments received yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            receivedPayments.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell className="font-medium">
                                  {p.invoice_no}
                                </TableCell>
                                <TableCell>{p.customer_name || "-"}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {p.method?.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {p.ref_no || "-"}
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  {formatCurrency(p.amount)}
                                </TableCell>
                                <TableCell>
                                  {p.paid_at
                                    ? new Date(p.paid_at).toLocaleDateString()
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                      <Pagination
                        page={receivedPage}
                        pageSize={pageSize}
                        totalItems={totalReceived}
                        onPageChange={(newPage) => setReceivedPage(newPage)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="made">
                  <Card>
                    <CardHeader>
                      <CardTitle>Made Payments</CardTitle>
                      <CardDescription>
                        {totalMade} payment(s) found
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
                          {madePayments.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No payments made yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            madePayments.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell className="font-medium">
                                  {p.bill_no}
                                </TableCell>
                                <TableCell>{p.vendor_name || "-"}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {p.method?.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {p.ref_no || "-"}
                                </TableCell>
                                <TableCell className="font-semibold text-orange-600">
                                  {formatCurrency(p.amount)}
                                </TableCell>
                                <TableCell>
                                  {p.paid_at
                                    ? new Date(p.paid_at).toLocaleDateString()
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                      <Pagination
                        page={madePageNum}
                        pageSize={pageSize}
                        totalItems={totalMade}
                        onPageChange={(newPage) => setMadePageNum(newPage)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment received from a customer or made to a vendor.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Type *</Label>
                <Controller
                  name="payment_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="made">Made</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_id">
                  {watchedType === "received" ? "Invoice *" : "Bill *"}
                </Label>
                <Controller
                  name="reference_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        className={errors.reference_id ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            watchedType === "received"
                              ? "Select invoice"
                              : "Select bill"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {watchedType === "received"
                          ? invoiceLookup.map((inv) => (
                              <SelectItem key={inv.id} value={inv.id}>
                                {inv.invoice_no} —{" "}
                                {inv.customer_name || inv.user_name || ""}
                              </SelectItem>
                            ))
                          : billLookup.map((bill) => (
                              <SelectItem key={bill.id} value={bill.id}>
                                {bill.bill_no} — {bill.vendor_name || ""}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.reference_id && (
                  <p className="text-sm text-red-500">
                    {errors.reference_id.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount")}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-500">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method *</Label>
                  <Controller
                    name="method"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={errors.method ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="gateway">
                            Payment Gateway
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.method && (
                    <p className="text-sm text-red-500">
                      {errors.method.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paid_at">Payment Date *</Label>
                  <Input
                    id="paid_at"
                    type="date"
                    {...register("paid_at")}
                    className={errors.paid_at ? "border-red-500" : ""}
                  />
                  {errors.paid_at && (
                    <p className="text-sm text-red-500">
                      {errors.paid_at.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ref_no">Reference No.</Label>
                  <Input
                    id="ref_no"
                    placeholder="UTR / Cheque no. / etc."
                    {...register("ref_no")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional remarks..."
                  {...register("notes")}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Record Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ContentContainer>
  );
}
