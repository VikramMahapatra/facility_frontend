import { apiService } from '../api';

class BuildingApiService {

    async getBuildings(url) {
        return await apiService.request(url);
    }

    async addBuilding(buildingData: any) {
        return await apiService.request('/buildings', {
            method: 'POST',
            body: JSON.stringify(buildingData),
        });
    }

    async updateBuilding(buildingData: any) {
        return await apiService.request('/buildings', {
            method: 'PUT',
            body: JSON.stringify(buildingData),
        });
    }

    async deleteBuilding(id: any) {
        return await apiService.request(`/sites/${id}`, {
            method: 'DELETE',
        });
    }

}

export const buildingApiService = new BuildingApiService();