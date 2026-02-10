import { facilityAuthApiService as apiService } from "../api";


class SuperAdminApiService {

    async fetchSuperAdminStats() {
        return await apiService.request('/super-admin/stats');
    }

    async fetchRecentPendingOrganizations() {
        return await apiService.request('/super-admin/orgs/recent-pending');
    }


    async fetchPendingOrganizations() {
        return await apiService.request('/super-admin/orgs/pending');
    }

    async rejectOrganization(orgId: string) {
        const response = await apiService.request(`/super-admin/orgs/${orgId}/reject`, {
            method: 'POST',
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