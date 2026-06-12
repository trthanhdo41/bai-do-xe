"use client";

import {
  BarChart3,
  Ban,
  Bell,
  Bot,
  Camera,
  Car,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  FileDown,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Menu,
  ParkingCircle,
  Plus,
  QrCode,
  RefreshCcw,
  ReceiptText,
  ScanLine,
  Search,
  Settings,
  Smartphone,
  Upload,
  UserRound,
  UsersRound,
  Wallet,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/client-api";
import { parkingConfig } from "@/lib/parking-config";

type Role = "admin" | "staff" | "customer";
type View =
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
  | "security";

type DemoUser = {
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

type FeeBreakdown = {
  totalMinutes: number;
  freeMinutes: number;
  billableMinutes: number;
  billableHours: number;
  hourlyRate: number;
  parkingFee: number;
  overdueFine: number;
  totalFee: number;
};

type ParkingSession = {
  id: string;
  plate: string;
  owner: string;
  vehicleType: "Ô tô";
  checkIn: string;
  checkOut?: string;
  slot: string;
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

type RegisteredVehicle = {
  id?: string;
  plate: string;
  owner: string;
  type: "Ô tô" | string;
  status: "Đã đăng ký" | "Cần duyệt" | "Blacklist" | string;
};

type PricingConfig = {
  id: string;
  freeMinutes: number;
  hourlyRate: number;
  overnightRate: number;
  monthlyRate: number;
  overdueFineRate: number;
  isActive: boolean;
  updatedAt?: string;
};

type ReportSummary = {
  from: string;
  to: string;
  entryCount: number;
  exitCount: number;
  activeCount: number;
  revenue: number;
  freeSessionCount: number;
  paidSessionCount: number;
};

type PaymentConfig = {
  id: string;
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  transferPrefix: string;
};

type TransactionItem = {
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

type NotificationItem = {
  id: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
};

type FeedbackItem = {
  id: string;
  subject: string;
  content: string;
  status: "Đang xử lý" | "Đã phản hồi" | "Đã đóng";
  response?: string;
  createdAt: string;
};

type DeviceItem = {
  id: string;
  name: string;
  gate: "entry" | "exit";
  rtspUrl: string;
  username?: string;
  roiNote?: string;
  status: "online" | "offline" | "unknown";
  lastSnapshotUrl?: string;
};

type ShiftItem = {
  id: string;
  name: string;
  startAt: string;
  endAt?: string;
  status: "Đang làm" | "Đã kết thúc";
  note?: string;
};

type IncidentItem = {
  id: string;
  type: string;
  note: string;
  plate?: string;
  status: "Mới" | "Đang xử lý" | "Đã xử lý";
  createdAt: string;
};

const demoUsers: DemoUser[] = [
  {
    id: 1,
    name: "Super Admin iPARK",
    email: "admin@ipark.vn",
    password: "admin",
    role: "admin",
    status: "Đang hoạt động",
    wallet: 0,
  },
  {
    id: 2,
    name: "Nhân viên cổng 1",
    email: "nv.1@ipark.vn",
    password: "123456",
    role: "staff",
    status: "Đang hoạt động",
    wallet: 0,
  },
  {
    id: 3,
    name: "Nhân viên cổng 2",
    email: "nv.2@ipark.vn",
    password: "123456",
    role: "staff",
    status: "Đang hoạt động",
    wallet: 0,
  },
];

const initialSessions: ParkingSession[] = [
  {
    id: "PX-1028",
    plate: "30H-678.90",
    owner: "Nguyễn Minh Anh",
    vehicleType: "Ô tô",
    checkIn: "08:15",
    slot: "A-12",
    status: "Đang gửi",
    fee: 0,
    entryDetectedPlate: "30H67890",
    entryConfidence: 96,
    matchStatus: "Chưa checkout",
  },
  {
    id: "PX-1027",
    plate: "30E-345.67",
    owner: "Khách iPARK 03",
    vehicleType: "Ô tô",
    checkIn: "07:40",
    checkOut: "10:20",
    slot: "B-04",
    status: "Đã hoàn thành",
    fee: 0,
    entryDetectedPlate: "30E34567",
    exitDetectedPlate: "30E34567",
    entryConfidence: 93,
    exitConfidence: 91,
    vehicleMatchScore: 100,
    matchStatus: "Khớp",
  },
  {
    id: "PX-1026",
    plate: "30F-222.11",
    owner: "Lê Thu Hà",
    vehicleType: "Ô tô",
    checkIn: "09:05",
    slot: "A-08",
    status: "Đang gửi",
    fee: 0,
    entryDetectedPlate: "30F22211",
    entryConfidence: 89,
    matchStatus: "Chưa checkout",
  },
];

const initialVehicles: RegisteredVehicle[] = [
  { plate: "30H-678.90", owner: "Nguyễn Minh Anh", type: "Ô tô", status: "Đã đăng ký" },
  { plate: "30E-345.67", owner: "Trần Hoàng Nam", type: "Ô tô", status: "Đã đăng ký" },
  { plate: "30F-222.11", owner: "Lê Thu Hà", type: "Ô tô", status: "Cần duyệt" },
  { plate: "30K-999.99", owner: "Khách vi phạm", type: "Ô tô", status: "Blacklist" },
];

const transactions = [
  { id: "GD-1201", method: "Ví nội bộ", amount: 18000, status: "Thành công", time: "10:22" },
  { id: "GD-1200", method: "VietQR chờ cấu hình", amount: 100000, status: "Chờ xác nhận", time: "09:40" },
  { id: "GD-1199", method: "Nạp ví", amount: 250000, status: "Thành công", time: "Hôm qua" },
];

const notifications = [
  "Xe 30H-678.90 vừa vào bãi.",
  "Số dư ví dưới ngưỡng cảnh báo.",
  "Camera cổng B mất tín hiệu 2 phút.",
  "Khuyến mãi gói gửi xe tháng đang chờ duyệt.",
];

const aiQueue = [
  { plate: "30H-678.90", confidence: "96%", type: "Ô tô", color: "Trắng", issue: "Không lỗi" },
  { plate: "30E-345.67", confidence: "72%", type: "Ô tô", color: "Đen", issue: "Ảnh hơi mờ" },
  { plate: "30K-999.99", confidence: "61%", type: "Ô tô", color: "Xám", issue: "Nghi trùng biển" },
];

const devices = [
  { name: "Camera cổng vào", status: "Chờ RTSP", lastShot: "Chưa có", roi: "Biển số trước" },
  { name: "Camera cổng ra", status: "Chờ RTSP", lastShot: "Chưa có", roi: "Biển số sau" },
];

const shiftRows = [
  { name: "Ca sáng", staff: "nv.1@ipark.vn", time: "06:00 - 14:00", status: "Đang làm" },
  { name: "Ca chiều", staff: "nv.2@ipark.vn", time: "14:00 - 22:00", status: "Chưa bắt đầu" },
  { name: "Ca đêm", staff: "nv.3@ipark.vn", time: "22:00 - 06:00", status: "Chưa bắt đầu" },
];

const roleLabels: Record<Role, string> = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  customer: "Khách hàng",
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const initialPricingConfig: PricingConfig = {
  id: "default",
  freeMinutes: 20,
  hourlyRate: 10000,
  overnightRate: 80000,
  monthlyRate: 1200000,
  overdueFineRate: 20000,
  isActive: true,
};

const initialPaymentConfig: PaymentConfig = {
  id: "default",
  bankName: "Ngân hàng test",
  bankBin: "970436",
  accountNumber: "0000000000",
  accountName: "IPARK",
  transferPrefix: "IPARK",
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [activeView, setActiveView] = useState<View>("overview");
  const [sessions, setSessions] = useState<ParkingSession[]>(initialSessions);
  const [registeredVehicles, setRegisteredVehicles] = useState<RegisteredVehicle[]>(initialVehicles);
  const [userList, setUserList] = useState<DemoUser[]>(demoUsers);
  const [searchText, setSearchText] = useState("");
  const [authError, setAuthError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [actionLog, setActionLog] = useState("Sẵn sàng vận hành.");
  const [exitSessionId, setExitSessionId] = useState("");
  const [pricingConfigState, setPricingConfigState] = useState<PricingConfig>(initialPricingConfig);
  const [paymentConfigState, setPaymentConfigState] = useState<PaymentConfig>(initialPaymentConfig);
  const [transactionList, setTransactionList] = useState<TransactionItem[]>([]);
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [deviceList, setDeviceList] = useState<DeviceItem[]>([]);
  const [shiftList, setShiftList] = useState<ShiftItem[]>([]);
  const [incidentList, setIncidentList] = useState<IncidentItem[]>([]);
  const [twoFactorQr, setTwoFactorQr] = useState("");
  const [reportFrom, setReportFrom] = useState(todayInputValue);
  const [reportTo, setReportTo] = useState(todayInputValue);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);

  const loadReportSummary = useCallback(async (from: string, to: string) => {
    try {
      const params = new URLSearchParams({ from, to });
      const response = await apiFetch(`/reports/summary?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        setActionLog(data.message || "Không tải được báo cáo.");
        return;
      }

      setReportSummary(data.summary);
    } catch {
      setActionLog("Không kết nối được API báo cáo.");
    }
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await apiFetch("/auth/me");
        const data = await response.json();
        if (data.user) {
          setCurrentUser(data.user);
          setActiveView(data.user.role === "customer" ? "profile" : "overview");
        }
      } catch {
        setActionLog("Chưa kết nối được phiên đăng nhập.");
      }
    }

    loadSession();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const activeUser = currentUser;

    async function loadOperationalData() {
      try {
        const [sessionResponse, vehicleResponse] = await Promise.all([
          apiFetch("/parking-sessions"),
          apiFetch("/vehicles"),
        ]);
        if (sessionResponse.ok) {
          const data = await sessionResponse.json();
          setSessions(data.sessions);
        }
        if (vehicleResponse.ok) {
          const data = await vehicleResponse.json();
          setRegisteredVehicles(data.vehicles);
        }
        if (activeUser.role === "admin") {
          const userResponse = await apiFetch("/users");
          if (userResponse.ok) {
            const data = await userResponse.json();
            setUserList(data.users);
          }
        }
        const pricingResponse = await apiFetch("/pricing-config");
        if (pricingResponse.ok) {
          const data = await pricingResponse.json();
          setPricingConfigState(data.pricingConfig);
        }
        const [paymentResponse, transactionResponse, notificationResponse, feedbackResponse] = await Promise.all([
          apiFetch("/payment-config"),
          apiFetch("/transactions"),
          apiFetch("/notifications"),
          apiFetch("/feedback"),
        ]);
        if (paymentResponse.ok) {
          const data = await paymentResponse.json();
          setPaymentConfigState(data.paymentConfig);
        }
        if (transactionResponse.ok) {
          const data = await transactionResponse.json();
          setTransactionList(data.transactions);
        }
        if (notificationResponse.ok) {
          const data = await notificationResponse.json();
          setNotificationList(data.notifications);
        }
        if (feedbackResponse.ok) {
          const data = await feedbackResponse.json();
          setFeedbackList(data.feedback);
        }
        if (activeUser.role !== "customer") {
          const [deviceResponse, shiftResponse, incidentResponse] = await Promise.all([
            apiFetch("/devices"),
            apiFetch("/shifts"),
            apiFetch("/incidents"),
          ]);
          if (deviceResponse.ok) {
            const data = await deviceResponse.json();
            setDeviceList(data.devices);
          }
          if (shiftResponse.ok) {
            const data = await shiftResponse.json();
            setShiftList(data.shifts);
          }
          if (incidentResponse.ok) {
            const data = await incidentResponse.json();
            setIncidentList(data.incidents);
          }
        }
      } catch {
        setActionLog("Không tải được dữ liệu vận hành từ MongoDB local.");
      }
    }

    loadOperationalData();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      return;
    }

    let ignore = false;

    async function loadCurrentReportSummary() {
      try {
        const params = new URLSearchParams({ from: reportFrom, to: reportTo });
        const response = await apiFetch(`/reports/summary?${params.toString()}`);
        const data = await response.json();
        if (!ignore && response.ok) {
          setReportSummary(data.summary);
        }
      } catch {
        if (!ignore) {
          setActionLog("Không kết nối được API báo cáo.");
        }
      }
    }

    loadCurrentReportSummary();
    return () => {
      ignore = true;
    };
  }, [currentUser?.role, reportFrom, reportTo]);

  const stats = useMemo(() => {
    const active = sessions.filter((item) => item.status === "Đang gửi").length;
    const revenue = sessions.reduce((sum, item) => sum + item.fee, 0);

    return {
      active,
      available: parkingConfig.totalCapacity - active,
      revenue,
      completion: sessions.filter((item) => item.status === "Đã hoàn thành").length,
    };
  }, [sessions]);

  const filteredSessions = sessions.filter((session) => {
    const value = `${session.plate} ${session.owner} ${session.id}`.toLowerCase();
    return value.includes(searchText.toLowerCase());
  });

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const twoFactorCode = String(form.get("twoFactorCode") ?? "").trim();

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(twoFactorCode ? { twoFactorCode } : {}) }),
      });
      const data = await response.json();
      if (response.status === 202 && data.requiresTwoFactor) {
        setAuthError(data.message || "Vui lòng nhập mã 2FA.");
        return;
      }
      if (!response.ok) {
        setAuthError(data.message || "Không đăng nhập được.");
        return;
      }

      setAuthError("");
      setCurrentUser(data.user);
      setActiveView(data.user.role === "customer" ? "profile" : "overview");
      setActionLog("Đăng nhập thành công bằng JWT cookie.");
    } catch {
      setAuthError("Không kết nối được API. Kiểm tra MongoDB local và .env.local.");
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.message || "Không đăng ký được.");
        return;
      }

      setAuthError("");
      setCurrentUser(data.user);
      setActiveView("profile");
      setActionLog("Đăng ký thành công, tài khoản đã lưu MongoDB.");
    } catch {
      setAuthError("Không kết nối được API. Kiểm tra MongoDB local.");
    }
  }

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const otp = String(form.get("otp") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const response = await apiFetch(otp && password ? "/auth/reset-password" : "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otp && password ? { email, otp, password } : { email }),
      });
      const data = await response.json();
      setAuthError(data.devOtp ? `${data.message} OTP demo: ${data.devOtp}` : data.message || "Đã xử lý OTP.");
      if (response.ok && otp && password) {
        setMode("login");
      }
    } catch {
      setAuthError("Không kết nối được API OTP.");
    }
  }

  async function updatePricing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      freeMinutes: Number(form.get("freeMinutes") || 0),
      hourlyRate: Number(form.get("hourlyRate") || 0),
      overnightRate: Number(form.get("overnightRate") || 0),
      monthlyRate: Number(form.get("monthlyRate") || 0),
      overdueFineRate: Number(form.get("overdueFineRate") || 0),
    };

    try {
      const response = await apiFetch("/pricing-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionLog(data.message || "Không lưu được bảng giá.");
        return;
      }

      setPricingConfigState(data.pricingConfig);
      setActionLog("Đã cập nhật bảng giá trong MongoDB.");
    } catch {
      setActionLog("Không kết nối được API cấu hình giá.");
    }
  }

  async function updatePaymentConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      bankName: String(form.get("bankName") || ""),
      bankBin: String(form.get("bankBin") || ""),
      accountNumber: String(form.get("accountNumber") || ""),
      accountName: String(form.get("accountName") || ""),
      transferPrefix: String(form.get("transferPrefix") || ""),
    };

    try {
      const response = await apiFetch("/payment-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionLog(data.message || "Không lưu được cấu hình thanh toán.");
        return;
      }
      setPaymentConfigState(data.paymentConfig);
      setActionLog("Đã lưu cấu hình VietQR.");
    } catch {
      setActionLog("Không kết nối được API thanh toán.");
    }
  }

  async function confirmTransaction(id: string) {
    const response = await apiFetch(`/transactions/${id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "Admin xác nhận thủ công" }),
    });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không xác nhận được giao dịch.");
      return;
    }
    setTransactionList((items) => items.map((item) => (item.id === id ? data.transaction : item)));
    setActionLog("Đã xác nhận thanh toán.");
  }

  async function createPaymentForSession(id: string) {
    const response = await apiFetch(`/transactions/session/${id}`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không tạo được giao dịch.");
      return;
    }
    if (data.transaction) {
      setTransactionList((items) => [data.transaction, ...items.filter((item) => item.id !== data.transaction.id)]);
    }
    setActionLog(data.message || "Đã tạo giao dịch cho phiên.");
  }

  async function createFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await apiFetch("/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: String(form.get("subject") || ""),
        content: String(form.get("content") || ""),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không gửi được phản hồi.");
      return;
    }
    setFeedbackList((items) => [data.feedback, ...items]);
    setActionLog("Đã lưu phản hồi vào MongoDB.");
    event.currentTarget.reset();
  }

  async function updateFeedbackStatus(id: string) {
    const response = await apiFetch(`/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Đã phản hồi", response: "Đã tiếp nhận và xử lý." }),
    });
    const data = await response.json();
    if (response.ok) {
      setFeedbackList((items) => items.map((item) => (item.id === id ? data.feedback : item)));
      setActionLog("Đã phản hồi khách hàng.");
    }
  }

  async function markNotificationRead(id: string) {
    const response = await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    const data = await response.json();
    if (response.ok) {
      setNotificationList((items) => items.map((item) => (item.id === id ? data.notification : item)));
    }
  }

  async function startShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await apiFetch("/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: String(form.get("name") || "Ca làm"), note: String(form.get("note") || "") }),
    });
    const data = await response.json();
    if (response.ok) {
      setShiftList((items) => [data.shift, ...items]);
      setActionLog("Đã bắt đầu ca làm việc.");
      event.currentTarget.reset();
    }
  }

  async function endShift(id: string) {
    const response = await apiFetch(`/shifts/${id}/end`, { method: "PATCH" });
    const data = await response.json();
    if (response.ok) {
      setShiftList((items) => items.map((item) => (item.id === id ? data.shift : item)));
      setActionLog("Đã kết thúc ca làm việc.");
    }
  }

  async function createIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await apiFetch("/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: String(form.get("type") || "Khác"),
        note: String(form.get("note") || ""),
        plate: String(form.get("plate") || ""),
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setIncidentList((items) => [data.incident, ...items]);
      setActionLog("Đã lưu sự cố vào MongoDB.");
      event.currentTarget.reset();
    }
  }

  async function resolveIncident(id: string) {
    const response = await apiFetch(`/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Đã xử lý" }),
    });
    const data = await response.json();
    if (response.ok) {
      setIncidentList((items) => items.map((item) => (item.id === id ? data.incident : item)));
      setActionLog("Đã xử lý sự cố.");
    }
  }

  async function saveDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") || "");
    const payload = {
      name: String(form.get("name") || ""),
      gate: String(form.get("gate") || "entry"),
      rtspUrl: String(form.get("rtspUrl") || ""),
      username: String(form.get("username") || ""),
      password: String(form.get("password") || ""),
      roiNote: String(form.get("roiNote") || ""),
    };
    const response = await apiFetch(id ? `/devices/${id}` : "/devices", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok) {
      setDeviceList((items) =>
        id ? items.map((item) => (item.id === id ? data.device : item)) : [data.device, ...items],
      );
      setActionLog("Đã lưu cấu hình camera.");
      event.currentTarget.reset();
    } else {
      setActionLog(data.message || "Không lưu được camera.");
    }
  }

  async function snapshotDevice(id: string) {
    const response = await apiFetch(`/devices/${id}/snapshot`, { method: "POST" });
    const data = await response.json();
    if (response.ok) {
      setDeviceList((items) => items.map((item) => (item.id === id ? data.device : item)));
      setActionLog("Đã chụp snapshot camera.");
    } else {
      setActionLog(data.message || "Không chụp được camera.");
    }
  }

  async function cameraEntry(deviceId: string) {
    const response = await apiFetch("/parking-sessions/camera-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, owner: "Khách vãng lai" }),
    });
    const data = await response.json();
    if (response.ok) {
      setSessions((items) => [data.session, ...items]);
      setActionLog("Camera đã tạo phiên xe vào.");
    } else {
      setActionLog(data.message || "Camera xe vào lỗi.");
    }
  }

  async function cameraExit(deviceId: string) {
    if (!exitSessionId) {
      setActionLog("Chọn phiên checkout trước khi dùng camera cổng ra.");
      return;
    }
    const response = await apiFetch("/parking-sessions/camera-exit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, sessionId: exitSessionId }),
    });
    const data = await response.json();
    if (response.ok) {
      setSessions((items) => items.map((item) => (item.id === exitSessionId ? data.session : item)));
      setActionLog(data.message || "Camera checkout đã xử lý.");
    } else {
      setActionLog(data.message || "Camera xe ra lỗi.");
    }
  }

  async function approveCheckout(id: string, plate: string) {
    const response = await apiFetch(`/parking-sessions/${id}/approve-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manualPlate: plate, verificationNote: "Admin duyệt từ UI" }),
    });
    const data = await response.json();
    if (response.ok) {
      setSessions((items) => items.map((item) => (item.id === id ? data.session : item)));
      setActionLog("Admin đã duyệt checkout thủ công.");
    } else {
      setActionLog(data.message || "Không duyệt được checkout.");
    }
  }

  async function setupTwoFactor() {
    const response = await apiFetch("/auth/2fa/setup", { method: "POST" });
    const data = await response.json();
    if (response.ok) {
      setTwoFactorQr(data.qrDataUrl);
      setActionLog("Quét QR rồi nhập mã để bật 2FA.");
    } else {
      setActionLog(data.message || "Không tạo được QR 2FA.");
    }
  }

  async function verifyTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await apiFetch("/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: String(form.get("code") || "") }),
    });
    const data = await response.json();
    if (response.ok) {
      setCurrentUser(data.user);
      setTwoFactorQr("");
      setActionLog("Đã bật 2FA.");
      event.currentTarget.reset();
    } else {
      setActionLog(data.message || "Không xác minh được 2FA.");
    }
  }

  async function disableTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await apiFetch("/auth/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: String(form.get("code") || "") }),
    });
    const data = await response.json();
    if (response.ok) {
      setCurrentUser(data.user);
      setActionLog("Đã tắt 2FA.");
      event.currentTarget.reset();
    } else {
      setActionLog(data.message || "Không tắt được 2FA.");
    }
  }

  async function downloadReport(type: "sessions" | "revenue", format: "xlsx" | "pdf" = "xlsx") {
    try {
      const params = new URLSearchParams({ from: reportFrom, to: reportTo, type, format });
      const response = await apiFetch(`/reports/export?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json();
        setActionLog(data.message || "Không xuất được báo cáo.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ipark-${type}-${reportFrom}-${reportTo}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      setActionLog("Đã xuất file Excel từ dữ liệu MongoDB.");
    } catch {
      setActionLog("Không kết nối được API xuất báo cáo.");
    }
  }

  async function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const owner = String(form.get("owner") ?? "Khách vãng lai");
    const image = form.get("entryImage");

    if (!(image instanceof File) || !image.name) {
      setActionLog("Vui lòng upload ảnh xe vào để nhận diện biển số.");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("action", "entry");
      payload.append("owner", owner);
      payload.append("vehicleType", "Ô tô");
      payload.append("image", image);

      const response = await apiFetch("/parking-sessions/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) {
        setActionLog(data.message || "Không tạo được phiên đỗ xe.");
        return;
      }
      setSessions((items) => [data.session, ...items]);
      setExitSessionId(data.session.id);
      setActionLog(`Đã nhận diện biển ${data.detection.plate} và ghi nhận xe vào MongoDB.`);
      event.currentTarget.reset();
    } catch {
      setActionLog("Không kết nối được API nhận diện ảnh xe vào. Kiểm tra AI service Python.");
    }
  }

  async function checkoutWithImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sessionId = String(form.get("sessionId") ?? "");
    const image = form.get("exitImage");

    if (!sessionId || !(image instanceof File) || !image.name) {
      setActionLog("Vui lòng chọn phiên và upload ảnh xe ra.");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("action", "exit");
      payload.append("sessionId", sessionId);
      payload.append("image", image);
      const response = await apiFetch("/parking-sessions/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) {
        setActionLog(data.message || "Không checkout được bằng ảnh.");
        return;
      }

      setSessions((items) => items.map((item) => (item.id === sessionId ? data.session : item)));
      setActionLog(data.message);
      event.currentTarget.reset();
    } catch {
      setActionLog("Không kết nối được API nhận diện ảnh xe ra. Kiểm tra AI service Python.");
    }
  }

  async function completeSession(id: string) {
    try {
      const response = await apiFetch("/parking-sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionLog(data.message || "Không hoàn thành được phiên.");
        return;
      }
      setSessions((items) => items.map((item) => (item.id === id ? data.session : item)));
      setActionLog(`Đã hoàn thành phiên ${id} và lưu biên lai vào MongoDB.`);
    } catch {
      setActionLog("Không kết nối được API hoàn thành phiên.");
    }
  }

  function simulateAction(message: string) {
    setActionLog(message);
  }

  if (!currentUser) {
    return (
      <main className="public-shell">
        <section className="hero">
          <nav className="topbar">
            <div className="brand">
              <ParkingCircle size={28} />
              <span>{parkingConfig.brandName}</span>
            </div>
            <div className="top-actions">
              <a href="#contact">Liên hệ</a>
              <button onClick={() => setMode("login")} type="button">
                <LogIn size={16} />
                Đăng nhập
              </button>
            </div>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Hệ thống quản lý bãi đỗ xe</span>
              <h1>{parkingConfig.brandName}</h1>
              <p>
                Theo dõi 30 chỗ đỗ ô tô khu A/B/C, ghi nhận xe vào/ra bằng ảnh, tính phí sau
                {` ${parkingConfig.freeMinutes} phút miễn phí`} và phân quyền vận hành.
              </p>
              <div className="status-strip">
                <div>
                  <span>Đang gửi</span>
                  <strong>{stats.active} xe</strong>
                </div>
                <div>
                  <span>Còn trống</span>
                  <strong>{stats.available} chỗ</strong>
                </div>
                <div>
                  <span>Camera</span>
                  <strong>2 cổng</strong>
                </div>
              </div>
              <div className="hero-actions">
                <button onClick={() => setMode("login")} type="button">
                  <LogIn size={18} />
                  Dùng tài khoản iPARK
                </button>
                <button className="secondary-button" onClick={() => setMode("register")} type="button">
                  <UserRound size={18} />
                  Đăng ký khách hàng
                </button>
              </div>
            </div>

            <div className="auth-panel">
              <div className="segmented">
                <button
                  className={mode === "login" ? "active" : ""}
                  onClick={() => setMode("login")}
                  type="button"
                >
                  Đăng nhập
                </button>
                <button
                  className={mode === "register" ? "active" : ""}
                  onClick={() => setMode("register")}
                  type="button"
                >
                  Đăng ký
                </button>
              </div>
              {mode === "login" && (
                <form onSubmit={handleLogin}>
                  <label>
                    Email
                    <input name="email" defaultValue="admin@ipark.vn" type="email" />
                  </label>
                  <label>
                    Mật khẩu
                    <input name="password" defaultValue="admin" type="password" />
                  </label>
                  <label>
                    Mã 2FA
                    <input name="twoFactorCode" placeholder="Nhập nếu tài khoản đã bật 2FA" />
                  </label>
                  {authError && <p className="form-error">{authError}</p>}
                  <button className="full-button" type="submit">
                    <LogIn size={18} />
                    Vào hệ thống
                  </button>
                  <button
                    className="secondary-button full-button"
                    onClick={() => {
                      window.location.href = `${apiBaseUrl}/auth/google`;
                    }}
                    type="button"
                  >
                    <LogIn size={18} />
                    Đăng nhập với Google
                  </button>
                  <button className="link-button" onClick={() => setMode("forgot")} type="button">
                    Quên mật khẩu / gửi OTP
                  </button>
                  <div className="demo-accounts">
                    <span>Tài khoản:</span>
                    <code>admin@ipark.vn / admin</code>
                    <code>nv.1@ipark.vn / 123456</code>
                    <code>nv.2@ipark.vn / 123456</code>
                    <code>nv.3@ipark.vn / 123456</code>
                  </div>
                </form>
              )}
              {mode === "register" && (
                <form onSubmit={handleRegister}>
                  <label>
                    Họ tên
                    <input name="name" placeholder="Nhập họ tên" required />
                  </label>
                  <label>
                    Email
                    <input name="email" placeholder="email@example.com" required type="email" />
                  </label>
                  <label>
                    Mật khẩu
                    <input name="password" placeholder="Tối thiểu 6 ký tự" required type="password" />
                  </label>
                  <button className="full-button" type="submit">
                    <Plus size={18} />
                    Tạo tài khoản
                  </button>
                </form>
              )}
              {mode === "forgot" && (
                <form onSubmit={handleForgotPassword}>
                  <label>
                    Email nhận OTP
                    <input name="email" placeholder="email@example.com" required type="email" />
                  </label>
                  <label>
                    Mã OTP
                    <input name="otp" placeholder="123456" />
                  </label>
                  <label>
                    Mật khẩu mới
                    <input name="password" placeholder="Tối thiểu 6 ký tự" type="password" />
                  </label>
                  {authError && <p className="form-info">{authError}</p>}
                  <button className="full-button" type="submit">
                    <Mail size={18} />
                    Gửi / xác minh OTP
                  </button>
                  <button className="link-button" onClick={() => setMode("login")} type="button">
                    Quay lại đăng nhập
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="public-section">
          <div>
            <span className="section-kicker">Tình trạng bãi xe</span>
            <h2>{parkingConfig.totalCapacity} vị trí ô tô, chia khu A/B/C</h2>
          </div>
          <div className="metric-grid">
            <Metric icon={<Car />} label="Xe đang gửi" value={String(stats.active)} />
            <Metric icon={<CheckCircle2 />} label="Chỗ còn trống" value={String(stats.available)} />
            <Metric icon={<Camera />} label="Camera cấu hình" value="2 cổng" />
            <Metric icon={<Clock3 />} label="Miễn phí đầu" value={`${parkingConfig.freeMinutes} phút`} />
          </div>
        </section>

        <section className="public-section compact" id="contact">
          <div>
            <span className="section-kicker">Liên hệ</span>
            <h2>Ban quản lý bãi đỗ xe</h2>
          </div>
          <p>
            Email: {parkingConfig.contactEmail} - Hotline: {parkingConfig.hotline} - Địa chỉ:{" "}
            {parkingConfig.address}
          </p>
        </section>
      </main>
    );
  }

  const navItems = [
    { id: "overview" as View, label: "Tổng quan", icon: LayoutDashboard, roles: ["admin", "staff"] },
    { id: "sessions" as View, label: "Phiên đỗ xe", icon: Car, roles: ["admin", "staff", "customer"] },
    { id: "vehicles" as View, label: "Phương tiện", icon: ScanLine, roles: ["admin", "staff", "customer"] },
    { id: "wallet" as View, label: "Ví & thanh toán", icon: Wallet, roles: ["admin", "customer"] },
    { id: "feedback" as View, label: "Phản hồi", icon: Bell, roles: ["customer", "admin"] },
    { id: "notifications" as View, label: "Thông báo", icon: Bell, roles: ["admin", "staff", "customer"] },
    { id: "shifts" as View, label: "Ca làm việc", icon: CalendarDays, roles: ["admin", "staff"] },
    { id: "incidents" as View, label: "Sự cố", icon: CircleAlert, roles: ["admin", "staff"] },
    { id: "ai" as View, label: "AI biển số", icon: Bot, roles: ["admin", "staff"] },
    { id: "devices" as View, label: "Camera & thiết bị", icon: Camera, roles: ["admin", "staff"] },
    { id: "users" as View, label: "Người dùng", icon: UsersRound, roles: ["admin"] },
    { id: "pricing" as View, label: "Cấu hình", icon: Settings, roles: ["admin"] },
    { id: "reports" as View, label: "Báo cáo", icon: BarChart3, roles: ["admin"] },
    { id: "security" as View, label: "Bảo mật", icon: KeyRound, roles: ["admin", "customer"] },
    { id: "profile" as View, label: "Hồ sơ", icon: UserRound, roles: ["admin", "staff", "customer"] },
  ].filter((item) => item.roles.includes(currentUser.role));

  return (
    <main className="app-shell">
      <aside className={mobileNavOpen ? "sidebar open" : "sidebar"}>
        <div className="brand app-brand">
          <ParkingCircle size={28} />
          <span>{parkingConfig.brandName}</span>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.id ? "active" : ""}
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileNavOpen(false);
                }}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="app-header">
          <button className="icon-button mobile-only" onClick={() => setMobileNavOpen(!mobileNavOpen)} type="button">
            <Menu size={20} />
          </button>
          <div>
            <p>{roleLabels[currentUser.role]}</p>
            <h1>{currentUser.name}</h1>
          </div>
          <button
            className="logout-button"
            onClick={async () => {
              await apiFetch("/auth/logout", { method: "POST" });
              setCurrentUser(null);
              setActionLog("Đã đăng xuất và xóa JWT cookie.");
            }}
            type="button"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </header>

        <div className="system-log">
          <CheckCircle2 size={16} />
          <span>{actionLog}</span>
        </div>

        {activeView === "overview" && (
          <Dashboard
            active={stats.active}
            available={stats.available}
            completion={stats.completion}
            revenue={stats.revenue}
          />
        )}

        {activeView === "sessions" && (
          <section className="content-grid">
            {currentUser.role !== "customer" && (
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p>Vận hành</p>
                    <h2>Xe vào bằng ảnh</h2>
                  </div>
                  <Camera size={22} />
                </div>
                <form className="stack-form" onSubmit={createSession}>
                  <label>
                    Chủ xe
                    <input name="owner" placeholder="Tên khách hàng" required />
                  </label>
                  <label>
                    Loại xe
                    <select name="vehicleType">
                      <option>Ô tô</option>
                    </select>
                  </label>
                  <label>
                    Ảnh xe vào
                    <input accept="image/*" name="entryImage" required type="file" />
                  </label>
                  <button className="full-button" type="submit">
                    <Upload size={18} />
                    Upload và nhận diện
                  </button>
                </form>
              </div>
            )}

            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <p>Quản lý phiên</p>
                  <h2>Danh sách xe trong ngày</h2>
                </div>
                <div className="search-box">
                  <Search size={16} />
                  <input
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Tìm biển số, mã phiên"
                    value={searchText}
                  />
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã phiên</th>
                      <th>Biển số</th>
                      <th>Chủ xe</th>
                      <th>Vị trí</th>
                      <th>AI biển vào</th>
                      <th>Trạng thái</th>
                      <th>Match</th>
                      <th>Xác minh</th>
                      <th>Thanh toán</th>
                      <th>Điểm ảnh xe</th>
                      <th>Phí</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr key={session.id}>
                        <td>{session.id}</td>
                        <td>{session.plate}</td>
                        <td>{session.owner}</td>
                        <td>{session.slot}</td>
                        <td>
                          {session.entryDetectedPlate || session.plate}
                          {session.entryConfidence ? ` (${session.entryConfidence}%)` : ""}
                        </td>
                        <td>
                          <span className={session.status === "Đang gửi" ? "badge warning" : "badge success"}>
                            {session.status}
                          </span>
                        </td>
                        <td>
                          <span className={session.matchStatus === "Không khớp" ? "badge warning" : "badge"}>
                            {session.matchStatus || "Chưa checkout"}
                          </span>
                        </td>
                        <td>
                          <span className={session.verificationStatus === "Chờ duyệt" ? "badge warning" : "badge"}>
                            {session.verificationStatus || "Không cần"}
                          </span>
                        </td>
                        <td>
                          <span className={session.paymentStatus === "paid" ? "badge success" : "badge warning"}>
                            {session.paymentStatus === "paid"
                              ? "Đã thanh toán"
                              : session.paymentStatus === "pending"
                                ? "Chờ xác nhận"
                                : "Chưa thanh toán"}
                          </span>
                        </td>
                        <td>{session.vehicleMatchScore ? `${session.vehicleMatchScore}%` : "Chưa có"}</td>
                        <td>
                          <strong>
                            {session.feeBreakdown || session.status === "Đã hoàn thành"
                              ? currency.format(session.fee)
                              : "Chưa tính"}
                          </strong>
                          {session.feeBreakdown && (
                            <span className="muted-cell">
                              {session.feeBreakdown.totalMinutes} phút, {session.feeBreakdown.billableHours} giờ tính phí
                            </span>
                          )}
                        </td>
                        <td>
                          {session.verificationStatus === "Chờ duyệt" && currentUser.role === "admin" ? (
                            <button
                              className="small-button"
                              onClick={() => approveCheckout(session.id, session.exitDetectedPlate || session.plate)}
                              type="button"
                            >
                              Duyệt
                            </button>
                          ) : session.status === "Đã hoàn thành" && session.fee > 0 && session.paymentStatus !== "paid" ? (
                            <button className="small-button" onClick={() => createPaymentForSession(session.id)} type="button">
                              QR
                            </button>
                          ) : session.status === "Đang gửi" && currentUser.role !== "customer" ? (
                            <button className="small-button" onClick={() => setExitSessionId(session.id)} type="button">
                              Chọn checkout
                            </button>
                          ) : (
                            <ReceiptText size={18} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {currentUser.role !== "customer" && (
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p>Checkout</p>
                    <h2>Xe ra bằng ảnh</h2>
                  </div>
                  <ScanLine size={22} />
                </div>
                <form className="stack-form" onSubmit={checkoutWithImage}>
                  <label>
                    Phiên đang gửi
                    <select name="sessionId" onChange={(event) => setExitSessionId(event.target.value)} value={exitSessionId}>
                      <option value="">Chọn phiên</option>
                      {sessions
                        .filter((session) => session.status === "Đang gửi")
                        .map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.plate} - {session.slot}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Ảnh xe ra
                    <input accept="image/*" name="exitImage" required type="file" />
                  </label>
                  <button className="full-button" type="submit">
                    <ScanLine size={18} />
                    Upload và đối chiếu
                  </button>
                  <button className="link-button" onClick={() => exitSessionId && completeSession(exitSessionId)} type="button">
                    Xác minh thủ công nếu ảnh lỗi
                  </button>
                </form>
              </div>
            )}
          </section>
        )}

        {activeView === "users" && (
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p>Admin</p>
                <h2>Quản lý tài khoản</h2>
              </div>
              <UsersRound size={22} />
            </div>
            <div className="user-list">
              {userList.map((user) => (
                <div className="user-row" key={user.id}>
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <span className="badge">{roleLabels[user.role]}</span>
                  <span className="badge success">{user.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === "vehicles" && (
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p>Phương tiện</p>
                <h2>Xe đăng ký, blacklist và ngoại lệ</h2>
              </div>
              <ScanLine size={22} />
            </div>
            <DataTable
              headers={["Biển số", "Chủ xe", "Loại xe", "Trạng thái", "Thao tác"]}
              rows={registeredVehicles.map((vehicle) => [
                vehicle.plate,
                vehicle.owner,
                vehicle.type,
                vehicle.status,
                <button
                  className="small-button"
                  key={vehicle.plate}
                  onClick={async () => {
                    if (!vehicle.id) {
                      simulateAction("Xe này chưa có ID MongoDB để duyệt.");
                      return;
                    }
                    const response = await apiFetch("/vehicles", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: vehicle.id, status: "Đã đăng ký" }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                      simulateAction(data.message || "Không duyệt được phương tiện.");
                      return;
                    }
                    setRegisteredVehicles((items) =>
                      items.map((item) => (item.id === vehicle.id ? data.vehicle : item)),
                    );
                    simulateAction(`Đã duyệt xe ${vehicle.plate} trong MongoDB.`);
                  }}
                  type="button"
                >
                  Duyệt
                </button>,
              ])}
            />
          </div>
        )}

        {activeView === "wallet" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>VietQR</p>
                  <h2>{paymentConfigState.bankName}</h2>
                </div>
                <QrCode size={22} />
              </div>
              {currentUser.role === "admin" ? (
                <form className="stack-form" key={paymentConfigState.id} onSubmit={updatePaymentConfig}>
                  <label>
                    Ngân hàng
                    <input defaultValue={paymentConfigState.bankName} name="bankName" required />
                  </label>
                  <label>
                    BIN ngân hàng
                    <input defaultValue={paymentConfigState.bankBin} name="bankBin" required />
                  </label>
                  <label>
                    Số tài khoản
                    <input defaultValue={paymentConfigState.accountNumber} name="accountNumber" required />
                  </label>
                  <label>
                    Chủ tài khoản
                    <input defaultValue={paymentConfigState.accountName} name="accountName" required />
                  </label>
                  <label>
                    Tiền tố nội dung
                    <input defaultValue={paymentConfigState.transferPrefix} name="transferPrefix" required />
                  </label>
                  <button className="full-button" type="submit">
                    <Settings size={18} />
                    Lưu VietQR
                  </button>
                </form>
              ) : (
                <div className="profile-lines">
                  <span>Số dư ví: {currency.format(currentUser.wallet || 0)}</span>
                  <span>Nội dung chuyển khoản dùng theo từng phiên gửi xe.</span>
                </div>
              )}
            </div>
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <p>Giao dịch</p>
                  <h2>Lịch sử thanh toán</h2>
                </div>
                <CreditCard size={22} />
              </div>
              <DataTable
                headers={["Mã", "Phương thức", "Số tiền", "Trạng thái", "Nội dung", "QR", "Thao tác"]}
                rows={(transactionList.length ? transactionList : transactions.map((item) => ({
                  id: item.id,
                  method: item.method,
                  amount: item.amount,
                  status: item.status === "Thành công" ? "paid" : "pending",
                  content: item.id,
                  createdAt: item.time,
                } as TransactionItem))).map((item) => [
                  item.id,
                  item.method,
                  currency.format(item.amount),
                  item.status,
                  item.content,
                  item.qrUrl ? (
                    <a className="small-button" href={item.qrUrl} key={`${item.id}-qr`} rel="noreferrer" target="_blank">
                      QR
                    </a>
                  ) : (
                    "Không có"
                  ),
                  item.status === "pending" && currentUser.role === "admin" ? (
                    <button className="small-button" key={item.id} onClick={() => confirmTransaction(item.id)} type="button">
                      Xác nhận
                    </button>
                  ) : (
                    "OK"
                  ),
                ])}
              />
            </div>
          </section>
        )}

        {activeView === "feedback" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Phản hồi</p>
                  <h2>Gửi phản hồi</h2>
                </div>
                <Bell size={22} />
              </div>
              <form className="stack-form" onSubmit={createFeedback}>
                <label>
                  Chủ đề
                  <input name="subject" placeholder="Ví dụ: nhầm phí gửi xe" required />
                </label>
                <label>
                  Nội dung
                  <input name="content" placeholder="Nhập nội dung phản hồi" required />
                </label>
                <button className="full-button" type="submit">
                  Gửi phản hồi
                </button>
              </form>
            </div>
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <p>Lịch sử</p>
                  <h2>Phản hồi đã gửi</h2>
                </div>
                <ReceiptText size={22} />
              </div>
              <DataTable
                headers={["Chủ đề", "Nội dung", "Trạng thái", "Phản hồi", "Thao tác"]}
                rows={feedbackList.map((item) => [
                  item.subject,
                  item.content,
                  item.status,
                  item.response || "Chưa có",
                  currentUser.role === "admin" && item.status !== "Đã phản hồi" ? (
                    <button className="small-button" key={item.id} onClick={() => updateFeedbackStatus(item.id)} type="button">
                      Phản hồi
                    </button>
                  ) : (
                    "OK"
                  ),
                ])}
              />
            </div>
          </section>
        )}

        {activeView === "notifications" && (
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p>Thông báo</p>
                <h2>Đăng ký, xe ra, thanh toán, OCR</h2>
              </div>
              <Bell size={22} />
            </div>
            <DataTable
              headers={["Tiêu đề", "Nội dung", "Trạng thái", "Thao tác"]}
              rows={(notificationList.length
                ? notificationList
                : notifications.map((content, index) => ({
                    id: String(index),
                    title: "Demo",
                    content,
                    read: false,
                    createdAt: "",
                  }))).map((item) => [
                item.title,
                item.content,
                item.read ? "Đã đọc" : "Mới",
                item.read ? (
                  "OK"
                ) : (
                  <button className="small-button" key={item.id} onClick={() => markNotificationRead(item.id)} type="button">
                    Đã đọc
                  </button>
                ),
              ])}
            />
          </div>
        )}

        {activeView === "shifts" && (
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p>Nhân viên</p>
                <h2>Quản lý ca làm việc</h2>
              </div>
              <CalendarDays size={22} />
            </div>
            <form className="action-row" onSubmit={startShift}>
              <input name="name" placeholder="Tên ca làm" required />
              <input name="note" placeholder="Ghi chú" />
              <button type="submit">
                <Clock3 size={18} />
                Bắt đầu ca
              </button>
            </form>
            <DataTable
              headers={["Ca", "Bắt đầu", "Kết thúc", "Trạng thái", "Thao tác"]}
              rows={(shiftList.length
                ? shiftList
                : shiftRows.map((item, index) => ({
                    id: String(index),
                    name: item.name,
                    startAt: item.time,
                    endAt: "",
                    status: item.status === "Đang làm" ? "Đang làm" : "Đã kết thúc",
                  } as ShiftItem))).map((item) => [
                item.name,
                new Date(item.startAt).toString() === "Invalid Date" ? item.startAt : new Date(item.startAt).toLocaleString("vi-VN"),
                item.endAt ? new Date(item.endAt).toLocaleString("vi-VN") : "Chưa kết thúc",
                item.status,
                item.status === "Đang làm" && shiftList.length ? (
                  <button className="small-button" key={item.id} onClick={() => endShift(item.id)} type="button">
                    Kết thúc
                  </button>
                ) : (
                  "OK"
                ),
              ])}
            />
          </div>
        )}

        {activeView === "incidents" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Sự cố</p>
                  <h2>Tạo báo cáo</h2>
                </div>
                <CircleAlert size={22} />
              </div>
              <form className="stack-form" onSubmit={createIncident}>
                <label>
                  Loại sự cố
                  <select name="type">
                    <option>Xe blacklist</option>
                    <option>Lỗi nhận dạng</option>
                    <option>Yêu cầu miễn phạt</option>
                    <option>Camera offline</option>
                    <option>Khác</option>
                  </select>
                </label>
                <label>
                  Biển số
                  <input name="plate" placeholder="Nếu có" />
                </label>
                <label>
                  Ghi chú
                  <input name="note" placeholder="Nhập ghi chú xử lý" required />
                </label>
                <button className="full-button" type="submit">
                  Lưu sự cố
                </button>
              </form>
            </div>
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <p>Xử lý</p>
                  <h2>Hàng đợi sự cố</h2>
                </div>
                <Ban size={22} />
              </div>
              <DataTable
                headers={["Loại", "Biển số", "Ghi chú", "Trạng thái", "Thao tác"]}
                rows={incidentList.map((item) => [
                  item.type,
                  item.plate || "Không có",
                  item.note,
                  item.status,
                  item.status !== "Đã xử lý" && currentUser.role === "admin" ? (
                    <button className="small-button" key={item.id} onClick={() => resolveIncident(item.id)} type="button">
                      Xử lý
                    </button>
                  ) : (
                    "OK"
                  ),
                ])}
              />
            </div>
          </section>
        )}

        {activeView === "ai" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>AI nhận dạng</p>
                  <h2>Tải ảnh xe lên</h2>
                </div>
                <Bot size={22} />
              </div>
              <div className="upload-box">
                <Upload size={28} />
                <span>Upload ảnh xe vào/ra để mô phỏng nhận dạng biển số</span>
                <button onClick={() => simulateAction("AI thật đang chạy qua upload ảnh xe ở module Phiên đỗ xe.")} type="button">
                  Chạy nhận dạng
                </button>
              </div>
            </div>
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <p>Queue</p>
                  <h2>Biển số, loại xe, màu xe, lỗi nhận dạng</h2>
                </div>
                <ScanLine size={22} />
              </div>
              <DataTable
                headers={["Biển số", "Tin cậy", "Loại xe", "Màu", "Tình trạng"]}
                rows={aiQueue.map((item) => [item.plate, item.confidence, item.type, item.color, item.issue])}
              />
            </div>
          </section>
        )}

        {activeView === "devices" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Thiết bị</p>
                  <h2>Cấu hình camera RTSP</h2>
                </div>
                <Camera size={22} />
              </div>
              <form className="stack-form" onSubmit={saveDevice}>
                <label>
                  Tên camera
                  <input name="name" placeholder="Camera cổng vào" required />
                </label>
                <label>
                  Cổng
                  <select name="gate">
                    <option value="entry">Cổng vào</option>
                    <option value="exit">Cổng ra</option>
                  </select>
                </label>
                <label>
                  RTSP/HTTP URL
                  <input name="rtspUrl" placeholder="rtsp://..." required />
                </label>
                <label>
                  Username
                  <input name="username" />
                </label>
                <label>
                  Password
                  <input name="password" type="password" />
                </label>
                <label>
                  ROI
                  <input name="roiNote" placeholder="Biển số trước/sau" />
                </label>
                <button className="full-button" type="submit">
                  <Wrench size={18} />
                  Lưu camera
                </button>
              </form>
            </div>
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <p>RTSP</p>
                  <h2>Trạng thái và snapshot</h2>
                </div>
                <RefreshCcw size={22} />
              </div>
              <DataTable
                headers={["Thiết bị", "Cổng", "Trạng thái", "Ảnh gần nhất", "ROI", "Thao tác"]}
                rows={(deviceList.length
                  ? deviceList
                  : devices.map((item, index) => ({
                      id: String(index),
                      name: item.name,
                      gate: index === 0 ? "entry" : "exit",
                      rtspUrl: "",
                      status: "unknown",
                      lastSnapshotUrl: "",
                      roiNote: item.roi,
                    } as DeviceItem))).map((item) => [
                  item.name,
                  item.gate === "entry" ? "Vào" : "Ra",
                  item.status,
                  item.lastSnapshotUrl ? (
                    <a href={item.lastSnapshotUrl} key={`${item.id}-shot`} rel="noreferrer" target="_blank">
                      Xem ảnh
                    </a>
                  ) : (
                    "Chưa có"
                  ),
                  item.roiNote || "Chưa có",
                  <div className="inline-actions" key={item.id}>
                    {deviceList.length ? (
                      <button className="small-button" onClick={() => snapshotDevice(item.id)} type="button">
                        Snapshot
                      </button>
                    ) : null}
                    {item.gate === "entry" && deviceList.length ? (
                      <button className="small-button" onClick={() => cameraEntry(item.id)} type="button">
                        Xe vào
                      </button>
                    ) : null}
                    {item.gate === "exit" && deviceList.length ? (
                      <button className="small-button" onClick={() => cameraExit(item.id)} type="button">
                        Xe ra
                      </button>
                    ) : null}
                  </div>,
                ])}
              />
            </div>
          </section>
        )}

        {activeView === "pricing" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Admin</p>
                  <h2>Cấu hình bảng giá</h2>
                </div>
                <Settings size={22} />
              </div>
              <form className="stack-form" key={pricingConfigState.updatedAt || pricingConfigState.id} onSubmit={updatePricing}>
                <label>
                  Phút miễn phí
                  <input defaultValue={pricingConfigState.freeMinutes} min={0} name="freeMinutes" required type="number" />
                </label>
                <label>
                  Giá theo giờ
                  <input defaultValue={pricingConfigState.hourlyRate} min={0} name="hourlyRate" required type="number" />
                </label>
                <label>
                  Giá qua đêm
                  <input defaultValue={pricingConfigState.overnightRate} min={0} name="overnightRate" required type="number" />
                </label>
                <label>
                  Gói tháng
                  <input defaultValue={pricingConfigState.monthlyRate} min={0} name="monthlyRate" required type="number" />
                </label>
                <label>
                  Phạt quá hạn
                  <input defaultValue={pricingConfigState.overdueFineRate} min={0} name="overdueFineRate" required type="number" />
                </label>
                <button className="full-button" type="submit">
                  <Settings size={18} />
                  Lưu bảng giá
                </button>
              </form>
            </div>
            <div className="panel wide">
              <div className="panel-heading">
                <div>
                  <p>Bảng giá hiện tại</p>
                  <h2>Áp dụng khi checkout</h2>
                </div>
                <ReceiptText size={22} />
              </div>
              <DataTable
                headers={["Hạng mục", "Giá trị"]}
                rows={[
                  ["Miễn phí đầu", `${pricingConfigState.freeMinutes} phút`],
                  ["Theo giờ", currency.format(pricingConfigState.hourlyRate)],
                  ["Qua đêm", currency.format(pricingConfigState.overnightRate)],
                  ["Gói tháng", currency.format(pricingConfigState.monthlyRate)],
                  ["Phạt quá hạn", currency.format(pricingConfigState.overdueFineRate)],
                  ["Sức chứa", `${parkingConfig.totalCapacity} chỗ, khu A/B/C`],
                ]}
              />
            </div>
          </section>
        )}

        {activeView === "reports" && (
          <section className="dashboard">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Báo cáo</p>
                  <h2>Doanh thu và lượt xe</h2>
                </div>
                <FileDown size={22} />
              </div>
              <div className="report-filters">
                <label>
                  Từ ngày
                  <input onChange={(event) => setReportFrom(event.target.value)} type="date" value={reportFrom} />
                </label>
                <label>
                  Đến ngày
                  <input onChange={(event) => setReportTo(event.target.value)} type="date" value={reportTo} />
                </label>
              </div>
              <div className="action-grid">
                <button onClick={() => loadReportSummary(reportFrom, reportTo)} type="button">
                  <RefreshCcw size={18} />
                  Tải lại
                </button>
                <button onClick={() => downloadReport("sessions")} type="button">
                  <FileDown size={18} />
                  Phiên đỗ xe
                </button>
                <button onClick={() => downloadReport("revenue")} type="button">
                  <FileDown size={18} />
                  Doanh thu
                </button>
                <button onClick={() => downloadReport("revenue", "pdf")} type="button">
                  <FileDown size={18} />
                  PDF
                </button>
              </div>
            </div>
            <div className="metric-grid">
              <Metric icon={<Car />} label="Xe vào" value={String(reportSummary?.entryCount ?? 0)} />
              <Metric icon={<ReceiptText />} label="Xe ra" value={String(reportSummary?.exitCount ?? 0)} />
              <Metric icon={<ParkingCircle />} label="Đang gửi" value={String(reportSummary?.activeCount ?? stats.active)} />
              <Metric icon={<CreditCard />} label="Doanh thu" value={currency.format(reportSummary?.revenue ?? 0)} />
            </div>
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Chi tiết</p>
                  <h2>Phiên miễn phí và có phí</h2>
                </div>
                <BarChart3 size={22} />
              </div>
              <DataTable
                headers={["Khoảng ngày", "Phiên miễn phí", "Phiên có phí", "Tổng phiên ra", "Doanh thu"]}
                rows={[
                  [
                    reportSummary ? `${reportSummary.from} - ${reportSummary.to}` : `${reportFrom} - ${reportTo}`,
                    String(reportSummary?.freeSessionCount ?? 0),
                    String(reportSummary?.paidSessionCount ?? 0),
                    String(reportSummary?.exitCount ?? 0),
                    currency.format(reportSummary?.revenue ?? 0),
                  ],
                ]}
              />
            </div>
          </section>
        )}

        {activeView === "security" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Xác thực</p>
                  <h2>Mật khẩu, OTP, JWT, 2FA</h2>
                </div>
                <KeyRound size={22} />
              </div>
              <div className="action-grid">
                <button onClick={() => setMode("forgot")} type="button">
                  <Mail size={18} />
                  Reset OTP
                </button>
                {currentUser.role === "admin" && (
                  <button onClick={setupTwoFactor} type="button">
                    <Smartphone size={18} />
                    Tạo QR 2FA
                  </button>
                )}
                <button
                  onClick={async () => {
                    await apiFetch("/auth/logout", { method: "POST" });
                    setCurrentUser(null);
                    setActionLog("Đã thu hồi phiên hoạt động hiện tại.");
                  }}
                  type="button"
                >
                  <LogOut size={18} />
                  Thu hồi phiên
                </button>
              </div>
              {twoFactorQr && (
                <div className="qr-panel">
                  <Image alt="QR 2FA" height={220} src={twoFactorQr} unoptimized width={220} />
                  <form className="stack-form" onSubmit={verifyTwoFactor}>
                    <label>
                      Mã 2FA
                      <input name="code" placeholder="123456" required />
                    </label>
                    <button className="full-button" type="submit">
                      Bật 2FA
                    </button>
                  </form>
                </div>
              )}
              {currentUser.role === "admin" && currentUser.twoFactorEnabled && (
                <form className="stack-form" onSubmit={disableTwoFactor}>
                  <label>
                    Mã 2FA để tắt
                    <input name="code" placeholder="123456" required />
                  </label>
                  <button className="full-button" type="submit">
                    Tắt 2FA
                  </button>
                </form>
              )}
            </div>
            <ModuleList
              icon={<CheckCircle2 size={22} />}
              kicker="Phiên"
              title="Quản lý phiên hoạt động"
              items={[
                "JWT cookie httpOnly",
                `2FA admin: ${currentUser.twoFactorEnabled ? "Đã bật" : "Chưa bật"}`,
                `Google OAuth: ${currentUser.provider === "google" || currentUser.provider === "mixed" ? "Đã liên kết" : "Sẵn sàng"}`,
              ]}
            />
          </section>
        )}

        {activeView === "profile" && (
          <section className="content-grid">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Hồ sơ</p>
                  <h2>{currentUser.name}</h2>
                </div>
                <UserRound size={22} />
              </div>
              <div className="profile-lines">
                <span>Email: {currentUser.email}</span>
                <span>Vai trò: {roleLabels[currentUser.role]}</span>
                <span>Trạng thái: {currentUser.status}</span>
              </div>
            </div>
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Ví điện tử</p>
                  <h2>{currency.format(currentUser.wallet)}</h2>
                </div>
                <Wallet size={22} />
              </div>
              <div className="profile-lines">
                <span>Giao dịch gần nhất: Thanh toán gửi xe PX-1027</span>
                <span>Phương thức: Ví nội bộ MVP</span>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Dashboard({
  active,
  available,
  completion,
  revenue,
  reportsOnly = false,
}: {
  active: number;
  available: number;
  completion: number;
  revenue: number;
  reportsOnly?: boolean;
}) {
  return (
    <section className="dashboard">
      <div className="metric-grid">
        <Metric icon={<Car />} label="Xe đang gửi" value={String(active)} />
        <Metric icon={<ParkingCircle />} label="Chỗ còn trống" value={String(available)} />
        <Metric icon={<CreditCard />} label="Doanh thu hôm nay" value={currency.format(revenue)} />
        <Metric icon={<ReceiptText />} label="Phiên đã hoàn thành" value={String(completion)} />
      </div>
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>{reportsOnly ? "Báo cáo" : "Tổng quan"}</p>
            <h2>Hiệu suất bãi xe trong ngày</h2>
          </div>
          <BarChart3 size={22} />
        </div>
        <div className="chart-bars">
          {[
            ["06:00", 38],
            ["08:00", 82],
            ["10:00", 64],
            ["12:00", 56],
            ["14:00", 73],
            ["16:00", 91],
          ].map(([label, value]) => (
            <div className="bar-item" key={label}>
              <div style={{ height: `${value}%` }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModuleList({
  icon,
  kicker,
  title,
  items,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p>{kicker}</p>
          <h2>{title}</h2>
        </div>
        {icon}
      </div>
      <div className="module-list">
        {items.map((item) => (
          <div className="module-item" key={item}>
            <CheckCircle2 size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
