import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, User, Home, Calendar, Percent, Tag, Building2 } from "lucide-react";
import { format } from "date-fns";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function SpaceOwnerApproval() {
    const { withLoader } = useLoader();
    const [searchTerm, setSearchTerm] = useState("");
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(6);
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();

    useSkipFirstEffect(() => {
        loadPendingOwnerRequests();
    }, [page]);

    useEffect(() => {
        if (page === 1) {
            loadPendingOwnerRequests();
        } else {
            setPage(1);
        }
    }, [searchTerm]);

    const loadPendingOwnerRequests = async () => {
        const skip = (page - 1) * pageSize;
        const limit = pageSize;

        // build query params
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        params.append("skip", skip.toString());
        params.append("limit", limit.toString());

        const response = await withLoader(async () => {
            return await spacesApiService.getPendingOwnerRequests(params);
        });

        if (response?.success) {
            setRequests(response.data?.requests || response.data?.data || response.data || []);
            setTotalItems(response.data?.total || 0);
        }
    };

    const handleApprove = async (id: string) => {
        const response = await withLoader(async () => {
            return await spacesApiService.updateOwnerApproval(id, "approved");
        });

        if (response?.success) {
            toast.success("Ownership request approved successfully.");
            loadPendingOwnerRequests();
        }
    };

    const handleReject = async (id: string) => {
        const response = await withLoader(async () => {
            return await spacesApiService.updateOwnerApproval(id, "rejected");
        });

        if (response?.success) {
            toast.success("Ownership request rejected successfully.");
            loadPendingOwnerRequests();
        }
    };

    const getOwnershipTypeBadgeClass = (type?: string) => {
        if (!type) return "bg-gray-100 text-gray-800";
        const normalized = type.toLowerCase();
        if (normalized === "primary") {
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        } else if (normalized === "secondary") {
            return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        }
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    };

    const getStatusBadgeClass = (isActive?: boolean) => {
        if (isActive === true) {
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        } else if (isActive === false) {
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        }
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-sidebar-primary">Space Ownership Approvals</h1>
                <p className="text-muted-foreground">Review and approve pending ownership requests</p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Requests Grid */}
            <ContentContainer>
                <LoaderOverlay />
                {requests.length === 0 ? (
                    <div className="text-center py-12">
                        <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-sidebar-primary mb-2">No pending ownership requests</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((req) => (
                            <Card key={req.id} className="rounded-2xl shadow-sm">
                                <CardContent className="p-4 flex flex-col gap-3">

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm pt-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Home className="h-5 w-5 text-sidebar-primary" />
                                                    <h2 className="font-semibold text-lg cursor-pointer hover:underline"
                                                        onClick={() =>
                                                            navigate(`/spaces/${req.space_id}`)
                                                        }>
                                                        {req.space_name}
                                                    </h2>
                                                </div>
                                            </div>
                                        </div>
                                        {req.owner_name && (
                                            <div className="flex items-start gap-2">
                                                <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-muted-foreground text-xs mb-1">Owner Name</p>
                                                    <p className="font-medium truncate">{req.owner_name}</p>
                                                </div>
                                            </div>
                                        )}

                                        {req.ownership_percentage !== undefined && (
                                            <div className="flex items-start gap-2">
                                                <Percent className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-muted-foreground text-xs mb-1">Ownership</p>
                                                    <p className="font-medium">{req.ownership_percentage}%</p>
                                                </div>
                                            </div>
                                        )}

                                        {req.status && (
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-muted-foreground text-xs mb-1">Status:</p>
                                                    <Badge className={getStatusBadgeClass(req.status)}>
                                                        {req.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
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
                                    </div>



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
