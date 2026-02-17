import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, FileText, Building2, Globe, CreditCard } from "lucide-react";
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
import { toast } from "@/components/ui/app-toast";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";

interface PaymentTerm {
  id?: string;
  description?: string;
  payment_method?: string;
  reference_no?: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
}

interface PaymentTermsFormProps {
  leaseId: string;
  term: PaymentTerm;
  mode: "create" | "edit" | "view";
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const initialTermValues: PaymentTerm = {
  id: "",
  description: "",
  payment_method: "",
  reference_no: "",
  due_date: "",
  amount: 0,
  status: "pending",

}

export function PaymentTermsForm({
  leaseId,
  term,
  mode,
  isOpen,
  onClose,
  onSave,
}: PaymentTermsFormProps) {
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>(initialTermValues);
  const [paymentModeList, setPaymentModeList] = useState<any[]>([]);

  useEffect(() => {
    setPaymentModeList([
      { id: "cash", name: "Cash", icon: Banknote },
      { id: "cheque", name: "Cheque", icon: FileText },
      { id: "bank_transfer", name: "Bank Transfer", icon: Building2 },
      { id: "online", name: "Online", icon: Globe },
      { id: "card", name: "Card", icon: CreditCard },
    ]);
  }, [])

  // Load payment mode lookup
  useEffect(() => {
    if (mode == "edit") {
      setPaymentTerm(term);
    }
    else {
      setPaymentTerm(initialTermValues);
    }
  }, [isOpen]);


  const updatePaymentTerm = (
    field: keyof PaymentTerm,
    value: any,
  ) => {
    let updated = paymentTerm;
    updated = { ...updated, [field]: value };
    setPaymentTerm(updated);
  };

  const handleSave = async (saveAndNew: boolean = false) => {
    const term = paymentTerm;
    // Validate payment term
    if (!term.due_date || !term.amount || term.amount <= 0) {
      toast.error("Please fill in all required fields (Due Date and Amount).");
      return;
    }

    // TODO: Implement API endpoint for saving payment terms
    const leaseTerm = {
      ...term,
      lease_id: leaseId,
      ...(term.id ? { id: term.id } : { id: undefined }), // 👈 key line
    };
    const response = await leasesApiService.addLeasePaymentTerm(leaseTerm);

    if (response?.success) {
      toast.success("Payment term saved successfully.");
      if (saveAndNew) {
        // Clear form for new entry
        setPaymentTerm(initialTermValues);
      } else {
        // Close form
        handleClose();
      }
      onSave();
    }
  };

  const handleClose = () => {
    setPaymentTerm(initialTermValues);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Payment Terms</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-4">
            {/* 1st row: Description */}
            <div>
              <Label>Description</Label>
              <Input
                placeholder="e.g., Initial Payment, Q1 Rent"
                value={paymentTerm.description || ""}
                onChange={(e) =>
                  updatePaymentTerm("description", e.target.value)
                }
              />
            </div>

            {/* 2nd row: Mode, Reference No, Amount */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Payment Mode</Label>
                <Select
                  value={paymentTerm.payment_method || ""}
                  onValueChange={(value) =>
                    updatePaymentTerm("payment_method", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode">
                      {paymentTerm.payment_method && (() => {
                        const selectedMode = paymentModeList.find(
                          (m: any) => m.id === paymentTerm.payment_method
                        );
                        if (selectedMode && selectedMode.icon) {
                          const IconComponent = selectedMode.icon;
                          return (
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{selectedMode.name}</span>
                            </div>
                          );
                        }
                        return selectedMode?.name || "";
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentModeList.map((mode: any) => {
                      const IconComponent = mode.icon;
                      return (
                        <SelectItem key={mode.id} value={mode.id}>
                          <div className="flex items-center gap-2">
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            <span>{mode.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Reference No</Label>
                <Input
                  placeholder="Enter reference number"
                  value={paymentTerm.reference_no || ""}
                  onChange={(e) =>
                    updatePaymentTerm("reference_no", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="Enter amount"
                  value={paymentTerm.amount || ""}
                  onChange={(e) =>
                    updatePaymentTerm(
                      "amount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className={
                    !paymentTerm.amount || paymentTerm.amount <= 0
                      ? "border-orange-300"
                      : ""
                  }
                />
              </div>
            </div>

            {/* 3rd row: Due Date, Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={paymentTerm.due_date || ""}
                  onChange={(e) =>
                    updatePaymentTerm("due_date", e.target.value)
                  }
                  className={!paymentTerm.due_date ? "border-orange-300" : ""}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={paymentTerm.status || "pending"}
                  onValueChange={(value: "pending" | "paid" | "overdue") =>
                    updatePaymentTerm("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(false)}
          >
            Save
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(true)}
          >
            Save & New
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
