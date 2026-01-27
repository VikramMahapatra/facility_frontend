import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { format } from "date-fns";

// API placeholders
async function fetchPendingOwners() {
    return [];
}

async function approveOwnership(id) { }
async function rejectOwnership(id) { }

export default function SpaceOwnerApproval() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchPendingOwners();
        setRequests(data);
        setLoading(false);
    };

    const handleApprove = async (id) => {
        await approveOwnership(id);
        loadData();
    };

    const handleReject = async (id) => {
        await rejectOwnership(id);
        loadData();
    };

    if (loading) {
        return <div className="p-6 text-sm text-muted-foreground">Loading ownership requests…</div>;
    }

    if (!requests.length) {
        return <div className="p-6 text-sm text-muted-foreground">No pending ownership requests</div>;
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Space Ownership Approvals</h1>

            <div className="grid gap-4">
                {requests.map((req) => (
                    <Card key={req.id} className="rounded-2xl shadow-sm">
                        <CardContent className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="font-medium">{req.space_name}</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Requested on {format(new Date(req.requested_at), "dd MMM yyyy")}
                                    </p>
                                </div>

                                <Badge variant="outline">{req.ownership_type}</Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Owner Org</p>
                                    <p className="font-medium">{req.owner_org_name}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground">Ownership %</p>
                                    <p className="font-medium">{req.ownership_percentage}%</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground">Start Date</p>
                                    <p className="font-medium">{format(new Date(req.start_date), "dd MMM yyyy")}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge>{req.status}</Badge>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(req.id)}
                                >
                                    <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleApprove(req.id)}
                                >
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
