import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Edit, Play, FileText, CheckCircle, Calendar, TrendingUp } from "lucide-react";
import { mockServiceRequests, mockPMTemplates } from "@/data/mockServiceRequestData";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";

export default function PreventiveMaintenance() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Preventive Maintenance</h1>
                  <p className="text-sm text-muted-foreground">Schedule and manage maintenance templates</p>
                </div>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search PM templates..."
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Asset Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="elevators">Elevators</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">20</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94%</div>
                  </CardContent>
                </Card>
              </div>

              {/* PM Templates Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Preventive Maintenance Templates</CardTitle>
                  <CardDescription>
                    Schedule and manage maintenance templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Asset Category</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead>Checklist Items</TableHead>
                        <TableHead>SLA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPMTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground">#{template.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{template.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {template.frequency}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(template.next_due).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="text-center">{template.checklist_items}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Response: {template.sla_response}h</div>
                              <div className="text-muted-foreground">Resolve: {template.sla_resolve}h</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                              {template.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Play className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}