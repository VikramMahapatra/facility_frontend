import { useState } from "react";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar, Users, CreditCard } from "lucide-react";
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
import { mockBookings, mockGuests, type Booking } from "@/data/mockHospitalityData";

const getStatusBadge = (status: string) => {
  const variants = {
    reserved: "bg-blue-100 text-blue-800",
    in_house: "bg-green-100 text-green-800",
    checked_out: "bg-gray-100 text-gray-800",
    no_show: "bg-red-100 text-red-800",
    cancelled: "bg-red-100 text-red-800"
  };
  return <Badge className={variants[status as keyof typeof variants]}>{status.replace('_', ' ')}</Badge>;
};

const getChannelBadge = (channel: string) => {
  const variants = {
    direct: "bg-green-100 text-green-800",
    ota: "bg-orange-100 text-orange-800",
    corporate: "bg-blue-100 text-blue-800"
  };
  return <Badge className={variants[channel as keyof typeof variants]}>{channel.toUpperCase()}</Badge>;
};

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const bookingForm = useForm<Partial<Booking>>({
    defaultValues: {
      channel: 'direct',
      status: 'reserved',
      adults: 1,
      children: 0
    }
  });

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const onCreateBooking = (data: Partial<Booking>) => {
    console.log('Creating booking:', data);
    setIsCreateOpen(false);
    bookingForm.reset();
  };

  const totalBookings = mockBookings.length;
  const activeBookings = mockBookings.filter(b => ['reserved', 'in_house'].includes(b.status)).length;
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const avgBookingValue = totalRevenue / totalBookings;

  const stats = [
    { title: "Total Bookings", value: totalBookings, icon: <Calendar className="h-4 w-4" /> },
    { title: "Active Bookings", value: activeBookings, icon: <Users className="h-4 w-4 text-green-500" /> },
    { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: <CreditCard className="h-4 w-4" /> },
    { title: "Avg Booking Value", value: `₹${Math.round(avgBookingValue).toLocaleString()}`, icon: <CreditCard className="h-4 w-4 text-blue-500" /> }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Bookings Management</h1>
              <p className="text-sm text-muted-foreground">Manage hotel reservations and guest bookings</p>
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
                    <CardTitle>Bookings & Reservations</CardTitle>
                    <CardDescription>Manage guest bookings and room reservations</CardDescription>
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
                        placeholder="Search by guest name or site..."
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
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="in_house">In House</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
                          New Booking
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Create New Booking</DialogTitle>
                          <DialogDescription>Add a new room reservation</DialogDescription>
                        </DialogHeader>
                        <Form {...bookingForm}>
                          <form onSubmit={bookingForm.handleSubmit(onCreateBooking)} className="space-y-4">
                            <FormField
                              control={bookingForm.control}
                              name="guestId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Guest</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select guest or add new" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {mockGuests.map((guest) => (
                                        <SelectItem key={guest.id} value={guest.id}>
                                          {guest.fullName} - {guest.email}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={bookingForm.control}
                                name="checkIn"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Check-in Date</FormLabel>
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
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={bookingForm.control}
                                name="checkOut"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Check-out Date</FormLabel>
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
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={bookingForm.control}
                                name="adults"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Adults</FormLabel>
                                    <FormControl>
                                      <Input type="number" min="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={bookingForm.control}
                                name="children"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Children</FormLabel>
                                    <FormControl>
                                      <Input type="number" min="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={bookingForm.control}
                              name="channel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Booking Channel</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select channel" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="direct">Direct</SelectItem>
                                      <SelectItem value="ota">Online Travel Agent</SelectItem>
                                      <SelectItem value="corporate">Corporate</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={bookingForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Special Requests</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Any special requests or notes..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Create Booking</Button>
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
                      <TableHead>Guest</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Check-in / Check-out</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">
                              Booking #{booking.id.slice(-6)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.siteName}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.roomCount} room{booking.roomCount > 1 ? 's' : ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">
                              to {new Date(booking.checkOut).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-blue-600">{booking.nights} night{booking.nights > 1 ? 's' : ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{booking.adults} Adult{booking.adults > 1 ? 's' : ''}</div>
                            {booking.children > 0 && (
                              <div className="text-muted-foreground">{booking.children} Child{booking.children > 1 ? 'ren' : ''}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getChannelBadge(booking.channel)}</TableCell>
                        <TableCell>
                          <span className="font-medium">₹{booking.totalAmount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
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