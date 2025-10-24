import { apiService } from "../api";

class UserManagementApiService {
  async getUsers(params) {
    return await apiService.request(`/users/all?${params.toString()}`);
  }

  async getUserStatusOverview() {
    return await apiService.request("/users/status-lookup");
  }

  async addUser(userData: any) {
    return await apiService.request("/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any) {
    return await apiService.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return await apiService.request(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getUserRolesLookup() {
    return await apiService.request("/roles/role-lookup");
  }
}

export const userManagementApiService = new UserManagementApiService();
