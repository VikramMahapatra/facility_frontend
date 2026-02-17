import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { toast } from "@/components/ui/app-toast";
import { invoiceApiService } from "@/services/financials/invoicesapi";
import { useLoader } from "@/context/LoaderContext";

interface PaymentDetail {
  id?: string;
  method: "upi" | "card" | "bank" | "cash" | "cheque" | "other";
  ref_no: string;
  paid_at: string;
  amount: number | string;
}

interface PaymentDetailsFormProps {
  invoiceId: string;
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
};

export function PaymentDetailsForm({
  invoiceId,
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

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && payment) {
        setPaymentDetail({
          id: (payment as any).id,
          method: payment.method || "upi",
          ref_no: payment.ref_no || "",
          paid_at: payment.paid_at || "",
          amount: payment.amount || 0,
        });
      } else {
        setPaymentDetail(initialPaymentValues);
      }
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

    // Reference number required for non-cash payments
    if (paymentDetail.method !== "cash" && !paymentDetail.ref_no?.trim()) {
      toast.error("Reference number is required for this payment method.");
      return;
    }

    const paymentPayload = {
      id: paymentDetail.id || undefined,
      invoice_id: invoiceId,
      method: paymentDetail.method,
      ref_no: paymentDetail.ref_no || "",
      amount: amount,
      paid_at: paymentDetail.paid_at,
      meta: "",
    };

    setIsSubmitting(true);
    setSavingButton(saveAndNew ? "saveAndNew" : "save");
    try {
      const response = await withLoader(async () => {
        return await invoiceApiService.saveInvoicePayment(paymentPayload);
      });

      if (response?.success) {
        toast.success(
          `Payment ${mode === "create" ? "added" : "updated"} successfully.`
        );

        if (onSave) {
          await onSave(paymentDetail);
        }

        if (saveAndNew) {
          setPaymentDetail(initialPaymentValues);
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Payment" : "Edit Payment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 1st row: Mode, Reference No, Amount */}
          <div className="grid grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <Label>Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  {currency === "INR"
                    ? "₹"
                    : currency === "USD"
                      ? "$"
                      : currency === "EUR"
                        ? "€"
                        : currency || "₹"}
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

          {/* 2nd row: Date */}
          <div className="space-y-2">
            <Label>Payment Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                className="pl-10"
                value={paymentDetail.paid_at || ""}
                onChange={(e) => updatePaymentDetail("paid_at", e.target.value)}
              />
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
