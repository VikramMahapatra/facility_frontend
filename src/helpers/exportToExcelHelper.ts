import * as XLSX from "xlsx";
import { exportApiService } from "@/services/common/exportapi";
import { toast } from "sonner";

export const exportToExcel = async (type, params: any) => {
    try {
        const excelResponse = await exportApiService.getExcelFileData(type, params);

        if (excelResponse.success) {
            const excelData = excelResponse.data;
            const ws = XLSX.utils.json_to_sheet(excelData.data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, type);
            XLSX.writeFile(wb, excelData.filename);

            toast(`${excelData.filename} has been downloaded successfully.`);
        }
        else {
            toast("Something went wrong while exporting the file.");
        }


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

    } catch (error: any) {
        console.error("Error exporting file:", error);
        toast("Something went wrong while exporting the file.");
    };
}
