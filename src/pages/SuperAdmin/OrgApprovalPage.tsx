import { superAdminApiService } from "@/services/super_admin/superadminapi";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { toast } from "@/components/ui/app-toast";
import { Check, X, Search, CheckCircle2 } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";

interface Org {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  status?: "pending" | "approved" | "rejected";
}

const OrgApprovalPage = () => {
  const { withLoader } = useLoader();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [allOrgs, setAllOrgs] = useState<Org[]>([]); // Store all orgs for pending count
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("pending");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useSkipFirstEffect(() => {
    loadOrgs();
  }, [page]);

  useEffect(() => {
    updateOrgsPage();
  }, [status, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateOrgsPage = () => {
    if (page === 1) {
      loadOrgs();
    } else {
      setPage(1);
    }
  };

  const loadOrgs = async () => {

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (status && status !== "all")
      params.append("status", status);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = (await withLoader(() =>
      superAdminApiService.fetchPendingOrganizations(params),
    )) as any;

    if (response?.success) {
      const fetchedOrgs = response.data?.orgs || [];

      setOrgs(fetchedOrgs);
      setTotalItems(response.data?.total || 0);
      setPendingCount(response.data?.total_pending || 0);
    }
  };

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

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">pending</Badge>;
      case "inactive":
        return <Badge variant="secondary">inactive</Badge>;
      case "active":
        return <Badge className="bg-green-600">active</Badge>;
      case "rejected":
        return <Badge variant="destructive">rejected</Badge>;
      default:
        return <Badge variant="secondary">pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Organization Approvals
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve organization registration requests
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pendingCount} Pending
        </Badge>
      </div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search organization name / email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {orgs.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            All Caught Up!
          </h3>
          <p className="text-muted-foreground">
            No pending organization approvals at this time
          </p>
        </div>
      ) : (
        <>


          {/* Table */}
          <div className="relative rounded-md border">
            <ContentContainer>
              <LoaderOverlay />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {orgs.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="font-medium">{org.name}</div>
                      </TableCell>
                      <TableCell>{org.email || "-"}</TableCell>
                      <TableCell>{org.phone || "-"}</TableCell>
                      <TableCell>
                        {org.created_at
                          ? new Date(org.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {statusBadge(org.status || "pending")}
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        {(org.status === "pending" || !org.status) && (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={rejecting === org.id || approving === org.id}
                              onClick={() => handleReject(org.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>

                            <Button
                              size="sm"
                              disabled={approving === org.id || rejecting === org.id}
                              onClick={() => handleApprove(org.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ContentContainer>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </>
      )}
    </div >
  );
};

export default OrgApprovalPage;
