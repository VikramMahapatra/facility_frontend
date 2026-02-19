import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/app-toast";
import * as XLSX from "xlsx";

interface ParkingSlotBulkUploadDialogProps {
  onImport: (data: any[]) => void;
}

export function ParkingSlotBulkUploadDialog({
  onImport,
}: ParkingSlotBulkUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    { row: number; errors: string[] }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    const filename = "parking_slots_template.xlsx";
    const templateData = [
      {
        slot_no: "P-001",
        siteName: "Tech Park Mall",
        zoneName: "Zone A",
        slot_type: "covered",
        spaceName: "Unit 101",
      },
      {
        slot_no: "P-002",
        siteName: "Tech Park Mall",
        zoneName: "Zone A",
        slot_type: "open",
        spaceName: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parking Slots");
    XLSX.writeFile(wb, filename);

    toast.success(`${filename} has been downloaded successfully.`);
  };

  const validSlotTypes = ["covered", "open", "visitor", "handicapped", "ev"];

  const validateParkingSlot = (slot: any, index: number): string[] => {
    const errors: string[] = [];

    if (!slot.slot_no) errors.push("Slot number is required");
    if (!slot.siteName) errors.push("Site name is required");
    if (!slot.zoneName) errors.push("Zone name is required");
    if (!slot.slot_type) {
      errors.push("Slot type is required");
    } else if (!validSlotTypes.includes(slot.slot_type.toLowerCase())) {
      const validTypes = validSlotTypes.join(", ");
      errors.push(
        `Invalid slot type '${slot.slot_type}' (must be one of: ${validTypes})`,
      );
    }

    return errors;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate data
        const errors: { row: number; errors: string[] }[] = [];
        jsonData.forEach((row: any, index) => {
          const rowErrors = validateParkingSlot(row, index);

          if (rowErrors.length > 0) {
            errors.push({ row: index + 2, errors: rowErrors }); // +2 because of header row and 0-index
          }
        });

        setParsedData(jsonData);
        setValidationErrors(errors);

        if (errors.length === 0) {
          toast.success(`${jsonData.length} parking slots ready to import.`);
        } else {
          toast.error(
            `${errors.length} rows have errors. Please review before importing.`,
          );
        }
      } catch (error) {
        toast.error("Please ensure the file is a valid Excel file.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsBinaryString(file);
    event.target.value = ""; // Reset input
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast.error("Please fix all validation errors before importing.");
      return;
    }

    try {
      // TODO: Add API call here when ready
      // const response = await parkingSlotApiService.bulkUploadParkingSlots(parsedData);

      // For now, just call the onImport callback
      onImport(parsedData);
      toast.success(`${parsedData.length} parking slots have been imported.`);

      setParsedData([]);
      setValidationErrors([]);
      setIsOpen(false);
    } catch (err) {
      console.error("Import failed:", err);
      toast.error("A technical error occurred during import.");
    }
  };

  const handleCancel = () => {
    setParsedData([]);
    setValidationErrors([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Parking Slots</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import multiple parking slots at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Need a template?</p>
                <p className="text-sm text-muted-foreground">
                  Download our Excel template to get started
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Excel files only (.xlsx, .xls)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Validation Summary */}
          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {validationErrors.length === 0 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700">
                          All rows valid
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {parsedData.length} parking slots ready to import
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">
                          {validationErrors.length} rows with errors
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {parsedData.length - validationErrors.length} valid,{" "}
                          {validationErrors.length} invalid
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error Details */}
              {validationErrors.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-destructive/10 p-3 border-b">
                    <h4 className="font-medium text-sm">Validation Errors</h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Row</TableHead>
                          <TableHead>Errors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationErrors.map((error) => (
                          <TableRow key={error.row}>
                            <TableCell className="font-medium">
                              #{error.row}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {error.errors.map((err, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="destructive"
                                    className="w-fit"
                                  >
                                    {err}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-3 border-b">
                  <h4 className="font-medium text-sm">
                    Data Preview ({parsedData.length} rows)
                  </h4>
                </div>
                <div className="max-h-64 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slot No</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Space</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((row: any, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {row.slot_no}
                          </TableCell>
                          <TableCell>{row.siteName || "-"}</TableCell>
                          <TableCell>{row.zoneName || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {row.slot_type || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.spaceName || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {parsedData.length > 10 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-sm text-muted-foreground"
                          >
                            ... and {parsedData.length - 10} more rows
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validationErrors.length > 0}
                >
                  Import {parsedData.length} parking slots
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
