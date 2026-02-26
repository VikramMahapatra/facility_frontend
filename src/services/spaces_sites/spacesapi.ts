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

  async getFilteredSpaceLookup(site_id?: any, building_id?: any, request_type?: any) {
    let url = "/spaces/filtered-lookup";
    if (site_id) {
      url += `?site_id=${site_id}`;
    }
    if (building_id) {
      url += `&building_id=${building_id}`;
    }
    if (request_type) {
      url += `&request_type=${request_type}`;
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
  async getOccupancyRequests(params?: URLSearchParams) {
    const url = params
      ? `/spaces/occupancy-requests?${params.toString()}`
      : "/spaces/occupancy-requests";
    return await apiService.request(url);

  }

  async approveOccupancyRequest(requestId: string) {
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

  async rejectOccupancyRequest(requestId: string) {
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
