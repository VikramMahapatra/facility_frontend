import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, FileText, Calculator, TrendingUp, AlertCircle, Download, Eye } from "lucide-react";
import { mockTaxCodes, type TaxCode } from "@/data/mockFinancialsData";

export default function TaxManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");

  const filteredTaxCodes = mockTaxCodes.filter(taxCode => {
    const matchesSearch = taxCode.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJurisdiction = jurisdictionFilter === "all" || taxCode.jurisdiction === jurisdictionFilter;
    
    return matchesSearch && matchesJurisdiction;
  });

  // Mock tax report data
  const taxReportData = [
    {
      month: "2024-01",
      totalSales: 605000,
      gst18: 97200,
      gst12: 8640,
      gst5: 2400,
      totalTax: 108240,
      filed: true
    },
    {
      month: "2024-02",
      totalSales: 643000,
      gst18: 115740,
      gst12: 9216,
      gst5: 2560,
      totalTax: 127516,
      filed: true
    },
    {
      month: "2024-03",
      totalSales: 652000,
      gst18: 117360,
      gst12: 9360,
      gst5: 2600,
      totalTax: 129320,
      filed: false
    }
  ];

  const totalTaxCollected = taxReportData.reduce((sum, report) => sum + report.totalTax, 0);
  const avgTaxRate = ((totalTaxCollected / taxReportData.reduce((sum, report) => sum + report.totalSales, 0)) * 100).toFixed(2);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Management</h1>
          <p className="text-muted-foreground">Manage tax codes, rates and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Tax Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Code
          </Button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tax Codes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTaxCodes.length}</div>
            <p className="text-xs text-muted-foreground">Configured codes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Collected</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalTaxCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 3 months</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Tax Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTaxRate}%</div>
            <p className="text-xs text-muted-foreground">Effective rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">1</div>
            <p className="text-xs text-muted-foreground">Due for filing</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Codes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Codes Configuration</CardTitle>
          <CardDescription>Manage tax rates and codes for different jurisdictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tax codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jurisdictions</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="US">United States</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tax Codes Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Code</TableHead>
                <TableHead>Rate (%)</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTaxCodes.map((taxCode) => (
                <TableRow key={taxCode.id}>
                  <TableCell className="font-medium">{taxCode.code}</TableCell>
                  <TableCell>{taxCode.rate}%</TableCell>
                  <TableCell>
                    <Badge variant="outline">{taxCode.jurisdiction}</Badge>
                  </TableCell>
                  <TableCell>
                    {taxCode.code === 'GST_18' && 'Goods and Services Tax - 18%'}
                    {taxCode.code === 'GST_12' && 'Goods and Services Tax - 12%'}
                    {taxCode.code === 'GST_5' && 'Goods and Services Tax - 5%'}
                    {taxCode.code === 'CGST_SGST' && 'Central + State GST - 9% each'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Returns & Reports</CardTitle>
          <CardDescription>Monthly tax filings and compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>GST 18%</TableHead>
                <TableHead>GST 12%</TableHead>
                <TableHead>GST 5%</TableHead>
                <TableHead>Total Tax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxReportData.map((report, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{report.month}</TableCell>
                  <TableCell>₹{report.totalSales.toLocaleString()}</TableCell>
                  <TableCell>₹{report.gst18.toLocaleString()}</TableCell>
                  <TableCell>₹{report.gst12.toLocaleString()}</TableCell>
                  <TableCell>₹{report.gst5.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">₹{report.totalTax.toLocaleString()}</TableCell>
                  <TableCell>
                    {report.filed ? (
                      <Badge variant="default">Filed</Badge>
                    ) : (
                      <Badge variant="destructive">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {!report.filed && (
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Calendar & Deadlines</CardTitle>
          <CardDescription>Important tax filing dates and reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Monthly GST Return</h4>
                <Badge variant="destructive">Due Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">GSTR-1 for March 2024</p>
              <p className="text-sm font-medium text-red-600">Due: April 11, 2024</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">TDS Return</h4>
                <Badge variant="secondary">Upcoming</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Quarterly TDS filing</p>
              <p className="text-sm font-medium">Due: April 30, 2024</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Income Tax Advance</h4>
                <Badge variant="outline">Scheduled</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Quarterly advance tax</p>
              <p className="text-sm font-medium">Due: June 15, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}