import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  History,
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Mail,
  Phone,
  Zap,
  Droplets,
  Percent,
  Plus,
  CalendarClock,
  Pencil,
  CreditCard,
  Wallet,
  Smartphone,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lease } from "@/interfaces/leasing_tenants_interface";
import { leasesApiService } from "@/services/leasing_tenants/leasesapi";
import { leaseChargeApiService } from "@/services/leasing_tenants/leasechargeapi";
import { LeaseChargeForm } from "@/components/LeaseChargeForm";
import { toast } from "@/components/ui/app-toast";
import ContentContainer from "@/components/ContentContainer";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import { Pagination } from "@/components/Pagination";
import { PaymentTermsForm } from "@/components/PaymentTermsForm";
import { useSettings } from "@/context/SettingsContext";

export default function LeaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [lease, setLease] = useState<Lease | null>(null);
  const [chargeHistory, setChargeHistory] = useState<any[]>([]);
  const [chargePage, setChargePage] = useState(1);
  const [chargePageSize] = useState(5);
  const [chargeTotalItems, setChargeTotalItems] = useState(0);
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [isPaymentTermsFormOpen, setIsPaymentTermsFormOpen] = useState(false);
  const [chargeFormMode, setChargeFormMode] = useState<
    "create" | "edit" | "view"
  >("create");
  const [selectedCharge, setSelectedCharge] = useState<any | undefined>();

  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [termPage, setTermPage] = useState(1);
  const [termPageSize] = useState(6);
  const [termTotalItems, setTermTotalItems] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState<any | undefined>();
  const [termFormMode, setTermFormMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const { systemCurrency } = useSettings();

  useEffect(() => {
    if (!id) return;

    const loadLeaseDetail = async () => {
      const response = await withLoader(async () => {
        return await leasesApiService.getLeaseById(id);
      });

      if (response?.success) {
        const data = response.data;

        if (data.lease) {
          setLease(data.lease);
        } else {
          setLease(data);
        }

        if (data.charges || data.lease_charges) {
          const charges = data.charges || data.lease_charges || [];
          setChargeHistory(Array.isArray(charges) ? charges : []);
          setChargeTotalItems(Array.isArray(charges) ? charges.length : 0);
        } else {
          setChargeHistory([]);
          setChargeTotalItems(0);
        }
      } else {
        toast.error("Failed to load lease details");
        navigate(-1);
      }
    };

    loadLeaseDetail();
    loadLeasePaymentTerms();
  }, [id]);

  const loadLeasePaymentTerms = async () => {
    const skip = (termPage - 1) * termPageSize;
    const limit = termPageSize;

    const params = new URLSearchParams();
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    params.append("lease_id", String(id));

    const response = await withLoader(async () => {
      return await leasesApiService.getLeasePaymentTerms(params);
    });

    if (response?.success) {
      setPaymentTerms(response.data?.items || []);
      setTermTotalItems(response.data?.total || 0);
    }
  };

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

  const formatCurrency = (val?: number) => {
    if (val == null) return "-";
    return systemCurrency.format(val);
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return <Wallet className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "bank":
      case "bank_transfer":
        return <Building2 className="h-4 w-4" />;
      case "cheque":
        return <FileText className="h-4 w-4" />;
      case "upi":
        return <Smartphone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const normalizeChargeCode = (code?: string) =>
    code?.toUpperCase().trim() || "UNKNOWN";

  const getChargeCodeColor = (code?: string) => {
    const normalized = normalizeChargeCode(code);
    switch (normalized) {
      case "RENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CAM":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "ELEC":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "WATER":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
      case "PARK":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "PENALTY":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "MAINTENANCE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
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
                  <Badge
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() =>
                      lease.space_id && navigate(`/spaces/${lease.space_id}`)
                    }
                  >
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
              <TabsTrigger value="terms">Payment Terms</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              {/* Tenant Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5" /> Tenant Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                        <Users className="h-4 w-4" />
                        Tenant Name
                      </span>
                      <p className="font-semibold text-base">
                        <span
                          className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          onClick={() =>
                            lease.tenant_id &&
                            navigate(`/tenants/${lease.tenant_id}/view`)
                          }
                        >
                          {capitalizeName(lease.tenant_name) || "-"}
                        </span>
                      </p>
                    </div>
                    {(lease as any).tenant_kind && (
                      <div>
                        <span className="text-muted-foreground mb-2 text-sm block">
                          Tenant Kind
                        </span>
                        {getKindBadge((lease as any).tenant_kind)}
                      </div>
                    )}
                    {(lease as any).tenant_legal_name && (
                      <div>
                        <span className="text-muted-foreground mb-2 text-sm block">
                          Legal Name
                        </span>
                        <p className="font-semibold text-base">
                          {(lease as any).tenant_legal_name}
                        </p>
                      </div>
                    )}
                    {(lease as any).tenant_email && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <Mail className="h-4 w-4" />
                          Email
                        </span>
                        <p className="font-semibold text-base">
                          {(lease as any).tenant_email}
                        </p>
                      </div>
                    )}
                    {(lease as any).tenant_phone && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <Phone className="h-4 w-4" />
                          Phone
                        </span>
                        <p className="font-semibold text-base">
                          {(lease as any).tenant_phone}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <span className="text-muted-foreground mb-2 text-sm block">
                        Status
                      </span>
                      <div className="min-h-[24px] flex items-center">
                        {getStatusBadge(lease.status)}
                      </div>
                    </div>
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
                    {(lease as any).building_name && (
                      <div>
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <Building2 className="h-4 w-4" />
                          Building
                        </span>
                        <p className="font-semibold text-base">
                          {(lease as any).building_name}
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
                          <span
                            className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                            onClick={() =>
                              lease.space_id &&
                              navigate(`/spaces/${lease.space_id}`)
                            }
                          >
                            {lease.space_name}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Financial Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                          <DollarSign className="h-4 w-4" />
                          Deposit Amount
                        </span>
                        <p className="font-semibold text-base">
                          {formatCurrency(lease.deposit_amount)}
                        </p>
                      </div>
                    )}
                    {(lease as any).cam_rate !== undefined &&
                      (lease as any).cam_rate !== null && (
                        <div>
                          <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                            <Percent className="h-4 w-4" />
                            CAM Rate
                          </span>
                          <p className="font-semibold text-base">
                            {formatCurrency(Number((lease as any).cam_rate))}
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Utilities */}
              {((lease as any).electricity || (lease as any).water) && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Zap className="h-5 w-5" /> Utilities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {(lease as any).electricity && (
                        <div>
                          <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                            <Zap className="h-4 w-4" />
                            Electricity
                          </span>
                          <p className="font-semibold text-base capitalize">
                            {(lease as any).electricity}
                          </p>
                        </div>
                      )}
                      {(lease as any).water && (
                        <div>
                          <span className="text-muted-foreground flex items-center gap-2 mb-2 text-sm">
                            <Droplets className="h-4 w-4" />
                            Water
                          </span>
                          <p className="font-semibold text-base capitalize">
                            {(lease as any).water}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* PAYMENT TERMS */}
            <TabsContent value="terms" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CalendarClock className="h-5 w-5" />
                      Payment Terms
                    </h3>

                    {lease?.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTerm(undefined);
                          setTermFormMode("create");
                          setIsPaymentTermsFormOpen(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Term
                      </Button>
                    )}
                  </div>

                  {paymentTerms.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No payment terms defined
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-20 font-semibold">
                              Term
                            </TableHead>
                            <TableHead className="w-32 font-semibold">
                              Payment Method
                            </TableHead>
                            <TableHead className="w-32 font-semibold">
                              Reference No
                            </TableHead>
                            {paymentTerms.some((t) => t.paid_at) && (
                              <TableHead className="w-28 font-semibold">
                                Paid On
                              </TableHead>
                            )}
                            <TableHead className="w-28 font-semibold">
                              Due Date
                            </TableHead>
                            <TableHead className="text-right w-28 font-semibold">
                              Amount
                            </TableHead>
                            <TableHead className="w-24 font-semibold">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentTerms
                            .slice(
                              (termPage - 1) * termPageSize,
                              termPage * termPageSize,
                            )
                            .map((term, index) => (
                              <TableRow
                                key={term.id || index}
                                className="hover:bg-muted/30 transition-colors border-b"
                              >
                                <TableCell className="py-2.5">
                                  <Badge
                                    variant="outline"
                                    className="font-semibold text-xs px-2 py-0.5"
                                  >
                                    {term.description || `Term #${index + 1}`}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2.5">
                                  <div className="flex items-center gap-1.5">
                                    {getPaymentMethodIcon(term.payment_method)}
                                    <span className="text-sm capitalize">
                                      {term.payment_method || (
                                        <span className="text-muted-foreground">
                                          -
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2.5">
                                  <span className="text-sm font-mono">
                                    {term.reference_no || (
                                      <span className="text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </span>
                                </TableCell>
                                {paymentTerms.some((t) => t.paid_at) && (
                                  <TableCell className="py-2.5">
                                    <span className="text-sm">
                                      {term.paid_at ? (
                                        formatDate(term.paid_at)
                                      ) : (
                                        <span className="text-muted-foreground">
                                          -
                                        </span>
                                      )}
                                    </span>
                                  </TableCell>
                                )}
                                <TableCell className="py-2.5">
                                  <span className="text-sm">
                                    {formatDate(term.due_date)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right font-semibold py-2.5">
                                  <span className="text-sm">
                                    {formatCurrency(Number(term.amount))}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2.5">
                                  <Badge
                                    className={
                                      term.status === "paid"
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : term.status === "overdue"
                                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                    }
                                  >
                                    {term.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  {termTotalItems > termPageSize && (
                    <div className="mt-6">
                      <Pagination
                        page={termPage}
                        pageSize={termPageSize}
                        totalItems={termTotalItems}
                        onPageChange={setTermPage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <LeaseChargeForm
        charge={
          chargeFormMode === "create" && id && lease
            ? ({
                lease_id: id,
                lease_name: lease.lease_number,
              } as any)
            : selectedCharge
        }
        isOpen={isChargeFormOpen}
        disableLeaseField={chargeFormMode === "create" && !!id}
        onClose={() => {
          setIsChargeFormOpen(false);
          setSelectedCharge(undefined);
        }}
        onSave={async (chargeData: any) => {
          let response;
          if (chargeFormMode === "create") {
            response = await withLoader(async () => {
              return await leaseChargeApiService.addLeaseCharge({
                ...chargeData,
                lease_id: id,
              });
            });
          } else if (chargeFormMode === "edit" && selectedCharge) {
            const updatedCharge = {
              ...selectedCharge,
              ...chargeData,
              updated_at: new Date().toISOString(),
            };
            response = await withLoader(async () => {
              return await leaseChargeApiService.updateLeaseCharge(
                updatedCharge,
              );
            });
          }

          if (response?.success) {
            setIsChargeFormOpen(false);
            setSelectedCharge(undefined);
            toast.success(
              `Lease charge has been ${chargeFormMode === "create" ? "created" : "updated"} successfully.`,
            );
            // Reload lease detail data to show the new/updated charge
            if (id) {
              const leaseResponse = await withLoader(async () => {
                return await leasesApiService.getLeaseById(id);
              });
              if (leaseResponse?.success) {
                const data = leaseResponse.data;
                if (data.lease) {
                  setLease(data.lease);
                } else {
                  setLease(data);
                }
                if (data.charges || data.lease_charges) {
                  const charges = data.charges || data.lease_charges || [];
                  setChargeHistory(Array.isArray(charges) ? charges : []);
                  setChargeTotalItems(
                    Array.isArray(charges) ? charges.length : 0,
                  );
                }
              }
            }
          } else if (response && !response.success) {
            if (response?.message) {
              toast.error(response.message);
            } else {
              toast.error(
                `Failed to ${chargeFormMode === "create" ? "create" : "update"} lease charge.`,
              );
            }
          }
          return response;
        }}
        mode={chargeFormMode}
      />
    </ContentContainer>
  );
}
