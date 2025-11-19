import { apiService } from "../api";

class ApprovalRulesApiService {

    async getRules() {
        return await apiService.request('/role-approval-rules/all');
    }

    async getUserTypes() {
        return await apiService.request('/role-approval-rules/user_type_lookup');
    }

    async createRule(data: any) {
        return await apiService.request('/role-approval-rules', {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

}

export const approvalRulesApiService = new ApprovalRulesApiService();
