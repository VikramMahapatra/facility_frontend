import { apiService } from '../api';

class SpacesApiService {

    async getSpaces(params) {
        return await apiService.request(`/spaces/all?${params.toString()}`);
    }

    async getSpaceOverview(params) {
        return await apiService.request(`/spaces/overview?${params.toString()}`);
    }

    async addSpace(spaceData: any) {
        return await apiService.request('/spaces/', {
            method: 'POST',
            body: JSON.stringify(spaceData),
        });
    }

    async updateSpace(spaceData: any) {
        return await apiService.request('/spaces/', {
            method: 'PUT',
            body: JSON.stringify(spaceData),
        });
    }

    async deleteSpace(id: any) {
        return await apiService.request(`/spaces/${id}`, {
            method: 'DELETE',
        });
    }

    async getSpaceLookup(site_id?: any, building_id?: any) {
        let url = '/spaces/lookup';
        if (site_id) {
            url += `?site_id=${site_id}`;
        }
        if (building_id) {
            url += `&building_id=${building_id}`;
        }
        return await apiService.request(url);
    }

    async getSpaceWithBuildingLookup(site_id?: any) {
        let url = '/spaces/space-building-lookup';
        if (site_id) {
            url += `?site_id=${site_id}`;
        }
        return await apiService.request(url);
    }

    async getSpaceById(id: any) {
        return await apiService.request(`/spaces/detail/${id}`);
    }

    async getActiveOwners(spaceId: string) {
        return await apiService.request(`/spaces/active-owners/${spaceId}`);
    }

    async searchUsers(search: string) {
        let url = `/users/search-user`;
        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }
        return await apiService.request(url);
    }

    async assignOwner(payload: any) {
        return await apiService.request(`/spaces/assign-owner`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getPendingOwnerRequests(params?: URLSearchParams) {
        const url = params ? `/spaces/pending-owner-request?${params.toString()}` : '/spaces/pending-owner-request';
        return await apiService.request(url);
    }

    async updateOwnerApproval(requestId: string, action: string) {
        return await apiService.request('/spaces/update-owner-approval', {
            method: 'POST',
            body: JSON.stringify({
                action: action,
                request_id: requestId,
            }),
        });
    }
}

export const spacesApiService = new SpacesApiService();//