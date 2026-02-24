import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "@/helpers/dateHelpers";
import MoveInModal from "./MoveInModal";
import MoveOutModal from "./MoveOutModal";
import {
    Clock,
    Users,
    LogIn,
    History,
    User,
    ShieldCheck,
    UserPlus,
    UserCheck,
    UserX,
    UserMinus,
    FileText,
    FileX
} from "lucide-react";
import { OccupancyResponse } from "@/interfaces/spaces_interfaces";
import React from "react";
import { Progress } from "../ui/progress";
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi";
import { useNavigate } from "react-router-dom";
import { toast } from "../ui/app-toast";
import {
    LogOut,
    Handshake,
    ClipboardCheck,
    Wrench,
    CheckCircle
} from "lucide-react"

interface Props {
    spaceId: string;
    owners: any[];
    tenants: any[];
    occupancy: OccupancyResponse;
    onSucess: () => void;
}

const EVENT_META: Record<string, any> = {
    owner_requested: { label: "Owner Requested", icon: User, color: "text-yellow-600 bg-yellow-100" },
    owner_approved: { label: "Owner Approved", icon: ShieldCheck, color: "text-green-600 bg-green-100" },
    owner_removed: { label: "Owner Removed", icon: UserX, color: "text-red-600 bg-red-100" },
    tenant_requested: { label: "Tenant Requested", icon: UserPlus, color: "text-yellow-600 bg-yellow-100" },
    tenant_approved: { label: "Tenant Approved", icon: UserCheck, color: "text-green-600 bg-green-100" },
    tenant_rejected: { label: "Tenant Rejected", icon: UserX, color: "text-red-600 bg-red-100" },
    tenant_removed: { label: "Tenant Removed", icon: UserMinus, color: "text-red-600 bg-red-100" },
    lease_created: { label: "Lease Created", icon: FileText, color: "text-green-600 bg-green-100" },
    lease_terminated: { label: "Lease Terminated", icon: FileX, color: "text-red-600 bg-red-100" },
    moved_in: { label: "Moved In", icon: LogIn, color: "text-green-700 bg-green-100" },
    moved_out: { label: "Moved Out", icon: LogOut, color: "text-gray-600 bg-gray-100" }
};

export default function OccupancyTimeline({ spaceId, owners, tenants, occupancy, onSucess }: Props) {

    return (
        <div className="space-y-6">
            {/* ================= Occupancy History ================= */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Occupancy Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {occupancy?.history?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No history</p>
                    ) : (
                        <div className="relative pl-6">
                            <div className="space-y-6">
                                {occupancy?.history.map((e, i) => {
                                    const meta = EVENT_META[e.event] || {};
                                    const Icon = meta.icon || Clock;
                                    return (
                                        <div key={i} className="relative flex gap-4">
                                            <div className="relative flex flex-col items-center">
                                                {i !== occupancy.history.length - 1 && (
                                                    <span className="absolute top-8 h-full w-px bg-border" />
                                                )}
                                                <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${meta.color}`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{meta.label || e.event}</p>
                                                    {e.occupant_type && (
                                                        <span className="rounded bg-muted px-2 py-0.5 text-xs capitalize">{e.occupant_type}</span>
                                                    )}
                                                </div>
                                                {e.occupant_name && <p className="text-sm text-muted-foreground">{e.occupant_name}</p>}
                                                <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
