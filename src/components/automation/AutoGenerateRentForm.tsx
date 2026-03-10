import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { leaseChargeApiService } from "@/services/leasing_tenants/leasechargeapi";
import { toast } from "@/components/ui/app-toast";
import { useLoader } from "@/context/LoaderContext";
import { Checkbox } from "@/components/ui/checkbox";

interface AutoGenerateRentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AutoGenerateRentForm = ({
  isOpen,
  onClose,
  onSuccess,
}: AutoGenerateRentFormProps) => {
  const { withLoader } = useLoader();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateInvoice, setGenerateInvoice] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Call API to sync rent charges for all leases
      const response = await withLoader(async () => {
        return await leaseChargeApiService.autoGenerateRent({
          generateInvoices: generateInvoice,
        });
      });

      if (response?.success) {
        toast.success("Rent charges synced successfully");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error("Failed to sync rent charges");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while syncing rent charges");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setGenerateInvoice(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Auto Generate Rent Charges
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="generate-invoice"
              checked={generateInvoice}
              onCheckedChange={(checked) => setGenerateInvoice(Boolean(checked))}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="generate-invoice"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Generate invoices for the synced rent charges
            </Label>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Sync Rent Charges"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};