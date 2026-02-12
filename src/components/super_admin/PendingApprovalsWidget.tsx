import { useEffect, useState } from "react";
import { superAdminApiService } from "@/services/super_admin/superadminapi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoader } from "@/context/LoaderContext";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PendingOrg = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    created_at?: string;
};

const PendingApprovalsWidget = () => {

    const { withLoader } = useLoader();
    const [orgs, setOrgs] = useState<PendingOrg[]>([]);

    useEffect(() => {

        const load = async () => {

            const response = await withLoader(() =>
                superAdminApiService.fetchRecentPendingOrganizations()
            ) as any;

            if (response?.success) {
                setOrgs(response.data || []);
            }
        };

        load();

    }, [withLoader]);

    return (
        <Card className="space-y-6">
            <CardHeader>
                <CardTitle>Recent Pending Approvals</CardTitle>
            </CardHeader>

            <CardContent>

                {orgs.length === 0 ? (

                    <div className="flex flex-col items-center justify-center py-10 text-center ">
                        <div className="text-center mb-4">
                            <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                All organizations are approved
                            </h3>
                            <p className="text-muted-foreground">
                                No pending approval requests right now.
                            </p>
                        </div>
                    </div>

                ) : (
                    <>
                        <div className="space-y-3">
                            {orgs.map((org) => (
                                <div
                                    key={org.id}
                                    className="flex items-center justify-between rounded-lg border bg-background p-4 transition-all hover:shadow-sm hover:border-primary/30"
                                >
                                    {/* LEFT SIDE */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-foreground">
                                            {org.name}
                                        </span>

                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">

                                            {org.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {org.email}
                                                </span>
                                            )}

                                            {org.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {org.phone}
                                                </span>
                                            )}

                                        </div>
                                    </div>

                                    {/* RIGHT SIDE ACTIONS */}
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">Pending</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </CardContent>
        </Card>

    );
};

export default PendingApprovalsWidget;
