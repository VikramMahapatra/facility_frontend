// ===============================
// OwnershipHistoryDialog.tsx
// ===============================

import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useLoader } from "@/context/LoaderContext";
import { format } from "date-fns";
import { User, Calendar, Percent, Tag, CheckCircle2, XCircle } from "lucide-react";

interface OwnershipHistoryItem {
    id: string;
    owner_user_id: string;
    owner_name: string;
    ownership_type: string;
    ownership_percentage: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    space_id: string;
    space_name: string;
}

export function OwnershipHistoryDialog({
    open,
    onClose,
    spaceId,
}: {
    open: boolean;
    onClose: () => void;
    spaceId: string;
}) {
    const [history, setHistory] = useState<OwnershipHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { withLoader } = useLoader();

    useEffect(() => {
        if (open && spaceId) {
            loadHistory();
        } else {
            setHistory([]);
            setLoading(false);
        }
    }, [open, spaceId]);

    const loadHistory = async () => {
        setLoading(true);
        const response = await withLoader(async () => {
            return await spacesApiService.getOwnershipHistory(spaceId);
        });

        if (response?.success) {
            const data = response.data?.data || response.data || [];
            setHistory(Array.isArray(data) ? data : []);
        } else {
            setHistory([]);
        }
        setLoading(false);
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
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Ownership History
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No ownership history found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <Card key={item.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold text-lg">{item.owner_name}</span>
                                                </div>
                                                {item.ownership_type && (
                                                    <Badge className={getOwnershipTypeBadgeClass(item.ownership_type)}>
                                                        {item.ownership_type}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Badge className={getStatusBadgeClass(item.is_active)}>
                                                {item.is_active ? (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <XCircle className="h-3 w-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-start gap-2">
                                                <Percent className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs mb-1">Ownership %</p>
                                                    <p className="font-medium">{item.ownership_percentage}%</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs mb-1">Start Date</p>
                                                    <p className="font-medium">
                                                        {item.start_date
                                                            ? format(new Date(item.start_date), "dd MMM yyyy")
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs mb-1">End Date</p>
                                                    <p className="font-medium">
                                                        {item.end_date
                                                            ? format(new Date(item.end_date), "dd MMM yyyy")
                                                            : "Ongoing"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs mb-1">Status</p>
                                                    <Badge
                                                        variant={item.is_active ? "default" : "secondary"}
                                                        className="text-xs"
                                                    >
                                                        {item.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
