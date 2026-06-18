"use client";

import { CreditCard, RefreshCcw, X } from "lucide-react";
import { useParkingApp } from "@/context/parking-app-context";
import { currency } from "@/lib/constants";

const DURATION_LABELS: Record<string, string> = {
  monthly: "Tháng",
  quarterly: "Quý",
  yearly: "Năm",
};

export function SubscriptionsView() {
  const {
    currentUser,
    planList,
    subscriptionList,
    createPlan,
    purchaseSubscription,
    renewSubscription,
    cancelSubscription,
  } = useParkingApp();

  if (!currentUser) return null;
  const isAdmin = currentUser.role === "admin";

  return (
    <section className="content-grid">
      {/* Admin: create plan form */}
      {isAdmin && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p>Quản lý</p>
              <h2>Tạo gói mới</h2>
            </div>
            <CreditCard size={22} />
          </div>
          <form className="stack-form" onSubmit={createPlan}>
            <label>Tên gói<input name="name" placeholder="Gói tháng VIP" required /></label>
            <label>Mô tả<input name="description" placeholder="Mô tả ngắn..." /></label>
            <label>
              Loại
              <select name="duration">
                <option value="monthly">Tháng</option>
                <option value="quarterly">Quý</option>
                <option value="yearly">Năm</option>
              </select>
            </label>
            <label>Số ngày<input defaultValue={30} min={1} name="durationDays" required type="number" /></label>
            <label>Giá (VND)<input defaultValue={0} min={0} name="price" required type="number" /></label>
            <label>% Giảm phí đỗ xe<input defaultValue={10} max={100} min={0} name="discountPercent" required type="number" /></label>
            <label>Số xe tối đa<input defaultValue={1} min={1} name="maxVehicles" type="number" /></label>
            <label>Tính năng (dấu phẩy)<input name="features" placeholder="priority_slot, free_reservation" /></label>
            <button className="full-button" type="submit"><CreditCard size={18} /> Tạo gói</button>
          </form>
        </div>
      )}

      {/* Customer: buy subscription */}
      {currentUser.role === "customer" && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p>Mua gói</p>
              <h2>Đăng ký gói đỗ xe</h2>
            </div>
            <CreditCard size={22} />
          </div>
          <form className="stack-form" onSubmit={purchaseSubscription}>
            <label>
              Chọn gói
              <select name="planId" required>
                <option value="">Chọn gói...</option>
                {planList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {currency.format(p.price)} ({DURATION_LABELS[p.duration]}, giảm {p.discountPercent}%)
                  </option>
                ))}
              </select>
            </label>
            <label>
              Biển số xe (dấu phẩy nếu nhiều xe)
              <input name="plates" placeholder="30H-123.45, 51G-678.90" required />
            </label>
            <button className="full-button" type="submit"><CreditCard size={18} /> Mua gói</button>
          </form>
        </div>
      )}

      {/* Plans overview */}
      <div className="panel wide">
        <div className="panel-heading">
          <div>
            <p>Gói đỗ xe</p>
            <h2>{isAdmin ? "Quản lý gói" : "Các gói hiện có"}</h2>
          </div>
        </div>
        <div className="plan-cards">
          {planList.map((plan) => (
            <div className="plan-card" key={plan.id}>
              <h3>{plan.name}</h3>
              <p className="plan-price">{currency.format(plan.price)}<span>/{DURATION_LABELS[plan.duration]}</span></p>
              <ul>
                <li>Giảm <strong>{plan.discountPercent}%</strong> phí đỗ xe</li>
                <li>Tối đa {plan.maxVehicles} xe</li>
                <li>{plan.durationDays} ngày</li>
                {plan.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ))}
          {planList.length === 0 && <p className="muted-cell">Chưa có gói nào.</p>}
        </div>

        {/* Subscriptions table */}
        <div className="panel-heading" style={{ marginTop: 24 }}>
          <div>
            <p>Đăng ký</p>
            <h2>{isAdmin ? "Tất cả đăng ký" : "Gói của tôi"}</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Gói</th>
                <th>Biển số</th>
                <th>Bắt đầu</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th>Gia hạn</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subscriptionList.map((sub) => (
                <tr key={sub.id}>
                  <td><strong>{sub.planName}</strong></td>
                  <td>{sub.plates.join(", ")}</td>
                  <td>{new Date(sub.startDate).toLocaleDateString("vi-VN")}</td>
                  <td>{new Date(sub.endDate).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <span className={sub.status === "active" ? "badge success" : sub.status === "expired" ? "badge warning" : "badge"}>
                      {sub.status === "active" ? "Hoạt động" : sub.status === "expired" ? "Hết hạn" : "Đã hủy"}
                    </span>
                  </td>
                  <td>{sub.renewalCount}x</td>
                  <td>
                    <div className="inline-actions">
                      {sub.status === "active" && (
                        <>
                          <button className="small-button" onClick={() => renewSubscription(sub.id)} title="Gia hạn" type="button">
                            <RefreshCcw size={14} />
                          </button>
                          <button className="small-button" onClick={() => cancelSubscription(sub.id)} title="Hủy" type="button">
                            <X size={14} />
                          </button>
                        </>
                      )}
                      {sub.status === "expired" && (
                        <button className="small-button" onClick={() => renewSubscription(sub.id)} type="button">
                          <RefreshCcw size={14} /> Gia hạn
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {subscriptionList.length === 0 && (
                <tr><td className="muted-cell" colSpan={7}>Chưa có đăng ký nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
