"use client";

import {
  BarChart3,
  Camera,
  Car,
  CheckCircle2,
  Clock3,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ParkingCircle,
  Plus,
  ReceiptText,
  Search,
  Settings,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Role = "admin" | "staff" | "customer";
type View = "overview" | "sessions" | "users" | "pricing" | "reports" | "profile";

type DemoUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: "Đang hoạt động" | "Đã khóa";
  wallet: number;
};

type ParkingSession = {
  id: string;
  plate: string;
  owner: string;
  vehicleType: "Ô tô" | "Xe máy";
  checkIn: string;
  checkOut?: string;
  slot: string;
  status: "Đang gửi" | "Đã hoàn thành";
  fee: number;
};

const demoUsers: DemoUser[] = [
  {
    id: 1,
    name: "Quản trị viên",
    email: "admin@parking.local",
    password: "123456",
    role: "admin",
    status: "Đang hoạt động",
    wallet: 0,
  },
  {
    id: 2,
    name: "Nhân viên ca sáng",
    email: "staff@parking.local",
    password: "123456",
    role: "staff",
    status: "Đang hoạt động",
    wallet: 0,
  },
  {
    id: 3,
    name: "Khách hàng demo",
    email: "customer@parking.local",
    password: "123456",
    role: "customer",
    status: "Đang hoạt động",
    wallet: 250000,
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
  },
  {
    id: "PX-1027",
    plate: "29B1-345.67",
    owner: "Trần Hoàng Nam",
    vehicleType: "Xe máy",
    checkIn: "07:40",
    checkOut: "10:20",
    slot: "B-04",
    status: "Đã hoàn thành",
    fee: 18000,
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
  },
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

function calculateFee(vehicleType: ParkingSession["vehicleType"]) {
  return vehicleType === "Ô tô" ? 35000 : 12000;
}

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [activeView, setActiveView] = useState<View>("overview");
  const [sessions, setSessions] = useState<ParkingSession[]>(initialSessions);
  const [searchText, setSearchText] = useState("");
  const [authError, setAuthError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const stats = useMemo(() => {
    const active = sessions.filter((item) => item.status === "Đang gửi").length;
    const revenue = sessions.reduce((sum, item) => sum + item.fee, 0);

    return {
      active,
      available: 120 - active,
      revenue,
      completion: sessions.filter((item) => item.status === "Đã hoàn thành").length,
    };
  }, [sessions]);

  const filteredSessions = sessions.filter((session) => {
    const value = `${session.plate} ${session.owner} ${session.id}`.toLowerCase();
    return value.includes(searchText.toLowerCase());
  });

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    // TODO: Thay mock auth này bằng API đăng nhập + JWT khi triển khai backend MongoDB.
    const user = demoUsers.find((item) => item.email === email && item.password === password);
    if (!user) {
      setAuthError("Email hoặc mật khẩu không đúng.");
      return;
    }

    setAuthError("");
    setCurrentUser(user);
    setActiveView(user.role === "customer" ? "profile" : "overview");
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();

    setAuthError("");
    setCurrentUser({
      id: Date.now(),
      name: name || "Khách hàng mới",
      email,
      password: "123456",
      role: "customer",
      status: "Đang hoạt động",
      wallet: 0,
    });
    setActiveView("profile");
  }

  function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const plate = String(form.get("plate") ?? "").toUpperCase();
    const vehicleType = String(form.get("vehicleType") ?? "Ô tô") as ParkingSession["vehicleType"];

    // TODO: Sau này lấy slot trống từ API thay vì tính demo trên client.
    setSessions((items) => [
      {
        id: `PX-${1030 + items.length}`,
        plate,
        owner: String(form.get("owner") ?? "Khách vãng lai"),
        vehicleType,
        checkIn: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        slot: vehicleType === "Ô tô" ? "A-15" : "B-09",
        status: "Đang gửi",
        fee: 0,
      },
      ...items,
    ]);
    event.currentTarget.reset();
  }

  function completeSession(id: string) {
    setSessions((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Đã hoàn thành",
              checkOut: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              fee: calculateFee(item.vehicleType),
            }
          : item,
      ),
    );
  }

  if (!currentUser) {
    return (
      <main className="public-shell">
        <section className="hero">
          <nav className="topbar">
            <div className="brand">
              <ParkingCircle size={28} />
              <span>Bãi Đỗ Xe</span>
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
              <h1>Bãi Đỗ Xe</h1>
              <p>
                Theo dõi chỗ trống, ghi nhận xe vào/ra, tính phí gửi xe và phân quyền vận hành cho
                quản trị viên, nhân viên, khách hàng.
              </p>
              <div className="status-strip">
                <div>
                  <span>Đang gửi</span>
                  <strong>42 xe</strong>
                </div>
                <div>
                  <span>Còn trống</span>
                  <strong>78 chỗ</strong>
                </div>
                <div>
                  <span>Camera</span>
                  <strong>06/06</strong>
                </div>
              </div>
              <div className="hero-actions">
                <button onClick={() => setMode("login")} type="button">
                  <LogIn size={18} />
                  Dùng tài khoản demo
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
              {mode === "login" ? (
                <form onSubmit={handleLogin}>
                  <label>
                    Email
                    <input name="email" defaultValue="admin@parking.local" type="email" />
                  </label>
                  <label>
                    Mật khẩu
                    <input name="password" defaultValue="123456" type="password" />
                  </label>
                  {authError && <p className="form-error">{authError}</p>}
                  <button className="full-button" type="submit">
                    <LogIn size={18} />
                    Vào hệ thống
                  </button>
                  <div className="demo-accounts">
                    <span>Demo:</span>
                    <code>admin@parking.local</code>
                    <code>staff@parking.local</code>
                    <code>customer@parking.local</code>
                  </div>
                </form>
              ) : (
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
            </div>
          </div>
        </section>

        <section className="public-section">
          <div>
            <span className="section-kicker">Tình trạng bãi xe</span>
            <h2>120 vị trí, cập nhật theo dữ liệu demo</h2>
          </div>
          <div className="metric-grid">
            <Metric icon={<Car />} label="Xe đang gửi" value="42" />
            <Metric icon={<CheckCircle2 />} label="Chỗ còn trống" value="78" />
            <Metric icon={<Camera />} label="Camera online" value="06/06" />
            <Metric icon={<Clock3 />} label="Thời gian xử lý" value="< 30s" />
          </div>
        </section>

        <section className="public-section compact" id="contact">
          <div>
            <span className="section-kicker">Liên hệ</span>
            <h2>Ban quản lý bãi đỗ xe</h2>
          </div>
          <p>Email: support@parking.local - Hotline: 0900 000 000 - Địa chỉ: Hà Nội</p>
        </section>
      </main>
    );
  }

  const navItems = [
    { id: "overview" as View, label: "Tổng quan", icon: LayoutDashboard, roles: ["admin", "staff"] },
    { id: "sessions" as View, label: "Phiên đỗ xe", icon: Car, roles: ["admin", "staff", "customer"] },
    { id: "users" as View, label: "Người dùng", icon: UsersRound, roles: ["admin"] },
    { id: "pricing" as View, label: "Cấu hình giá", icon: Settings, roles: ["admin"] },
    { id: "reports" as View, label: "Báo cáo", icon: BarChart3, roles: ["admin"] },
    { id: "profile" as View, label: "Hồ sơ", icon: UserRound, roles: ["admin", "staff", "customer"] },
  ].filter((item) => item.roles.includes(currentUser.role));

  return (
    <main className="app-shell">
      <aside className={mobileNavOpen ? "sidebar open" : "sidebar"}>
        <div className="brand app-brand">
          <ParkingCircle size={28} />
          <span>Bãi Đỗ Xe</span>
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
          <button className="logout-button" onClick={() => setCurrentUser(null)} type="button">
            <LogOut size={18} />
            Đăng xuất
          </button>
        </header>

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
                    <h2>Tạo phiên xe vào</h2>
                  </div>
                  <Camera size={22} />
                </div>
                <form className="stack-form" onSubmit={createSession}>
                  <label>
                    Biển số xe
                    <input name="plate" placeholder="30H-123.45" required />
                  </label>
                  <label>
                    Chủ xe
                    <input name="owner" placeholder="Tên khách hàng" required />
                  </label>
                  <label>
                    Loại xe
                    <select name="vehicleType">
                      <option>Ô tô</option>
                      <option>Xe máy</option>
                    </select>
                  </label>
                  <button className="full-button" type="submit">
                    <Plus size={18} />
                    Ghi nhận xe vào
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
                      <th>Trạng thái</th>
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
                          <span className={session.status === "Đang gửi" ? "badge warning" : "badge success"}>
                            {session.status}
                          </span>
                        </td>
                        <td>{session.fee ? currency.format(session.fee) : "Chưa tính"}</td>
                        <td>
                          {session.status === "Đang gửi" && currentUser.role !== "customer" ? (
                            <button className="small-button" onClick={() => completeSession(session.id)} type="button">
                              Xe ra
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
              {demoUsers.map((user) => (
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

        {activeView === "pricing" && (
          <section className="content-grid">
            <PricingCard title="Ô tô" price="35.000đ/lượt" note="Áp dụng trong ngày, quá giờ tính phase sau" />
            <PricingCard title="Xe máy" price="12.000đ/lượt" note="Dành cho khách vãng lai và khách có tài khoản" />
            <PricingCard title="Sức chứa" price="120 chỗ" note="MVP đang dùng dữ liệu demo, backend sẽ quản lý theo khu" />
          </section>
        )}

        {activeView === "reports" && (
          <Dashboard
            active={stats.active}
            available={stats.available}
            completion={stats.completion}
            revenue={stats.revenue}
            reportsOnly
          />
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
