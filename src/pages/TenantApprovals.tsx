import { useEffect, useState } from "react";
import { Check, X, Eye } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { useNavigate } from "react-router-dom";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";


type TenantApproval = {
    id: string;
    tenant_id: string;
    tenant_name: string;
    phone: string;
    space_id: string;
    space_name: string;
    site_name: string;
    requested_at: string;
    status: "pending" | "approved" | "rejected";
};

export default function TenantApprovalPage() {
    const navigate = useNavigate();

    const [tenants, setTenants] = useState<TenantApproval[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("pending");

    useEffect(() => {
        fetchTenants();
    }, [status, search]);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status) params.append("status", status);
            if (search) params.append("search", search);
            const res = await tenantsApiService.getTenantApprovals(params);
            setTenants(res.data.items);
        } finally {
            setLoading(false);
        }
    };

    const approveTenant = async (spaceId: string, tenantId: string) => {
        console.log("space & tenant", spaceId, tenantId);
        await tenantsApiService.approveTenant(spaceId, tenantId);
        fetchTenants();
    };

    const rejectTenant = async (spaceId: string, tenantId: string) => {
        await tenantsApiService.rejectTenant(spaceId, tenantId);
        fetchTenants();
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "approved":
                return <Badge className="bg-green-600">Approved</Badge>;
            case "leased":
                return <Badge className="bg-green-600">Leased</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">Tenant Approvals</h1>
                <p className="text-sm text-muted-foreground">
                    Review and manage tenant space requests
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <Input
                            placeholder="Search tenant name / phone"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64"
                        />

                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="leased">Leased</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader />
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Space</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Requested On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {tenants.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        No tenant requests found
                                    </TableCell>
                                </TableRow>
                            )}

                            {tenants.map((tenant) => {
                                return (
                                    <TableRow key={tenant.id} >
                                        <TableCell>
                                            <div className="font-medium">{tenant.tenant_name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {tenant.phone}
                                            </div>
                                        </TableCell>

                                        <TableCell>{tenant.space_name}</TableCell>
                                        <TableCell>{tenant.site_name}</TableCell>
                                        <TableCell>
                                            {new Date(tenant.requested_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{statusBadge(tenant.status)}</TableCell>

                                        <TableCell className="text-right space-x-2">
                                            {tenant.status === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            approveTenant(
                                                                tenant.space_id,
                                                                tenant.tenant_id
                                                            )
                                                        }
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            rejectTenant(
                                                                tenant.space_id,
                                                                tenant.tenant_id
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    navigate(`/spaces/${tenant.space_id}`)
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    );
}
