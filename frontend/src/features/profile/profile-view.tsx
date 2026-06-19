"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, LogOut, Monitor, UserRound, Wallet } from "lucide-react";

import { useParkingApp } from "@/context/parking-app-context";
import { apiFetch } from "@/lib/client-api";
import { currency, roleLabels } from "@/lib/constants";

type ActiveSessionItem = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  loginAt: string;
  lastActiveAt: string;
};

export function ProfileView() {
  const { currentUser } = useParkingApp();
  const [pwMsg, setPwMsg] = useState("");
  const [sessions, setSessions] = useState<ActiveSessionItem[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  if (!currentUser) return null;

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: String(form.get("currentPassword") || ""),
        newPassword: String(form.get("newPassword") || ""),
      }),
    });
    const data = await response.json();
    setPwMsg(data.message || (response.ok ? "Đã thay đổi mật khẩu." : "Lỗi."));
    if (response.ok) event.currentTarget.reset();
  }

  async function loadSessions() {
    const response = await apiFetch("/auth/sessions");
    if (response.ok) {
      const data = await response.json();
      setSessions(data.sessions);
      setSessionsLoaded(true);
    }
  }

  async function revokeSession(id: string) {
    const response = await apiFetch(`/auth/sessions/${id}`, { method: "DELETE" });
    if (response.ok) {
      setSessions((items) => items.filter((s) => s.id !== id));
    }
  }

  async function revokeAll() {
    const response = await apiFetch("/auth/sessions", { method: "DELETE" });
    if (response.ok) setSessions([]);
  }

  return (
    <section className="content-grid">
      {/* Profile info */}
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

      {/* Wallet summary */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>Ví điện tử</p>
            <h2>{currency.format(currentUser.wallet)}</h2>
          </div>
          <Wallet size={22} />
        </div>
        <div className="profile-lines">
          <span>Thanh toán tự động khi checkout nếu đủ số dư.</span>
        </div>
      </div>

      {/* Change password */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>Bảo mật</p>
            <h2>Thay đổi mật khẩu</h2>
          </div>
          <KeyRound size={22} />
        </div>
        <form className="stack-form" onSubmit={handleChangePassword}>
          <label>
            Mật khẩu hiện tại
            <input name="currentPassword" required type="password" />
          </label>
          <label>
            Mật khẩu mới (tối thiểu 6 ký tự)
            <input minLength={6} name="newPassword" required type="password" />
          </label>
          <button className="full-button" type="submit">
            <KeyRound size={18} />
            Đổi mật khẩu
          </button>
          {pwMsg && <p className="muted-cell">{pwMsg}</p>}
        </form>
      </div>

      {/* Active sessions */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>Phiên đăng nhập</p>
            <h2>Quản lý phiên hoạt động</h2>
          </div>
          <Monitor size={22} />
        </div>
        {!sessionsLoaded ? (
          <button className="full-button" onClick={loadSessions} type="button">
            Tải danh sách phiên
          </button>
        ) : (
          <>
            {sessions.length > 0 && (
              <button className="small-button" onClick={revokeAll} style={{ marginBottom: 12 }} type="button">
                <LogOut size={14} /> Thu hồi tất cả
              </button>
            )}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Thiết bị</th>
                    <th>IP</th>
                    <th>Đăng nhập</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>{s.userAgent?.slice(0, 40) || "Không xác định"}</td>
                      <td>{s.ipAddress || "—"}</td>
                      <td>{new Date(s.loginAt).toLocaleString("vi-VN")}</td>
                      <td>
                        <button className="small-button" onClick={() => revokeSession(s.id)} type="button">
                          Thu hồi
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr><td className="muted-cell" colSpan={4}>Không có phiên nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
