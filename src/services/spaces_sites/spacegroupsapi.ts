import { apiService } from '../api';

class SpaceGroupsApiService {

    async getSpaceGroups(params) {
        return await apiService.request(`/space-groups/all?${params.toString()}`);
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

    async getSpaceGroupLookup(site_id?: any, space_id?: any) {
        let url = '/space-groups/lookup';
        const params: string[] = [];

        if (site_id) params.push(`site_id=${site_id}`);
        if (space_id) params.push(`space_id=${space_id}`);

        if (params.length) {
            url += `?${params.join('&')}`;
        }
        return await apiService.request(url);
    }
}

export const spaceGroupsApiService = new SpaceGroupsApiService();