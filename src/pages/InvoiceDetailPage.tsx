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
import { toast } from "sonner";
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
                <h1 className="text-2xl font-bold">
                  Invoice #{invoice.invoice_no}
                </h1>
                <p className="text-muted-foreground">
                  {invoice.billable_item_name || "Invoice Details"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsInvoiceFormOpen(true)}
                size="icon"
                className="h-8 px-3"
              >
                <Pencil className="h-4 w-4" />
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
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Site
                      </Label>
                      <p className="font-semibold">
                        {invoice.site_name || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Invoice Type
                      </Label>
                      <p className="font-semibold">
                        {invoice.billable_item_type === "lease charge"
                          ? "Lease Charge"
                          : invoice.billable_item_type === "work order"
                          ? "Work Order"
                          : invoice.billable_item_type || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Billable Item
                      </Label>
                      <p className="font-semibold">
                        {invoice.billable_item_name || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        Currency
                      </Label>
                      <p className="font-semibold">
                        {invoice.currency || "INR"}
                      </p>
                    </div>
                    {invoice.customer_name && (
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer
                        </Label>
                        <p className="font-semibold">{invoice.customer_name}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Invoice Date
                      </Label>
                      <p className="font-semibold">
                        {invoice.date
                          ? new Date(invoice.date).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Due Date
                      </Label>
                      <p className="font-semibold">
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Payment Status
                      </Label>
                      <p className="font-semibold">
                        {invoice.is_paid ? (
                          <span className="text-green-600 flex items-center gap-1">
                            Fully Paid
                          </span>
                        ) : (
                          <span className="text-orange-600 flex items-center gap-1">
                            Pending
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Totals */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Financial Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Subtotal
                      </Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(invoice.totals?.sub, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Tax
                      </Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(invoice.totals?.tax, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4" />
                        Grand Total
                      </Label>
                      <p className="text-lg font-semibold text-primary">
                        {formatCurrency(
                          invoice.totals?.grand,
                          invoice.currency
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Paid Amount
                      </Label>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(paymentSummary.paid, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        Outstanding
                      </Label>
                      <p
                        className={`text-lg font-semibold ${
                          paymentSummary.outstanding > 0
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(
                          paymentSummary.outstanding,
                          invoice.currency
                        )}
                      </p>
                    </div>
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
