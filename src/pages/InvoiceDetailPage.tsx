import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  History,
  ArrowLeft,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Plus,
  MapPin,
  Receipt,
  Coins,
  User,
  Clock,
  CircleDollarSign,
  Percent,
  BadgeIndianRupee,
} from "lucide-react";
import { Invoice, PaymentInput } from "@/interfaces/invoices_interfaces";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { toast } from "@/components/ui/app-toast";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { InvoiceForm } from "@/components/InvoiceForm";
import { PaymentDetailsForm } from "@/components/PaymentDetailsForm";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | undefined>();
  const [paymentFormMode, setPaymentFormMode] = useState<"create" | "edit">(
    "create"
  );

  useEffect(() => {
    if (!id) return;

    const loadInvoice = async () => {
      const response = await withLoader(async () => {
        return await invoiceApiService.getInvoiceById(id);
      });

      if (response?.success) {
        setInvoice(response.data);
        // Set payments from invoice.payments on load
        if (response.data?.payments) {
          setPayments(response.data.payments);
        } else {
          setPayments([]);
        }
      } else {
        toast.error("Failed to load invoice details");
        navigate("/invoices");
      }
    };

    loadInvoice();
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

  const formatCurrency = (
    amount: number | undefined,
    currency: string = "INR"
  ) => {
    const numAmount = amount || 0;
    const symbol =
      currency === "INR"
        ? "₹"
        : currency === "USD"
          ? "$"
          : currency === "EUR"
            ? "€"
            : currency;
    return `${symbol} ${numAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculatePaymentSummary = () => {
    if (!invoice) return { paid: 0, outstanding: 0, status: "Unpaid" };

    const invoiceTotal = invoice.totals?.grand || 0;
    // Use payments state instead of invoice.payments

    // Calculate total paid amount from all payments
    const paid = payments.reduce((sum, payment: any) => {
      let amount = 0;
      if (payment.amount !== undefined && payment.amount !== null) {
        // Handle both number and string amounts
        if (typeof payment.amount === "number") {
          amount = payment.amount;
        } else if (typeof payment.amount === "string") {
          amount = parseFloat(payment.amount) || 0;
        }
      }
      return sum + amount;
    }, 0);

    const outstanding = Math.max(0, invoiceTotal - paid);
    const status =
      outstanding <= 0 && paid > 0
        ? "Paid"
        : paid > 0
          ? "Partially Paid"
          : "Unpaid";

    return { paid, outstanding, status };
  };

  const paymentSummary = calculatePaymentSummary();

  const progress =
    invoice?.totals?.grand > 0
      ? (paymentSummary.paid / invoice.totals.grand) * 100
      : 0;

  return (
    <ContentContainer>
      <LoaderOverlay />
      {invoice && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/invoices")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold">
                    Invoice #{invoice.invoice_no}
                  </h1>
                  {getStatusBadge(invoice.status)}
                </div>

                <p className="text-sm text-muted-foreground mt-1">
                  {invoice.lines?.length || 0} charges • {invoice.currency}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInvoiceFormOpen(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>


          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              {/*<TabsTrigger value="history">History</TabsTrigger>*/}
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Progress</span>
                    <span className="font-medium">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      Paid: {formatCurrency(paymentSummary.paid, invoice.currency)}
                    </span>
                    <span className="text-orange-600 font-medium">
                      Outstanding: {formatCurrency(paymentSummary.outstanding, invoice.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-medium">{invoice.user_name || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Space</p>
                    <p className="font-medium">{invoice.space_name + ", " + invoice.site_name || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Charges
                    </h3>

                    <Badge variant="secondary">
                      {invoice.lines?.length || 0} items
                    </Badge>
                  </div>

                  {invoice.lines && invoice.lines.length > 0 ? (
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr className="text-muted-foreground">
                            <th className="text-left p-4">Type</th>
                            <th className="text-left p-4">Description</th>
                            <th className="text-left p-4">Period</th>
                            <th className="text-left p-4">Tax</th>
                            <th className="text-right p-4">Amount</th>
                          </tr>
                        </thead>

                        <tbody>
                          {invoice.lines.map((line) => (
                            <tr key={line.id} className="border-t">
                              <td className="p-4 font-medium">
                                {line.code?.toUpperCase()}
                              </td>

                              <td className="p-4 text-muted-foreground">
                                {line.description || "-"}
                              </td>

                              <td className="p-4">
                                {line.item_label || "-"}
                              </td>

                              <td className="p-4">
                                {line.tax_pct || 0}%
                              </td>

                              <td className="p-4 text-right font-semibold">
                                {formatCurrency(line.amount, invoice.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No charges attached to this invoice.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Totals */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-5">
                    Financial Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-muted/40">
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(invoice.totals?.sub, invoice.currency)}
                      </p>
                    </Card>

                    <Card className="p-4 bg-muted/40">
                      <p className="text-sm text-muted-foreground">Tax</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(invoice.totals?.tax, invoice.currency)}
                      </p>
                    </Card>

                    <Card className="p-4 bg-green-50">
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(paymentSummary.paid, invoice.currency)}
                      </p>
                    </Card>

                    <Card className="p-4 bg-orange-50">
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="text-xl font-semibold text-orange-600">
                        {formatCurrency(paymentSummary.outstanding, invoice.currency)}
                      </p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PAYMENTS */}
            <TabsContent value="payments" className="space-y-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Payment Details
                  </h3>
                  <Button
                    onClick={() => {
                      setSelectedPayment(undefined);
                      setPaymentFormMode("create");
                      setIsPaymentFormOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Record Payment
                  </Button>
                </div>

                {payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment: any, idx) => (
                      <Card key={payment.id || idx} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-muted rounded-lg">
                              {getPaymentMethodIcon(payment.method || "card")}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">
                                  {payment.method
                                    ? payment.method.toUpperCase()
                                    : "Unknown"}
                                </p>
                                {payment.id && (
                                  <Badge variant="outline" className="text-xs">
                                    ID: {payment.id.slice(0, 8)}...
                                  </Badge>
                                )}
                              </div>

                              {payment.ref_no && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Reference:</strong> {payment.ref_no}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                <strong>Date:</strong>{" "}
                                {payment.paid_at
                                  ? new Date(
                                    payment.paid_at
                                  ).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                  : "-"}
                              </p>
                              {payment.billable_item_name && (
                                <p className="text-xs text-muted-foreground">
                                  Item Name: {payment.billable_item_name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {formatCurrency(
                                  payment.amount,
                                  invoice.currency
                                )}
                              </p>
                            </div>
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
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No payments recorded
                  </p>
                )}
              </CardContent>
            </TabsContent>

            {/* HISTORY */}
            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" /> Activity History
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {invoice.created_at && (
                      <li>
                        Invoice created on{" "}
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </li>
                    )}
                    {invoice.updated_at &&
                      invoice.created_at !== invoice.updated_at && (
                        <li>
                          Last updated on{" "}
                          {new Date(invoice.updated_at).toLocaleDateString()}
                        </li>
                      )}
                    {payments && payments.length > 0 && (
                      <li>{payments.length} payment(s) recorded</li>
                    )}
                    {!invoice.created_at &&
                      !payments?.length &&
                      !invoice.updated_at && (
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

      {invoice && (
        <>
          <InvoiceForm
            invoice={invoice}
            isOpen={isInvoiceFormOpen}
            onClose={() => setIsInvoiceFormOpen(false)}
            mode="edit"
            onSave={async (invoiceData: Partial<Invoice>) => {
              if (!invoice) return { success: false };

              const updatedInvoice = {
                ...invoice,
                ...invoiceData,
                id: invoice.id,
                invoice_no: invoice.invoice_no,
                updated_at: new Date().toISOString(),
              };

              const response = await withLoader(async () => {
                return await invoiceApiService.updateInvoice(updatedInvoice);
              });

              if (response?.success) {
                setIsInvoiceFormOpen(false);
                toast.success("Invoice updated successfully.");
                // Reload invoice data
                const reloadResponse = await withLoader(async () => {
                  return await invoiceApiService.getInvoiceById(id!);
                });
                if (reloadResponse?.success) {
                  setInvoice(reloadResponse.data);
                }
              } else if (response && !response.success) {
                if (response?.message) {
                  toast.error(response.message);
                } else {
                  toast.error("Failed to update invoice.");
                }
              }
              return response;
            }}
          />

          {id && invoice && (
            <PaymentDetailsForm
              invoiceId={id}
              payment={selectedPayment}
              mode={paymentFormMode}
              isOpen={isPaymentFormOpen}
              currency={invoice.currency}
              onClose={() => {
                setIsPaymentFormOpen(false);
                setSelectedPayment(undefined);
              }}
              onSave={async (paymentData: any) => {
                // Call payment history API after successful payment save
                if (id) {
                  try {
                    const paymentHistoryResponse = await withLoader(
                      async () => {
                        return await invoiceApiService.getPaymentHistory(id);
                      }
                    );
                    if (paymentHistoryResponse?.success) {
                      const paymentData =
                        paymentHistoryResponse.data?.payments || [];
                      setPayments(
                        Array.isArray(paymentData) ? paymentData : []
                      );
                    } else {
                      // If payment history API fails, fallback to reloading from invoice
                      if (invoice?.payments) {
                        setPayments(invoice.payments);
                      }
                    }
                    return paymentHistoryResponse;
                  } catch (error) {
                    console.error("Error loading payment history:", error);
                    // Fallback to reloading from invoice
                    if (invoice?.payments) {
                      setPayments(invoice.payments);
                    }
                    return { success: false };
                  }
                }
                return { success: false };
              }}
            />
          )}
        </>
      )}
    </ContentContainer>
  );
}
