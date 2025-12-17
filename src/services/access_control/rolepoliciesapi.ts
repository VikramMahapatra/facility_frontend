import { apiService } from '../api';

class RolePolicyApiService {

    async getRolePolicies(role_id: any) {
        return await apiService.request(`/role-policies/all?role_id=${role_id}`);
    }

    async getRoles() {
        return await apiService.request(`/roles/role-lookup`);
    }

    async savePolicies(role_id: string, policies: any) {
        return await apiService.request('/role-policies/', {
            method: 'POST',
            body: JSON.stringify({
                role_id,
                policies,
            }),
        });
    }
}

export const rolePolicyApiService = new RolePolicyApiService();