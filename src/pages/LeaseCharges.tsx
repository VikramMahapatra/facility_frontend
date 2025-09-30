// app/(your-path)/LeaseCharges.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Plus, Search, Filter, Edit, Eye, Trash2, Receipt, DollarSign, Calendar, TrendingUp } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { leaseChargeApiService } from "@/services/Leasing_Tenants/leasechargeapi";
import { LeaseChargeForm } from "@/components/LeaseChargeForm";

type ChargeCode = "RENT" | "CAM" | "ELEC" | "WATER" | "PARK" | "PENALTY" | "MAINTENANCE" | string;

interface LeaseCharge {
  id: string;
  lease_id: string;
  charge_code: ChargeCode;
  period_start: string; // ISO date
  period_end: string;   // ISO date
  amount: number;
  tax_pct: number;
  lease_start?: string | null;
  lease_end?: string | null;
  rent_amount?: number | null;
  period_days?: number | null;
  tax_amount?: number | null;
  metadata?: any;
  created_at?: string;
}

const monthsFull = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function LeaseCharges() {
  const { toast } = useToast();

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChargeCode, setSelectedChargeCode] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // data
  const [items, setItems] = useState<LeaseCharge[]>([]);
  const [loading, setLoading] = useState(false);

  // dashboard cards (from /lease-charges/dashboard)
  const [totalChargesCard, setTotalChargesCard] = useState(0);
  const [taxAmountCard, setTaxAmountCard] = useState(0);
  const [thisMonthCard, setThisMonthCard] = useState(0);
  const [avgChargeCard, setAvgChargeCard] = useState(0);

  // delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedCharge, setSelectedCharge] = useState<any | undefined>();
  const [reloadTick, setReloadTick] = useState(0); // bump to refetch list

  // load dashboard once
  useEffect(() => {
    (async () => {
      try {
        const d = await leaseChargeApiService.getDashboard();
        setTotalChargesCard(d.total_charges ?? 0);
        setTaxAmountCard(d.tax_amount ?? 0);
        setThisMonthCard(d.this_month ?? 0);
        setAvgChargeCard(d.avg_charge ?? 0);
      } catch {
        // no-op
      }
    })();
  }, []);

  // load list on filters / reloadTick
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const byType = selectedChargeCode !== "all";
        const byMonth = selectedMonth !== "all";

        if (byType && byMonth) {
          const r = await leaseChargeApiService.getByType([selectedChargeCode]);
          const idx = monthsFull.findIndex((m) => m === selectedMonth); // 0..11
          const filtered = (r.items || []).filter(
            (c: LeaseCharge) => new Date(c.period_start).getMonth() === idx
          );
          setItems(filtered);
        } else if (byType) {
          const r = await leaseChargeApiService.getByType([selectedChargeCode]);
          setItems(r.items || []);
        } else if (byMonth) {
          const i = monthsFull.findIndex((m) => m === selectedMonth);
          const shortName = monthsShort[i]; // "Jan" etc.
          const r = await leaseChargeApiService.getByMonth(shortName);
          setItems(r.items || []);
        } else {
          // none -> all
          const r = await leaseChargeApiService.getByMonth();
          setItems(r.items || []);
        }
      } catch {
        setItems([]);
        toast({ title: "Failed to load lease charges", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedChargeCode, selectedMonth, reloadTick, toast]);

  // search (client side)
  const filteredCharges = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return items;
    return items.filter((charge) => {
      const idHit = charge.id?.toLowerCase().includes(s);
      const leaseHit = charge.lease_id?.toLowerCase().includes(s);
      return idHit || leaseHit;
    });
  }, [items, searchTerm]);

  // stats (from current filtered list)
  const listTotalCharges = filteredCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const listTotalTax = filteredCharges.reduce((sum, c) => sum + ((c.amount || 0) * (c.tax_pct || 0) / 100), 0);
  const uniqueLeases = new Set(filteredCharges.map((c) => c.lease_id)).size;
  const thisMonthCharges = filteredCharges.filter((c) => {
    const d = new Date(c.period_start);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const chargesByType = filteredCharges.reduce((acc: Record<string, number>, c) => {
    acc[c.charge_code] = (acc[c.charge_code] || 0) + (c.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  // helpers
  const getChargeCodeColor = (code: string) => {
    switch (code) {
      case "RENT": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CAM": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ELEC": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "WATER": return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
      case "PARK": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "PENALTY": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "MAINTENANCE": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
  const getChargeCodeName = (code: string) => {
    switch (code) {
      case "RENT": return "Monthly Rent";
      case "CAM": return "Common Area Maintenance";
      case "ELEC": return "Electricity";
      case "WATER": return "Water";
      case "PARK": return "Parking";
      case "PENALTY": return "Penalty";
      case "MAINTENANCE": return "Maintenance";
      default: return code;
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
      charge_code: charge.charge_code,
      period_start: charge.period_start?.slice(0, 10),
      period_end: charge.period_end?.slice(0, 10),
      amount: charge.amount,
      tax_pct: charge.tax_pct,
    });
    setFormMode("edit");
    setIsFormOpen(true);
  };

  // delete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await leaseChargeApiService.delete(deleteId);
      toast({ title: "Charge deleted" });
      setReloadTick((t) => t + 1);
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Lease Charges</h1>
            </div>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {/* Dashboard cards (org-wide from backend) */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Charges (All)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalChargesCard)}</div>
                  <p className="text-xs text-muted-foreground">Across entire org</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tax Amount (All)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(taxAmountCard)}</div>
                  <p className="text-xs text-muted-foreground">Total tax collected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month (All)</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{thisMonthCard}</div>
                  <p className="text-xs text-muted-foreground">Charges generated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Charge (All)</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(avgChargeCard)}</div>
                  <p className="text-xs text-muted-foreground">Average per charge</p>
                </CardContent>
              </Card>
            </div>

            {/* Charges by Type summary (current list) */}
            {Object.keys(chargesByType).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Charges by Type</CardTitle>
                  <CardDescription>Breakdown for the current list</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {Object.entries(chargesByType).map(([code, amount]) => (
                      <div key={code} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <Badge className={getChargeCodeColor(code)}>{code}</Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getChargeCodeName(code)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(amount)}</div>
                          <div className="text-xs text-muted-foreground">
                            {listTotalCharges ? ((amount / listTotalCharges) * 100).toFixed(1) : "0.0"}%
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
                <Select value={selectedChargeCode} onValueChange={setSelectedChargeCode}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="RENT">Rent</SelectItem>
                    <SelectItem value="CAM">CAM</SelectItem>
                    <SelectItem value="ELEC">Electricity</SelectItem>
                    <SelectItem value="WATER">Water</SelectItem>
                    <SelectItem value="PARK">Parking</SelectItem>
                    <SelectItem value="PENALTY">Penalty</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>

                {/* Month (full name; service converts to 1..12) */}
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {monthsFull.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
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
                <Button size="sm" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Charge
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="grid gap-6">
              {loading ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground">Loading…</CardContent></Card>
              ) : filteredCharges.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No charges found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      No charges match your current filters. Try adjusting your search criteria.
                    </p>
                    <Button onClick={handleCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Charge
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredCharges.map((charge) => {
                  const taxAmount = (charge.amount || 0) * (charge.tax_pct || 0) / 100;
                  const totalAmount = (charge.amount || 0) + taxAmount;

                  return (
                    <Card key={charge.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Badge className={getChargeCodeColor(charge.charge_code)}>
                                {charge.charge_code}
                              </Badge>
                              {getChargeCodeName(charge.charge_code)}
                            </CardTitle>
                            <CardDescription>
                              Lease {charge.lease_id?.slice(-6)} •{" "}
                              {new Date(charge.period_start).toLocaleDateString()} -{" "}
                              {new Date(charge.period_end).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-lg font-bold">{formatCurrency(totalAmount)}</div>
                              {charge.tax_pct > 0 && (
                                <div className="text-xs text-muted-foreground">+{charge.tax_pct}% tax</div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => {/* optional: view modal */}}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(charge)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteId(charge.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Base Amount</div>
                            <div className="text-lg font-semibold">{formatCurrency(charge.amount)}</div>
                          </div>

                          {charge.tax_pct > 0 && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Tax ({charge.tax_pct}%)</div>
                              <div className="text-lg font-semibold">{formatCurrency(taxAmount)}</div>
                            </div>
                          )}

                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Period</div>
                            <div className="text-sm">
                              {Math.ceil(
                                (new Date(charge.period_end).getTime() - new Date(charge.period_start).getTime()) /
                                (1000 * 60 * 60 * 24)
                              )}{" "}
                              days
                            </div>
                          </div>
                        </div>

                        {charge.metadata && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium mb-2">Details</div>
                            {charge.metadata?.description && (
                              <div className="text-sm text-muted-foreground mb-1">{charge.metadata.description}</div>
                            )}
                            {charge.metadata?.units && charge.metadata?.rate && (
                              <div className="text-sm text-muted-foreground">
                                {charge.metadata.units} units × ₹{charge.metadata.rate} per unit
                              </div>
                            )}
                          </div>
                        )}

                        {charge.created_at && (
                          <div className="mt-4 text-xs text-muted-foreground">
                            Generated on {new Date(charge.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Charge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this charge? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>
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
        onSaved={() => setReloadTick((t) => t + 1)}
        mode={formMode}
      />
    </SidebarProvider>
  );
}
