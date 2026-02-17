import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Check,
  X,
  User,
  Home,
  Calendar,
  Search,
  Building2,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { toast } from "@/components/ui/app-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SpaceMoveOutRequest = {
  id: string;
  space_id: string;
  space_name: string;
  site_name: string;
  building_name: string;
  tenant_name: string;
  tenant_id: string;
  requested_at: string;
  move_out_date: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
};

export default function SpaceMoveOutApproval() {
  const { withLoader } = useLoader();
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string>("pending");
  const [requests, setRequests] = useState<SpaceMoveOutRequest[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useSkipFirstEffect(() => {
    loadMoveOutRequests();
  }, [page]);

  useEffect(() => {
    if (page === 1) {
      loadMoveOutRequests();
    } else {
      setPage(1);
    }
  }, [searchTerm, status]);

  const loadMoveOutRequests = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (status) params.append("status", status);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = (await withLoader(async () => {
      return await spacesApiService.getMoveOutRequests(params);
    })) as any;

    if (response?.success) {
      setRequests(
        response.data?.requests || response.data?.data || response.data || []
      );
      setTotalItems(response.data?.total || 0);
    }
  };

  const handleApprove = async (id: string) => {
    const response = (await withLoader(async () => {
      return await spacesApiService.approveMoveOutRequest(id);
    })) as any;

    if (response?.success) {
      toast.success("Move-out request approved successfully.");
      loadMoveOutRequests();
    } else {
      const errorMessage =
        response?.data?.message ||
        response?.message ||
        "Failed to approve move-out request";
      toast.error(errorMessage);
    }
  };

  const handleReject = async (id: string) => {
    const response = (await withLoader(async () => {
      return await spacesApiService.rejectMoveOutRequest(id);
    })) as any;

    if (response?.success) {
      toast.success("Move-out request rejected successfully.");
      loadMoveOutRequests();
    } else {
      const errorMessage =
        response?.data?.message ||
        response?.message ||
        "Failed to reject move-out request";
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sidebar-primary">
          Space Move/Out Approvals
        </h1>
        <p className="text-muted-foreground">
          Review and approve pending space move-out requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search space / tenant name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Grid */}
      <ContentContainer>
        <LoaderOverlay />
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-sidebar-primary mb-2">
              No pending move-out requests
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <Card key={req.id} className="rounded-2xl shadow-sm">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-sidebar-primary" />
                        <h2 className="font-semibold text-lg">
                          {req.space_name}
                        </h2>
                      </div>
                      {req.tenant_name && (
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {req.tenant_name}
                          </p>
                        </div>
                      )}
                    </div>

                    {getStatusBadge(req.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
                    {req.site_name && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs mb-1">
                            Site
                          </p>
                          <p className="font-medium truncate">
                            {req.site_name}
                          </p>
                        </div>
                      </div>
                    )}

                    {req.building_name && (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs mb-1">
                            Building
                          </p>
                          <p className="font-medium truncate">
                            {req.building_name}
                          </p>
                        </div>
                      </div>
                    )}

                    {req.requested_at && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs mb-1">
                            Requested On
                          </p>
                          <p className="font-medium">
                            {format(new Date(req.requested_at), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    )}

                    {req.move_out_date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs mb-1">
                            Move-Out Date
                          </p>
                          <p className="font-medium">
                            {format(new Date(req.move_out_date), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {req.reason && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground text-xs mb-1">
                        Reason
                      </p>
                      <p className="text-sm">{req.reason}</p>
                    </div>
                  )}

                  {req.status === "pending" && (
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(req.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(req.id)}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ContentContainer>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
