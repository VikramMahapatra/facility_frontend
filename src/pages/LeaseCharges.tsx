import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { mockLeaseCharges, mockLeases, getLeaseById } from "@/data/mockLeasingData";
import { Plus, Search, Filter, Edit, Eye, Trash2, Receipt, DollarSign, Calendar, TrendingUp } from "lucide-react";

const LeaseCharges = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChargeCode, setSelectedChargeCode] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const filteredCharges = mockLeaseCharges.filter(charge => {
    const lease = getLeaseById(charge.lease_id);
    const matchesSearch = charge.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lease && lease.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesChargeCode = selectedChargeCode === "all" || charge.charge_code === selectedChargeCode;
    const chargeMonth = new Date(charge.period_start).getMonth();
    const matchesMonth = selectedMonth === "all" || chargeMonth === parseInt(selectedMonth);
    
    return matchesSearch && matchesChargeCode && matchesMonth;
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  // Calculate statistics
  const totalCharges = filteredCharges.reduce((sum, charge) => sum + charge.amount, 0);
  const totalTax = filteredCharges.reduce((sum, charge) => sum + (charge.amount * charge.tax_pct / 100), 0);
  const uniqueLeases = new Set(filteredCharges.map(charge => charge.lease_id)).size;
  const thisMonthCharges = filteredCharges.filter(charge => {
    const chargeDate = new Date(charge.period_start);
    const now = new Date();
    return chargeDate.getMonth() === now.getMonth() && chargeDate.getFullYear() === now.getFullYear();
  });

  const chargesByType = filteredCharges.reduce((acc, charge) => {
    acc[charge.charge_code] = (acc[charge.charge_code] || 0) + charge.amount;
    return acc;
  }, {} as Record<string, number>);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalCharges)}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {uniqueLeases} leases
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tax Amount</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalTax)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total tax collected
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{thisMonthCharges.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Charges generated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Charge</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredCharges.length > 0 ? formatCurrency(totalCharges / filteredCharges.length) : '₹0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average per charge
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charge Type Summary */}
            {Object.keys(chargesByType).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Charges by Type</CardTitle>
                  <CardDescription>Breakdown of charges by category</CardDescription>
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
                            {((amount / totalCharges) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters and Actions */}
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

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
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
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Charge
                </Button>
              </div>
            </div>

            {/* Charges Grid */}
            <div className="grid gap-6">
              {filteredCharges.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No charges found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      No charges match your current filters. Try adjusting your search criteria.
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Charge
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredCharges.map((charge) => {
                  const lease = getLeaseById(charge.lease_id);
                  const taxAmount = charge.amount * charge.tax_pct / 100;
                  const totalAmount = charge.amount + taxAmount;
                  
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
                              Lease {charge.lease_id.slice(-6)} • {new Date(charge.period_start).toLocaleDateString()} - {new Date(charge.period_end).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-lg font-bold">{formatCurrency(totalAmount)}</div>
                              {charge.tax_pct > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  +{charge.tax_pct}% tax
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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
                              {Math.ceil((new Date(charge.period_end).getTime() - new Date(charge.period_start).getTime()) / (1000 * 60 * 60 * 24))} days
                            </div>
                          </div>
                        </div>

                        {charge.metadata && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium mb-2">Details</div>
                            {charge.metadata.description && (
                              <div className="text-sm text-muted-foreground mb-1">
                                {charge.metadata.description}
                              </div>
                            )}
                            {charge.metadata.units && charge.metadata.rate && (
                              <div className="text-sm text-muted-foreground">
                                {charge.metadata.units} units × ₹{charge.metadata.rate} per unit
                              </div>
                            )}
                          </div>
                        )}

                        {lease && (
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
    </SidebarProvider>
  );
};

export default LeaseCharges;