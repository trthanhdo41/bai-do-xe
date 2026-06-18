import {
  demoUsers,
  initialPaymentConfig,
  initialPricingConfig,
  initialSessions,
  initialVehicles,
} from "@/lib/mock-data";
import { todayInputValue } from "@/lib/constants";
import type {
  AuthMode,
  DemoUser,
  DeviceItem,
  DeviceMaintenanceLog,
  FeedbackItem,
  IncidentItem,
  NotificationItem,
  OccupancyHourPoint,
  ParkingSession,
  ParkingSlot,
  PaymentConfig,
  PeakHourPoint,
  PricingConfig,
  RegisteredVehicle,
  ReportSummary,
  Reservation,
  RevenueChartPoint,
  ShiftItem,
  Subscription,
  SubscriptionPlan,
  TopCustomer,
  TransactionItem,
  Zone,
} from "@/types";

export type ParkingAppState = {
  mode: AuthMode;
  currentUser: DemoUser | null;
  sessions: ParkingSession[];
  registeredVehicles: RegisteredVehicle[];
  userList: DemoUser[];
  searchText: string;
  authError: string;
  mobileNavOpen: boolean;
  actionLog: string;
  exitSessionId: string;
  pricingConfigState: PricingConfig;
  paymentConfigState: PaymentConfig;
  transactionList: TransactionItem[];
  notificationList: NotificationItem[];
  feedbackList: FeedbackItem[];
  deviceList: DeviceItem[];
  shiftList: ShiftItem[];
  incidentList: IncidentItem[];
  twoFactorQr: string;
  reportFrom: string;
  reportTo: string;
  reportSummary: ReportSummary | null;
  sessionLoading: boolean;
  zoneList: Zone[];
  slotList: ParkingSlot[];
  reservationList: Reservation[];
  planList: SubscriptionPlan[];
  subscriptionList: Subscription[];
  maintenanceLogList: DeviceMaintenanceLog[];
  revenueChart: RevenueChartPoint[];
  occupancyData: OccupancyHourPoint[];
  topCustomers: TopCustomer[];
  peakHours: PeakHourPoint[];
};

export function createInitialState(): ParkingAppState {
  return {
    mode: "login",
    currentUser: null,
    sessions: initialSessions,
    registeredVehicles: initialVehicles,
    userList: demoUsers,
    searchText: "",
    authError: "",
    mobileNavOpen: false,
    actionLog: "Sẵn sàng vận hành.",
    exitSessionId: "",
    pricingConfigState: initialPricingConfig,
    paymentConfigState: initialPaymentConfig,
    transactionList: [],
    notificationList: [],
    feedbackList: [],
    deviceList: [],
    shiftList: [],
    incidentList: [],
    twoFactorQr: "",
    reportFrom: todayInputValue(),
    reportTo: todayInputValue(),
    reportSummary: null,
    sessionLoading: true,
    zoneList: [],
    slotList: [],
    reservationList: [],
    planList: [],
    subscriptionList: [],
    maintenanceLogList: [],
    revenueChart: [],
    occupancyData: [],
    topCustomers: [],
    peakHours: [],
  };
}
