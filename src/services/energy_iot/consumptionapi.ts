import { apiService } from "../api";

class ConsumptionApiService {
  async getOverview() {
    return await apiService.request("/consumption-reports/overview");
  }

  async getWeeklyConsumptionTrend() {
    return await apiService.request("/consumption-reports/weekly-trends");
  }

  async getMonthlyCostAnalysis() {
    return await apiService.request(
      "/consumption-reports/monthly-cost-analysis"
    );
  }

  async getConsumptionReports(params?: URLSearchParams) {
    const queryString = params ? `?${params.toString()}` : "";
    return await apiService.request(`/consumption-reports/all${queryString}`);
  }

  async getConsumptionReportsMonthLookup() {
    return await apiService.request("/consumption-reports/month-lookup");
  }

  async getConsumptionReportsTypeLookup() {
    return await apiService.request("/consumption-reports/type-lookup");
  }
}

export const consumptionApiService = new ConsumptionApiService();
