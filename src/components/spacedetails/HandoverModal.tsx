import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/app-toast";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";


const HandoverModal = ({ open, onClose, occupancyId }) => {
    const [form, setForm] = useState({
        keys_returned: false,
        accessories_returned: false,
        remarks: ""
    });

    const createHandover = async () => {
        const res = await fetch("/api/handover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                occupancy_id: occupancyId,
                ...form
            })
        });

        const data = await res.json();

        // Redirect to inspection
        window.location.href = `/inspection/${data.id}`;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Space Handover</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Checkbox
                        checked={form.keys_returned}
                        onCheckedChange={(v) =>
                            setForm({ ...form, keys_returned: !!v })
                        }
                    >
                        Keys Returned
                    </Checkbox>

                    <Checkbox
                        checked={form.accessories_returned}
                        onCheckedChange={(v) =>
                            setForm({ ...form, accessories_returned: !!v })
                        }
                    >
                        Accessories Returned
                    </Checkbox>

                    <Textarea
                        placeholder="Remarks"
                        value={form.remarks}
                        onChange={(e) =>
                            setForm({ ...form, remarks: e.target.value })
                        }
                    />

                    <Button onClick={createHandover}>
                        Start Handover
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};