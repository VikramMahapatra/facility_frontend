import { apiService } from "../api";

class PendingApprovalApiService {

    async getUsers(params) {
        return await apiService.request(`/pending-approval/all?${params.toString()}`);
    }

    async updateUser(userData: any) {
        return await apiService.request('/pending-approval', {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    }

}

export const pendingApprovalApiService = new PendingApprovalApiService();
