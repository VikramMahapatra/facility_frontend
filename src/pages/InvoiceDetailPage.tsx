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
} from "lucide-react";
import { Invoice, PaymentInput } from "@/interfaces/invoices_interfaces";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { toast } from "sonner";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadInvoice = async () => {
      const response = await withLoader(async () => {
        return await invoiceApiService.getInvoiceById(id);
      });

      if (response?.success) {
        setInvoice(response.data);
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
    currency: string = "INR",
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
    const payments = invoice.payments || [];

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
                variant="outline"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate(`/invoices/${id}/edit`)}
              >
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
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Site</Label>
                      <p className="font-semibold">
                        {invoice.site_name || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
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
                      <Label className="text-muted-foreground">
                        Billable Item
                      </Label>
                      <p className="font-semibold">
                        {invoice.billable_item_name || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Currency</Label>
                      <p className="font-semibold">
                        {invoice.currency || "INR"}
                      </p>
                    </div>
                    {invoice.customer_name && (
                      <div>
                        <Label className="text-muted-foreground">
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
                        <Calendar className="h-4 w-4" />
                        Due Date
                      </Label>
                      <p className="font-semibold">
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    {invoice.is_paid !== undefined && (
                      <div>
                        <Label className="text-muted-foreground">
                          Payment Status
                        </Label>
                        <p className="font-semibold">
                          {invoice.is_paid ? (
                            <span className="text-green-600">Fully Paid</span>
                          ) : (
                            <span className="text-orange-600">Pending</span>
                          )}
                        </p>
                      </div>
                    )}
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
                      <Label className="text-muted-foreground">Subtotal</Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(invoice.totals?.sub, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tax</Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(invoice.totals?.tax, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Grand Total
                      </Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(
                          invoice.totals?.grand,
                          invoice.currency,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Paid Amount
                      </Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(paymentSummary.paid, invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
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
                          invoice.currency,
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PAYMENTS */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Payment Details
                  </h3>

                  {invoice.payments && invoice.payments.length > 0 ? (
                    <div className="space-y-4">
                      {invoice.payments.map((payment: any, idx) => (
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
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
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
                                        payment.paid_at,
                                      ).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "-"}
                                </p>
                                {payment.billable_item_name && (
                                  <p className="text-xs text-muted-foreground">
                                    {payment.billable_item_name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {formatCurrency(
                                  payment.amount,
                                  invoice.currency,
                                )}
                              </p>
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
                    {invoice.payments && invoice.payments.length > 0 && (
                      <li>{invoice.payments.length} payment(s) recorded</li>
                    )}
                    {!invoice.created_at &&
                      !invoice.payments?.length &&
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
    </ContentContainer>
  );
}
