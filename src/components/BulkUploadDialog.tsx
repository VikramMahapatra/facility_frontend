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
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Meter, MeterReading } from "@/data/mockEnergyData";
import { meterReadingApiService } from "@/services/energy_iot/meterreadingsapi";

interface BulkUploadDialogProps {
  type: "meters" | "readings";
  onImport: (data: any[]) => void;
}

export function BulkUploadDialog({ type, onImport }: BulkUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    { row: number; errors: string[] }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    let templateData: any[] = [];
    let filename = "";

    if (type === "meters") {
      filename = "meters_template.xlsx";
      templateData = [
        {
          code: "ELE-001",
          kind: "electricity",
          unit: "kWh",
          multiplier: 1.0,
          siteName: "Tech Park Mall",
          spaceName: "Ground Floor",
          status: "active",
        },
        {
          code: "WAT-002",
          kind: "water",
          unit: "m3",
          multiplier: 1.0,
          siteName: "Hotel Paradise",
          spaceName: "Basement",
          status: "active",
        },
      ];
    } else {
      filename = "readings_template.xlsx";
      templateData = [
        {
          meterCode: "ELE-001",
          reading: 15420.5,
          timestamp: new Date().toISOString(),
          source: "manual",
        },
        {
          meterCode: "WAT-002",
          reading: 1250.8,
          timestamp: new Date().toISOString(),
          source: "iot",
        },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      type === "meters" ? "Meters" : "Readings"
    );
    XLSX.writeFile(wb, filename);

    toast.success(`${filename} has been downloaded successfully.`);
  };

  const meterUnits = [
    { id: "kWh", name: "kWh (Kilowatt Hours)" },
    { id: "kW", name: "kW (Kilowatts)" },
    { id: "m3", name: "m³ (Cubic Meters)" },
    { id: "L", name: "L (Liters)" },
    { id: "gal", name: "Gallons" },
    { id: "therms", name: "Therms" },
    { id: "BTU", name: "BTU (British Thermal Units)" },
    { id: "tons", name: "Tons" },
    { id: "count", name: "Count" },
    { id: "hours", name: "Hours" },
  ];

  const validateMeter = (meter: any, index: number): string[] => {
    const errors: string[] = [];

    if (!meter.code) errors.push("Code is required");
    if (!meter.kind) errors.push("Kind is required");
    if (
      !["electricity", "water", "gas", "btuh", "people_counter"].includes(
        meter.kind
      )
    ) {
      errors.push(
        "Invalid kind (must be: electricity, water, gas, btuh, or people_counter)"
      );
    }
    if (!meter.unit) {
      errors.push("Unit is required");
    } else if (!meterUnits.some((u) => u.id === meter.unit)) {
      const validUnits = meterUnits.map((u) => u.id).join(", ");
      errors.push(
        `Invalid unit '${meter.unit}' (must be one of: ${validUnits})`
      );
    }
    if (meter.multiplier === undefined || meter.multiplier === null)
      errors.push("Multiplier is required");
    if (isNaN(meter.multiplier)) errors.push("Multiplier must be a number");
    if (!meter.siteName) errors.push("Site name is required");
    if (!meter.spaceName) errors.push("Space name is required");
    if (!["active", "inactive", "maintenance"].includes(meter.status)) {
      errors.push("Invalid status (must be: active, inactive, or maintenance)");
    }

    return errors;
  };

  const validateReading = (reading: any, index: number): string[] => {
    const errors: string[] = [];

    if (!reading.meterCode) errors.push("Meter code is required");
    if (reading.reading === undefined || reading.reading === null)
      errors.push("Reading value is required");
    if (isNaN(reading.reading)) errors.push("Reading must be a number");
    if (!reading.timestamp) errors.push("Timestamp is required");
    if (!["manual", "iot"].includes(reading.source)) {
      errors.push("Invalid source (must be: manual or iot)");
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
          const rowErrors =
            type === "meters"
              ? validateMeter(row, index)
              : validateReading(row, index);

          if (rowErrors.length > 0) {
            errors.push({ row: index + 2, errors: rowErrors }); // +2 because of header row and 0-index
          }
        });

        setParsedData(jsonData);
        setValidationErrors(errors);

        if (errors.length === 0) {
          toast.success(`${jsonData.length} ${type} ready to import.`);
        } else {
          toast.error(
            `${errors.length} rows have errors. Please review before importing.`
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
      let importResponse;
      if (type === "meters")
        importResponse = await handleBulkMeterImport(parsedData);
      else importResponse = await handleBulkReadingImport(parsedData);

      if (
        !importResponse.validations ||
        importResponse.validations.length === 0
      ) {
        onImport(parsedData);
        toast.success(`${parsedData.length} ${type} have been imported.`);

        setParsedData([]);
        setValidationErrors([]);
        setIsOpen(false);
      } else {
        setValidationErrors(importResponse.validations);
        toast.error(
          `${importResponse.inserted} ${type} have been imported, ${importResponse.validations.length} ${type} import failed`
        );
      }
    } catch (err) {
      console.error("Import failed:", err);
       toast.error("A technical error occurred during import.");
    }
  };

  const handleBulkMeterImport = async (data: any[]) => {
    console.log("Importing meters:", data);
    try {
      const resp = await meterReadingApiService.bulkUploadMeters(data);
      return resp;
    } catch (err) {
      throw err;
    }
  };

  const handleBulkReadingImport = async (data: any[]) => {
    console.log("Importing readings:", data);
    try {
      const resp = await meterReadingApiService.bulkUploadMeterReadings(data);
      return resp;
    } catch (err) {
      throw err;
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
          <DialogTitle>
            Bulk Upload {type === "meters" ? "Meters" : "Readings"}
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to import multiple {type} at once.
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
                          {parsedData.length} {type} ready to import
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
                        {type === "meters" ? (
                          <>
                            <TableHead>Code</TableHead>
                            <TableHead>Kind</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Space</TableHead>
                            <TableHead>Status</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Meter Code</TableHead>
                            <TableHead>Reading</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Source</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((row: any, idx) => (
                        <TableRow key={idx}>
                          {type === "meters" ? (
                            <>
                              <TableCell>{row.code}</TableCell>
                              <TableCell className="capitalize">
                                {row.kind}
                              </TableCell>
                              <TableCell>{row.unit}</TableCell>
                              <TableCell>{row.siteName}</TableCell>
                              <TableCell>{row.spaceName}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    row.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {row.status}
                                </Badge>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{row.meterCode}</TableCell>
                              <TableCell>{row.reading}</TableCell>
                              <TableCell className="text-sm">
                                {new Date(row.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    row.source === "iot"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {row.source}
                                </Badge>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                      {parsedData.length > 10 && (
                        <TableRow>
                          <TableCell
                            colSpan={type === "meters" ? 5 : 4}
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
                  Import {parsedData.length} {type}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
