export interface ItemCustomization {
  milk?: 'Standard Dairy' | 'Oat Milk (+₹30)' | 'Almond Milk (+₹40)' | 'Soy Milk (+₹25)';
  sweetness?: 'Sugar-Free' | 'Mild (50%)' | 'Regular (100%)';
  temperature?: 'Hot' | 'Over Ice (+₹15)';
  extraShot?: boolean;
  whippedCrema?: boolean;
  note?: string;
  additionalPrice?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  category: 'Starters' | 'Main Course' | 'Pizza' | 'Burger' | 'Sandwich' | 'Beverages' | 'Desserts' | 'Combos' | string;
  price: number;
  img: string;
  isVeg: boolean;
  rating: number;
  prepTime: number;
  desc: string;
  isAvailable?: boolean;
  discount?: number;
  isPopular?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  calories?: string;
  strength?: number;
  type?: 'hot' | 'cold' | string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  customization?: ItemCustomization;
  forGuest?: string; // Which seated person added this item
}

export interface SplitPaymentRecord {
  person: string;
  amount: number;
  status: 'pending' | 'paid';
  method?: string;
  paidAt?: string;
}

export interface TableSession {
  sessionId: string;
  tableId: number;
  status: 'active' | 'completed' | 'ended';
  startTime: string;
  endTime?: string;
  members: Array<{ name: string; email?: string; joinedAt?: string }>;
  peopleCount?: number;
  interests?: string[];
  cart?: CartItem[];
  orders?: OrderRecord[];
  paymentStatus?: 'pending' | 'partially_paid' | 'completed';
  splitPayments?: SplitPaymentRecord[];
}

export interface TableInfo {
  tableNo: string | number | null;
  sessionId?: string;
  peopleCount?: number;
  guestNames?: string[];
  area?: string;
  entertainment?: string;
  interests?: string[];
}

export interface UserProfile {
  n: string; // name
  c: string; // contact (email/phone)
  name?: string;
  contact?: string;
  email?: string;
  profileImage?: string;
  isAuthenticated?: boolean;
  token?: string;
  preferences?: {
    pureVeg?: boolean;
    favoriteCategory?: string;
    interests?: string[];
  };
}

export interface AdminUser {
  u: string;
  token?: string;
}

export interface OrderItemDetail {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  forGuest?: string;
  customization?: ItemCustomization;
}

export interface OrderRecord {
  o: string; // Order ID (e.g. TH1025)
  t: string; // Table number
  i: string; // Items string summary
  items?: OrderItemDetail[];
  price: string;
  s: 'New' | 'Accepted' | 'Preparing' | 'Ready' | 'Served' | 'Completed' | string;
  rawAmount: number;
  contact?: string;
  customerName?: string;
  sessionId?: string;
  paymentMethod?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  createdAt?: string;
}

export interface TableRecord {
  id: number;
  status: 'Free' | 'Occupied' | 'Reserved' | 'Ordering';
  seats: number;
  guestNames?: string[];
  currentSessionId?: string | null;
  zone?: string;
}

export interface BookingRecord {
  id?: string;
  tableId: string | number;
  customerName: string;
  time: string;
  date?: string;
  phone?: string;
  guests?: number;
  area?: string;
  entertainment?: string;
}

export interface WaiterCall {
  id?: string;
  _id?: string;
  tableId: string | number;
  time?: string;
  status?: string;
  resolved?: boolean;
  requestType?: string;
  createdAt?: string;
}

export interface PaymentRecord {
  id: string;
  orderId?: string;
  rel: string; // Table number / relation
  customer?: string;
  person?: string;
  method: 'Paytm' | 'UPI' | 'Card' | 'Cash' | string;
  status: 'Pending' | 'Successful' | 'Failed' | 'Refunded' | string;
  amount: string;
  rawAmount?: number;
  splitType?: 'full' | 'equal' | 'itemized';
  date?: string;
  createdAt?: string;
}

export interface FeedbackRecord {
  id?: string;
  user: string;
  rating: number;
  comments: string;
  tableNo?: string | number;
  date?: string;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'table' | 'invite' | 'alert';
  target: 'customer' | 'admin';
  timestamp: string;
  read: boolean;
}

export interface SyncData {
  tables: TableRecord[];
  orders: OrderRecord[];
  feedback: FeedbackRecord[];
  customers: Array<{ name?: string; n?: string; contact?: string; c?: string; visits?: number; v?: number; ltv?: number; l?: number }>;
  payments: PaymentRecord[];
  bookings: BookingRecord[];
  waiterCalls: WaiterCall[];
  menu?: MenuItem[];
  activeSessions?: TableSession[];
  notifications?: AppNotification[];
}

export type ThemeMode = 'light';
