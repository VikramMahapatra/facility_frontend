import { apiService } from '../services/api';

class DashboardApiService {
    async getLeasingOverviewData() {
        return await apiService.request('/dashboard/leaseoverview');
    }

}

export const dashboardApiService = new DashboardApiService();