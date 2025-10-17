import { apiService } from '../api';

class ConsumptionApiService {
    // Overview 
    async getOverview() {
        return await apiService.request('/consumption-reports/overview');
    }

    // Weekly consumption trends chart 
    async getWeeklyConsumptionTrend() {
        return await apiService.request('/consumption-reports/weekly-trends');
    }

    // Monthly cost analysis chart 
    async getMonthlyCostAnalysis() {
        return await apiService.request('/consumption-reports/monthly-cost-analysis');
    }

    // All types dropdown 
    async getUtilityTypes() {
        return await apiService.request('/consumption-reports/month-lookup');
    }

    // Month dropdown 
    async getAvailableMonths() {
        return await apiService.request('/consumption-reports/type-lookup');
    }

    // Get consumption data with filters
    /*async getConsumption(params: any) {
        return await apiService.request(`/consumption/all?${params.toString()}`);
    }*/
}

export const consumptionApiService = new ConsumptionApiService();