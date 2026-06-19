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
  const { mode, setMode, authError, handleLogin, handleRegister, handleForgotPassword } = useParkingApp();

  return (
    <div className="auth-panel">
      <div className="segmented">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Đăng nhập</button>
        <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">Đăng ký</button>
      </div>
      {mode === "login" && (
        <form onSubmit={handleLogin}>
          <label>Email<input name="email" defaultValue="admin@ipark.vn" type="email" /></label>
          <label>Mật khẩu<input name="password" defaultValue="admin" type="password" /></label>
          <label>Mã 2FA<input name="twoFactorCode" placeholder="Nhập nếu tài khoản đã bật 2FA" /></label>
          {authError && <p className="form-error">{authError}</p>}
          <button className="full-button" type="submit"><LogIn size={18} />Vào hệ thống</button>
          <button className="secondary-button full-button" onClick={() => { window.location.href = `${apiBaseUrl}/auth/google`; }} type="button"><LogIn size={18} />Đăng nhập với Google</button>
          <button className="link-button" onClick={() => setMode("forgot")} type="button">Quên mật khẩu / gửi OTP</button>
          <div className="demo-accounts"><span>TÀI KHOẢN:</span><code>admin@ipark.vn / admin</code><code>nv.1@ipark.vn / 123456</code></div>
        </form>
      )}
      {mode === "register" && (
        <form onSubmit={handleRegister}>
          <label>Họ tên<input name="name" placeholder="Nhập họ tên" required /></label>
          <label>Email<input name="email" placeholder="email@example.com" required type="email" /></label>
          <label>Mật khẩu<input name="password" placeholder="Tối thiểu 6 ký tự" required type="password" /></label>
          <button className="full-button" type="submit"><Plus size={18} />Tạo tài khoản</button>
        </form>
      )}
      {mode === "forgot" && (
        <form onSubmit={handleForgotPassword}>
          <label>Email nhận OTP<input name="email" placeholder="email@example.com" required type="email" /></label>
          <label>Mã OTP<input name="otp" placeholder="123456" /></label>
          <label>Mật khẩu mới<input name="password" placeholder="Tối thiểu 6 ký tự" type="password" /></label>
          {authError && <p className="form-info">{authError}</p>}
          <button className="full-button" type="submit"><Mail size={18} />Gửi / xác minh OTP</button>
          <button className="link-button" onClick={() => setMode("login")} type="button">Quay lại đăng nhập</button>
        </form>
      )}
    </div>
  );
}

export function PublicLanding() {
  const { stats, setMode } = useParkingApp();

  return (
    <main className="public-shell">
      {/* Hero */}
      <section className="hero">
        <nav className="topbar">
          <div className="brand"><ParkingCircle size={28} /><span>{parkingConfig.brandName}</span></div>
          <div className="top-actions">
            <a href="#features">Tính năng</a>
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
              <div><span>Đang gửi</span><strong>{stats.active} xe</strong></div>
              <div><span>Còn trống</span><strong>{stats.available} chỗ</strong></div>
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

      {/* Features */}
      <section className="landing-section" id="features">
        <div className="section-header">
          <span className="section-kicker">Tính năng nổi bật</span>
          <h2>Tại sao chọn {parkingConfig.brandName}?</h2>
          <p>Giải pháp toàn diện cho bãi đỗ xe hiện đại</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Car size={24} /></div>
            <h3>Nhận diện AI</h3>
            <p>Tự động nhận diện biển số bằng AI khi xe vào/ra, giảm thiểu thao tác thủ công.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Zap size={24} /></div>
            <h3>Thanh toán tự động</h3>
            <p>Tính phí thông minh, thanh toán qua ví điện tử hoặc VietQR không cần tiền mặt.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={24} /></div>
            <h3>Bảo mật cao</h3>
            <p>Xác thực 2 yếu tố, mã hóa dữ liệu, phân quyền chi tiết theo vai trò.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Clock3 size={24} /></div>
            <h3>Realtime</h3>
            <p>Theo dõi trạng thái bãi xe, chỗ trống, camera trực tiếp 24/7.</p>
          </div>
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
