export type Role = "admin" | "staff" | "customer";

export type View =
  | "overview"
  | "sessions"
  | "users"
  | "pricing"
  | "reports"
  | "profile"
  | "wallet"
  | "vehicles"
  | "feedback"
  | "notifications"
  | "shifts"
  | "incidents"
  | "ai"
  | "devices"
  | "security"
  | "zones"
  | "parking-slots"
  | "reservations"
  | "subscriptions";

export type DemoUser = {
  id: number | string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: "Đang hoạt động" | "Đã khóa";
  wallet: number;
  avatarUrl?: string;
  provider?: string;
  twoFactorEnabled?: boolean;
};

export type FeeBreakdown = {
  totalMinutes: number;
  freeMinutes: number;
  billableMinutes: number;
  billableHours: number;
  hourlyRate: number;
  parkingFee: number;
  overdueFine: number;
  totalFee: number;
};

export type ParkingSession = {
  id: string;
  plate: string;
  owner: string;
  vehicleType: "Ô tô";
  checkIn: string;
  checkOut?: string;
  slot: string;
  slotId?: string;
  status: "Đang gửi" | "Đã hoàn thành";
  fee: number;
  entryImageUrl?: string;
  exitImageUrl?: string;
  entryDetectedPlate?: string;
  exitDetectedPlate?: string;
  entryConfidence?: number;
  exitConfidence?: number;
  vehicleMatchScore?: number;
  matchStatus?: "Chưa checkout" | "Khớp" | "Không khớp";
  verificationStatus?: "Không cần" | "Chờ duyệt" | "Đã duyệt" | "Từ chối";
  manualPlate?: string;
  verificationNote?: string;
  paymentStatus?: "unpaid" | "pending" | "paid";
  transactionId?: string;
  feeBreakdown?: FeeBreakdown;
};

export type RegisteredVehicle = {
  id?: string;
  plate: string;
  owner: string;
  type: "Ô tô" | string;
  status: "Đã đăng ký" | "Cần duyệt" | "Blacklist" | string;
};

export type PricingConfig = {
  id: string;
  freeMinutes: number;
  hourlyRate: number;
  overnightRate: number;
  monthlyRate: number;
  overdueFineRate: number;
  isActive: boolean;
  updatedAt?: string;
};

export type ReportSummary = {
  from: string;
  to: string;
  entryCount: number;
  exitCount: number;
  activeCount: number;
  revenue: number;
  freeSessionCount: number;
  paidSessionCount: number;
};

export type PaymentConfig = {
  id: string;
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  transferPrefix: string;
};

export type TransactionItem = {
  id: string;
  sessionId?: string;
  method: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  content: string;
  qrUrl?: string;
  paidAt?: string;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export type FeedbackItem = {
  id: string;
  subject: string;
  content: string;
  status: "Đang xử lý" | "Đã phản hồi" | "Đã đóng";
  response?: string;
  createdAt: string;
};

export type DeviceItem = {
  id: string;
  name: string;
  gate: "entry" | "exit";
  rtspUrl: string;
  username?: string;
  roiNote?: string;
  status: "online" | "offline" | "unknown";
  lastSnapshotUrl?: string;
  healthCheckEnabled?: boolean;
  offlineThresholdMinutes?: number;
  maintenanceSchedule?: {
    intervalDays: number;
    lastMaintenanceAt?: string;
    nextMaintenanceAt?: string;
  };
};

export type ShiftItem = {
  id: string;
  name: string;
  startAt: string;
  endAt?: string;
  status: "Đang làm" | "Đã kết thúc";
  note?: string;
};

export type IncidentItem = {
  id: string;
  type: string;
  note: string;
  plate?: string;
  status: "Mới" | "Đang xử lý" | "Đã xử lý";
  createdAt: string;
};

export type AuthMode = "login" | "register" | "forgot";

export type ZoneStats = {
  total: number;
  empty: number;
  occupied: number;
  reserved: number;
  maintenance: number;
};

export type Zone = {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  allowedVehicleTypes: string[];
  pricingConfigId?: string;
  displayOrder: number;
  isActive: boolean;
  stats?: ZoneStats;
  updatedAt?: string;
};

export type SlotStatus = "empty" | "occupied" | "reserved" | "maintenance";
export type SlotType = "regular" | "VIP" | "electric" | "handicap";

export type ParkingSlot = {
  id: string;
  slotCode: string;
  zoneId: string;
  zoneName: string;
  slotType: SlotType;
  features: string[];
  status: SlotStatus;
  currentSessionId?: string;
  floor: number;
  notes?: string;
  updatedAt?: string;
};

export type SlotMapEntry = {
  zoneId: string;
  zoneName: string;
  slots: ParkingSlot[];
};

// --- Reservation ---
export type Reservation = {
  id: string;
  userId: string;
  slotId: string;
  slotCode: string;
  zoneName: string;
  vehicleType: string;
  plate: string;
  reservedFrom: string;
  reservedUntil: string;
  status: "pending" | "active" | "completed" | "cancelled" | "expired";
  sessionId?: string;
  depositAmount?: number;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
};

// --- Subscription ---
export type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string;
  duration: "monthly" | "quarterly" | "yearly";
  durationDays: number;
  price: number;
  discountPercent: number;
  maxVehicles: number;
  features: string[];
  isActive: boolean;
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
  plates: string[];
  transactionId?: string;
  renewalCount: number;
  createdAt: string;
};

// --- Device Maintenance ---
export type DeviceMaintenanceLog = {
  id: string;
  deviceId: string;
  deviceName: string;
  type: "scheduled" | "repair" | "inspection" | "replacement";
  description: string;
  performedBy?: string;
  performedAt: string;
  cost: number;
  notes?: string;
  status: "planned" | "in_progress" | "completed";
  createdAt: string;
};

// --- Analytics ---
export type RevenueChartPoint = {
  date: string;
  revenue: number;
  count: number;
};

export type OccupancyHourPoint = {
  hour: number;
  avgOccupancy: number;
  maxOccupancy: number;
};

export type TopCustomer = {
  userId: string;
  name: string;
  email?: string;
  sessionCount: number;
  totalSpent: number;
};

export type PeakHourPoint = {
  dayOfWeek: number;
  hour: number;
  count: number;
};
