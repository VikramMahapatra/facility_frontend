import { useState } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog"
import ActionDialog from "@/components/ActionDialog"

export default function SettlementDialog({
    open,
    onClose,
    settlementId,
    onSubmit
}) {
    const [damageCharges, setDamageCharges] = useState("")
    const [pendingDues, setPendingDues] = useState("")

    const finalAmount = Number(damageCharges) + Number(pendingDues)

    const handleSubmit = async () => {
        let data: any = {
            settlement_id: settlementId,
        };
        data = {
            ...data,
            damage_charges: Number(damageCharges),
            pending_dues: Number(pendingDues)
        };
        onSubmit(data);
    }

    if (!open) return null

    return (
        <ActionDialog
            open={open}
            title="Complete Settlement"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText="Complete"
            submittingText="Processing..."
        >

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">
                        Damage Charges
                    </label>
                    <input
                        type="number"
                        value={damageCharges}
                        onChange={(e) =>
                            setDamageCharges(e.target.value)
                        }
                        className="w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">
                        Pending Dues
                    </label>
                    <input
                        type="number"
                        value={pendingDues}
                        onChange={(e) =>
                            setPendingDues(e.target.value)
                        }
                        className="w-full border rounded-md p-2"
                    />
                </div>

                <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-600">
                        Final Amount
                    </p>
                    <p className="text-lg font-semibold">
                        ₹ {finalAmount}
                    </p>
                </div>
            </div>

        </ActionDialog>
    )
}