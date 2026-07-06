import { facilityAuthApiService as apiService } from "../api";


class SuperAdminApiService {

    async fetchSuperAdminStats() {
        return await apiService.request('/super-admin/stats');
    }

    async fetchRecentPendingOrganizations() {
        return await apiService.request('/super-admin/orgs/recent-pending');
    }


    async fetchPendingOrganizations(params) {
        return await apiService.request(`/super-admin/orgs/pending?${params.toString()}`);
    }

    async rejectOrganization(orgId: string, data: { rejection_reason: string }) {
        const response = await apiService.request(`/super-admin/orgs/${orgId}/reject`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }

    async approveOrganization(orgId: string) {
        const response = await apiService.request(`/super-admin/orgs/${orgId}/approve`, {
            method: 'POST',
        });
        return response;
    }

}

export const superAdminApiService = new SuperAdminApiService();