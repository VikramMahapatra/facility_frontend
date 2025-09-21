import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Edit, Play, Pause, CheckCircle, Clock, AlertTriangle, User, Calendar, Wrench } from "lucide-react";
import { mockWorkOrders, type WorkOrder } from "@/data/mockMaintenanceData";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";

export default function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");

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
                  <h1 className="text-2xl font-bold">Work Orders</h1>
                  <p className="text-sm text-muted-foreground">Manage maintenance tasks and work orders</p>
                </div>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Work Order
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
                    placeholder="Search work orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockWorkOrders.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockWorkOrders.filter(wo => wo.status === 'open').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockWorkOrders.filter(wo => wo.status === 'in_progress').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockWorkOrders.filter(wo => new Date(wo.dueAt) < new Date() && wo.status !== 'completed').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Work Orders Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Orders</CardTitle>
                  <CardDescription>
                    Manage maintenance tasks and assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Work Order</TableHead>
                        <TableHead>Asset/Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockWorkOrders.slice(0, 10).map((workOrder) => (
                        <TableRow key={workOrder.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{workOrder.title}</div>
                              <div className="text-sm text-muted-foreground">#{workOrder.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{workOrder.assetName}</div>
                              <div className="text-sm text-muted-foreground">{workOrder.spaceName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{workOrder.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                workOrder.priority === 'critical' ? 'destructive' :
                                workOrder.priority === 'high' ? 'destructive' :
                                workOrder.priority === 'medium' ? 'default' : 'secondary'
                              }
                            >
                              {workOrder.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {workOrder.assignedTo}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(workOrder.dueAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                workOrder.status === 'completed' ? 'default' :
                                workOrder.status === 'in_progress' ? 'secondary' : 'outline'
                              }
                            >
                              {workOrder.status.replace('_', ' ')}
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
                              {workOrder.status === 'open' && (
                                <Button variant="ghost" size="sm">
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              {workOrder.status === 'in_progress' && (
                                <Button variant="ghost" size="sm">
                                  <CheckCircle className="w-4 h-4" />
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
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}