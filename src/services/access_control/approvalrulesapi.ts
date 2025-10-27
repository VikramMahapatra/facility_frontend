import { apiService } from "../api";

class ApprovalRulesApiService {

    async getRules() {
        return await apiService.request('/role-approval-rules/all');
    }

    async createRule(data: any) {
        return await apiService.request('/role-approval-rules', {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

}

export const approvalRulesApiService = new ApprovalRulesApiService();
