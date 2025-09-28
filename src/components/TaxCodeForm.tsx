import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TaxCode } from "@/interfaces/tax_interfaces";

interface TaxCodeFormProps {
    taxCode?: TaxCode;
    isOpen: boolean;
    onClose: () => void;
    onSave: (taxCode: Partial<TaxCode>) => void;
    mode: "create" | "edit" | "view";
}

const jurisdictions = [
    { code: "IN", name: "India" },
    { code: "US", name: "USA" },
    { code: "UK", name: "United Kingdom" },
    { code: "S", name: "Singapore" },
];

const emptyFormData: Partial<TaxCode> = {
    code: "",
    rate: 0,
    status: "active",
    jurisdiction: "",
    accounts: "",
};

export function TaxCodeForm({ taxCode, isOpen, onClose, onSave, mode }: TaxCodeFormProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<TaxCode>>(emptyFormData);

    useEffect(() => {
        if (taxCode) {
            setFormData(taxCode);
        } else {
            setFormData(emptyFormData);
        }
    }, [taxCode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.rate || !formData.status || !formData.jurisdiction) {
            toast({
                title: "Validation Error",
                description: "Code, Rate, Status, and Jurisdiction are required fields",
                variant: "destructive",
            });
            return;
        }

        const taxCodeData = {
            ...taxCode,
            code: formData.code,
            rate: formData.rate,
            status: formData.status,
            jurisdiction: formData.jurisdiction,
            accounts: formData.accounts,
            updated_at: new Date().toISOString(),
        };

        onSave(taxCodeData);
    };

    const isReadOnly = mode === "view";

    return (
        <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" >
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" && "Create New Tax Code"
                        }
                        {mode === "edit" && "Edit Tax Code"}
                        {mode === "view" && "Tax Code Details"}
                    </DialogTitle>
                </DialogHeader>

                < form onSubmit={handleSubmit} className="space-y-4" >
                    <div>
                        <Label htmlFor="code" > Code * </Label>
                        < Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Enter tax code"
                            disabled={isReadOnly}
                        />
                    </div>

                    < div >
                        <Label htmlFor="rate" > Rate(%) * </Label>
                        < Input
                            id="rate"
                            type="number"
                            step="0.01"
                            value={formData.rate}
                            onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                            placeholder="e.g., 18"
                            disabled={isReadOnly}
                        />
                    </div>

                    < div >
                        <Label htmlFor="status" > Status * </Label>
                        < Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                            disabled={isReadOnly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            < SelectContent >
                                <SelectItem value="active" > Active </SelectItem>
                                < SelectItem value="inactive" > Inactive </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    < div >
                        <Label htmlFor="jurisdiction" > Jurisdiction * </Label>
                        <Select
                            value={formData.jurisdiction}
                            onValueChange={(value) => setFormData({ ...formData, jurisdiction: value })}
                            disabled={isReadOnly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select jurisdiction" />
                            </SelectTrigger>
                            <SelectContent>
                                {jurisdictions.map((j) => (
                                    <SelectItem key={j.code} value={j.code}>
                                        {j.name} ({j.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* < div >
                        <Label htmlFor="accounts" > Accounts </Label>
                        < Textarea
                            id="accounts"
                            value={formData.accounts || ""}
                            onChange={(e) => setFormData({ ...formData, accounts: e.target.value })}
                            placeholder="Optional accounts info"
                            disabled={isReadOnly}
                        />
                    </div> */}

                    < DialogFooter >
                        <Button type="button" variant="outline" onClick={onClose} >
                            {mode === "view" ? "Close" : "Cancel"}
                        </Button>
                        {
                            mode !== "view" && (
                                <Button type="submit" >
                                    {mode === "create" ? "Create Tax Code" : "Update Tax Code"
                                    }
                                </Button>
                            )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
