import { apiService } from '../api';

class OccupancyApiService {

    async moveIn(spaceData: any) {
        return await apiService.request(`/spaces/move-in-request`, {
            method: 'POST',
            body: JSON.stringify(spaceData),
        });
    }

    async moveOut(spaceData: any) {
        return await apiService.request(`/spaces/move-out-request`, {
            method: 'POST',
            body: JSON.stringify(spaceData)
        });
    }

    async getSpaceOccupancy(id: any) {
        return await apiService.request(`/spaces/${id}/occupancy`);
    }

    async getSpaceOccupancyUpcomingMoveIns(id: any) {
        return await apiService.request(`/spaces/${id}/occupancy/upcoming-movein`);
    }

    async getSpaceOccupancyHistory(id: any) {
        return await apiService.request(`/spaces/${id}/occupancy/history`);
    }

    async getSpaceOccupancyTimeline(id: any) {
        return await apiService.request(`/spaces/${id}/occupancy/timeline`, {
            method: 'POST',
        });
    }

    async updateHandover(occupancyId: string, params: any) {
        return await apiService.request(`/spaces/handover/${occupancyId}/update-handover`, {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    async requestInspection(params: any) {
        return await apiService.request(`/spaces/inspection/request`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async completeInspection(inspectionId: string, params: any) {
        return await apiService.request(`/spaces/inspection/${inspectionId}/complete`, {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    async createMaintenance(params: any) {
        return await apiService.request(`/spaces/maintenance/create`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async completeMaintenance(maintenanceId: string, params: any) {
        return await apiService.request(`/spaces/maintenance/${maintenanceId}/complete`, {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    async completeSettlement(settlementId: string, params: any) {
        return await apiService.request(`/spaces/settlement/${settlementId}/complete`, {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

}

export const occupancyApiService = new OccupancyApiService();//