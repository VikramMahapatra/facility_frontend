import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractApiService } from "@/services/pocurments/contractapi";
import { vendorsApiService } from "@/services/pocurments/vendorsapi";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { organisationApiService } from "@/services/spaces_sites/organisationapi";
import { ContractFormValues, contractSchema } from "@/schemas/contract.schema";
import { toast } from "sonner";

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

export function ContractForm({ contract, isOpen, onClose, onSave, mode }: ContractFormProps) {
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

  const documents = watch("documents") || [];

  const loadAll = async () => {
    setFormLoading(true);

    await Promise.all([loadTypeLookup(), loadStatusLookup(), loadVendorLookup(), loadSiteLookup()]);
    
    reset(
      contract
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
          sla: { response_hrs: contract.terms?.sla?.response_hrs || undefined },
          penalty: { per_day: contract.terms?.penalty?.per_day || undefined },
        },
        documents: contract.documents || [],
      }
        : emptyFormData
    );
    setFormLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [contract, mode, reset]);

  

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
    const newDocument: Document = { id: `doc-${Date.now()}`, url: "", name: "" };
    const currentDocuments = getValues("documents") || [];
    setValue("documents", [...currentDocuments, newDocument]);
  };

  const removeDocument = (documentId: string) => {
    const currentDocuments = getValues("documents") || [];
    setValue(
      "documents",
      currentDocuments.filter((doc) => doc.id !== documentId)
    );
  };

  const updateDocument = (documentId: string, field: keyof Document, value: string) => {
    const currentDocuments = getValues("documents") || [];
    setValue(
      "documents",
      currentDocuments.map((doc) => (doc.id === documentId ? { ...doc, [field]: value } : doc))
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
    const formResponse = await onSave({
      ...contract,
      ...data,
    });
  };
     



  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="type">Contract Type</Label>
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeList.map((t: any) => (
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
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusList.map((s: any) => (
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
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger className={errors.vendor_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorList.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendor_id && <p className="text-sm text-red-500">{errors.vendor_id.message}</p>}
                </div>
              )}
            />

            <Controller
              name="site_id"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="site">Site</Label>
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {siteList.map((site: any) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
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
              {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Contract Value (₹)</Label>
              <Input
                id="value"
                type="number"
                step="any"
                {...register("value", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                disabled={isReadOnly}
                placeholder="500000"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
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
                  {...register("terms.sla.response_hrs", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                  disabled={isReadOnly}
                  placeholder="4"
                  className={errors.terms?.sla?.response_hrs ? "border-red-500" : ""}
                />
                {errors.terms?.sla?.response_hrs && (
                  <p className="text-sm text-red-500">{errors.terms.sla.response_hrs.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="penalty_per_day">Penalty - Per Day (₹)</Label>
                <Input
                  id="penalty_per_day"
                  type="number"
                  step="any"
                  {...register("terms.penalty.per_day", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                  disabled={isReadOnly}
                  placeholder="1000"
                  className={errors.terms?.penalty?.per_day ? "border-red-500" : ""}
                />
                {errors.terms?.penalty?.per_day && (
                  <p className="text-sm text-red-500">{errors.terms.penalty.per_day.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Document URLs</h3>
              {!isReadOnly && (
                <Button type="button" variant="outline" size="sm" onClick={addDocument} className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add URL
                </Button>
              )}
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {documents.map((doc: Document, index: number) => (
                    <div key={doc.id} className="flex items-center space-x-3 p-3 bg-white rounded border">
                      <div className="flex-shrink-0 w-6 text-center">
                        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                      </div>

                      <div className="w-56">
                        <Input
                          placeholder="Name"
                          value={doc.name}
                          onChange={(e) => updateDocument(doc.id, "name", e.target.value)}
                          disabled={isReadOnly}
                          className="h-8"
                        />
                      </div>

                      <div className="flex-1">
                        <Input
                          placeholder="Enter document URL..."
                          value={doc.url}
                          onChange={(e) => updateDocument(doc.id, "url", e.target.value)}
                          disabled={isReadOnly}
                          className="h-8"
                        />
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {doc.url && isValidUrl(doc.url) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, "_blank")}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No URLs added yet</p>
                      <p className="text-xs">Click "Add URL" to add your first document URL</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {mode !== "view" && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : mode === "create" ? "Create Contract" : "Update Contract"}
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