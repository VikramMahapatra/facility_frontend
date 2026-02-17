import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileText } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractApiService } from "@/services/procurements/contractapi";
import { vendorsApiService } from "@/services/procurements/vendorsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { ContractFormValues, contractSchema } from "@/schemas/contract.schema";
import { toast } from "@/components/ui/app-toast";
import { withFallback } from "@/helpers/commonHelper";
import { AsyncAutocompleteRQ } from "./common/async-autocomplete-rq";

interface ContractFormProps {
  contract?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: any) => Promise<any>;
  mode: "create" | "edit" | "view";
}

interface Document {
  id: string;
  url: string;
  name: string;
}

const emptyFormData: ContractFormValues = {
  title: "",
  type: "",
  status: "",
  vendor_id: "",
  site_id: "",
  start_date: "",
  end_date: "",
  value: undefined,
  terms: {
    sla: { response_hrs: undefined },
    penalty: { per_day: undefined },
  },
  documents: [],
};

export function ContractForm({
  contract,
  isOpen,
  onClose,
  onSave,
  mode,
}: ContractFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: emptyFormData,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [formLoading, setFormLoading] = useState(true);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAll = async () => {
    setFormLoading(true);

    // Reset file uploads when form opens
    setUploadedImages([]);
    setImagePreviews([]);

    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    reset(
      contract && mode !== "create"
        ? {
          title: contract.title || "",
          type: contract.type || "",
          status: contract.status || "",
          vendor_id: contract.vendor_id || "",
          site_id: contract.site_id || "",
          start_date: contract.start_date || "",
          end_date: contract.end_date || "",
          value: contract.value || undefined,
          terms: {
            sla: {
              response_hrs: contract.terms?.sla?.response_hrs || undefined,
            },
            penalty: {
              per_day: contract.terms?.penalty?.per_day || undefined,
            },
          },
          documents: contract.documents || [],
        }
        : emptyFormData,
    );
    setFormLoading(false);
  };

  useEffect(() => {
    Promise.all([
      loadTypeLookup(),
      loadStatusLookup(),
      loadVendorLookup(),
      loadSiteLookup(),
    ]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [contract, mode, isOpen, reset]);

  const loadTypeLookup = async () => {
    const response = await contractApiService.getTypeLookup();
    if (response.success) setTypeList(response.data || []);
  };

  const loadStatusLookup = async () => {
    const response = await contractApiService.getStatusLookup();
    if (response.success) setStatusList(response.data || []);
  };

  const loadVendorLookup = async () => {
    const response = await vendorsApiService.getVendorLookup();
    if (response.success) setVendorList(response.data || []);
  };

  const loadSiteLookup = async () => {
    const response = await siteApiService.getSiteLookup();
    if (response.success) setSiteList(response.data || []);
  };

  const addDocument = () => {
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      url: "",
      name: "",
    };
    const currentDocuments = getValues("documents") || [];
    setValue("documents", [...currentDocuments, newDocument]);
  };

  const removeDocument = (documentId: string) => {
    const currentDocuments = getValues("documents") || [];
    setValue(
      "documents",
      currentDocuments.filter((doc) => doc.id !== documentId),
    );
  };

  const updateDocument = (
    documentId: string,
    field: keyof Document,
    value: string,
  ) => {
    const currentDocuments = getValues("documents") || [];
    setValue(
      "documents",
      currentDocuments.map((doc) =>
        doc.id === documentId ? { ...doc, [field]: value } : doc,
      ),
    );
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const onSubmitForm = async (data: ContractFormValues) => {
    // Create FormData if there are uploaded files, otherwise use JSON
    let submitData: any;

    if (uploadedImages.length > 0) {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("vendor_id", data.vendor_id);
      formData.append("site_id", data.site_id);
      formData.append("start_date", data.start_date);
      formData.append("end_date", data.end_date);
      formData.append("value", String(data.value || ""));
      if (data.type) formData.append("type", data.type);
      if (data.status) formData.append("status", data.status);
      if (data.terms?.sla?.response_hrs) {
        formData.append(
          "terms.sla.response_hrs",
          String(data.terms.sla.response_hrs),
        );
      }
      if (data.terms?.penalty?.per_day) {
        formData.append(
          "terms.penalty.per_day",
          String(data.terms.penalty.per_day),
        );
      }

      // Append files
      uploadedImages.forEach((file) => {
        formData.append("files", file);
      });

      submitData = formData;
    } else {
      submitData = {
        ...contract,
        ...data,
      };
    }

    const formResponse = await onSave(submitData);
    if (formResponse?.success) {
      // Clean up preview URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setUploadedImages([]);
      setImagePreviews([]);
      reset(emptyFormData);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setUploadedImages([]);
    setImagePreviews([]);
    reset(emptyFormData);
    onClose();
  };

  const isReadOnly = mode === "view";

  const fallbackType = contract?.type
    ? {
      id: contract.type,
      name: contract.type,
      value: contract.type,
    }
    : null;

  const fallbackStatus = contract?.status
    ? {
      id: contract.status,
      name: contract.status,
      value: contract.status,
    }
    : null;

  const fallbackVendor = contract?.vendor_id
    ? {
      id: contract.vendor_id,
      name: contract.vendor_name,
      value: contract.vendor_id,
    }
    : null;

  const types = withFallback(typeList, fallbackType);
  const statuses = withFallback(statusList, fallbackStatus);
  const vendors = withFallback(vendorList, fallbackVendor);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Contract"}
            {mode === "edit" && "Edit Contract"}
            {mode === "view" && "Contract Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {formLoading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Contract Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Contract Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    disabled={isReadOnly}
                    placeholder="Annual Maintenance Contract"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="type">Contract Type</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="status">Contract Status</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>

              {/* Vendor / Site */}
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="vendor_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor *</Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isReadOnly || mode === "edit"}
                      >
                        <SelectTrigger
                          className={errors.vendor_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((v: any) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.vendor_id && (
                        <p className="text-sm text-red-500">
                          {errors.vendor_id.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="site_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="site">Site *</Label>
                      <AsyncAutocompleteRQ
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={isReadOnly || mode === "edit"}
                        placeholder="Select site"
                        queryKey={["contract-sites"]}
                        queryFn={async (search) => {
                          const res =
                            await siteApiService.getSiteLookup(search);
                          if (res.success) {
                            return res.data.map((s: any) => ({
                              id: s.id,
                              label: s.name,
                            }));
                          }
                          return [];
                        }}
                        fallbackOption={
                          contract?.site_id
                            ? {
                              id: contract.site_id,
                              label:
                                contract.site_name ||
                                `Site (${contract.site_id.slice(0, 6)})`,
                            }
                            : undefined
                        }
                        minSearchLength={1}
                      />
                      {errors.site_id && (
                        <p className="text-sm text-red-500">
                          {errors.site_id.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Dates / Value */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                    disabled={isReadOnly}
                    className={errors.start_date ? "border-red-500" : ""}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register("end_date")}
                    disabled={isReadOnly}
                    className={errors.end_date ? "border-red-500" : ""}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-500">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Contract Value (₹) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="any"
                    {...register("value", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    disabled={isReadOnly}
                    placeholder="500000"
                    className={errors.value ? "border-red-500" : ""}
                  />
                  {errors.value && (
                    <p className="text-sm text-red-500">
                      {errors.value.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Terms:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="response_hrs">SLA - Response Hours</Label>
                    <Input
                      id="response_hrs"
                      type="number"
                      step="any"
                      {...register("terms.sla.response_hrs", {
                        setValueAs: (v) => (v === "" ? undefined : Number(v)),
                      })}
                      disabled={isReadOnly}
                      placeholder="4"
                      className={
                        errors.terms?.sla?.response_hrs ? "border-red-500" : ""
                      }
                    />
                    {errors.terms?.sla?.response_hrs && (
                      <p className="text-sm text-red-500">
                        {errors.terms.sla.response_hrs.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="penalty_per_day">
                      Penalty - Per Day (₹)
                    </Label>
                    <Input
                      id="penalty_per_day"
                      type="number"
                      step="any"
                      {...register("terms.penalty.per_day", {
                        setValueAs: (v) => (v === "" ? undefined : Number(v)),
                      })}
                      disabled={isReadOnly}
                      placeholder="1000"
                      className={
                        errors.terms?.penalty?.per_day ? "border-red-500" : ""
                      }
                    />
                    {errors.terms?.penalty?.per_day && (
                      <p className="text-sm text-red-500">
                        {errors.terms.penalty.per_day.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <Label>Attach Documents</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={isReadOnly}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Only JPG, PNG, JPEG, and PDF files must be uploaded</p>
                    <p>• Uploaded files must be less than 2MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
                      const ALLOWED_TYPES = [
                        "image/png",
                        "image/jpeg",
                        "image/jpg",
                        "application/pdf",
                      ];

                      const validFiles: File[] = [];
                      const validPreviews: string[] = [];

                      files.forEach((file) => {
                        // Validation 1: File size (2MB)
                        if (file.size > MAX_FILE_SIZE) {
                          toast.error(
                            `${file.name} exceeds 2MB limit. Please choose a smaller file.`,
                          );
                          return;
                        }

                        // Validation 2: File type (png, jpeg, jpg, pdf)
                        const fileType = file.type.toLowerCase();
                        if (!ALLOWED_TYPES.includes(fileType)) {
                          toast.error(
                            `${file.name} is not a valid file type. Only PNG, JPEG, JPG, and PDF are allowed.`,
                          );
                          return;
                        }

                        // If file passes both validations, add it
                        validFiles.push(file);
                        // For PDFs, we don't create a preview URL, we'll use null
                        if (fileType === "application/pdf") {
                          validPreviews.push("");
                        } else {
                          validPreviews.push(URL.createObjectURL(file));
                        }
                      });

                      if (validFiles.length > 0) {
                        setUploadedImages((prev) => [...prev, ...validFiles]);
                        setImagePreviews((prev) => [...prev, ...validPreviews]);
                      }

                      // Reset file input to allow selecting the same file again
                      if (e.target) {
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  {uploadedImages.length > 0 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {uploadedImages.map((file, index) => {
                          const isPdf = file.type.toLowerCase() === "application/pdf";
                          return (
                            <div key={index} className="relative group">
                              {isPdf ? (
                                <div className="w-full h-24 flex items-center justify-center bg-muted rounded border">
                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                              ) : (
                                <img
                                  src={imagePreviews[index]}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border"
                                />
                              )}
                              {!isReadOnly && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setUploadedImages((prev) =>
                                      prev.filter((_, i) => i !== index),
                                    );
                                    setImagePreviews((prev) => {
                                      if (prev[index]) {
                                        URL.revokeObjectURL(prev[index]);
                                      }
                                      return prev.filter((_, i) => i !== index);
                                    });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        <p>
                          Total: {uploadedImages.length} file(s),{" "}
                          {(
                            uploadedImages.reduce(
                              (sum, file) => sum + file.size,
                              0,
                            ) / 1024
                          ).toFixed(2)}{" "}
                          KB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : mode === "create"
                        ? "Create Contract"
                        : "Update Contract"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
