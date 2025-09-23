import { apiService } from '../api';

class SpaceGroupsApiService {

    async getSpaceGroups(url) {
        return await apiService.request(url);
    }

    async addSpaceGroup(spaceGroupData: any) {
        return await apiService.request('/space-groups', {
            method: 'POST',
            body: JSON.stringify(spaceGroupData),
        });
    }

    async updateSpaceGroup(spaceGroupData: any) {
        return await apiService.request('/space-groups', {
            method: 'PUT',
            body: JSON.stringify(spaceGroupData),
        });
    }

    async deleteSpaceGroup(id: any) {
        return await apiService.request(`/space-groups/${id}`, {
            method: 'DELETE',
        });
    }

}

export const spaceGroupsApiService = new SpaceGroupsApiService();