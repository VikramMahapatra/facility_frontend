import { apiService } from "../api";

class UserManagementApiService {
  async getUsers(params?: URLSearchParams) {
    const qs = params?.toString() ? `?${params.toString()}` : "";
    return await apiService.request(`/users/all${qs}`);
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

  async updateUser(userData: any) {
    return await apiService.request("/users/", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async addAccount(userAccountData: any) {
    return await apiService.request("/users/add-account", {
      method: "POST",
      body: JSON.stringify(userAccountData),
    });
  }

  async updateAccount(userAccountData: any) {
    return await apiService.request("/users/update-account", {
      method: "PUT",
      body: JSON.stringify(userAccountData),
    });
  }

  async markAsDefault(id: any) {
    return await apiService.request("/users/mark-default", {
      method: "POST",
      body: JSON.stringify({ user_org_id: id }),
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

  async getUserById(userId: string) {
    return await apiService.request(`/users/detail?user_id=${userId}`, {
      method: "POST",
    });
  }

  async checkUserGlobal(userData: any) {
    return await apiService.request("/users/check-global", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async mapUserToOrg(userData: any) {
    return await apiService.request("/users/map-user-org", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async searchTenantOwnerUsers(search: string) {
    let url = `/users/search-tenant-owner-user`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    return await apiService.request(url);
  }

  async searchStaffUsers(search: string) {
    let url = `/users/search-staff-user`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    return await apiService.request(url);
  }

}

export const userManagementApiService = new UserManagementApiService();
