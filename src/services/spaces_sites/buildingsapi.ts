import { apiService } from '../api';

class BuildingApiService {

    async getBuildings(url) {
        return await apiService.request(url);
    }

    async addBuilding(siteData: any) {
        return await apiService.request('/buildings', {
            method: 'POST',
            body: JSON.stringify(siteData),
        });
    }

    async updateBuilding(siteData: any) {
        return await apiService.request('/buildings', {
            method: 'PUT',
            body: JSON.stringify(siteData),
        });
    }

    async deleteSite(id: any) {
        return await apiService.request(`/sites/${id}`, {
            method: 'DELETE',
        });
    }

}

export const buildingApiService = new BuildingApiService();