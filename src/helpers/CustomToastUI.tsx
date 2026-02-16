import { toast } from "sonner";
import { AlertTriangle, X } from "lucide-react";

export const showErrorToast = (
    title: string,
    message: string,
    retry?: () => void
) => {
    toast.custom((t) => (
        <div className="!bg-transparent !p-0">
            <div
                className="
                    flex gap-4 items-start
                    max-w-[520px] w-full
                    bg-white/90 backdrop-blur
                    border border-red-200
                    rounded-2xl shadow-lg
                    p-4
                "
            >
                {/* Icon */}
                <div className="bg-red-100 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <p className="font-semibold text-red-900">
                        {title}
                    </p>

                    <p className="text-sm text-red-800 mt-1">
                        {message}
                    </p>

                    {retry && (
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                retry();
                            }}
                            className="text-sm font-medium text-red-700 mt-2 hover:underline"
                        >
                            Retry
                        </button>
                    )}
                </div>

                {/* Close */}
                <button
                    onClick={() => toast.dismiss(t)}
                    className="opacity-60 hover:opacity-100"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    ));
};
