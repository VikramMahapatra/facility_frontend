import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Wallet,
  Building2,
  FileText,
  Smartphone,
  Calendar,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/app-toast";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { paymentsApiService } from "@/services/financials/paymentsapi";
import { useLoader } from "@/context/LoaderContext";
import { useSettings } from "@/context/SettingsContext";

interface PaymentDetail {
  id?: string;
  method: "upi" | "card" | "bank" | "cash" | "cheque" | "other";
  ref_no: string;
  paid_at: string;
  amount: number | string;
  notes?: string;
}

interface PaymentDetailsFormProps {
  invoiceId?: string;
  billId?: string;
  payment?: PaymentDetail;
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentDetail) => Promise<any>;
  currency?: string;
}

const initialPaymentValues: PaymentDetail = {
  method: "upi",
  ref_no: "",
  paid_at: "",
  amount: 0,
  notes: "",
};

export function PaymentDetailsForm({
  invoiceId,
  billId,
  payment,
  mode,
  isOpen,
  onClose,
  onSave,
  currency = "INR",
}: PaymentDetailsFormProps) {
  const { withLoader } = useLoader();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingButton, setSavingButton] = useState<
    "save" | "saveAndNew" | null
  >(null);
  const [paymentDetail, setPaymentDetail] =
    useState<PaymentDetail>(initialPaymentValues);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { systemCurrency } = useSettings();

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && payment) {
        setPaymentDetail({
          id: (payment as any).id,
          method: payment.method || "upi",
          ref_no: payment.ref_no || "",
          paid_at: payment.paid_at || "",
          amount: payment.amount || 0,
          // Try to backfill remarks from meta if present on existing payment
          notes:
            (payment as any).notes ||
            (payment as any).meta?.notes ||
            (typeof (payment as any).meta === "string"
              ? (payment as any).meta
              : ""),
        });
      } else {
        setPaymentDetail(initialPaymentValues);
      }
      setAttachments([]);
    }
  }, [isOpen, mode, payment]);

  const updatePaymentDetail = (field: keyof PaymentDetail, value: any) => {
    setPaymentDetail((prev) => ({ ...prev, [field]: value }));
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Wallet className="h-4 w-4" />;
      case "bank":
        return <Building2 className="h-4 w-4" />;
      case "cheque":
        return <FileText className="h-4 w-4" />;
      case "upi":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleSave = async (saveAndNew: boolean = false) => {
    // Validate payment detail
    if (!paymentDetail.paid_at || !paymentDetail.amount) {
      toast.error("Please fill in all required fields (Date and Amount).");
      return;
    }

    const amount =
      typeof paymentDetail.amount === "string"
        ? parseFloat(paymentDetail.amount) || 0
        : paymentDetail.amount || 0;

    if (amount <= 0) {
      toast.error("Payment amount must be greater than zero.");
      return;
    }

    // Reference number required for non-cash payments (invoices only; bills may not use ref_no)
    if (
      !billId &&
      paymentDetail.method !== "cash" &&
      !paymentDetail.ref_no?.trim()
    ) {
      toast.error("Reference number is required for this payment method.");
      return;
    }

    setIsSubmitting(true);
    setSavingButton(saveAndNew ? "saveAndNew" : "save");
    try {
      let response: { success?: boolean; message?: string };
      if (billId) {
        const billPayload = {
          id: paymentDetail.id || undefined,
          bill_id: billId,
          method: paymentDetail.method,
          amount,
          paid_at: paymentDetail.paid_at,
          meta: paymentDetail.notes
            ? { notes: paymentDetail.notes }
            : undefined,
        };
        if (attachments.length > 0) {
          const formData = new FormData();
          attachments.forEach((file) => formData.append("attachments", file));
          formData.append("payment", JSON.stringify(billPayload));
          response = await withLoader(async () => {
            return await paymentsApiService.recordBillPayment(formData);
          });
        } else {
          response = await withLoader(async () => {
            return await paymentsApiService.recordBillPayment(billPayload);
          });
        }
      } else if (invoiceId) {
        const invoicePayload = {
          id: paymentDetail.id || undefined,
          invoice_id: invoiceId,
          method: paymentDetail.method,
          ref_no: paymentDetail.ref_no || "",
          amount,
          paid_at: paymentDetail.paid_at,
          meta: paymentDetail.notes
            ? { notes: paymentDetail.notes }
            : undefined,
        };
        if (attachments.length > 0) {
          const formData = new FormData();
          attachments.forEach((file) => formData.append("attachments", file));
          formData.append("payment", JSON.stringify(invoicePayload));
          response = await withLoader(async () => {
            return await invoiceApiService.saveInvoicePayment(formData);
          });
        } else {
          response = await withLoader(async () => {
            return await invoiceApiService.saveInvoicePayment(invoicePayload);
          });
        }
      } else {
        toast.error("Missing invoice or bill reference.");
        return;
      }

      if (response?.success) {
        toast.success(
          `Payment ${mode === "create" ? "added" : "updated"} successfully.`,
        );

        if (onSave) {
          await onSave(paymentDetail);
        }

        if (saveAndNew) {
          setPaymentDetail(initialPaymentValues);
          setAttachments([]);
        } else {
          handleClose();
        }
      } else if (response && !response.success) {
        if (response?.message) {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error("Failed to save payment.");
    } finally {
      setIsSubmitting(false);
      setSavingButton(null);
    }
  };

  const handleClose = () => {
    setPaymentDetail(initialPaymentValues);
    setAttachments([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Payment" : "Edit Payment"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4 rounded-lg border bg-muted/40 p-4">
          {/* 1st row: Mode, Reference No, Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Mode *</Label>
              <Select
                value={paymentDetail.method}
                onValueChange={(value: any) =>
                  updatePaymentDetail("method", value)
                }
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(paymentDetail.method)}
                    <SelectValue placeholder="Select payment type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reference No.</Label>
              <Input
                type="text"
                placeholder="Enter Ref No."
                value={paymentDetail.ref_no || ""}
                onChange={(e) => updatePaymentDetail("ref_no", e.target.value)}
                disabled={paymentDetail.method === "cash"}
              />
            </div>
          </div>

          {/* 2nd row: Date & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  className="pl-10"
                  value={paymentDetail.paid_at || ""}
                  onChange={(e) =>
                    updatePaymentDetail("paid_at", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  {systemCurrency?.icon}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={paymentDetail.amount || ""}
                  onChange={(e) =>
                    updatePaymentDetail("amount", e.target.value)
                  }
                  step="any"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              placeholder="Add remarks"
              value={paymentDetail.notes || ""}
              onChange={(e) => updatePaymentDetail("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Attachments</Label>
            <div className="border-2 border-dashed rounded-lg p-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <Paperclip className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {attachments.length > 0
                      ? `${attachments.length} file(s) attached`
                      : "No attachments"}
                  </p>
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-muted p-2 rounded"
                        >
                          <span className="truncate max-w-[320px]">
                            {file.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setAttachments((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    id="payment-file-upload"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setAttachments((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      document
                        .getElementById("payment-file-upload")
                        ?.click();
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Attachment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
          >
            {savingButton === "save" ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            {savingButton === "saveAndNew" ? "Saving..." : "Save & New"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
