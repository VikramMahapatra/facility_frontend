import { apiService } from '../services/api';

class DashboardApiService {
    async getLeasingOverviewData() {
        return await apiService.request('/dashboard/leasing-overview');
    }

    async getMaintenanceOverviewData() {
        return await apiService.request('/dashboard/maintenance-status');
    }   

    async getAccessAndParkingOverviewData() {
        return await apiService.request('/dashboard/access-and-parking');
    }

    async getFinancialSummaryData() {
        return await apiService.request('/dashboard/financial-summary');
    }

    async getMonthlyRevenueTrend() {
        return await apiService.request('/dashboard/monthly-revenue-trend');
    }

    async getSpaceOccupancy() {
        return await apiService.request('/dashboard/space-occupancy');
    }

    async getWorkOrdersPriority() {
        return await apiService.request('/dashboard/work-orders-priority');
    }

    async getEnergyConsumptionTrend() {
        return await apiService.request('/dashboard/energy-consumption-trend');
    }

    async getOccupancyByFloor() {
        return await apiService.request('/dashboard/occupancy-by-floor');
    }

    async getEnergyStatus() {
        return await apiService.request('/dashboard/energy-status');
    }
    async getOverview() {
        return await apiService.request('/dashboard/overview');
    }
}
export const dashboardApiService = new DashboardApiService();