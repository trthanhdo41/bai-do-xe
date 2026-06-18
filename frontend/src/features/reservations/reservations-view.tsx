"use client";

import { CalendarCheck, X, CheckCircle } from "lucide-react";
import { useParkingApp } from "@/context/parking-app-context";

const STATUS_BADGE: Record<string, string> = {
  active: "badge warning",
  completed: "badge success",
  cancelled: "badge",
  expired: "badge",
  pending: "badge warning",
};

export function ReservationsView() {
  const {
    currentUser,
    reservationList,
    slotList,
    createReservation,
    cancelReservation,
    confirmReservation,
  } = useParkingApp();

  if (!currentUser) return null;

  const reservableSlots = slotList.filter(
    (s) => s.status === "empty" && ["VIP", "electric", "handicap"].includes(s.slotType),
  );

  return (
    <section className="content-grid">
      {/* Form đặt chỗ */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>Đặt trước</p>
            <h2>Đặt chỗ VIP</h2>
          </div>
          <CalendarCheck size={22} />
        </div>
        <form className="stack-form" onSubmit={createReservation}>
          <label>
            Chọn slot
            <select name="slotId" required>
              <option value="">Chọn vị trí VIP/Điện/Khuyết tật</option>
              {reservableSlots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.slotCode} ({s.slotType}) - Khu {s.zoneName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Biển số xe
            <input name="plate" placeholder="30H-123.45" required />
          </label>
          <label>
            Thời gian bắt đầu
            <input name="reservedFrom" required type="datetime-local" />
          </label>
          <label>
            Thời gian kết thúc
            <input name="reservedUntil" required type="datetime-local" />
          </label>
          <button className="full-button" type="submit">
            <CalendarCheck size={18} />
            Đặt chỗ
          </button>
        </form>
      </div>

      {/* Bảng reservations */}
      <div className="panel wide">
        <div className="panel-heading">
          <div>
            <p>{currentUser.role === "customer" ? "Của tôi" : "Tất cả"}</p>
            <h2>Danh sách đặt chỗ</h2>
          </div>
          <span className="muted-cell">{reservationList.length} mục</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Slot</th>
                <th>Khu</th>
                <th>Biển số</th>
                <th>Từ</th>
                <th>Đến</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservationList.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.slotCode}</strong></td>
                  <td>{r.zoneName}</td>
                  <td>{r.plate}</td>
                  <td>{new Date(r.reservedFrom).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>{new Date(r.reservedUntil).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td><span className={STATUS_BADGE[r.status] || "badge"}>{r.status}</span></td>
                  <td>
                    <div className="inline-actions">
                      {r.status === "active" && currentUser.role !== "customer" && (
                        <button className="small-button" onClick={() => confirmReservation(r.id)} title="Xác nhận xe tới" type="button">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {["active", "pending"].includes(r.status) && (
                        <button className="small-button" onClick={() => cancelReservation(r.id)} title="Hủy" type="button">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reservationList.length === 0 && (
                <tr><td className="muted-cell" colSpan={7}>Chưa có đặt chỗ nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
