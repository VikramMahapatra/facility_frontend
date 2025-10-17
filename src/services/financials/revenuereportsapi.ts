import { apiService } from '../api';

class RevenueReportsApiService {
    
    async getRevenueReportsOverview() {
        return await apiService.request(`/revenue-reports/overview`);
    }

    
    async getRevenueReportsBySource() {
    return await apiService.request('/revenue-reports/revenue-by-source');
   }

   async getRevenueReportsByOutstandingReceivables() {
    return await apiService.request('/revenue-reports/outstanding-receivables');
   }

     async getRevenueReportsByTrend() {
        return await apiService.request('/revenue-reports/revenue-by-trend');
    }

    async getRevenueReportsMonthLookup() {
        return await apiService.request('/revenue-reports/month-lookup');
    }
}

export const revenueReportsApiService= new RevenueReportsApiService();
