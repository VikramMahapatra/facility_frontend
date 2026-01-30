import { apiService } from '../api';

class OccupancyApiService {

    async moveIn(spaceData: any) {
        return await apiService.request(`/spaces/move-in`, {
            method: 'POST',
            body: JSON.stringify(spaceData),
        });
    }

    async moveOut(spaceId: any) {
        return await apiService.request(`/spaces/${spaceId}/move-out`, {
            method: 'POST',
        });
    }

    async getSpaceOccupancy(id: any) {
        return await apiService.request(`/spaces/${id}/occupancy`);
    }
}

export const occupancyApiService = new OccupancyApiService();//