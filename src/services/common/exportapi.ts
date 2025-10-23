import { exportToExcel } from "@/helpers/exportToExcelHelper";
import { apiService } from '../api';

class ExportApiService {

    async getExcelFileData(type: string, params?: URLSearchParams | null) {
        const queryString = params ? `&${params.toString()}` : "";
        return await apiService.request(`/export?type=${type}${queryString}`);
    }

}

export const exportApiService = new ExportApiService();