export interface RatePlan {
  id: string;
  orgId: string;
  siteId: string;
  name: string;
  mealPlan?: 'EP' | 'CP' | 'MAP' | 'AP';
  policies?: any;
  taxes?: any;
  siteName: string;
  status: 'active' | 'inactive';
  description?: string;
  baseRate: number;
  currency: string;
}

export interface Rate {
  id: string;
  ratePlanId: string;
  ratePlanName: string;
  spaceGroupId: string;
  spaceGroupName: string;
  date: string;
  price: number;
  allotment?: number;
  minStay?: number;
  maxStay?: number;
  closedToArrival: boolean;
  closedToDeparture: boolean;
}

export interface Guest {
  id: string;
  orgId: string;
  siteId: string;
  fullName: string;
  email?: string;
  phoneE164?: string;
  kyc?: any;
  siteName: string;
  createdAt: string;
  totalBookings: number;
  status: 'active' | 'blacklisted';
}

export interface Booking {
  id: string;
  orgId: string;
  siteId: string;
  guestId?: string;
  guestName: string;
  channel: 'direct' | 'ota' | 'corporate';
  status: 'reserved' | 'in_house' | 'checked_out' | 'no_show' | 'cancelled';
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  notes?: string;
  createdAt: string;
  siteName: string;
  roomCount: number;
  totalAmount: number;
  nights: number;
}

export interface BookingRoom {
  id: string;
  bookingId: string;
  spaceId: string;
  spaceName: string;
  ratePlanId: string;
  ratePlanName: string;
  pricePerNight: number;
  taxes?: any;
  status: 'allocated' | 'occupied' | 'cleaning' | 'blocked';
}

export interface Folio {
  id: string;
  bookingId: string;
  folioNo: string;
  status: 'open' | 'settled';
  payerKind: 'guest' | 'company' | 'agent';
  payerId?: string;
  createdAt: string;
  guestName: string;
  totalCharges: number;
  totalPayments: number;
  balance: number;
}

export interface HousekeepingTask {
  id: string;
  orgId: string;
  siteId: string;
  spaceId: string;
  spaceName: string;
  status: 'dirty' | 'cleaning' | 'inspected' | 'clean';
  taskDate: string;
  notes?: string;
  assignedTo?: string;
  assignedToName?: string;
  siteName: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // in minutes
}

export const mockRatePlans: RatePlan[] = [
  {
    id: "rp-1",
    orgId: "org-1",
    siteId: "site-3",
    name: "BAR - Best Available Rate",
    mealPlan: "EP",
    policies: { cancellation: "24hrs", noShow: "1night" },
    taxes: { GST: 12, luxury_tax: 5 },
    siteName: "Hotel Paradise",
    status: "active",
    description: "Standard public rate with flexible cancellation",
    baseRate: 5500,
    currency: "INR"
  },
  {
    id: "rp-2",
    orgId: "org-1",
    siteId: "site-3",
    name: "Corporate Rate",
    mealPlan: "CP",
    policies: { cancellation: "12hrs", noShow: "nocharge" },
    taxes: { GST: 12 },
    siteName: "Hotel Paradise",
    status: "active",
    description: "Special rate for corporate clients",
    baseRate: 4800,
    currency: "INR"
  },
  {
    id: "rp-3",
    orgId: "org-1",
    siteId: "site-3",
    name: "Promotional Package",
    mealPlan: "MAP",
    policies: { cancellation: "48hrs", noShow: "1night" },
    taxes: { GST: 12, luxury_tax: 5 },
    siteName: "Hotel Paradise",
    status: "active",
    description: "Limited time promotional offer",
    baseRate: 4200,
    currency: "INR"
  },
  {
    id: "rp-4",
    orgId: "org-1",
    siteId: "site-4",
    name: "Weekend Special",
    mealPlan: "EP",
    policies: { cancellation: "24hrs", noShow: "1night" },
    taxes: { GST: 12 },
    siteName: "Seaside Resort",
    status: "active",
    description: "Special weekend package",
    baseRate: 7200,
    currency: "INR"
  }
];

export const mockGuests: Guest[] = [
  {
    id: "guest-1",
    orgId: "org-1",
    siteId: "site-3",
    fullName: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phoneE164: "+919876543210",
    kyc: { aadhaar: "xxxx-xxxx-1234", passport: null },
    siteName: "Hotel Paradise",
    createdAt: "2024-01-10T10:30:00Z",
    totalBookings: 5,
    status: "active"
  },
  {
    id: "guest-2",
    orgId: "org-1",
    siteId: "site-3",
    fullName: "Priya Sharma",
    email: "priya.sharma@email.com",
    phoneE164: "+919876543211",
    kyc: { aadhaar: "xxxx-xxxx-5678" },
    siteName: "Hotel Paradise",
    createdAt: "2024-01-12T14:15:00Z",
    totalBookings: 2,
    status: "active"
  },
  {
    id: "guest-3",
    orgId: "org-1",
    siteId: "site-3",
    fullName: "John Smith",
    email: "john.smith@email.com",
    phoneE164: "+14155552345",
    kyc: { passport: "A1234567" },
    siteName: "Hotel Paradise",
    createdAt: "2024-01-08T09:20:00Z",
    totalBookings: 1,
    status: "active"
  },
  {
    id: "guest-4",
    orgId: "org-1",
    siteId: "site-4",
    fullName: "Anita Desai",
    email: "anita.desai@email.com",
    phoneE164: "+919876543212",
    siteName: "Seaside Resort",
    createdAt: "2024-01-14T16:45:00Z",
    totalBookings: 3,
    status: "active"
  }
];

