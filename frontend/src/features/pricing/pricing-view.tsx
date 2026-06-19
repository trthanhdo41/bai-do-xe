"use client";

import { useState, useEffect } from "react";
import { Bell, Pencil, ReceiptText, Settings, Trash2 } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { useParkingApp } from "@/context/parking-app-context";
import { apiFetch } from "@/lib/client-api";
import { currency } from "@/lib/constants";

type NotifTemplate = {
  id: string;
  name: string;
  triggerType: string;
  title: string;
  content: string;
  isActive: boolean;
};

const TRIGGER_LABELS: Record<string, string> = {
  entry: "Xe vào",
  exit: "Xe ra",
  overdue: "Quá hạn",
  low_balance: "Số dư thấp",
  promotion: "Khuyến mãi",
  reservation_confirmed: "Đặt chỗ xác nhận",
  reservation_expired: "Đặt chỗ hết hạn",
  subscription_expiring: "Gói sắp hết",
  custom: "Tùy chỉnh",
};

export function PricingView() {
  const { pricingConfigState, updatePricing } = useParkingApp();
  const [activeTab, setActiveTab] = useState<"pricing" | "templates">("pricing");
  const [templates, setTemplates] = useState<NotifTemplate[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [tplMsg, setTplMsg] = useState("");

  async function loadTemplates() {
    const response = await apiFetch("/notification-templates");
    if (response.ok) {
      const data = await response.json();
      setTemplates(data.templates);
      setTemplatesLoaded(true);
    }
  }

  async function createTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name") || ""),
      triggerType: String(form.get("triggerType") || "custom"),
      title: String(form.get("title") || ""),
      content: String(form.get("content") || ""),
    };
    const response = await apiFetch("/notification-templates", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (response.ok) {
      setTemplates((prev) => [...prev, data.template]);
      setTplMsg("Đã tạo mẫu thông báo.");
      event.currentTarget.reset();
    } else {
      setTplMsg(data.message || "Lỗi.");
    }
  }

  async function deleteTemplate(id: string) {
    const response = await apiFetch(`/notification-templates/${id}`, { method: "DELETE" });
    if (response.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setTplMsg("Đã xóa mẫu.");
    }
  }

  return (
    <section className="content-single">
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>Admin</p>
            <h2>Cấu hình hệ thống</h2>
          </div>
          <Settings size={22} />
        </div>

        <div className="tab-bar">
          <button className={`tab-item${activeTab === "pricing" ? " tab-active" : ""}`} onClick={() => setActiveTab("pricing")} type="button">
            Bảng giá
          </button>
          <button className={`tab-item${activeTab === "templates" ? " tab-active" : ""}`} onClick={() => { setActiveTab("templates"); if (!templatesLoaded) loadTemplates(); }} type="button">
            Mẫu thông báo
          </button>
        </div>

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: "0.95rem", marginBottom: 12 }}>Chỉnh sửa bảng giá</h3>
              <form className="stack-form" key={pricingConfigState.updatedAt || pricingConfigState.id} onSubmit={updatePricing}>
                <label>Phút miễn phí<input defaultValue={pricingConfigState.freeMinutes} min={0} name="freeMinutes" required type="number" /></label>
                <label>Giá theo giờ<input defaultValue={pricingConfigState.hourlyRate} min={0} name="hourlyRate" required type="number" /></label>
                <label>Giá qua đêm<input defaultValue={pricingConfigState.overnightRate} min={0} name="overnightRate" required type="number" /></label>
                <label>Gói tháng<input defaultValue={pricingConfigState.monthlyRate} min={0} name="monthlyRate" required type="number" /></label>
                <label>Phạt quá hạn (VND/30 phút)<input defaultValue={pricingConfigState.overdueFineRate} min={0} name="overdueFineRate" required type="number" /></label>
                <button className="full-button" type="submit"><Settings size={18} /> Lưu bảng giá</button>
              </form>
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", marginBottom: 12 }}>Bảng giá hiện tại</h3>
              <DataTable
                headers={["Hạng mục", "Giá trị"]}
                rows={[
                  ["Miễn phí đầu", `${pricingConfigState.freeMinutes} phút`],
                  ["Theo giờ", currency.format(pricingConfigState.hourlyRate)],
                  ["Qua đêm", currency.format(pricingConfigState.overnightRate)],
                  ["Gói tháng", currency.format(pricingConfigState.monthlyRate)],
                  ["Phạt quá hạn", `${currency.format(pricingConfigState.overdueFineRate)}/30 phút`],
                ]}
              />
            </div>
          </div>
        )}

        {/* Notification Templates Tab */}
        {activeTab === "templates" && (
          <div>
            {tplMsg && <p className="muted-cell" style={{ marginBottom: 12 }}>{tplMsg}</p>}

            {/* Create form */}
            <form className="stack-form" onSubmit={createTemplate} style={{ marginBottom: 20 }}>
              <div className="panel-heading"><div><p>Thêm</p><h2>Tạo mẫu thông báo mới</h2></div><Bell size={20} /></div>
              <div className="filter-row">
                <input name="name" placeholder="Tên mẫu (unique)" required style={{ flex: 1 }} />
                <select name="triggerType" required>
                  {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <label>Tiêu đề thông báo<input name="title" placeholder="Tiêu đề..." required /></label>
              <label>Nội dung<textarea name="content" placeholder="Nội dung thông báo... (hỗ trợ biến: {{plate}}, {{fee}}, {{name}})" required rows={3} /></label>
              <button className="small-button" type="submit"><Bell size={14} /> Tạo mẫu</button>
            </form>

            {/* Templates table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Loại trigger</th>
                    <th>Tiêu đề</th>
                    <th>Nội dung</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl) => (
                    <tr key={tpl.id}>
                      <td><strong>{tpl.name}</strong></td>
                      <td><span className="badge">{TRIGGER_LABELS[tpl.triggerType] || tpl.triggerType}</span></td>
                      <td>{tpl.title}</td>
                      <td><span className="muted-cell">{tpl.content.slice(0, 50)}...</span></td>
                      <td><span className={tpl.isActive ? "badge success" : "badge"}>{tpl.isActive ? "Bật" : "Tắt"}</span></td>
                      <td>
                        <button className="small-button" onClick={() => deleteTemplate(tpl.id)} title="Xóa" type="button">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {templates.length === 0 && templatesLoaded && (
                    <tr><td className="muted-cell" colSpan={6}>Chưa có mẫu thông báo nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
