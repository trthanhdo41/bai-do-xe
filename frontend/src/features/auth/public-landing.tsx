"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Camera,
  CheckCircle2,
  Clock3,
  LogIn,
  Mail,
  ParkingCircle,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import { Metric } from "@/components/ui/metric";
import { useParkingApp } from "@/context/parking-app-context";
import { apiBaseUrl } from "@/lib/constants";
import { parkingConfig } from "@/lib/parking-config";

type ZoneAvailability = {
  zone: string;
  description?: string;
  total: number;
  available: number;
  occupied: number;
  allowedVehicleTypes: string[];
};

function ParkingAvailability() {
  const [zones, setZones] = useState<ZoneAvailability[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ zone: string; description?: string; available: number; total: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadAvailability() {
      try {
        const response = await fetch(`${apiBaseUrl}/public/availability`);
        if (response.ok) {
          const data = await response.json();
          setZones(data.zones);
          setTotalAvailable(data.available);
          setTotalCapacity(data.capacity);
          setLoaded(true);
        }
      } catch {
        // Silently fail for public page
      }
    }
    loadAvailability();
    // Refresh every 30 seconds
    const interval = setInterval(loadAvailability, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(`${apiBaseUrl}/public/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <div>
      {/* Search */}
      <div className="filter-row" style={{ marginBottom: 16 }}>
        <div className="search-box" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Tìm khu vực, loại xe..."
            value={searchQuery}
          />
        </div>
        <button className="small-button" onClick={handleSearch} type="button">Tìm kiếm</button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="metric-grid" style={{ marginBottom: 20 }}>
          {searchResults.map((r) => (
            <div className="metric-card" key={r.zone}>
              <span>Khu {r.zone}</span>
              <strong>{r.available} / {r.total} trống</strong>
              {r.description && <span style={{ fontSize: "0.75rem" }}>{r.description}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Realtime availability grid */}
      {loaded && (
        <>
          <div className="metric-grid" style={{ marginBottom: 12 }}>
            <Metric icon={<Car />} label="Tổng chỗ trống" value={String(totalAvailable)} />
            <Metric icon={<CheckCircle2 />} label="Tổng sức chứa" value={String(totalCapacity)} />
            <Metric icon={<Camera />} label="Tỷ lệ lấp đầy" value={totalCapacity > 0 ? `${Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100)}%` : "0%"} />
            <Metric icon={<Clock3 />} label="Miễn phí đầu" value={`${parkingConfig.freeMinutes} phút`} />
          </div>

          <div className="plan-cards">
            {zones.map((zone) => (
              <div className="plan-card" key={zone.zone}>
                <h3>Khu {zone.zone}</h3>
                <p className="plan-price">{zone.available}<span> / {zone.total} trống</span></p>
                <ul>
                  <li>{zone.description || "Khu đỗ xe"}</li>
                  <li>Loại xe: {zone.allowedVehicleTypes.join(", ")}</li>
                  <li>Đang đỗ: {zone.occupied} xe</li>
                </ul>
                <div style={{ marginTop: 8 }}>
                  <div style={{ background: "#e5e7eb", borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        background: zone.available > 0 ? "#16a34a" : "#dc2626",
                        height: "100%",
                        width: `${zone.total > 0 ? ((zone.total - zone.available) / zone.total) * 100 : 0}%`,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {!loaded && <p className="muted-cell">Đang tải thông tin bãi xe...</p>}
    </div>
  );
}

export function AuthPanel() {
  const { mode, setMode, authError, handleLogin, handleRegister, handleForgotPassword } = useParkingApp();

  return (
    <div className="auth-panel">
      <div className="segmented">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
          Đăng nhập
        </button>
        <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">
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
  );
}

export function PublicLanding() {
  const { stats, setMode } = useParkingApp();

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

          <AuthPanel />
        </div>
      </section>

      <section className="public-section">
        <div>
          <span className="section-kicker">Tình trạng bãi xe</span>
          <h2>Tìm kiếm và xem chỗ trống realtime</h2>
        </div>
        <ParkingAvailability />
      </section>

      <section className="public-section compact" id="contact">
        <div>
          <span className="section-kicker">Liên hệ</span>
          <h2>Ban quản lý bãi đỗ xe</h2>
        </div>
        <p>
          Email: {parkingConfig.contactEmail} - Hotline: {parkingConfig.hotline} - Địa chỉ: {parkingConfig.address}
        </p>
      </section>
    </main>
  );
}
