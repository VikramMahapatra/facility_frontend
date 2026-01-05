import { apiService } from '../api';

class RevenueReportsApiService {
    
    async getRevenueReportsOverview(params?: URLSearchParams) {
        const queryString = params ? `?${params.toString()}` : '';
        return await apiService.request(`/revenue-reports/overview${queryString}`);
    }

    
    async getRevenueReportsBySource(params?: URLSearchParams) {
        const queryString = params ? `?${params.toString()}` : '';
        return await apiService.request(`/revenue-reports/revenue-by-source${queryString}`);
   }

   async getRevenueReportsByOutstandingReceivables(params?: URLSearchParams) {
        const queryString = params ? `?${params.toString()}` : '';
        return await apiService.request(`/revenue-reports/revenue-outstanding${queryString}`);
   }

     async getRevenueReportsByTrend(params?: URLSearchParams) {
        const queryString = params ? `?${params.toString()}` : '';
        return await apiService.request(`/revenue-reports/revenue-trend${queryString}`);
    }

    async getRevenueReportsMonthLookup() {
        return await apiService.request('/revenue-reports/month-lookup');
    }
}

export const revenueReportsApiService= new RevenueReportsApiService();