export const mockBookings: Booking[] = [
  {
    id: "booking-1",
    orgId: "org-1",
    siteId: "site-3",
    guestId: "guest-1",
    guestName: "Rajesh Kumar",
    channel: "direct",
    status: "in_house",
    checkIn: "2024-01-15",
    checkOut: "2024-01-18",
    adults: 2,
    children: 1,
    notes: "Late check-in requested",
    createdAt: "2024-01-10T10:30:00Z",
    siteName: "Hotel Paradise",
    roomCount: 1,
    totalAmount: 16500,
    nights: 3
  },
  {
    id: "booking-2",
    orgId: "org-1",
    siteId: "site-3",
    guestId: "guest-2",
    guestName: "Priya Sharma",
    channel: "ota",
    status: "reserved",
    checkIn: "2024-01-20",
    checkOut: "2024-01-22",
    adults: 1,
    children: 0,
    notes: "Business traveler",
    createdAt: "2024-01-12T14:15:00Z",
    siteName: "Hotel Paradise",
    roomCount: 1,
    totalAmount: 9600,
    nights: 2
  },
  {
    id: "booking-3",
    orgId: "org-1",
    siteId: "site-3",
    guestId: "guest-3",
    guestName: "John Smith",
    channel: "corporate",
    status: "checked_out",
    checkIn: "2024-01-08",
    checkOut: "2024-01-12",
    adults: 1,
    children: 0,
    createdAt: "2024-01-05T09:20:00Z",
    siteName: "Hotel Paradise",
    roomCount: 1,
    totalAmount: 19200,
    nights: 4
  },
  {
    id: "booking-4",
    orgId: "org-1",
    siteId: "site-4",
    guestId: "guest-4",
    guestName: "Anita Desai",
    channel: "direct",
    status: "reserved",
    checkIn: "2024-01-25",
    checkOut: "2024-01-28",
    adults: 2,
    children: 2,
    notes: "Family vacation",
    createdAt: "2024-01-14T16:45:00Z",
    siteName: "Seaside Resort",
    roomCount: 2,
    totalAmount: 21600,
    nights: 3
  },
  {
    id: "booking-5",
    orgId: "org-1",
    siteId: "site-3",
    guestName: "Walk-in Guest",
    channel: "direct",
    status: "no_show",
    checkIn: "2024-01-14",
    checkOut: "2024-01-15",
    adults: 1,
    children: 0,
    notes: "No-show booking",
    createdAt: "2024-01-14T18:00:00Z",
    siteName: "Hotel Paradise",
    roomCount: 1,
    totalAmount: 5500,
    nights: 1
  }
];

export const mockFolios: Folio[] = [
  {
    id: "folio-1",
    bookingId: "booking-1",
    folioNo: "F001",
    status: "open",
    payerKind: "guest",
    payerId: "guest-1",
    createdAt: "2024-01-15T10:30:00Z",
    guestName: "Rajesh Kumar",
    totalCharges: 18500,
    totalPayments: 10000,
    balance: 8500
  },
  {
    id: "folio-2",
    bookingId: "booking-3",
    folioNo: "F002",
    status: "settled",
    payerKind: "company",
    createdAt: "2024-01-08T09:20:00Z",
    guestName: "John Smith",
    totalCharges: 21200,
    totalPayments: 21200,
    balance: 0
  },
  {
    id: "folio-3",
    bookingId: "booking-2",
    folioNo: "F003",
    status: "open",
    payerKind: "guest",
    payerId: "guest-2",
    createdAt: "2024-01-12T14:15:00Z",
    guestName: "Priya Sharma",
    totalCharges: 0,
    totalPayments: 0,
    balance: 0
  }
];

export const mockHousekeepingTasks: HousekeepingTask[] = [
  {
    id: "hk-1",
    orgId: "org-1",
    siteId: "site-3",
    spaceId: "room-101",
    spaceName: "Room 101 - Deluxe King",
    status: "cleaning",
    taskDate: "2024-01-15",
    notes: "Guest checkout cleaning",
    assignedTo: "staff-1",
    assignedToName: "Sunita Devi",
    siteName: "Hotel Paradise",
    priority: "high",
    estimatedTime: 45
  },
  {
    id: "hk-2",
    orgId: "org-1",
    siteId: "site-3",
    spaceId: "room-102",
    spaceName: "Room 102 - Executive Suite",
    status: "inspected",
    taskDate: "2024-01-15",
    notes: "Ready for next guest",
    assignedTo: "staff-2",
    assignedToName: "Rajni Sharma",
    siteName: "Hotel Paradise",
    priority: "medium",
    estimatedTime: 60
  },
  {
    id: "hk-3",
    orgId: "org-1",
    siteId: "site-3",
    spaceId: "room-103",
    spaceName: "Room 103 - Standard Twin",
    status: "dirty",
    taskDate: "2024-01-15",
    notes: "Checkout completed, needs cleaning",
    siteName: "Hotel Paradise",
    priority: "high",
    estimatedTime: 40
  },
  {
    id: "hk-4",
    orgId: "org-1",
    siteId: "site-3",
    spaceId: "room-104",
    spaceName: "Room 104 - Deluxe King",
    status: "clean",
    taskDate: "2024-01-15",
    notes: "Ready for arrival",
    assignedTo: "staff-1",
    assignedToName: "Sunita Devi",
    siteName: "Hotel Paradise",
    priority: "low",
    estimatedTime: 30
  },
  {
    id: "hk-5",
    orgId: "org-1",
    siteId: "site-4",
    spaceId: "room-201",
    spaceName: "Room 201 - Ocean View Suite",
    status: "cleaning",
    taskDate: "2024-01-15",
    notes: "Deep cleaning required",
    assignedTo: "staff-3",
    assignedToName: "Maya Patel",
    siteName: "Seaside Resort",
    priority: "medium",
    estimatedTime: 90
  }
];