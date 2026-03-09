import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  History,
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Plus,
  Receipt,
  Clock,
  User,
  Paperclip,
  Download,
  AlertTriangle,
  Send,
} from "lucide-react";
import { Bill } from "@/interfaces/invoices_interfaces";
import { billsApiService } from "@/services/financials/billsapi";
import { toast } from "@/components/ui/app-toast";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useSettings } from "@/context/SettingsContext";
import { PaymentDetailsForm } from "@/components/PaymentDetailsForm";
import { downloadFile } from "@/helpers/fileDownloadHelper";
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

export default function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const { systemCurrency } = useSettings();
  const [bill, setBill] = useState<Bill | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | undefined>();
  const [paymentFormMode, setPaymentFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [showIssueDialog, setShowIssueDialog] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadBill = async () => {
      const response = await withLoader(async () => {
        return await billsApiService.getBillById(id);
      });

      if (response?.success) {
        const data = response.data?.data ?? response.data;
        setBill(data);
        if (data?.payments) {
          setPayments(data.payments);
        } else {
          setPayments([]);
        }
      } else {
        toast.error("Failed to load bill details");
        navigate("/bills");
      }
    };

    loadBill();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "paid":
        return (
          <Badge className="bg-green-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold shadow-sm">
            <CheckCircle2 className="h-4 w-4" /> Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-orange-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold shadow-sm">
            <AlertCircle className="h-4 w-4" /> Partial
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold shadow-sm">
            <CheckCircle2 className="h-4 w-4" /> Approved
          </Badge>
        );
      case "issued":
        return (
          <Badge className="bg-blue-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold shadow-sm">
            <FileText className="h-4 w-4" /> Issued
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold shadow-sm">
            <FileText className="h-4 w-4" /> Draft
          </Badge>
        );
      case "void":
        return (
          <Badge className="bg-red-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold shadow-sm">
            <XCircle className="h-4 w-4" /> Void
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold shadow-sm">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Wallet className="h-4 w-4" />;
      case "bank":
        return <Building2 className="h-4 w-4" />;
      case "upi":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number | string | undefined) => {
    const num = Number(amount) || 0;
    return systemCurrency.format(num);
  };

  const calculatePaymentSummary = () => {
    if (!bill) return { paid: 0, outstanding: 0 };
    const billTotal =
      Number(bill.totals?.grand) || Number((bill as any).total_amount) || 0;
    const paid = payments.reduce((sum: number, payment: any) => {
      return sum + (Number(payment.amount) || 0);
    }, 0);
    const outstanding = Math.max(0, billTotal - paid);
    return { paid, outstanding };
  };

  const paymentSummary = calculatePaymentSummary();
  const billTotal =
    Number(bill?.totals?.grand) || Number((bill as any)?.total_amount) || 0;
  const progress = billTotal > 0 ? (paymentSummary.paid / billTotal) * 100 : 0;

  const handleIssueBill = async () => {
    if (!bill?.id) return;
    if ((bill.status || "").toLowerCase() !== "draft") return;

    const updatedBill = {
      ...bill,
      status: "issued" as const,
      updated_at: new Date().toISOString(),
      attachments: [],
    };

    const formData = new FormData();
    formData.append("bill", JSON.stringify(updatedBill));

    const response = await withLoader(async () => {
      return await billsApiService.updateBill(formData);
    });

    if (response?.success) {
      toast.success("Bill issued successfully.");
      setShowIssueDialog(false);
      const reloadResponse = await withLoader(async () => {
        return await billsApiService.getBillById(bill.id!);
      });
      if (reloadResponse?.success) {
        const data = reloadResponse.data?.data ?? reloadResponse.data;
        setBill(data);
        setPayments(data?.payments || []);
      }
    } else {
      toast.error(response?.message || "Failed to issue bill.");
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    await billsApiService.downloadPaymentReceipt(paymentId);
  };

  return (
    <ContentContainer>
      <LoaderOverlay />
      {bill && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/bills")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold">{bill.bill_no}</h1>
                  {getStatusBadge(bill.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {bill.lines?.length || 0} line item(s) •{" "}
                  {(bill as any).currency || "INR"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {bill.status === "draft" && (
                <>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowIssueDialog(true)}
                  >
                    <Send className="h-4 w-4" />
                    Issue Bill
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/bills/${id}/edit`)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              {/* Payment Progress */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Payment Progress
                    </span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      Paid: {formatCurrency(paymentSummary.paid)}
                    </span>
                    <span className="text-orange-600 font-medium">
                      Outstanding: {formatCurrency(paymentSummary.outstanding)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Bill Info */}
              <Card>
                <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Vendor</p>
                    <p className="font-medium">
                      {(bill as any).vendor_name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Space</p>
                    <p className="font-medium">
                      {[(bill as any).space_name, (bill as any).site_name]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Bill Date</p>
                    <p className="font-medium">
                      {bill.date
                        ? new Date(bill.date).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {(bill as any).due_date
                        ? new Date((bill as any).due_date).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Line Items
                    </h3>
                    <Badge variant="secondary">
                      {bill.lines?.length || 0} items
                    </Badge>
                  </div>

                  {bill.lines && bill.lines.length > 0 ? (
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr className="text-muted-foreground">
                            <th className="text-left p-4">Work Order</th>
                            <th className="text-left p-4">Description</th>
                            <th className="text-left p-4">Tax %</th>
                            <th className="text-right p-4">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bill.lines.map((line: any, idx: number) => (
                            <tr key={line.id || idx} className="border-t">
                              <td className="p-4 font-medium">
                                {line.work_order_no || "-"}
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {line.description || "-"}
                              </td>
                              <td className="p-4">{line.tax_pct || 0}%</td>
                              <td className="p-4 text-right font-semibold">
                                {formatCurrency(line.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No line items attached to this bill.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Attachments</h3>
                  </div>
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4">
                    {bill.attachments && bill.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {bill.attachments.map((attachment, index) => (
                          <div
                            key={attachment.id || index}
                            className="relative group border rounded-lg overflow-hidden bg-background"
                          >
                            {attachment.content_type?.startsWith("image/") &&
                              attachment.file_data_base64 ? (
                              <img
                                src={`data:${attachment.content_type};base64,${attachment.file_data_base64}`}
                                alt={attachment.file_name}
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="w-full h-32 flex items-center justify-center bg-muted">
                                <Paperclip className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="p-2">
                              <p
                                className="text-xs text-muted-foreground truncate"
                                title={
                                  attachment.file_name ||
                                  `Attachment ${index + 1}`
                                }
                              >
                                {attachment.file_name ||
                                  `Attachment ${index + 1}`}
                              </p>
                            </div>
                            {attachment.file_data_base64 && (
                              <a
                                href={`data:${attachment.content_type};base64,${attachment.file_data_base64}`}
                                download={
                                  attachment.file_name ||
                                  `attachment-${index + 1}`
                                }
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                              >
                                <Download className="w-5 h-5 text-white" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No attachments uploaded
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-5">
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-muted/40">
                      <p className="text-sm text-muted-foreground">
                        Grand Total
                      </p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(billTotal)}
                      </p>
                    </Card>

                    <Card className="p-4 bg-green-50">
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(paymentSummary.paid)}
                      </p>
                    </Card>

                    <Card className="p-4 bg-orange-50">
                      <p className="text-sm text-muted-foreground">
                        Outstanding
                      </p>
                      <p className="text-xl font-semibold text-orange-600">
                        {formatCurrency(paymentSummary.outstanding)}
                      </p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PAYMENTS - same pattern as Lease Payment Terms */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Details
                    </h3>
                    {bill?.status !== "paid" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(undefined);
                          setPaymentFormMode("create");
                          setIsPaymentFormOpen(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Record Payment
                      </Button>
                    )}
                  </div>

                  {payments && payments.length > 0 ? (
                    <div className="space-y-4">
                      {payments.map((payment: any, idx: number) => {
                        const notes =
                          payment.notes ||
                          payment.meta?.notes ||
                          payment.meta?.remarks;

                        return (
                          <Card
                            key={payment.id || idx}
                            className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                          >
                            <CardContent className="p-4 md:p-5">
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="p-2 bg-muted rounded-lg">
                                    {getPaymentMethodIcon(
                                      payment.method || "card",
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold flex items-center gap-2">
                                      {payment.method
                                        ? payment.method.toUpperCase()
                                        : "UNKNOWN"}
                                      {payment.id && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] uppercase"
                                        >
                                          ID: {payment.id.slice(0, 8)}...
                                        </Badge>
                                      )}
                                    </p>
                                    {payment.ref_no && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        <span className="font-medium">
                                          Reference:
                                        </span>{" "}
                                        {payment.ref_no}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <p className="text-xl md:text-2xl font-bold">
                                      {formatCurrency(payment.amount)}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDownloadReceipt(payment.id)
                                    }
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {bill?.status !== "paid" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedPayment(payment);
                                        setPaymentFormMode("edit");
                                        setIsPaymentFormOpen(true);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-0.5">
                                    Date
                                  </p>
                                  <p className="text-sm font-medium">
                                    {payment.paid_at
                                      ? new Date(
                                        payment.paid_at,
                                      ).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "short",
                                        day: "2-digit",
                                      })
                                      : "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-0.5">
                                    Notes
                                  </p>
                                  <p className="text-sm font-medium line-clamp-2">
                                    {notes || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-0.5">
                                    Vendor
                                  </p>
                                  <p className="text-sm font-medium">
                                    {(bill as any).vendor_name || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] text-muted-foreground mb-0.5">
                                    Currency
                                  </p>
                                  <p className="text-sm font-medium">
                                    {systemCurrency?.name}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No payments recorded
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* HISTORY */}
            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" /> Activity History
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {(bill as any).created_at && (
                      <li>
                        Bill created on{" "}
                        {new Date(
                          (bill as any).created_at,
                        ).toLocaleDateString()}
                      </li>
                    )}
                    {(bill as any).updated_at &&
                      (bill as any).created_at !== (bill as any).updated_at && (
                        <li>
                          Last updated on{" "}
                          {new Date(
                            (bill as any).updated_at,
                          ).toLocaleDateString()}
                        </li>
                      )}
                    {payments && payments.length > 0 && (
                      <li>{payments.length} payment(s) recorded</li>
                    )}
                    {!(bill as any).created_at &&
                      !payments?.length &&
                      !(bill as any).updated_at && (
                        <li className="text-muted-foreground">
                          No activity history available
                        </li>
                      )}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {bill && id && (
        <PaymentDetailsForm
          billId={id}
          payment={selectedPayment}
          mode={paymentFormMode}
          isOpen={isPaymentFormOpen}
          currency={(bill as any).currency || "INR"}
          onClose={() => {
            setIsPaymentFormOpen(false);
            setSelectedPayment(undefined);
          }}
          onSave={async () => {
            if (!id) return { success: false };
            try {
              const reloadResponse = await withLoader(async () => {
                return await billsApiService.getBillById(id);
              });
              if (reloadResponse?.success) {
                const data = reloadResponse.data?.data ?? reloadResponse.data;
                setBill(data);
                setPayments(data?.payments || []);
              }
              return reloadResponse;
            } catch (error) {
              console.error("Error reloading bill:", error);
              return { success: false };
            }
          }}
        />
      )}

      <AlertDialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg">
                  Issue this bill?
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>
                      The bill status will change from{" "}
                      <span className="font-medium text-foreground">Draft</span>{" "}
                      to{" "}
                      <span className="font-medium text-foreground">
                        Issued
                      </span>
                      .
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="font-medium text-foreground">
                      Are you sure you want to issue this bill?
                    </span>
                  </div>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-w-24">Cancel</AlertDialogCancel>
            <AlertDialogAction className="min-w-28" onClick={handleIssueBill}>
              Issue Bill
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentContainer>
  );
}
