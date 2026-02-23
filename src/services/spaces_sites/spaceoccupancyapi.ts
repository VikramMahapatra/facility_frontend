import { apiService } from '../api';

class OccupancyApiService {

    async moveIn(spaceData: any) {
        return await apiService.request(`/spaces/move-in-request`, {
            method: 'POST',
            body: JSON.stringify(spaceData),
        });
    }

    async moveOut(spaceData: any) {
        return await apiService.request(`/spaces/move_out_request`, {
            method: 'POST',
            body: JSON.stringify(spaceData)
        });
    }

    async getSpaceOccupancy(id: any) {
        return await apiService.request(`/spaces/${id}/occupancy`);
    }

    async updateHandover(occupancyId: string, params: any) {
        return await apiService.request(`/spaces/handover/${occupancyId}/update-checklist`, {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    async completeHandover(occupancyId: string) {
        return await apiService.request(`/spaces/handover/${occupancyId}/complete`, {
            method: 'POST',
        });
    }


    async fetchInspection(inspectionId: any) {
        return await apiService.request(`/api/inspection/${inspectionId}`);
    }
}

export const occupancyApiService = new OccupancyApiService();//