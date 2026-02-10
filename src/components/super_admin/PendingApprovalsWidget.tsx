import { useEffect, useState } from "react";
import { superAdminApiService } from "@/services/super_admin/superadminapi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoader } from "@/context/LoaderContext";
import { CheckCircle2 } from "lucide-react";

type PendingOrg = {
    id: string;
    name: string;
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

                    <div className="space-y-3">

                        {orgs.map(org => (

                            <div
                                key={org.id}
                                className="flex justify-between items-center border-b pb-2"
                            >
                                <span className="text-sm font-medium">
                                    {org.name}
                                </span>

                                {/* Approve button later */}
                                {/* <Button size="sm">Approve</Button> */}

                            </div>

                        ))}

                    </div>

                )}

            </CardContent>
        </Card>

    );
};

export default PendingApprovalsWidget;
