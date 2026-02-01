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
import { toast } from "sonner";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";

interface PaymentTerm {
  description?: string;
  payment_mode?: string;
  reference_no?: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
}

interface PaymentTermsFormProps {
  leaseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function PaymentTermsForm({
  leaseId,
  isOpen,
  onClose,
  onSave,
}: PaymentTermsFormProps) {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [paymentModeList, setPaymentModeList] = useState<any[]>([]);

  // Load payment mode lookup
  useEffect(() => {
    if (isOpen) {
      // TODO: Implement payment mode lookup API
      // For now, using static options with icons
      setPaymentModeList([
        { id: "cash", name: "Cash", icon: Banknote },
        { id: "cheque", name: "Cheque", icon: FileText },
        { id: "bank_transfer", name: "Bank Transfer", icon: Building2 },
        { id: "online", name: "Online", icon: Globe },
        { id: "card", name: "Card", icon: CreditCard },
      ]);
    }
  }, [isOpen]);

  // Add default entry when form opens
  useEffect(() => {
    if (isOpen && paymentTerms.length === 0) {
      setPaymentTerms([
        {
          description: "",
          payment_mode: "",
          reference_no: "",
          due_date: "",
          amount: 0,
          status: "pending",
        },
      ]);
    }
  }, [isOpen, paymentTerms.length]);

  const updatePaymentTerm = (
    field: keyof PaymentTerm,
    value: any,
  ) => {
    if (paymentTerms.length > 0) {
      const updated = [...paymentTerms];
      updated[0] = { ...updated[0], [field]: value };
      setPaymentTerms(updated);
    }
  };

  const handleSave = async (saveAndNew: boolean = false) => {
    if (paymentTerms.length === 0) {
      toast.error("Please fill in payment term details.");
      return;
    }

    const term = paymentTerms[0];
    
    // Validate payment term
    if (!term.due_date || !term.amount || term.amount <= 0) {
      toast.error("Please fill in all required fields (Due Date and Amount).");
      return;
    }

    try {
      // TODO: Implement API endpoint for saving payment terms
      // const response = await leasesApiService.savePaymentTerm(leaseId, term);
      
      // Temporary: Show success message
      console.log("Payment term to save:", term);
      toast.success("Payment term saved successfully.");
      
      if (onSave) {
        onSave();
      }

      if (saveAndNew) {
        // Clear form for new entry
        setPaymentTerms([
        {
          description: "",
          payment_mode: "",
          reference_no: "",
          due_date: "",
          amount: 0,
          status: "pending",
        },
        ]);
      } else {
        // Close form
        handleClose();
      }
    } catch (error) {
      console.error("Error saving payment term:", error);
      toast.error("Failed to save payment term. Please try again.");
    }
  };

  const handleClose = () => {
    setPaymentTerms([]);
    onClose();
  };

  // Reset to default entry when form closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentTerms([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Payment Terms</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {paymentTerms.length > 0 && (
            <div className="space-y-4">
              {/* 1st row: Description */}
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="e.g., Initial Payment, Q1 Rent"
                  value={paymentTerms[0].description || ""}
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
                    value={paymentTerms[0].payment_mode || ""}
                    onValueChange={(value) =>
                      updatePaymentTerm("payment_mode", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode">
                        {paymentTerms[0].payment_mode && (() => {
                          const selectedMode = paymentModeList.find(
                            (m: any) => m.id === paymentTerms[0].payment_mode
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
                    value={paymentTerms[0].reference_no || ""}
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
                    value={paymentTerms[0].amount || ""}
                    onChange={(e) =>
                      updatePaymentTerm(
                        "amount",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className={
                      !paymentTerms[0].amount || paymentTerms[0].amount <= 0
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
                    value={paymentTerms[0].due_date || ""}
                    onChange={(e) =>
                      updatePaymentTerm("due_date", e.target.value)
                    }
                    className={!paymentTerms[0].due_date ? "border-orange-300" : ""}
                  />
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select
                    value={paymentTerms[0].status || "pending"}
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
          )}
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
