import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { Invoice } from "@/interfaces/invoices_interfaces";
import { serviceRequestApiService } from "@/services/maintenance_assets/servicerequestapi";
import { leasesApiService } from "@/services/Leasing_Tenants/leasesapi";

// ✅ Same types as service request form
type CustomerKind = 'resident' | 'merchant' | 'guest' | 'staff' | 'other';

interface InvoiceFormProps {
    invoice?: Invoice;
    isOpen: boolean;
    onClose: () => void;
    onSave: (invoice: Partial<Invoice>) => void;
    mode: "create" | "edit" | "view";
}

const emptyFormData: Partial<Invoice> = {
    site_id: "",
    customer_kind: "resident",
    customer_id: "",
    invoice_no: "",
    date: new Date().toISOString().split("T")[0],
    due_date: "",
    status: "draft",
    currency: "INR",
    totals: { sub: 0, tax: 0, grand: 0 },
    meta: {},
};

export function InvoiceForm({ invoice, isOpen, onClose, onSave, mode }: InvoiceFormProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Invoice>>(emptyFormData);
    const [siteList, setSiteList] = useState<any[]>([]);
    const [customerList, setCustomerList] = useState<any[]>([]);
    const [requesterKindList, setRequesterKindList] = useState<any[]>([]);

    useEffect(() => {
        const kind = invoice?.customer_kind || emptyFormData.customer_kind;
        
        if (invoice) {
            console.log("selected invoice:", invoice);
            setFormData(invoice);
        } else {
            setFormData(emptyFormData);
        }
        
        loadSiteLookup();
        loadRequesterKindLookup();
        loadCustomerLookup(kind, invoice?.site_id);
    }, [invoice]);

    // ✅ Load customer when kind or site changes (SAME as service request)
    useEffect(() => {
        loadCustomerLookup(formData.customer_kind, formData.site_id);
    }, [formData.customer_kind, formData.site_id]);

    // ✅ Set customer_id when customerList loads (SAME as service request)
    useEffect(() => {
        if (!invoice) return;
        setFormData((prev) => ({ ...prev, customer_id: String(invoice.customer_id) }));
    }, [customerList]);

    const loadSiteLookup = async () => {
        try {
            const rows = await siteApiService.getSiteLookup();
            if (rows.success) setSiteList(rows.data || []);
        } catch {
            setSiteList([]);
        }
    };

    const loadRequesterKindLookup = async () => {
        try {
            // ✅ Use service request requester kind lookup (SAME as service request)
            const rows = await serviceRequestApiService.getServiceRequestRequesterKindLookup();
            if (rows.success) setRequesterKindList(rows.data || []);
        } catch {
            setRequesterKindList([]);
        }
    };

    const loadCustomerLookup = async (kind?: CustomerKind, site_id?: string) => {
        if (!kind || !site_id) {
            setCustomerList([]);
            return;
        }
        
        try {
            // ✅ SAME LOGIC AS SERVICE REQUEST FORM - Use leasesApiService for customer lookup
            const Kind = kind === "resident" ? "individual" : kind === "merchant" ? "commercial" : kind;
            const lookup = await leasesApiService.getLeasePartnerLookup(Kind, site_id);
            if (lookup.success) setCustomerList(lookup.data || []);
        } catch {
            setCustomerList([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.invoice_no || !formData.customer_id || !formData.site_id) {
            toast({
                title: "Validation Error",
                description: "Invoice No, Site and Customer are required",
                variant: "destructive",
            });
            return;
        }

        onSave({
            ...invoice,
            ...formData,
            updated_at: new Date().toISOString(),
        });
    };

    const isReadOnly = mode === "view";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" && "Create New Invoice"}
                        {mode === "edit" && "Edit Invoice"}
                        {mode === "view" && "Invoice Details"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Invoice No + Site */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="invoice_no">Invoice No *</Label>
                            <Input
                                id="invoice_no"
                                value={formData.invoice_no}
                                onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                                placeholder="INV-2025-001"
                                disabled={isReadOnly}
                            />
                        </div>
                        <div>
                            <Label htmlFor="site_id">Site *</Label>
                            <Select
                                name="site_id"
                                value={formData.site_id}
                                onValueChange={(value) => {
                                    // ✅ SAME as service request - clear customer when site changes
                                    setFormData({ ...formData, site_id: value, customer_id: "" });
                                }}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select site" />
                                </SelectTrigger>
                                <SelectContent>
                                    {siteList.map((site) => (
                                        <SelectItem key={site.id} value={site.id}>
                                            {site.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Customer Kind + Customer ID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="customer_kind">Customer Type *</Label>
                            <Select
                                name="customer_kind"
                                value={formData.customer_kind}
                                onValueChange={(value: CustomerKind) => {
                                    // ✅ SAME as service request - clear customer when type changes
                                    setFormData({ ...formData, customer_kind: value, customer_id: "" });
                                }}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* ✅ Use service request requester kind options */}
                                    {requesterKindList.map((rk: any) => (
                                        <SelectItem key={rk.id} value={rk.id}>
                                            {rk.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="customer_id">Customer *</Label>
                            <Select
                                key={customerList.map(c => c.id).join("-")}
                                name="customer_id"
                                value={formData.customer_id}
                                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                                disabled={isReadOnly || !formData.site_id}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customerList.map((cust) => (
                                        <SelectItem key={cust.id} value={cust.id}>
                                            {cust.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="date">Invoice Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                disabled={isReadOnly}
                            />
                        </div>
                        <div>
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={formData.due_date || ""}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    {/* Status + Currency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: Invoice["status"]) => setFormData({ ...formData, status: value })}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="issued">Issued</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="void">Void</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Input
                                id="currency"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="sub">Subtotal</Label>
                            <Input
                                id="sub"
                                type="number"
                                value={formData.totals?.sub ?? 0}
                                onChange={(e) =>
                                    setFormData({ ...formData, totals: { ...formData.totals, sub: Number(e.target.value) } })
                                }
                                disabled={isReadOnly}
                            />
                        </div>
                        <div>
                            <Label htmlFor="tax">Tax</Label>
                            <Input
                                id="tax"
                                type="number"
                                value={formData.totals?.tax ?? 0}
                                onChange={(e) =>
                                    setFormData({ ...formData, totals: { ...formData.totals, tax: Number(e.target.value) } })
                                }
                                disabled={isReadOnly}
                            />
                        </div>
                        <div>
                            <Label htmlFor="grand">Grand Total</Label>
                            <Input
                                id="grand"
                                type="number"
                                value={formData.totals?.grand ?? 0}
                                onChange={(e) =>
                                    setFormData({ ...formData, totals: { ...formData.totals, grand: Number(e.target.value) } })
                                }
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {mode === "view" ? "Close" : "Cancel"}
                        </Button>
                        {mode !== "view" && (
                            <Button type="submit">{mode === "create" ? "Create Invoice" : "Update Invoice"}</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}