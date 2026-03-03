import { showErrorToast } from "@/components/ui/app-toast";

export async function downloadFile(
    request: Promise<Response>,
    fallbackName = "download.pdf"
) {
    const response = await request;

    // -----------------------------
    // ERROR HANDLING
    // -----------------------------
    if (!response.ok) {
        const text = await response.text();
        showErrorToast("Download failed!", "Something went wrong");
    }

    // -----------------------------
    // VALIDATE FILE TYPE
    // -----------------------------
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/pdf")) {
        const text = await response.text();
        throw new Error(text);
    }

    // -----------------------------
    // EXTRACT FILENAME
    // -----------------------------
    let filename = fallbackName;

    const disposition = response.headers.get("content-disposition");

    if (disposition) {
        // UTF-8 filename support
        const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        const asciiMatch = disposition.match(/filename="?([^"]+)"?/i);

        if (utfMatch?.[1]) {
            filename = decodeURIComponent(utfMatch[1]);
        } else if (asciiMatch?.[1]) {
            filename = asciiMatch[1];
        }
    }

    // -----------------------------
    // DOWNLOAD FILE
    // -----------------------------
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
}