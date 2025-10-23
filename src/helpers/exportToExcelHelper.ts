import * as XLSX from "xlsx";
import { toast } from "@/hooks/use-toast";
import { exportApiService } from "@/services/common/exportapi";

export const exportToExcel = async (type, params: any) => {
    try {
        const excelResponse = await exportApiService.getExcelFileData(type, params);

        const ws = XLSX.utils.json_to_sheet(excelResponse.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, type);
        XLSX.writeFile(wb, excelResponse.filename);

        // const blob = await response.blob();
        // // ✅ Get filename from headers, fallback to default
        // let filename = "export.xlsx";
        // const disposition = response.headers.get("Content-Disposition") || response.headers.get("content-disposition");

        // if (disposition) {
        //     const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?"?([^;\r\n"]+)/i);
        //     if (filenameMatch && filenameMatch[1]) {
        //         filename = decodeURIComponent(filenameMatch[1]);
        //     }
        // }

        // // ✅ Create download link and click it
        // const url = window.URL.createObjectURL(blob);
        // const a = document.createElement("a");
        // a.href = url;
        // a.download = filename;
        // document.body.appendChild(a);
        // a.click();
        // a.remove();
        // window.URL.revokeObjectURL(url);

        toast({
            title: "File Downloaded",
            description: `${excelResponse.filename} has been downloaded successfully.`,
        });
    } catch (error: any) {
        console.error("Error exporting file:", error);
        toast({
            title: "Export Error",
            description: error.message || "Something went wrong while exporting the file.",
            variant: "destructive",
        });
    };
}
