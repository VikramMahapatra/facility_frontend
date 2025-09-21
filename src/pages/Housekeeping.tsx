import { useState } from "react";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Clock, MapPin, User, CheckCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { mockHousekeepingTasks, type HousekeepingTask } from "@/data/mockHospitalityData";

const getStatusBadge = (status: string) => {
  const variants = {
    dirty: "bg-red-100 text-red-800",
    cleaning: "bg-yellow-100 text-yellow-800",
    inspected: "bg-blue-100 text-blue-800",
    clean: "bg-green-100 text-green-800"
  };
  return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const variants = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };
  return <Badge className={variants[priority as keyof typeof variants]}>{priority}</Badge>;
};

export default function Housekeeping() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const taskForm = useForm<Partial<HousekeepingTask>>({
    defaultValues: {
      status: 'dirty',
      priority: 'medium',
      estimatedTime: 45
    }
  });

  const filteredTasks = mockHousekeepingTasks.filter(task => {
    const matchesSearch = task.spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.assignedToName && task.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const onCreateTask = (data: Partial<HousekeepingTask>) => {
    console.log('Creating housekeeping task:', data);
    setIsCreateOpen(false);
    taskForm.reset();
  };

  const totalTasks = mockHousekeepingTasks.length;
  const cleanRooms = mockHousekeepingTasks.filter(t => t.status === 'clean').length;
  const inProgress = mockHousekeepingTasks.filter(t => t.status === 'cleaning').length;
  const avgTime = mockHousekeepingTasks.reduce((sum, t) => sum + t.estimatedTime, 0) / totalTasks;

  const stats = [
    { title: "Total Tasks", value: totalTasks, icon: <MapPin className="h-4 w-4" /> },
    { title: "Clean Rooms", value: cleanRooms, icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
    { title: "In Progress", value: inProgress, icon: <Clock className="h-4 w-4 text-yellow-500" /> },
    { title: "Avg Time", value: `${Math.round(avgTime)}min`, icon: <Clock className="h-4 w-4 text-blue-500" /> }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Housekeeping Management</h1>
              <p className="text-sm text-muted-foreground">Manage room cleaning tasks and housekeeping schedules</p>
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
                    <CardTitle>Housekeeping Tasks</CardTitle>
                    <CardDescription>Track and manage room cleaning and maintenance tasks</CardDescription>
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
                        placeholder="Search by room, site, or staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="dirty">Dirty</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="inspected">Inspected</SelectItem>
                        <SelectItem value="clean">Clean</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          New Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Create Housekeeping Task</DialogTitle>
                          <DialogDescription>Schedule a new cleaning or maintenance task</DialogDescription>
                        </DialogHeader>
                        <Form {...taskForm}>
                          <form onSubmit={taskForm.handleSubmit(onCreateTask)} className="space-y-4">
                            <FormField
                              control={taskForm.control}
                              name="spaceId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Room/Space</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select room" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="room-101">Room 101 - Deluxe King</SelectItem>
                                      <SelectItem value="room-102">Room 102 - Executive Suite</SelectItem>
                                      <SelectItem value="room-103">Room 103 - Standard Twin</SelectItem>
                                      <SelectItem value="room-104">Room 104 - Deluxe King</SelectItem>
                                      <SelectItem value="room-201">Room 201 - Ocean View Suite</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="taskDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Task Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className="w-full pl-3 text-left font-normal"
                                        >
                                          {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarComponent
                                        mode="single"
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={taskForm.control}
                                name="priority"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={taskForm.control}
                                name="estimatedTime"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Est. Time (minutes)</FormLabel>
                                    <FormControl>
                                      <Input type="number" min="15" step="15" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={taskForm.control}
                              name="assignedTo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Assign To</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select staff member" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="staff-1">Sunita Devi</SelectItem>
                                      <SelectItem value="staff-2">Rajni Sharma</SelectItem>
                                      <SelectItem value="staff-3">Maya Patel</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Any special instructions or notes..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Create Task</Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room/Space</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.spaceName}</div>
                            <div className="text-sm text-muted-foreground">{task.notes}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{task.siteName}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>
                          {task.assignedToName ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{task.assignedToName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{task.estimatedTime}min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(task.taskDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}