import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "@/helpers/dateHelpers";
import MoveInModal from "./Occupancy/MoveInModal";
import MoveOutModal from "./Occupancy/MoveOutModal";
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
import { EVENT_META, TimelineEvent } from "@/interfaces/spaces_interfaces";
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
    history: TimelineEvent[];
}

export default function OccupancyTimeline({ history }: Props) {

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
                    {history?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No history</p>
                    ) : (
                        <div className="relative pl-6">
                            <div className="space-y-6">
                                {history?.map((e, i) => {
                                    const meta = EVENT_META[e.event] || {};
                                    const Icon = meta.icon || Clock;
                                    return (
                                        <div key={i} className="relative flex gap-4">
                                            <div className="relative flex flex-col items-center">
                                                {i !== history.length - 1 && (
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
