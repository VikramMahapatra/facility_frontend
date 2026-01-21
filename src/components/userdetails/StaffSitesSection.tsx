import { Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StaffSite {
    site_id: string;
    site_name: string;
}

interface StaffSitesSectionProps {
    sites?: StaffSite[];
    staff_role: string
}

export function StaffSitesSection({ sites, staff_role }: StaffSitesSectionProps) {
    if (!sites || sites.length === 0) {
        return (
            <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                    No sites assigned
                </p>
            </div>
        );
    }

    return (
        <div className="pt-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4" />
                Assigned Sites
            </p>

            <div className="flex flex-wrap gap-2">
                {sites.map((site) => (
                    <Badge
                        key={site.site_id}
                        variant="secondary"
                        className="flex items-center gap-1"
                    >
                        <Building className="h-3 w-3" />
                        {site.site_name}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
