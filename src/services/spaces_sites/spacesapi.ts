import { apiService } from '../api';

class SpacesApiService {

    async getSpaces(url) {
        return await apiService.request(url);
    }

    async getSpaceOverview(url) {
        return await apiService.request(url);
    }

    async addSpace(spaceData: any) {
        return await apiService.request('/spaces', {
            method: 'POST',
            body: JSON.stringify(spaceData),
        });
    }

    async updateSpace(spaceData: any) {
        return await apiService.request('/spaces', {
            method: 'PUT',
            body: JSON.stringify(spaceData),
        });
    }

    async deleteSpace(id: any) {
        return await apiService.request(`/spaces/${id}`, {
            method: 'DELETE',
        });
    }

}

export const spacesApiService = new SpacesApiService();