// app/(your-path)/LeaseCharges.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  Receipt,
  DollarSign,
  Calendar,
  TrendingUp,
  MapPin,
} from "lucide-react";
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
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { leaseChargeApiService } from "@/services/leasing_tenants/leasechargeapi";
import { LeaseChargeForm } from "@/components/LeaseChargeForm";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { Pagination } from "@/components/Pagination";
import { PageHeader } from "@/components/PageHeader";

type ChargeCode =
  | "RENT"
  | "CAM"
  | "ELEC"
  | "WATER"
  | "PARK"
  | "PENALTY"
  | "MAINTENANCE"
  | string;

interface LeaseCharge {
  id: string;
  lease_id: string;
  charge_code_id: string;
  charge_code: ChargeCode;
  period_start: string; // ISO date
  period_end: string; // ISO date
  amount: number;
  tax_pct: number;
  lease_start?: string;
  lease_end?: string;
  rent_amount?: number;
  period_days?: number;
  tax_amount?: number;
  total_amount?: number;
  metadata?: any;
  created_at?: string;
  tenant_name: string;
  site_name: string;
  space_name: string;
  tax_code_id?: string;
  payer_type?: string;
}

const monthsFull = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface LeaseChargeOverview {
  total_charges: number;
  tax_amount: number;
  this_month: number;
  avg_charge: number;
}

