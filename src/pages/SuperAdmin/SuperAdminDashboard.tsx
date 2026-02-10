import { superAdminApiService } from "@/services/super_admin/superadminapi";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoader } from "@/context/LoaderContext";
import { useEffect, useState } from "react";

type SuperAdminStats = {
  totalOrganizations?: number;
  pendingApprovals?: number;
  activeUsers?: number;
};

const SuperAdminDashboard = () => {
  const { withLoader } = useLoader();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const response = (await withLoader(() =>
        superAdminApiService.fetchSuperAdminStats()
      )) as any;

      if (response?.success) {
        const data = response.data || {};
        // Backend returns snake_case, UI uses camelCase
        setStats({
          totalOrganizations:
            data.totalOrganizations ?? data.total_orgs ?? data.total_org ?? 0,
          pendingApprovals:
            data.pendingApprovals ?? data.pending_orgs ?? data.pending_org ?? 0,
          activeUsers: data.activeUsers ?? data.total_users ?? 0,
        });
      } else {
        setStats(null);
      }
    };

    loadStats();
  }, [withLoader]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          High-level overview of organizations and approvals.
        </p>
      </div>

      <ContentContainer>
        <LoaderOverlay />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats?.totalOrganizations ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats?.pendingApprovals ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats?.activeUsers ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentContainer>
    </div>
  );
};

export default SuperAdminDashboard;
