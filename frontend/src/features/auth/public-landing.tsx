"use client";

import { useEffect, useState } from "react";
import {
  Car,
  CheckCircle2,
  Clock3,
  LogIn,
  Mail,
  MapPin,
  ParkingCircle,
  Phone,
  Plus,
  Search,
  Shield,
  UserRound,
  Zap,
} from "lucide-react";

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
    async function load() {
      try {
        const r = await fetch(`${apiBaseUrl}/public/availability`);
        if (r.ok) { const d = await r.json(); setZones(d.zones); setTotalAvailable(d.available); setTotalCapacity(d.capacity); setLoaded(true); }
      } catch { /* silent */ }
    }
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    try {
      const r = await fetch(`${apiBaseUrl}/public/search?q=${encodeURIComponent(searchQuery)}`);
      if (r.ok) { const d = await r.json(); setSearchResults(d.results); }
    } catch { /* silent */ }
  }

  const fillRate = totalCapacity > 0 ? Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100) : 0;

  return (
    <div className="availability-section">
      {/* Stats row */}
      {loaded && (
        <div className="avail-stats">
          <div className="avail-stat-item">
            <div className="avail-stat-icon green"><Car size={20} /></div>
            <div><span className="avail-stat-value">{totalAvailable}</span><span className="avail-stat-label">Chỗ trống</span></div>
          </div>
          <div className="avail-stat-item">
            <div className="avail-stat-icon blue"><CheckCircle2 size={20} /></div>
            <div><span className="avail-stat-value">{totalCapacity}</span><span className="avail-stat-label">Tổng sức chứa</span></div>
          </div>
          <div className="avail-stat-item">
            <div className="avail-stat-icon orange"><Zap size={20} /></div>
            <div><span className="avail-stat-value">{fillRate}%</span><span className="avail-stat-label">Tỷ lệ lấp đầy</span></div>
          </div>
          <div className="avail-stat-item">
            <div className="avail-stat-icon purple"><Clock3 size={20} /></div>
            <div><span className="avail-stat-value">{parkingConfig.freeMinutes}p</span><span className="avail-stat-label">Miễn phí đầu</span></div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="avail-search">
        <Search size={18} className="avail-search-icon" />
        <input
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Tìm khu vực đỗ xe, loại xe..."
          value={searchQuery}
        />
        <button onClick={handleSearch} type="button">Tìm kiếm</button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="zone-grid" style={{ marginBottom: 20 }}>
          {searchResults.map((r) => (
            <div className="zone-card" key={r.zone}>
              <div className="zone-card-header"><h4>Khu {r.zone}</h4><span className="badge success">{r.available} trống</span></div>
              {r.description && <p>{r.description}</p>}
              <div className="zone-bar"><div style={{ width: `${r.total > 0 ? ((r.total - r.available) / r.total) * 100 : 0}%` }} /></div>
            </div>
          ))}
        </div>
      )}

      {/* Zone cards */}
      {loaded && (
        <div className="zone-grid">
          {zones.map((zone) => (
            <div className="zone-card" key={zone.zone}>
              <div className="zone-card-header">
                <h4>Khu {zone.zone}</h4>
                <span className={`badge ${zone.available > 0 ? "success" : "warning"}`}>
                  {zone.available > 0 ? `${zone.available} trống` : "Đầy"}
                </span>
              </div>
              <p className="zone-desc">{zone.description || "Khu đỗ xe"}</p>
              <div className="zone-meta">
                <span>{zone.allowedVehicleTypes.join(", ")}</span>
                <span>{zone.occupied}/{zone.total} đang đỗ</span>
              </div>
              <div className="zone-bar">
                <div style={{
                  width: `${zone.total > 0 ? ((zone.total - zone.available) / zone.total) * 100 : 0}%`,
                  background: zone.available > 0 ? "var(--success)" : "var(--danger)",
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {!loaded && <p className="muted-cell" style={{ textAlign: "center", padding: 40 }}>Đang tải thông tin bãi xe...</p>}
    </div>
  );
}

export function AuthPanel() {
  const { mode, setMode, handleLogin, handleRegister, handleForgotPassword } = useParkingApp();

  return (
    <div className="auth-panel">
      <div className="auth-panel-header">
        <ParkingCircle size={24} />
        <span>iPARK</span>
      </div>
      <div className="segmented">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Đăng nhập</button>
        <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">Đăng ký</button>
      </div>

      {mode === "login" && (
        <form onSubmit={handleLogin}>
          <label>
            <span className="label-text">Email</span>
            <input name="email" defaultValue="admin@ipark.vn" type="email" placeholder="you@email.com" />
          </label>
          <label>
            <span className="label-text">Mật khẩu</span>
            <input name="password" defaultValue="admin" type="password" placeholder="••••••" />
          </label>
          <label>
            <span className="label-text">Mã 2FA <span className="optional">(nếu có)</span></span>
            <input name="twoFactorCode" placeholder="6 chữ số" />
          </label>
          <button className="full-button" type="submit"><LogIn size={18} />Đăng nhập</button>
          <div className="auth-divider"><span>hoặc</span></div>
          <button className="secondary-button full-button" onClick={() => { window.location.href = `${apiBaseUrl}/auth/google`; }} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Đăng nhập với Google
          </button>
          <button className="link-button" onClick={() => setMode("forgot")} type="button">Quên mật khẩu?</button>
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={handleRegister}>
          <label>
            <span className="label-text">Họ tên</span>
            <input name="name" placeholder="Nguyễn Văn A" required />
          </label>
          <label>
            <span className="label-text">Email</span>
            <input name="email" placeholder="you@email.com" required type="email" />
          </label>
          <label>
            <span className="label-text">Mật khẩu</span>
            <input name="password" placeholder="Tối thiểu 6 ký tự" required type="password" />
          </label>
          <button className="full-button" type="submit"><Plus size={18} />Tạo tài khoản</button>
          <button className="link-button" onClick={() => setMode("login")} type="button">Đã có tài khoản? Đăng nhập</button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleForgotPassword}>
          <p className="auth-subtitle">Nhập email để nhận mã OTP. Sau đó điền OTP và mật khẩu mới.</p>
          <label>
            <span className="label-text">Email</span>
            <input name="email" placeholder="you@email.com" required type="email" />
          </label>
          <label>
            <span className="label-text">Mã OTP</span>
            <input name="otp" placeholder="6 chữ số từ email" />
          </label>
          <label>
            <span className="label-text">Mật khẩu mới</span>
            <input name="password" placeholder="Tối thiểu 6 ký tự" type="password" />
          </label>
          <button className="full-button" type="submit"><Mail size={18} />Xác minh & đặt lại</button>
          <button className="link-button" onClick={() => setMode("login")} type="button">← Quay lại đăng nhập</button>
        </form>
      )}
    </div>
  );
}

export function PublicLanding() {
  const { setMode } = useParkingApp();
  const [liveStats, setLiveStats] = useState({ active: 0, available: 0 });

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${apiBaseUrl}/public/availability`);
        if (r.ok) {
          const d = await r.json();
          setLiveStats({ available: d.available, active: d.capacity - d.available });
        }
      } catch { /* silent */ }
    }
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <main className="public-shell">
      {/* Hero */}
      <section className="hero">
        <nav className="topbar">
          <div className="brand"><ParkingCircle size={28} /><span>{parkingConfig.brandName}</span></div>
          <div className="top-actions">
            <a href="#availability">Chỗ trống</a>
            <a href="#contact">Liên hệ</a>
            <button onClick={() => setMode("login")} type="button"><LogIn size={16} />Đăng nhập</button>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Hệ thống quản lý bãi đỗ xe thông minh</span>
            <h1>Đỗ xe dễ dàng với <span className="hero-highlight">{parkingConfig.brandName}</span></h1>
            <p>Nhận diện biển số tự động bằng AI, theo dõi chỗ trống realtime, thanh toán không tiền mặt và quản lý vận hành toàn diện.</p>
            <div className="status-strip">
              <div><span>Đang gửi</span><strong>{liveStats.active} xe</strong></div>
              <div><span>Còn trống</span><strong>{liveStats.available} chỗ</strong></div>
              <div><span>Camera AI</span><strong>2 cổng</strong></div>
            </div>
            <div className="hero-actions">
              <button onClick={() => setMode("login")} type="button"><LogIn size={18} />Dùng tài khoản iPARK</button>
              <button className="secondary-button" onClick={() => setMode("register")} type="button"><UserRound size={18} />Đăng ký miễn phí</button>
            </div>
          </div>
          <AuthPanel />
        </div>
      </section>

      {/* Availability */}
      <section className="landing-section alt" id="availability">
        <div className="section-header">
          <span className="section-kicker">Chỗ trống realtime</span>
          <h2>Tìm chỗ đỗ ngay</h2>
          <p>Cập nhật tự động mỗi 30 giây</p>
        </div>
        <ParkingAvailability />
      </section>

      {/* Contact */}
      <section className="landing-section" id="contact">
        <div className="section-header">
          <span className="section-kicker">Liên hệ</span>
          <h2>Ban quản lý bãi đỗ xe</h2>
        </div>
        <div className="contact-grid">
          <div className="contact-item"><MapPin size={20} /><div><strong>Địa chỉ</strong><p>{parkingConfig.address}</p></div></div>
          <div className="contact-item"><Mail size={20} /><div><strong>Email</strong><p>{parkingConfig.contactEmail}</p></div></div>
          <div className="contact-item"><Phone size={20} /><div><strong>Hotline</strong><p>{parkingConfig.hotline}</p></div></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <ParkingCircle size={20} />
        <span>© 2024 {parkingConfig.brandName}. Hệ thống quản lý bãi đỗ xe thông minh.</span>
      </footer>
    </main>
  );
}
