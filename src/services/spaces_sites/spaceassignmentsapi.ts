import { apiService } from '../api';

class SpaceAssignmentApiService {

    async getAssignments(url) {
        return await apiService.request(url);
    }

    async getAssignmentOverview(url) {
        return await apiService.request(url);
    }

    async getAssignmentPreview(group_id?: string, space_id?: string) {
        const params = new URLSearchParams();
        if (group_id) params.append("group_id", group_id);
        if (space_id) params.append("space_id", space_id);
        return await apiService.request(`/space-group-members/preview?${params.toString()}`);
    }

    async addAssignment(spaceData: any) {
        return await apiService.request('/space-group-members', {
            method: 'POST',
            body: JSON.stringify(spaceData),
        });
    }

    async updateAssignment(spaceData: any) {
        return await apiService.request('/space-group-members', {
            method: 'PUT',
            body: JSON.stringify(spaceData),
        });
    }

    async deleteAssignment(id: any) {
        return await apiService.request(`/space-group-members/${id}`, {
            method: 'DELETE',
        });
    }

}

export const spaceAssignmentApiService = new SpaceAssignmentApiService();