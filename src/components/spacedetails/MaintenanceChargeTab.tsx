import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { SpaceOwnershipSection } from "@/components/spacedetails/SpaceOwnershipSection";
import { OwnershipHistoryDialog } from "@/components/spacedetails/OwnershipHistoryDialog";
import { useLoader } from "@/context/LoaderContext";
import {
    getKindColor,
    getKindIcon,
    getStatusColor,
    OccupancyResponse,
    Space,
    TimelineEvent,
} from "@/interfaces/spaces_interfaces";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import {
    ArrowLeft,
    FileText,
    Home,
    Wrench,
    Search,
    Calendar,
    Receipt,
    IndianRupee,
    Clock,
    History,
    Users,
    Pencil,
    Car,
    Plus,
    Trash2,
} from "lucide-react";
import { SpaceMaintenanceForm } from "@/components/SpaceMaintenanceForm";
import { SpaceForm } from "@/components/SpaceForm";
import { toast } from "@/components/ui/app-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ownerMaintenancesApiService } from "@/services/spaces_sites/ownermaintenancesapi";
import { Pagination } from "@/components/Pagination";
import OccupancyTab from "@/components/spacedetails/OccupancyTab";
import SpaceTenantSection from "@/components/spacedetails/SpaceTenantSection";
import { tenantsApiService } from "@/services/leasing_tenants/tenantsapi";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";
import { parkingSlotApiService } from "@/services/parking_access/parkingslotsapi";
import { ParkingSlot } from "@/interfaces/parking_access_interface";
import { useSettings } from "@/context/SettingsContext";
import { formatDate } from "@/helpers/dateHelpers";

interface Props {
    space: Space;
    owners: any[];
}

export default function MaintenanceCharge({ space, owners }: Props) {
    const [maintenanceItems, setMaintenanceItems] = useState<any[]>([]);
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);

    const [maintenanceSearch, setMaintenanceSearch] = useState("");
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [maintenancePageSize] = useState(5);
    const [maintenanceTotal, setMaintenanceTotal] = useState(0);
    const [maintenanceRecord, setMaintenanceRecord] = useState<any | null>(null);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState<
        "create" | "edit" | "view"
    >("create");


    useEffect(() => {
        if (space?.id) {
            loadMaintenances(space.id);
        }
    }, [space?.id, maintenancePage]);

    useEffect(() => {
        if (maintenancePage === 1) {
            if (space?.id) loadMaintenances(space.id);
        } else {
            setMaintenancePage(1);
        }
    }, [maintenanceSearch]);


    const loadMaintenances = async (spaceId: string) => {
        setMaintenanceLoading(true);
        const params = new URLSearchParams();
        if (maintenanceSearch) params.append("search", maintenanceSearch);
        params.append("space_id", spaceId);
        params.append(
            "skip",
            ((maintenancePage - 1) * maintenancePageSize).toString(),
        );
        params.append("limit", maintenancePageSize.toString());
        const response =
            await ownerMaintenancesApiService.getOwnerMaintenancesBySpace(params);
        if (response?.success) {
            setMaintenanceItems(response.data?.maintenances || []);
            setMaintenanceTotal(response.data?.total_records || 0);
        }
        setMaintenanceLoading(false);
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline">-</Badge>;
        switch (status.toLowerCase()) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
            case "invoiced":
                return <Badge className="bg-blue-100 text-blue-700">Invoiced</Badge>;
            case "paid":
                return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
            case "waived":
                return <Badge className="bg-purple-100 text-purple-700">Waived</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Maintenance Charges</span>
                        {owners.length > 0 && (
                            <Button
                                onClick={() => {
                                    setMaintenanceRecord({
                                        site_name: space.site_name,
                                        space_name: space.name,
                                        building_name: space.building_block,
                                    });
                                    setMaintenanceMode("create");
                                    setIsMaintenanceOpen(true);
                                }}
                                className="gap-2"
                            >
                                <Wrench className="h-4 w-4" />
                                Create Maintenance
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search maintenance..."
                            value={maintenanceSearch}
                            onChange={(e) => setMaintenanceSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <div className="relative">
                        {maintenanceLoading && (
                            <div className="animate-pulse space-y-3">
                                <div className="h-6 bg-gray-200 rounded w-40"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </div>
                        )}
                        {maintenanceItems.length === 0 && !maintenanceLoading ? (
                            <p className="text-center text-sm text-muted-foreground">
                                No maintenance charges found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {maintenanceItems.map((item) => (
                                    <Card key={item.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">
                                                #{item.maintenance_no || "-"}
                                            </div>
                                            {getStatusBadge(item.status)}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Owner: {item.owner_name || "-"}
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                            <div className="space-y-1">
                                                <div className="text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Period
                                                </div>
                                                <div>
                                                    {formatDate(item.period_start)} -{" "}
                                                    {formatDate(item.period_end)}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-muted-foreground flex items-center gap-2">
                                                    <IndianRupee className="h-4 w-4" />
                                                    Amount
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium">
                                                        ₹ {item.amount ?? "-"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-muted-foreground flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Created
                                                </div>
                                                <div>{formatDate(item.created_at)}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-muted-foreground flex items-center gap-2">
                                                    <Receipt className="h-4 w-4" />
                                                    Invoice
                                                </div>
                                                <div>{item.invoice_id || "-"}</div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Pagination
                page={maintenancePage}
                pageSize={maintenancePageSize}
                totalItems={maintenanceTotal}
                onPageChange={setMaintenancePage}
            />
            <SpaceMaintenanceForm
                isOpen={isMaintenanceOpen}
                onClose={() => setIsMaintenanceOpen(false)}
                onSave={async (payload) => {
                    if (!payload.space_id || !payload.start_date) {
                        toast.error("Space and start date are required");
                        return { success: false };
                    }

                    const payloadToSave = {
                        ...payload,
                        period_start: payload.start_date,
                        period_end: payload.end_date,
                    };
                    delete payloadToSave.start_date;
                    delete payloadToSave.end_date;
                    const response =
                        await ownerMaintenancesApiService.createOwnerMaintenance(
                            payloadToSave,
                        );

                    if (response?.success) {
                        setIsMaintenanceOpen(false);
                        toast.success(
                            `Space maintenance has been created successfully.`,
                        );
                        return { success: true };
                    } else {
                        return { success: false };
                    }
                }}
                mode={maintenanceMode}
                record={maintenanceRecord as any}
                defaultSpaceId={space.id}
            />
        </>
    )
}