export default function LeaseCharges() {
  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChargeCode, setSelectedChargeCode] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [leaseCharges, setLeaseCharges] = useState<LeaseCharge[]>([]);
  const [chargeCodeList, setChargeCodeList] = useState([]);
  const { user, handleLogout } = useAuth();
  const [months, setMonths] = useState<{ id: string; name: string }[]>([]);
  // form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedCharge, setSelectedCharge] = useState<any | undefined>();

  const [leaseChargeOverview, setLeaseChargeOverview] =
    useState<LeaseChargeOverview>({
      total_charges: 0,
      tax_amount: 0,
      this_month: 0,
      avg_charge: 0,
    });

  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(6); // items per page
  const [totalItems, setTotalItems] = useState(0);
  const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  const resource = "lease_charges"; // must match resource name from backend policies

  useSkipFirstEffect(() => {
    loadLeaseCharges();
    loadLeaseChargeOverView();
  }, [page]);

  useEffect(() => {
    updateLeaseChargePage();
  }, [searchTerm, selectedMonth, selectedChargeCode]);

  useEffect(() => {
    loadLeaseChargeLookup();
  }, []);

  useEffect(() => {
    loadLeaseMonthLookup();
  }, []);

  const updateLeaseChargePage = () => {
    if (page === 1) {
      loadLeaseCharges();
      loadLeaseChargeOverView();
    } else {
      setPage(1); // triggers the page effect
    }
  };

  const loadLeaseChargeLookup = async () => {
    const lookup = await leaseChargeApiService.getLeaseChargeLookup();
    if (lookup.success) setChargeCodeList(lookup.data || []);
  };

  const loadLeaseMonthLookup = async () => {
    const lookup = await leaseChargeApiService.getLeaseMonthLookup();
    if (lookup.success) setMonths(lookup.data || []); // instead of setSelectedMonth
  };

  const loadLeaseChargeOverView = async () => {
    const response = await leaseChargeApiService.getLeaseChargeOverview();
    if (response.success) setLeaseChargeOverview(response.data || {});
  };

  const loadLeaseCharges = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedChargeCode) params.append("charge_code", selectedChargeCode);
    if (selectedMonth) params.append("month", selectedMonth);

    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await leaseChargeApiService.getLeaseCharges(params);
    });

    if (response?.success) {
      setLeaseCharges(response.data?.items || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const chargesByType = leaseCharges.reduce(
    (acc: Record<string, number>, c) => {
      const amount = Number(c.amount) || 0; // ensure numeric
      acc[c.charge_code] = (acc[c.charge_code] || 0) + amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // helpers
  const getChargeCodeColor = (code: string) => {
    code = code.toUpperCase();
    switch (code) {
      case "RENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CAM":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
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
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  const getChargeCodeName = (code: string) => {
    code = code.toUpperCase();
    switch (code) {
      case "RENT":
        return "Monthly Rent";
      case "CAM":
        return "Common Area Maintenance";
      case "ELEC":
        return "Electricity";
      case "WATER":
        return "Water";
      case "PARK":
        return "Parking";
      case "PENALTY":
        return "Penalty";
      case "MAINTENANCE":
        return "Maintenance";
      default:
        return code;
    }
  };

  // form open handlers
  const handleCreate = () => {
    setSelectedCharge(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };
  const handleEdit = (charge: LeaseCharge) => {
    setSelectedCharge({
      id: charge.id,
      lease_id: charge.lease_id,
      charge_code_id: charge.charge_code_id,
      period_start: charge.period_start?.slice(0, 10),
      period_end: charge.period_end?.slice(0, 10),
      amount: charge.amount,
      tax_pct: charge.tax_pct,
      tax_code_id: charge.tax_code_id, // ✅ Add this
      payer_type: charge.payer_type, // ✅ Add this
    });

    setFormMode("edit");
    setIsFormOpen(true);
  };
  const handleView = (charge: LeaseCharge) => {
    setSelectedCharge({
      id: charge.id,
      lease_id: charge.lease_id,
      charge_code: charge.charge_code,
      period_start: charge.period_start?.slice(0, 10),
      period_end: charge.period_end?.slice(0, 10),
      amount: charge.amount,
      tax_pct: charge.tax_pct,
      tax_code_id: charge.tax_code_id, // ✅ Add this
      payer_type: charge.payer_type, // ✅ Add this
    });
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleSave = async (data: Partial<LeaseCharge>) => {
    let response;
    if (formMode === "create") {
      response = await leaseChargeApiService.addLeaseCharge(data);

      if (response.success) updateLeaseChargePage();
    } else if (formMode === "edit" && selectedCharge) {
      const updatedLeaseCharge = {
        ...selectedCharge,
        ...data,
        updated_at: new Date().toISOString(),
      };
      response = await leaseChargeApiService.updateLeaseCharge(
        updatedLeaseCharge
      );

      if (response.success) {
        // Update the edited lease charge in local state
        setLeaseCharges((prev) =>
          prev.map((lc) =>
            lc.id === updatedLeaseCharge.id ? response.data : lc
          )
        );
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `Lease Charge ${data.charge_code} has been ${formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  // delete
  const handleDelete = async () => {
    if (deleteId) {
      const response = await leaseChargeApiService.deleteLeaseCharge(deleteId);
      if (response.success) {
        const authResponse = response.data;
        if (authResponse?.success) {
          // Success - refresh data
          updateLeaseChargePage();
          setDeleteId(null);
          toast.success("The lease charge has been removed successfully.");
        } else {
          // Show error popup from backend
          toast.error(
            `Cannot Delete Lease Charge\n${authResponse?.message || "Unknown error"
            }`,
            {
              style: { whiteSpace: "pre-line" },
            }
          );
        }
      }
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Dashboard cards (org-wide from backend) */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Charges (All)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(leaseChargeOverview.total_charges)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across entire org
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tax Amount (All)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(leaseChargeOverview.tax_amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total tax collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month (All)
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaseChargeOverview.this_month}
            </div>
            <p className="text-xs text-muted-foreground">
              Charges generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Charge (All)
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(leaseChargeOverview.avg_charge)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per charge
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charges by Type summary (current list) */}
      {Object.keys(chargesByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Charges by Type</CardTitle>
            <CardDescription>
              Breakdown for the current list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(chargesByType).map(([code, amount]) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <Badge className={getChargeCodeColor(code)}>
                      {code.toLocaleUpperCase()}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getChargeCodeName(code)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {leaseChargeOverview.total_charges
                        ? (
                          (amount / leaseChargeOverview.total_charges) *
                          100
                        ).toFixed(1)
                        : "0.0"}
                      %
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters + actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search charges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type */}
          {/* Charge Code Select */}
          <Select
            value={selectedChargeCode}
            onValueChange={setSelectedChargeCode}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {chargeCodeList.map((m: { id: string; name: string }) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month (full name; service converts to 1..12) */}
          {/* Month Select */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map((m: { id: string; name: string }) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
          {canWrite(resource) && (
            <Button size="sm" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Charge
            </Button>
          )}
        </div>
      </div>

      <ContentContainer>
        <LoaderOverlay />
        {/* List */}
        <div className="grid gap-6">
          {leaseCharges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No charges found
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  No charges match your current filters. Try adjusting
                  your search criteria.
                </p>
                {canWrite(resource) && (
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Charge
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            leaseCharges.map((charge) => {
              const amount = Number(charge.amount) || 0;
              const taxPct = Number(charge.tax_pct) || 0;
              const taxAmount = (amount * taxPct) / 100;
              const totalAmount = Number(charge.total_amount) || 0;

              return (
                <Card
                  key={charge.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 mb-1">
                          <Badge
                            className={getChargeCodeColor(
                              charge.charge_code
                            )}
                          >
                            {charge.charge_code.toLocaleUpperCase()}
                          </Badge>
                          {charge.tenant_name}
                        </CardTitle>
                        <CardDescription className="space-y-1">
                          <div>
                            Period -{" "}
                            {new Date(
                              charge.period_start
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              charge.period_end
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {charge.space_name} • {charge.site_name}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(totalAmount)}
                          </div>
                          {charge.tax_pct > 0 && (
                            <div className="text-xs text-muted-foreground">
                              +{charge.tax_pct}% tax
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleView(charge);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canWrite(resource) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(charge)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete(resource) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(charge.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Base Amount
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(charge.amount)}
                        </div>
                      </div>

                      {charge.tax_pct > 0 && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Tax ({charge.tax_pct}%)
                          </div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(taxAmount)}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Period
                        </div>
                        <div className="text-sm">
                          {Math.ceil(
                            (new Date(charge.period_end).getTime() -
                              new Date(charge.period_start).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </div>
                      </div>
                    </div>

                    {charge.metadata && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">
                          Details
                        </div>
                        {charge.metadata?.description && (
                          <div className="text-sm text-muted-foreground mb-1">
                            {charge.metadata.description}
                          </div>
                        )}
                        {charge.metadata?.units &&
                          charge.metadata?.rate && (
                            <div className="text-sm text-muted-foreground">
                              {charge.metadata.units} units × ₹
                              {charge.metadata.rate} per unit
                            </div>
                          )}
                      </div>
                    )}

                    {charge.created_at && (
                      <div className="mt-4 text-xs text-muted-foreground">
                        Generated on{" "}
                        {new Date(charge.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {leaseCharges.length > 0 && (
          <div className="mt-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          </div>
        )}
      </ContentContainer>
      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Charge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this charge? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create / Edit form */}
      <LeaseChargeForm
        charge={selectedCharge}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        mode={formMode}
      />
    </div>
  );
}
