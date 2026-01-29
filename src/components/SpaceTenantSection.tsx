// ===============================
// SpaceTenantSection.tsx
// ===============================
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { TenantDialog } from "./TenantDialog";

export function SpaceTenantSection({
  spaceId,
  actionSlot,
}: {
  spaceId: string;
  actionSlot?: React.ReactNode;
}) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const loadTenants = async () => {
    const res = await spacesApiService.getActiveTenants(spaceId);
    if (res.success) setTenants(res.data || []);
  };

  useEffect(() => {
    loadTenants();
  }, [spaceId]);

  return (
    <div className="space-y-4">
      {tenants.length === 0 && (
        <Alert variant="destructive">
          <AlertTitle>No tenant assigned</AlertTitle>
          <AlertDescription>
            This space currently has no tenant. Assign tenant to continue
            normal operations.
          </AlertDescription>
        </Alert>
      )}

      {tenants.map((t) => (
        <Card key={t.id} className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.tenant_name}</p>
            <p className="text-sm text-muted-foreground">
              Since {t.start_date}
            </p>
          </div>
          {t.lease_number && (
            <Badge variant="outline">{t.lease_number}</Badge>
          )}
        </Card>
      ))}

      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)}>Assign / Change Tenant</Button>
        {tenants.length > 0 && actionSlot}
      </div>

      <TenantDialog
        open={open}
        onClose={() => setOpen(false)}
        spaceId={spaceId}
        onSuccess={() => {
          loadTenants();
          setOpen(false);
        }}
      />
    </div>
  );
}
