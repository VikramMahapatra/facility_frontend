import { useState } from "react";
import { Plus, Search, Filter, Download, Eye, Edit, Receipt, DollarSign, CheckCircle, Clock } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockFolios, mockFolioCharges, mockFolioPayments, type Folio } from "@/data/mockHospitalityData";

const getStatusBadge = (status: string) => {
  const variants = {
    open: "bg-blue-100 text-blue-800",
    settled: "bg-green-100 text-green-800",
    refunded: "bg-orange-100 text-orange-800"
  };
  return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
};

const getPayerBadge = (payerKind: string) => {
  const variants = {
    guest: "bg-purple-100 text-purple-800",
    company: "bg-blue-100 text-blue-800",
    agent: "bg-orange-100 text-orange-800"
  };
  return <Badge className={variants[payerKind as keyof typeof variants]}>{payerKind}</Badge>;
};

export default function Folios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredFolios = mockFolios.filter(folio => {
    const matchesSearch = folio.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         folio.folioNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || folio.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalFolios = mockFolios.length;
  const openFolios = mockFolios.filter(f => f.status === 'open').length;
  const totalCharges = mockFolios.reduce((sum, f) => sum + f.totalCharges, 0);
  const totalPayments = mockFolios.reduce((sum, f) => sum + f.totalPayments, 0);
  const outstandingBalance = totalCharges - totalPayments;

  const stats = [
    { title: "Total Folios", value: totalFolios, icon: <Receipt className="h-4 w-4" /> },
    { title: "Open Folios", value: openFolios, icon: <Clock className="h-4 w-4 text-blue-500" /> },
    { title: "Total Charges", value: `₹${totalCharges.toLocaleString()}`, icon: <DollarSign className="h-4 w-4" /> },
    { title: "Outstanding", value: `₹${outstandingBalance.toLocaleString()}`, icon: <CheckCircle className="h-4 w-4 text-orange-500" /> }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Folio Management</h1>
              <p className="text-sm text-muted-foreground">Manage guest billing and payment records</p>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Guest Folios & Billing</CardTitle>
                    <CardDescription>Track charges, payments, and outstanding balances</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Actions */}
                <div className="flex items-center justify-between space-y-2 mb-6">
                  <div className="flex flex-1 items-center space-x-4 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by folio number or guest..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="settled">Settled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Folio
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio No.</TableHead>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Payer Type</TableHead>
                      <TableHead>Total Charges</TableHead>
                      <TableHead>Payments</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFolios.map((folio) => (
                      <TableRow key={folio.id}>
                        <TableCell>
                          <div className="font-medium">{folio.folioNo}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(folio.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{folio.guestName}</div>
                        </TableCell>
                        <TableCell>
                          {getPayerBadge(folio.payerKind)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹{folio.totalCharges.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">₹{folio.totalPayments.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${folio.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            ₹{folio.balance.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(folio.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Add Payment">
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Charges and Payments Summary */}
                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Charges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockFolioCharges.map((charge) => (
                          <div key={charge.id} className="flex justify-between items-start border-b pb-2">
                            <div>
                              <div className="font-medium text-sm">{charge.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {charge.code} • {new Date(charge.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm font-medium">₹{charge.amount.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockFolioPayments.map((payment) => (
                          <div key={payment.id} className="flex justify-between items-start border-b pb-2">
                            <div>
                              <div className="font-medium text-sm capitalize">{payment.method}</div>
                              <div className="text-xs text-muted-foreground">
                                {payment.refNo} • {new Date(payment.paidAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-green-600">₹{payment.amount.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
