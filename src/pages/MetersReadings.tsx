import { useState } from "react";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Zap, Droplets, Flame, Users, Gauge } from "lucide-react";
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
import { mockMeters, mockMeterReadings, type Meter, type MeterReading } from "@/data/mockEnergyData";

const getMeterIcon = (kind: string) => {
  switch (kind) {
    case 'electricity': return <Zap className="h-4 w-4 text-yellow-500" />;
    case 'water': return <Droplets className="h-4 w-4 text-blue-500" />;
    case 'gas': return <Flame className="h-4 w-4 text-orange-500" />;
    case 'people_counter': return <Users className="h-4 w-4 text-purple-500" />;
    default: return <Gauge className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800", 
    maintenance: "bg-yellow-100 text-yellow-800"
  };
  return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
};

export default function MetersReadings() {
  const [activeTab, setActiveTab] = useState<'meters' | 'readings'>('meters');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [isCreateMeterOpen, setIsCreateMeterOpen] = useState(false);
  const [isCreateReadingOpen, setIsCreateReadingOpen] = useState(false);

  const meterForm = useForm<Partial<Meter>>({
    defaultValues: {
      kind: 'electricity',
      unit: 'kWh',
      multiplier: 1,
      status: 'active'
    }
  });

  const readingForm = useForm<Partial<MeterReading>>({
    defaultValues: {
      source: 'manual'
    }
  });

  const filteredMeters = mockMeters.filter(meter =>
    meter.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.kind.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReadings = mockMeterReadings.filter(reading =>
    reading.meterCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reading.meterKind.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onCreateMeter = (data: Partial<Meter>) => {
    console.log('Creating meter:', data);
    setIsCreateMeterOpen(false);
    meterForm.reset();
  };

  const onCreateReading = (data: Partial<MeterReading>) => {
    console.log('Creating reading:', data);
    setIsCreateReadingOpen(false);
    readingForm.reset();
  };

  const stats = [
    { title: "Total Meters", value: mockMeters.length, icon: <Gauge className="h-4 w-4" /> },
    { title: "Active Meters", value: mockMeters.filter(m => m.status === 'active').length, icon: <Zap className="h-4 w-4 text-green-500" /> },
    { title: "Latest Readings", value: mockMeterReadings.length, icon: <Eye className="h-4 w-4" /> },
    { title: "IoT Connected", value: mockMeterReadings.filter(r => r.source === 'iot').length, icon: <Users className="h-4 w-4 text-blue-500" /> }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Meters & Readings</h1>
              <p className="text-sm text-muted-foreground">Monitor and manage utility meters and consumption data</p>
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
                    <CardTitle>Energy & Utility Management</CardTitle>
                    <CardDescription>Manage meters and track consumption readings</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === 'meters' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('meters')}
                    >
                      Meters
                    </Button>
                    <Button
                      variant={activeTab === 'readings' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('readings')}
                    >
                      Readings
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Actions */}
                <div className="flex items-center justify-between space-y-2 mb-6">
                  <div className="flex flex-1 items-center space-x-2 max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                    {activeTab === 'meters' ? (
                      <Dialog open={isCreateMeterOpen} onOpenChange={setIsCreateMeterOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Meter
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Create New Meter</DialogTitle>
                            <DialogDescription>Add a new utility meter to the system</DialogDescription>
                          </DialogHeader>
                          <Form {...meterForm}>
                            <form onSubmit={meterForm.handleSubmit(onCreateMeter)} className="space-y-4">
                              <FormField
                                control={meterForm.control}
                                name="code"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Meter Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="ELE-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={meterForm.control}
                                name="kind"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Meter Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="electricity">Electricity</SelectItem>
                                        <SelectItem value="water">Water</SelectItem>
                                        <SelectItem value="gas">Gas</SelectItem>
                                        <SelectItem value="btuh">BTUH</SelectItem>
                                        <SelectItem value="people_counter">People Counter</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={meterForm.control}
                                name="unit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Unit</FormLabel>
                                    <FormControl>
                                      <Input placeholder="kWh, m³, L, CFM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={meterForm.control}
                                name="multiplier"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Multiplier</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.0001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateMeterOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit">Create Meter</Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Dialog open={isCreateReadingOpen} onOpenChange={setIsCreateReadingOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Reading
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Record New Reading</DialogTitle>
                            <DialogDescription>Add a new meter reading</DialogDescription>
                          </DialogHeader>
                          <Form {...readingForm}>
                            <form onSubmit={readingForm.handleSubmit(onCreateReading)} className="space-y-4">
                              <FormField
                                control={readingForm.control}
                                name="meterId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Meter</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select meter" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {mockMeters.map((meter) => (
                                          <SelectItem key={meter.id} value={meter.id}>
                                            {meter.code} - {meter.siteName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={readingForm.control}
                                name="reading"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reading Value</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={readingForm.control}
                                name="source"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Source</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="manual">Manual</SelectItem>
                                        <SelectItem value="iot">IoT Device</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateReadingOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit">Record Reading</Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Content Tables */}
                {activeTab === 'meters' ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Last Reading</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMeters.map((meter) => (
                        <TableRow key={meter.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMeterIcon(meter.kind)}
                              <span className="capitalize">{meter.kind}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{meter.code}</TableCell>
                          <TableCell>{meter.siteName}</TableCell>
                          <TableCell>{meter.spaceName || meter.assetName || 'General'}</TableCell>
                          <TableCell>{meter.unit}</TableCell>
                          <TableCell>
                            {meter.lastReading ? (
                              <div>
                                <div className="font-medium">{meter.lastReading} {meter.unit}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(meter.lastReadingDate!).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              'No readings'
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(meter.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedMeter(meter)}>
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
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meter</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reading</TableHead>
                        <TableHead>Delta</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReadings.map((reading) => (
                        <TableRow key={reading.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{reading.meterCode}</div>
                              <div className="text-sm text-muted-foreground capitalize">{reading.meterKind}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMeterIcon(reading.meterKind)}
                              <span className="capitalize">{reading.meterKind}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{reading.reading} {reading.unit}</span>
                          </TableCell>
                          <TableCell>
                            {reading.delta ? (
                              <span className="text-blue-600">+{reading.delta} {reading.unit}</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={reading.source === 'iot' ? 'default' : 'secondary'}>
                              {reading.source}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(reading.ts).toLocaleDateString()}
                              <div className="text-xs text-muted-foreground">
                                {new Date(reading.ts).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}