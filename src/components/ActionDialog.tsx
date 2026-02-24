import React from "react";

type Props = {
    open: boolean;
    title: string;
    onClose: () => void;
    onSubmit?: () => void;
    submitText?: string;
    children: React.ReactNode;
};

export default function ActionDialog({
    open,
    title,
    onClose,
    onSubmit,
    submitText = "Submit",
    children
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[500px] shadow-lg">
                <div className="p-4 border-b font-semibold">{title}</div>

                <div className="p-4 space-y-4">{children}</div>

                <div className="p-4 border-t flex justify-end gap-2">
                    <button
                        className="px-4 py-2 border rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    {onSubmit && (
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                            onClick={onSubmit}
                        >
                            {submitText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}