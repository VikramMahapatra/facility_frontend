import { toast as sonnerToast } from "sonner";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

type ToastVariant = "success" | "error";

type AppToastParams = {
    title: string;
    message?: string;
    variant?: ToastVariant;
    retry?: () => void;
};

export function showAppToast({
    title,
    message,
    variant = "success",
    retry,
}: AppToastParams) {

    const styles = {
        success: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
            iconBg: "bg-emerald-100",
            title: "text-emerald-900",
            message: "text-emerald-800",
            duration: 3000,
        },
        error: {
            icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
            iconBg: "bg-red-100",
            title: "text-red-900",
            message: "text-red-800",
            duration: 6000,
        },
    };

    const s = styles[variant];

    sonnerToast.custom((t) => (
        <div className="
            w-fit
            max-w-[420px]
            flex gap-3 items-start
            bg-white border shadow-lg
            rounded-xl p-4
        ">

            {/* Icon */}
            <div className={`${s.iconBg} p-2 rounded-lg`}>
                {s.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
                {/* If description exists → normal title */}
                {message ? (
                    <>
                        <p className={`font-semibold ${s.title}`}>
                            {title}
                        </p>

                        <p className={`text-sm mt-1 ${s.message}`}>
                            {message}
                        </p>
                    </>
                ) : (
                    /* If only one line → treat as main message */
                    <p className={`text-sm mt-1  ${s.title}`}>
                        {title}
                    </p>
                )}
                {retry && (
                    <button
                        onClick={() => {
                            sonnerToast.dismiss(t);
                            retry();
                        }}
                        className="text-sm mt-2 font-medium hover:underline"
                    >
                        Retry
                    </button>
                )}
            </div>
            {/* Close */}
            <button
                onClick={() => sonnerToast.dismiss(t)}
                className="opacity-60 hover:opacity-100"
            >
                <X size={16} />
            </button>

        </div>
    ), {
        duration: s.duration,
        position: "bottom-right",
    });
}

//
// ⭐ OVERLOADED WRAPPERS (CLEAN API)
//

export function showSuccessToast(title: string, message?: string) {
    showAppToast({
        title,
        message,
        variant: "success",
    });
}

export function showErrorToast(
    title: string,
    message?: string
) {
    showAppToast({
        title,
        message,
        variant: "error"
    });
}


export const toast = {
    success: (title: string, message?: string) => {
        showAppToast({
            title,
            message,
            variant: "success",
        });
    },
    error: (title: string, message?: string) => {
        showAppToast({
            title,
            message,
            variant: "success",
        });
    }
};
