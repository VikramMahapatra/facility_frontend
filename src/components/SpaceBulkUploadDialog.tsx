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
import { spaceKinds, SpaceKind } from "@/interfaces/spaces_interfaces";

interface SpaceBulkUploadDialogProps {
  onImport: (data: any[]) => void;
}

export function SpaceBulkUploadDialog({
  onImport,
}: SpaceBulkUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    { row: number; errors: string[] }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    const filename = "spaces_template.xlsx";
    const templateData = [
      {
        code: "SPC-001",
        name: "Unit 101",
        siteName: "Tech Park Mall",
        buildingBlockName: "Building A",
        category: "residential",
        kind: "apartment",
        floor: 1,
        area_sqft: 1200,
        beds: 2,
        baths: 2,
        status: "available",
        view: "City View",
        furnished: "fully",
        star_rating: "4",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Spaces");
    XLSX.writeFile(wb, filename);

    toast.success(`${filename} has been downloaded successfully.`);
  };

  const validateSpace = (space: any, index: number): string[] => {
    const errors: string[] = [];

    if (!space.code) errors.push("Code is required");
    if (!space.siteName) errors.push("Site name is required");
    if (!space.kind) {
      errors.push("Kind (Type) is required");
    } else if (!spaceKinds.includes(space.kind as SpaceKind)) {
      const validKinds = spaceKinds.join(", ");
      errors.push(
        `Invalid kind '${space.kind}' (must be one of: ${validKinds})`,
      );
    }
    if (
      space.category &&
      !["residential", "commercial"].includes(space.category)
    ) {
      errors.push("Invalid category (must be: residential or commercial)");
    }
    if (
      space.floor !== undefined &&
      space.floor !== null &&
      space.floor !== ""
    ) {
      if (isNaN(Number(space.floor))) {
        errors.push("Floor must be a number");
      }
    }
    if (
      space.area_sqft !== undefined &&
      space.area_sqft !== null &&
      space.area_sqft !== ""
    ) {
      if (isNaN(Number(space.area_sqft))) {
        errors.push("Area (sq ft) must be a number");
      } else if (Number(space.area_sqft) < 0) {
        errors.push("Area (sq ft) cannot be negative");
      }
    }
    if (space.beds !== undefined && space.beds !== null && space.beds !== "") {
      if (isNaN(Number(space.beds)) || !Number.isInteger(Number(space.beds))) {
        errors.push("Beds must be a whole number");
      } else if (Number(space.beds) < 0) {
        errors.push("Beds cannot be negative");
      }
    }
    if (
      space.baths !== undefined &&
      space.baths !== null &&
      space.baths !== ""
    ) {
      if (
        isNaN(Number(space.baths)) ||
        !Number.isInteger(Number(space.baths))
      ) {
        errors.push("Baths must be a whole number");
      } else if (Number(space.baths) < 0) {
        errors.push("Baths cannot be negative");
      }
    }
    if (!space.status) {
      errors.push("Status is required");
    } else if (
      !["available", "occupied", "out_of_service"].includes(space.status)
    ) {
      errors.push(
        "Invalid status (must be: available, occupied, or out_of_service)",
      );
    }
    if (
      space.furnished &&
      !["unfurnished", "semi", "fully"].includes(space.furnished)
    ) {
      errors.push("Invalid furnished (must be: unfurnished, semi, or fully)");
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
          const rowErrors = validateSpace(row, index);

          if (rowErrors.length > 0) {
            errors.push({ row: index + 2, errors: rowErrors }); // +2 because of header row and 0-index
          }
        });

        setParsedData(jsonData);
        setValidationErrors(errors);

        if (errors.length === 0) {
          toast.success(`${jsonData.length} spaces ready to import.`);
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
      // const response = await spacesApiService.bulkUploadSpaces(parsedData);

      // For now, just call the onImport callback
      onImport(parsedData);
      toast.success(`${parsedData.length} spaces have been imported.`);

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
          <DialogTitle>Bulk Upload Spaces</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import multiple spaces at once.
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
                          {parsedData.length} spaces ready to import
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
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((row: any, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {row.code}
                          </TableCell>
                          <TableCell>{row.name || "-"}</TableCell>
                          <TableCell>{row.siteName}</TableCell>
                          <TableCell className="capitalize">
                            {row.category || "-"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {row.kind?.replace("_", " ")}
                          </TableCell>
                          <TableCell>
                            {row.floor !== undefined &&
                              row.floor !== null &&
                              row.floor !== ""
                              ? row.floor
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {row.area_sqft !== undefined &&
                              row.area_sqft !== null &&
                              row.area_sqft !== ""
                              ? `${row.area_sqft} sq ft`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.status === "available"
                                  ? "default"
                                  : row.status === "occupied"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {parsedData.length > 10 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
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
                  Import {parsedData.length} spaces
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
