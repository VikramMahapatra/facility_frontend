import { superAdminApiService } from "@/services/super_admin/superadminapi";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLoader } from "@/context/LoaderContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Org {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

const OrgApprovalPage = () => {
  const { withLoader } = useLoader();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const loadOrgs = async () => {
    const response = (await withLoader(() =>
      superAdminApiService.fetchPendingOrganizations(),
    )) as any;

    if (response?.success) {
      setOrgs(response.data?.pending_orgs || []);
    } else {
      setOrgs([]);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (orgId: string) => {
    setApproving(orgId);
    const response = (await withLoader(() =>
      superAdminApiService.approveOrganization(orgId),
    )) as any;

    if (response?.success) {
      toast.success("Organization approved successfully!");
      loadOrgs(); // refresh list
    } else {
      const errorMessage =
        response?.data?.message ||
        response?.message ||
        "Failed to approve organization";
      toast.error(errorMessage);
    }
    setApproving(null);
  };

  const handleReject = async (orgId: string) => {
    setRejecting(orgId);
    const response = (await withLoader(() =>
      superAdminApiService.rejectOrganization(orgId),
    )) as any;

    if (response?.success) {
      toast.success("Organization rejected successfully!");
      loadOrgs(); // refresh list
    } else {
      const errorMessage =
        response?.data?.message ||
        response?.message ||
        "Failed to reject organization";
      toast.error(errorMessage);
    }
    setRejecting(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Organization Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve organizations waiting for access.
        </p>
      </div>

      <ContentContainer>
        <LoaderOverlay />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {!Array.isArray(orgs) || orgs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending organizations to approve.
              </p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgs.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          {org.name}
                        </TableCell>
                        <TableCell>{org.email}</TableCell>
                        <TableCell>
                          {org.created_at
                            ? new Date(org.created_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={rejecting === org.id || approving === org.id}
                              onClick={() => handleReject(org.id)}
                            >
                              {rejecting === org.id ? "Rejecting..." : "Reject"}
                            </Button>
                            <Button
                              size="sm"
                              disabled={approving === org.id || rejecting === org.id}
                              onClick={() => handleApprove(org.id)}
                            >
                              {approving === org.id ? "Approving..." : "Approve"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </ContentContainer>
    </div>
  );
};

export default OrgApprovalPage;
