import { apiService } from "../api";

class SpacesApiService {
  async getSpaces(params) {
    return await apiService.request(`/spaces/all?${params.toString()}`);
  }

  async getSpaceOverview(params) {
    return await apiService.request(`/spaces/overview?${params.toString()}`);
  }

  async addSpace(spaceData: any) {
    return await apiService.request("/spaces/", {
      method: "POST",
      body: JSON.stringify(spaceData),
    });
  }

  async updateSpace(spaceData: any) {
    return await apiService.request("/spaces/", {
      method: "PUT",
      body: JSON.stringify(spaceData),
    });
  }

  async deleteSpace(id: any) {
    return await apiService.request(`/spaces/${id}`, {
      method: "DELETE",
    });
  }

  async getSpaceLookup(site_id?: any, building_id?: any) {
    let url = "/spaces/lookup";
    if (site_id) {
      url += `?site_id=${site_id}`;
    }
    if (building_id) {
      url += `&building_id=${building_id}`;
    }
    return await apiService.request(url);
  }

  async getMasterSpaceLookup(site_id?: any, building_id?: any, space_id?: any) {
    const url = "/master/space-lookup";
    const body: any = {};

    if (site_id) {
      body.site_id = site_id;
    }
    if (building_id) {
      body.building_id = building_id;
    }
    if (space_id) {
      body.space_id = space_id;
    }

    return await apiService.request(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getSpaceWithBuildingLookup(site_id?: any) {
    let url = "/spaces/space-building-lookup";
    if (site_id) {
      url += `?site_id=${site_id}`;
    }
    return await apiService.request(url);
  }

  async getSpaceById(id: any) {
    return await apiService.request(`/spaces/detail/${id}`);
  }

  async getActiveOwners(spaceId: string) {
    return await apiService.request(`/spaces/active-owners/${spaceId}`);
  }

  async searchUsers(search: string) {
    let url = `/users/search-user`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    return await apiService.request(url);
  }

  async assignOwner(payload: any) {
    return await apiService.request(`/spaces/assign-owner`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async removeOwner(payload: any) {
    return await apiService.request(`/spaces/remove-owner`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getPendingOwnerRequests(params?: URLSearchParams) {
    const url = params
      ? `/spaces/pending-owner-request?${params.toString()}`
      : "/spaces/pending-owner-request";
    return await apiService.request(url);
  }

  async updateOwnerApproval(requestId: string, action: string) {
    return await apiService.request("/spaces/update-owner-approval", {
      method: "POST",
      body: JSON.stringify({
        action: action,
        request_id: requestId,
      }),
    });
  }

  async getOwnershipHistory(spaceId: string) {
    return await apiService.request(`/spaces/ownership-history/${spaceId}`);
  }

  async getActiveTenants(spaceId: string) {
    return await apiService.request(`/spaces/active-tenants/${spaceId}`);
  }

  async assignTenant(payload: any) {
    return await apiService.request(`/spaces/assign-tenant`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async removeTenant(payload: any) {
    return await apiService.request(`/spaces/remove-tenant`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getTenantHistory(spaceId: string) {
    return await apiService.request(`/spaces/tenant-history/${spaceId}`);
  }

  // Mock API methods for space move-out approvals
  async getMoveOutRequests(params?: URLSearchParams) {
    // Mock implementation - returns mock data for now
    return new Promise((resolve) => {
      setTimeout(() => {
        const statusParam = params?.get("status") || "pending";
        const searchParam = params?.get("search") || "";
        const skip = parseInt(params?.get("skip") || "0");
        const limit = parseInt(params?.get("limit") || "6");

        // Mock data
        const allMockData = [
          {
            id: "1",
            space_id: "space-1",
            space_name: "Office Suite 101",
            site_name: "Downtown Plaza",
            building_name: "Building A",
            tenant_name: "John Doe",
            tenant_id: "tenant-1",
            requested_at: new Date().toISOString(),
            move_out_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            reason: "Lease expiration",
            status: "pending",
          },
          {
            id: "2",
            space_id: "space-2",
            space_name: "Conference Room A",
            site_name: "Business Center",
            building_name: "Building B",
            tenant_name: "Jane Smith",
            tenant_id: "tenant-2",
            requested_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            move_out_date: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
            reason: "Relocating to larger space",
            status: "pending",
          },
          {
            id: "3",
            space_id: "space-3",
            space_name: "Workshop 205",
            site_name: "Industrial Park",
            building_name: "Building C",
            tenant_name: "Bob Johnson",
            tenant_id: "tenant-3",
            requested_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            move_out_date: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            reason: "Business closure",
            status: "approved",
          },
          {
            id: "4",
            space_id: "space-4",
            space_name: "Storage Unit 10",
            site_name: "Warehouse Complex",
            building_name: "Building D",
            tenant_name: "Alice Williams",
            tenant_id: "tenant-4",
            requested_at: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000
            ).toISOString(),
            move_out_date: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            reason: "No longer needed",
            status: "rejected",
          },
        ];

        // Filter by status
        let filtered = allMockData;
        if (statusParam && statusParam !== "all") {
          filtered = allMockData.filter((item) => item.status === statusParam);
        }

        // Filter by search
        if (searchParam) {
          const searchLower = searchParam.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.space_name.toLowerCase().includes(searchLower) ||
              item.tenant_name.toLowerCase().includes(searchLower) ||
              item.site_name.toLowerCase().includes(searchLower)
          );
        }

        // Paginate
        const total = filtered.length;
        const paginated = filtered.slice(skip, skip + limit);

        const mockData = {
          success: true,
          data: {
            requests: paginated,
            total: total,
          },
        };
        resolve(mockData);
      }, 300);
    });
  }

  async approveMoveOutRequest(requestId: string) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Move-out request approved successfully",
        });
      }, 500);
    });
  }

  async rejectMoveOutRequest(requestId: string) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Move-out request rejected successfully",
        });
      }, 500);
    });
  }

  async getAccessoriesLookup() {
    return await apiService.request("/master/accessories");
  }
}

export const spacesApiService = new SpacesApiService(); //
