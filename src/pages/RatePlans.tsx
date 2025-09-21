import { useState } from "react";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, CreditCard, Percent, Settings } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { mockRatePlans, type RatePlan } from "@/data/mockHospitalityData";

const getMealPlanBadge = (mealPlan?: string) => {
  if (!mealPlan) return null;
  const variants = {
    EP: "bg-gray-100 text-gray-800",
    CP: "bg-blue-100 text-blue-800",
    MAP: "bg-green-100 text-green-800",
    AP: "bg-purple-100 text-purple-800"
  };
  const names = {
    EP: "European Plan",
    CP: "Continental Plan", 
    MAP: "Modified American Plan",
    AP: "American Plan"
  };
  return (
    <Badge className={variants[mealPlan as keyof typeof variants]} title={names[mealPlan as keyof typeof names]}>
      {mealPlan}
    </Badge>
  );
};

const getStatusBadge = (status: string) => {
  const variants = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800"
  };
  return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
};

export default function RatePlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const ratePlanForm = useForm<Partial<RatePlan>>({
    defaultValues: {
      status: 'active',
      currency: 'INR',
      mealPlan: 'EP'
    }
  });

  const filteredRatePlans = mockRatePlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || plan.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const onCreateRatePlan = (data: Partial<RatePlan>) => {
    console.log('Creating rate plan:', data);
    setIsCreateOpen(false);
    ratePlanForm.reset();
  };

  const totalPlans = mockRatePlans.length;
  const activePlans = mockRatePlans.filter(p => p.status === 'active').length;
  const avgBaseRate = mockRatePlans.reduce((sum, p) => sum + p.baseRate, 0) / totalPlans;
  const corporatePlans = mockRatePlans.filter(p => p.name.toLowerCase().includes('corporate')).length;

  const stats = [
    { title: "Total Rate Plans", value: totalPlans, icon: <CreditCard className="h-4 w-4" /> },
    { title: "Active Plans", value: activePlans, icon: <Settings className="h-4 w-4 text-green-500" /> },
    { title: "Avg Base Rate", value: `₹${Math.round(avgBaseRate).toLocaleString()}`, icon: <Percent className="h-4 w-4" /> },
    { title: "Corporate Plans", value: corporatePlans, icon: <CreditCard className="h-4 w-4 text-blue-500" /> }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Rate Plans Management</h1>
              <p className="text-sm text-muted-foreground">Configure room rates, meal plans, and pricing policies</p>
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
                    <CardTitle>Rate Plans & Pricing</CardTitle>
                    <CardDescription>Manage room rates, meal plans, and booking policies</CardDescription>
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
                        placeholder="Search rate plans or properties..."
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                          New Rate Plan
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Create New Rate Plan</DialogTitle>
                          <DialogDescription>Configure a new pricing plan for your property</DialogDescription>
                        </DialogHeader>
                        <Form {...ratePlanForm}>
                          <form onSubmit={ratePlanForm.handleSubmit(onCreateRatePlan)} className="space-y-4">
                            <FormField
                              control={ratePlanForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rate Plan Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., BAR - Best Available Rate" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={ratePlanForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Brief description of this rate plan..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={ratePlanForm.control}
                                name="baseRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Base Rate (₹)</FormLabel>
                                    <FormControl>
                                      <Input type="number" min="0" step="100" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={ratePlanForm.control}
                                name="mealPlan"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Meal Plan</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select meal plan" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="EP">EP - European Plan (Room Only)</SelectItem>
                                        <SelectItem value="CP">CP - Continental Plan (Room + Breakfast)</SelectItem>
                                        <SelectItem value="MAP">MAP - Modified American Plan (Room + 2 Meals)</SelectItem>
                                        <SelectItem value="AP">AP - American Plan (Room + 3 Meals)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={ratePlanForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Create Rate Plan</Button>
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
                      <TableHead>Rate Plan</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Meal Plan</TableHead>
                      <TableHead>Base Rate</TableHead>
                      <TableHead>Policies</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRatePlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">{plan.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{plan.siteName}</div>
                        </TableCell>
                        <TableCell>
                          {getMealPlanBadge(plan.mealPlan)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹{plan.baseRate.toLocaleString()}</span>
                          <div className="text-xs text-muted-foreground">per night</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {plan.policies && (
                              <>
                                <div>Cancel: {plan.policies.cancellation}</div>
                                <div className="text-muted-foreground">No-show: {plan.policies.noShow}</div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(plan.status)}</TableCell>
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