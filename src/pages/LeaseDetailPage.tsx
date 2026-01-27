import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  History,
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lease } from "@/interfaces/leasing_tenants_interface";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { toast } from "sonner";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { Pagination } from "@/components/Pagination";

export default function LeaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [lease, setLease] = useState<Lease | null>(null);
  const [chargeHistory, setChargeHistory] = useState<any[]>([]);
  const [isChargeLoading, setIsChargeLoading] = useState(false);
  const [chargePage, setChargePage] = useState(1);
  const [chargePageSize] = useState(5);
  const [chargeTotalItems, setChargeTotalItems] = useState(0);

  useEffect(() => {
    if (!id) return;

    // TODO: Uncomment when API is ready
    // const loadLease = async () => {
    //   const response = await withLoader(async () => {
    //     return await leasesApiService.getLeaseById(id);
    //   });
    //   if (response?.success) {
    //     setLease(response.data);
    //   } else {
    //     toast.error("Failed to load lease details");
    //     navigate(-1);
    //   }
    // };
    // loadLease();

    // Mock data for now - remove when API is ready
    setLease({
      id: id,
      lease_number: `LS-${id.slice(0, 8)}`,
      tenant_name: "Sample Tenant",
      tenant_id: "tenant-123",
      space_name: "Space A-101",
      site_name: "Main Site",
      building_name: "Building 1",
      status: "active",
      kind: "commercial",
      start_date: "2024-01-01",
      end_date: "2025-12-31",
      rent_amount: 50000,
      deposit_amount: 100000,
      cam_rate: 10,
      frequency: "monthly",
    } as Lease);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // TODO: Uncomment when API is ready
    // const loadChargeHistory = async () => {
    //   setIsChargeLoading(true);
    //   try {
    //     const response = await leasesApiService.getLeaseChargeHistory(id);
    //     if (response?.success) {
    //       const items = response?.data || [];
    //       setChargeHistory(items);
    //       setChargeTotalItems(items.length);
    //     } else {
    //       setChargeHistory([]);
    //       setChargeTotalItems(0);
    //     }
    //   } catch (error) {
    //     setChargeHistory([]);
    //     setChargeTotalItems(0);
    //     toast.error("Failed to load charge history");
    //   } finally {
    //     setIsChargeLoading(false);
    //   }
    // };
    // loadChargeHistory();

    // Mock data for now - remove when API is ready
    setIsChargeLoading(false);
    setChargeHistory([]);
    setChargeTotalItems(0);
  }, [id]);

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const capitalizeName = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "expired":
        return <Badge className="bg-orange-100 text-orange-700">Expired</Badge>;
      case "terminated":
        return <Badge className="bg-red-100 text-red-700">Terminated</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const getKindBadge = (kind?: string) => {
    switch (kind?.toLowerCase()) {
      case "commercial":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Commercial
          </Badge>
        );
      case "residential":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Residential
          </Badge>
        );
      default:
        return <Badge variant="outline">{kind || "Unknown"}</Badge>;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <ContentContainer>
      <LoaderOverlay />
      {lease && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/leases")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                  {lease.lease_number
                    ? lease.lease_number.slice(0, 2).toUpperCase()
                    : "LS"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {lease.lease_number || `Lease #${lease.id?.slice(0, 8)}`}
                </h1>
                <p>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {lease.space_name || "Unknown Space"}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* <Button
                variant="outline"
                onClick={() => navigate(`/leases/${id}/edit`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Edit
              </Button>
              {/*} */}
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charges">Lease Charges</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Lease Information
                  </h3>
                  {/* First Row: Tenant, Status, Kind */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                        <Users className="h-4 w-4" />
                        Tenant
                      </span>
                      <p className="font-semibold text-base">
                        {lease.tenant_name || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground mb-2 text-sm block">
                        Status
                      </span>
                      {getStatusBadge(lease.status)}
                    </div>
                    <div>
                      <span className="text-muted-foreground mb-2 text-sm block">
                        Kind
                      </span>
                      {getKindBadge(lease.kind)}
                    </div>
                  </div>
                  {/* Second Row: Other Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lease.start_date && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          Start Date
                        </span>
                        <p className="font-semibold text-base">
                          {formatDate(lease.start_date)}
                        </p>
                      </div>
                    )}
                    {lease.end_date && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          End Date
                        </span>
                        <p className="font-semibold text-base">
                          {formatDate(lease.end_date)}
                        </p>
                      </div>
                    )}
                    {lease.rent_amount !== undefined && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <DollarSign className="h-4 w-4" />
                          Rent Amount
                        </span>
                        <p className="font-semibold text-base">
                          {formatCurrency(lease.rent_amount)}
                          {lease.frequency && ` / ${lease.frequency}`}
                        </p>
                      </div>
                    )}
                    {lease.deposit_amount !== undefined && (
                      <div>
                        <span className="text-muted-foreground mb-2 text-sm block">
                          Deposit Amount
                        </span>
                        <p className="font-semibold text-base">
                          {formatCurrency(lease.deposit_amount)}
                        </p>
                      </div>
                    )}
                    {lease.space_name && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          Space
                        </span>
                        <p className="font-semibold text-base">
                          {lease.space_name}
                        </p>
                      </div>
                    )}
                    {lease.site_name && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <Building2 className="h-4 w-4" />
                          Site
                        </span>
                        <p className="font-semibold text-base">
                          {lease.site_name}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CHARGES */}
            <TabsContent value="charges" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Lease Charges
                  </h3>
                  {isChargeLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading charges...
                    </p>
                  ) : chargeHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No charges found
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Charge items will be rendered here */}
                      <p className="text-sm text-muted-foreground">
                        Charges list will be displayed here
                      </p>
                    </div>
                  )}
                  {/* Pagination */}
                  {chargeTotalItems > chargePageSize && (
                    <Pagination
                      page={chargePage}
                      pageSize={chargePageSize}
                      totalItems={chargeTotalItems}
                      onPageChange={setChargePage}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ContentContainer>
  );
}
