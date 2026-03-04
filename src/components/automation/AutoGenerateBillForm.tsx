import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { toast } from "@/components/ui/app-toast";
import { useLoader } from "@/context/LoaderContext";
import { billsApiService } from "@/services/financials/billsapi";

interface AutoGenerateBillFormValues {
  month: string;
  year: string;
}

interface AutoGenerateBillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

export const AutoGenerateBillForm = ({
  isOpen,
  onClose,
  onSuccess,
}: AutoGenerateBillFormProps) => {
  const { withLoader } = useLoader();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AutoGenerateBillFormValues>({
    defaultValues: {
      month:
        new Date().getMonth() + 1 < 10
          ? `0${new Date().getMonth() + 1}`
          : `${new Date().getMonth() + 1}`,
      year: currentYear.toString(),
    },
  });

  const onSubmit = async (data: AutoGenerateBillFormValues) => {
    setIsSubmitting(true);
    try {
      const date = `${data.year}-${data.month}-01`;

      const response = await withLoader(async () => {
        return await billsApiService.autoGenerateBills(date);
      });

      if (response?.success) {
        toast.success("Bills generated successfully");
        reset();
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Auto Generate Bills
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Controller
              name="month"
              control={control}
              rules={{ required: "Month is required" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.month && (
              <p className="text-sm text-red-500">{errors.month.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Controller
              name="year"
              control={control}
              rules={{ required: "Year is required" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.year && (
              <p className="text-sm text-red-500">{errors.year.message}</p>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

