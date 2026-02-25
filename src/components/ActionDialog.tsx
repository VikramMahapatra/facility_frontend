import React, { useState } from "react";

type Props = {
    open: boolean;
    title: string;
    onClose: () => void;
    onSubmit?: () => Promise<void> | void;
    submitText?: string;
    submittingText?: string;
    children: React.ReactNode;
};

export default function ActionDialog({
    open,
    title,
    onClose,
    onSubmit,
    submitText = "Submit",
    submittingText = "Submitting...",
    children
}: Props) {
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!onSubmit) return;

        try {
            setLoading(true);
            await onSubmit();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[500px] shadow-lg">
                <div className="p-4 border-b font-semibold">{title}</div>

                <div className="p-4 space-y-4">{children}</div>

                <div className="p-4 border-t flex justify-end gap-2">
                    <button
                        className="px-4 py-2 border rounded"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    {onSubmit && (
                        <button
                            className={`px-4 py-2 rounded text-white ${loading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600"
                                }`}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? submittingText : submitText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}