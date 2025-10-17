import { apiService } from './api';

// Define interfaces for analytics dat

class AnalyticsApiService {
    async getAdvanceAnalytics() {
        return await apiService.request('/analytics/advance-analytics');
    }

    async getByMonth() {
        return await apiService.request('/analytics/by-month');
    }

    async getSitePropertyLookup() {
        return await apiService.request('/analytics/');
    }

    async getRevenueAnalytics() {
        return await apiService.request('/analytics/revenue/revenue-trends-forecast');
      }

    async getSiteProfitability() {
        return await apiService.request('/analytics/revenue/revenue-site-profitability');
      }

    async getCollectionPerformance() {
        return await apiService.request('/analytics/revenue/revenue-collection-performance');
      }
    
    async getOccupancyTrends() {
        return await apiService.request('/analytics/occupancy/occupancy-trends');
      }

    async getSpaceTypePerformance() {
        return await apiService.request('/analytics/occupancy/space-type-performance');
      }

    async getPortfolioDistribution() {
        return await apiService.request('/analytics/occupancy/portfolio-distribution');
      }

    async getYoyPerformance() {
        return await apiService.request('/analytics/financial/yoy-performance');
      }

    async getSiteComparison() {
        return await apiService.request('/analytics/financial/site-comparison');
      }

    async getMaintenanceEfficiency() {
        return await apiService.request('/analytics/operations/maintenance-efficiency');
    }

    async getEnergyConsumption() {
        return await apiService.request('/analytics/operations/energy-consumption');
    }

    async getDailyVisitorTrends() {
        return await apiService.request('/analytics/access/daily-visitor-trends');
    }

    async getHourlyAccessPattern() {
        return await apiService.request('/analytics/access/hourly-access-pattern');
    }

    async getTenantSatisfaction() {
        return await apiService.request('/analytics/tenant/tenant-satisfaction');
    }

    async getTenantRetention() {
        return await apiService.request('/analytics/tenant/tenant-retention');
    }

    async getPortfolioHeatmap() {
        return await apiService.request('/analytics/portfolio/portfolio-heatmap');
    }

    async getPerformanceSummary() {
        return await apiService.request('/analytics/portfolio/performance-summary');
    }
    }

export const analyticsApiService = new AnalyticsApiService();


