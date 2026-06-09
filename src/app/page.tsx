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
import { FormEvent, useEffect, useMemo, useState } from "react";

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
};

type RegisteredVehicle = {
  id?: string;
  plate: string;
  owner: string;
  type: "Ô tô" | string;
  status: "Đã đăng ký" | "Cần duyệt" | "Blacklist" | string;
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

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me");
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
          fetch("/api/parking-sessions"),
          fetch("/api/vehicles"),
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
          const userResponse = await fetch("/api/users");
          if (userResponse.ok) {
            const data = await userResponse.json();
            setUserList(data.users);
          }
        }
      } catch {
        setActionLog("Không tải được dữ liệu vận hành từ MongoDB local.");
      }
    }

    loadOperationalData();
  }, [currentUser]);

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

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
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
      const response = await fetch("/api/auth/register", {
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

      const response = await fetch("/api/parking-sessions/upload", { method: "POST", body: payload });
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
      const response = await fetch("/api/parking-sessions/upload", { method: "POST", body: payload });
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
      const response = await fetch("/api/parking-sessions", {
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
                  {authError && <p className="form-error">{authError}</p>}
                  <button className="full-button" type="submit">
                    <LogIn size={18} />
                    Vào hệ thống
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
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setAuthError("OTP email đang chờ cấu hình SMTP thật.");
                  }}
                >
                  <label>
                    Email nhận OTP
                    <input name="email" placeholder="email@example.com" required type="email" />
                  </label>
                  <label>
                    Mã OTP
                    <input name="otp" placeholder="123456" />
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
              await fetch("/api/auth/logout", { method: "POST" });
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
                        <td>{session.vehicleMatchScore ? `${session.vehicleMatchScore}%` : "Chưa có"}</td>
                        <td>{session.fee ? currency.format(session.fee) : "Chưa tính"}</td>
                        <td>
                          {session.status === "Đang gửi" && currentUser.role !== "customer" ? (
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
                    const response = await fetch("/api/vehicles", {
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
                  <p>Số dư ví</p>
                  <h2>{currency.format(currentUser.wallet || 520000)}</h2>
                </div>
                <Wallet size={22} />
              </div>
              <div className="action-grid">
                <button onClick={() => simulateAction("Đã tạo yêu cầu nạp ví. Cần cấu hình cổng thanh toán để xác nhận thật.")} type="button">
                  <Plus size={18} />
                  Nạp ví
                </button>
                <button onClick={() => simulateAction("VietQR đang chờ thông tin ngân hàng test.")} type="button">
                  <QrCode size={18} />
                  VietQR
                </button>
                <button onClick={() => simulateAction("Kiểm tra thanh toán đang chờ tích hợp provider thật.")} type="button">
                  <RefreshCcw size={18} />
                  Kiểm tra
                </button>
              </div>
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
                headers={["Mã", "Phương thức", "Số tiền", "Trạng thái", "Thời gian"]}
                rows={transactions.map((item) => [
                  item.id,
                  item.method,
                  currency.format(item.amount),
                  item.status,
                  item.time,
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
              <form
                className="stack-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  simulateAction("Đã ghi nhận phản hồi khách hàng trên giao diện. Cần API lưu phản hồi để hoàn chỉnh.");
                  event.currentTarget.reset();
                }}
              >
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
            <ModuleList
              icon={<ReceiptText size={22} />}
              kicker="Lịch sử"
              title="Phản hồi đã gửi"
              items={["Yêu cầu miễn phạt PX-1024 - Đang xử lý", "Góp ý khu B thiếu biển chỉ dẫn - Đã tiếp nhận"]}
            />
          </section>
        )}

        {activeView === "notifications" && (
          <ModuleList
            icon={<Bell size={22} />}
            kicker="Thông báo"
            title="Đăng ký, xe ra, phạt, số dư thấp, khuyến mãi"
            items={notifications}
          />
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
            <div className="action-row">
              <button onClick={() => simulateAction("Đã bắt đầu ca làm việc trên giao diện. Cần API ca làm để lưu lâu dài.")} type="button">
                <Clock3 size={18} />
                Bắt đầu ca
              </button>
              <button onClick={() => simulateAction("Đã kết thúc ca trên giao diện. Cần API báo cáo ca để lưu lâu dài.")} type="button">
                <ReceiptText size={18} />
                Kết thúc ca
              </button>
            </div>
            <DataTable
              headers={["Ca", "Nhân viên", "Thời gian", "Trạng thái"]}
              rows={shiftRows.map((item) => [item.name, item.staff, item.time, item.status])}
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
              <form
                className="stack-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  simulateAction("Đã tạo báo cáo sự cố trên giao diện. Cần API sự cố để lưu lâu dài.");
                  event.currentTarget.reset();
                }}
              >
                <label>
                  Loại sự cố
                  <select name="type">
                    <option>Xe blacklist</option>
                    <option>Lỗi nhận dạng</option>
                    <option>Yêu cầu miễn phạt</option>
                  </select>
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
            <ModuleList
              icon={<Ban size={22} />}
              kicker="Xử lý"
              title="Hàng đợi sự cố"
              items={["30K-999.99 thuộc blacklist - Cần xác minh", "PX-1021 xin miễn phạt quá hạn", "Camera B offline"]}
            />
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
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p>Thiết bị</p>
                <h2>Camera, ROI, trạng thái kết nối</h2>
              </div>
              <Camera size={22} />
            </div>
            <div className="action-row">
              <button onClick={() => simulateAction("Restart thiết bị đang chờ tích hợp RTSP/device API thật.")} type="button">
                <RefreshCcw size={18} />
                Restart thiết bị
              </button>
              <button onClick={() => simulateAction("Đã lưu cấu hình ROI camera. Cần RTSP thật để kiểm tra live.")} type="button">
                <Wrench size={18} />
                Cấu hình ROI
              </button>
            </div>
            <DataTable
              headers={["Thiết bị", "Trạng thái", "Ảnh gần nhất", "ROI"]}
              rows={devices.map((item) => [item.name, item.status, item.lastShot, item.roi])}
            />
          </div>
        )}

        {activeView === "pricing" && (
          <section className="content-grid">
            <PricingCard title="Miễn phí" price={`${parkingConfig.freeMinutes} phút đầu`} note="Sau thời gian miễn phí mới tính phí theo bảng giá thật" />
            <PricingCard title="Sức chứa" price={`${parkingConfig.totalCapacity} chỗ`} note="Khu A/B/C, mỗi khu 10 ô tô" />
            <PricingCard title="Bảng giá" price="Chưa chốt" note="Dũng chưa gửi giá theo giờ/đêm/tháng và mức phạt quá hạn" />
          </section>
        )}

        {activeView === "reports" && (
          <section className="dashboard">
            <Dashboard
              active={stats.active}
              available={stats.available}
              completion={stats.completion}
              revenue={stats.revenue}
              reportsOnly
            />
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p>Xuất báo cáo</p>
                  <h2>PDF / Excel</h2>
                </div>
                <FileDown size={22} />
              </div>
              <div className="action-grid">
                <button onClick={() => simulateAction("Chức năng xuất doanh thu đang chờ mẫu báo cáo thật.")} type="button">
                  Doanh thu
                </button>
                <button onClick={() => simulateAction("Chức năng xuất thống kê đang chờ mẫu báo cáo thật.")} type="button">
                  Thống kê bãi
                </button>
                <button onClick={() => simulateAction("Chức năng xuất phạt/ví đang chờ mẫu báo cáo thật.")} type="button">
                  Phạt / ví
                </button>
              </div>
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
                <button onClick={() => simulateAction("OTP email đang chờ cấu hình SMTP thật.")} type="button">
                  <Mail size={18} />
                  Gửi OTP
                </button>
                <button onClick={() => simulateAction("2FA admin đang chờ triển khai xác thực thật.")} type="button">
                  <Smartphone size={18} />
                  Bật 2FA
                </button>
                <button onClick={() => simulateAction("Đã thu hồi phiên hoạt động hiện tại qua cookie JWT.")} type="button">
                  <LogOut size={18} />
                  Thu hồi phiên
                </button>
              </div>
            </div>
            <ModuleList
              icon={<CheckCircle2 size={22} />}
              kicker="Phiên"
              title="Quản lý phiên hoạt động"
              items={["JWT cookie httpOnly", "Đăng nhập gần nhất: trình duyệt hiện tại", "Google OAuth: chờ client ID"]}
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

function PricingCard({ title, price, note }: { title: string; price: string; note: string }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p>Cấu hình</p>
          <h2>{title}</h2>
        </div>
        <Settings size={22} />
      </div>
      <strong className="price-text">{price}</strong>
      <p className="muted-text">{note}</p>
    </div>
  );
}
