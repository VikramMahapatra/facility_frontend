import { apiService } from '../api';

class RoleManagementApiService {

    async getRoleManagement(params) {
        return await apiService.request(`/roles/all?${params.toString()}`);
    }


    async addRoleManagement(roleData: any) {
        return await apiService.request('/roles', {
            method: 'POST',
            body: JSON.stringify(roleData),
        });
    }

    async updateRoleManagement(roleData: any) {
        return await apiService.request('/roles', {
            method: 'PUT',
            body: JSON.stringify(roleData),
        });
    }

    async deleteRoleManagement(id: any) {
        return await apiService.request(`/roles/${id}`, {
            method: 'DELETE',
        });
    }

}

export const roleManagementApiService = new RoleManagementApiService();
