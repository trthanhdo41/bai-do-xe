"use client";

import { useState } from "react";
import { ParkingSquare, Wrench, RotateCcw, Trash2, LayoutGrid } from "lucide-react";
import { useParkingApp } from "@/context/parking-app-context";
import type { ParkingSlot, SlotStatus } from "@/types";

const SLOT_TYPE_OPTIONS = ["regular", "VIP", "electric", "handicap"] as const;
const STATUS_LABELS: Record<SlotStatus, string> = {
  empty: "Trống",
  occupied: "Đang đỗ",
  reserved: "Đặt trước",
  maintenance: "Bảo trì",
};
const STATUS_BADGE: Record<SlotStatus, string> = {
  empty: "badge success",
  occupied: "badge warning",
  reserved: "badge",
  maintenance: "badge",
};

function SlotCard({ slot, onMaintenance, onFree, onDelete, isAdmin }: {
  slot: ParkingSlot;
  onMaintenance: (id: string) => void;
  onFree: (id: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  return (
    <div className={`slot-card slot-${slot.status}`}>
      <div className="slot-card-code">{slot.slotCode}</div>
      <div className="slot-card-type">{slot.slotType}</div>
      <span className={STATUS_BADGE[slot.status]}>{STATUS_LABELS[slot.status]}</span>
      {slot.features.length > 0 && (
        <div className="slot-card-features">
          {slot.features.map((f) => (
            <span className="badge" key={f}>{f}</span>
          ))}
        </div>
      )}
      {isAdmin && slot.status !== "occupied" && slot.status !== "reserved" && (
        <div className="inline-actions" style={{ marginTop: 6 }}>
          {slot.status !== "maintenance" ? (
            <button
              className="small-button"
              onClick={() => onMaintenance(slot.id)}
              title="Đặt bảo trì"
              type="button"
            >
              <Wrench size={13} />
            </button>
          ) : (
            <button
              className="small-button"
              onClick={() => onFree(slot.id)}
              title="Mở lại"
              type="button"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            className="small-button"
            onClick={() => onDelete(slot.id)}
            title="Xóa slot"
            type="button"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

export function ParkingSlotsView() {
  const {
    currentUser,
    zoneList,
    slotList,
    createSlot,
    bulkCreateSlots,
    updateSlotStatus,
    deleteSlot,
  } = useParkingApp();

  const [activeTab, setActiveTab] = useState<"map" | "list" | "create" | "bulk">("map");
  const [filterZone, setFilterZone] = useState("");
  const [filterStatus, setFilterStatus] = useState<SlotStatus | "">("");

  if (!currentUser) return null;
  const isAdmin = currentUser.role === "admin";

  const filteredSlots = slotList.filter((s) => {
    if (filterZone && s.zoneId !== filterZone) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    return true;
  });

  // Group by zone for map view
  const slotsByZone = zoneList.map((zone) => ({
    zone,
    slots: slotList.filter((s) => s.zoneId === zone.id),
  }));

  return (
    <section className="content-single">
      {/* Tab navigation */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>Bãi đỗ xe</p>
            <h2>Quản lý vị trí đỗ xe</h2>
          </div>
          <ParkingSquare size={22} />
        </div>

        <div className="tab-bar">
          {(["map", "list", ...(isAdmin ? ["create", "bulk"] : [])] as const).map((tab) => (
            <button
              className={`tab-item${activeTab === tab ? " tab-active" : ""}`}
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              type="button"
            >
              {tab === "map" ? "Sơ đồ" : tab === "list" ? "Danh sách" : tab === "create" ? "+ 1 slot" : "Tạo hàng loạt"}
            </button>
          ))}
        </div>

        {/* Map view */}
        {activeTab === "map" && (
          <div className="slot-map">
            {slotsByZone.map(({ zone, slots }) => (
              <div className="slot-zone-block" key={zone.id}>
                <div className="slot-zone-header">
                  <strong>Khu {zone.name}</strong>
                  <span className="muted-cell">
                    {slots.filter((s) => s.status === "empty").length} trống / {slots.length} tổng
                  </span>
                </div>
                <div className="slot-grid">
                  {slots.map((slot) => (
                    <SlotCard
                      isAdmin={isAdmin}
                      key={slot.id}
                      onDelete={deleteSlot}
                      onFree={(id) => updateSlotStatus(id, "empty")}
                      onMaintenance={(id) => updateSlotStatus(id, "maintenance")}
                      slot={slot}
                    />
                  ))}
                  {slots.length === 0 && (
                    <span className="muted-cell">Chưa có slot nào trong khu này.</span>
                  )}
                </div>
              </div>
            ))}
            {zoneList.length === 0 && (
              <p className="muted-cell">Chưa có khu vực. Hãy tạo zone trước.</p>
            )}
          </div>
        )}

        {/* List view with filters */}
        {activeTab === "list" && (
          <>
            <div className="filter-row">
              <select onChange={(e) => setFilterZone(e.target.value)} value={filterZone}>
                <option value="">Tất cả khu vực</option>
                {zoneList.map((z) => (
                  <option key={z.id} value={z.id}>Khu {z.name}</option>
                ))}
              </select>
              <select onChange={(e) => setFilterStatus(e.target.value as SlotStatus | "")} value={filterStatus}>
                <option value="">Tất cả trạng thái</option>
                <option value="empty">Trống</option>
                <option value="occupied">Đang đỗ</option>
                <option value="reserved">Đặt trước</option>
                <option value="maintenance">Bảo trì</option>
              </select>
              <span className="muted-cell">{filteredSlots.length} slot</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã slot</th>
                    <th>Khu vực</th>
                    <th>Loại</th>
                    <th>Tính năng</th>
                    <th>Tầng</th>
                    <th>Trạng thái</th>
                    {isAdmin && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td><strong>{slot.slotCode}</strong></td>
                      <td>{slot.zoneName}</td>
                      <td>{slot.slotType}</td>
                      <td>
                        {slot.features.length > 0
                          ? slot.features.join(", ")
                          : <span className="muted-cell">—</span>}
                      </td>
                      <td>{slot.floor === 0 ? "Trệt" : slot.floor > 0 ? `Tầng ${slot.floor}` : `Hầm B${Math.abs(slot.floor)}`}</td>
                      <td>
                        <span className={STATUS_BADGE[slot.status]}>{STATUS_LABELS[slot.status]}</span>
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="inline-actions">
                            {slot.status === "empty" && (
                              <button
                                className="small-button"
                                onClick={() => updateSlotStatus(slot.id, "maintenance")}
                                type="button"
                              >
                                <Wrench size={14} />
                              </button>
                            )}
                            {slot.status === "maintenance" && (
                              <button
                                className="small-button"
                                onClick={() => updateSlotStatus(slot.id, "empty")}
                                type="button"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                            {slot.status !== "occupied" && slot.status !== "reserved" && (
                              <button
                                className="small-button"
                                onClick={() => deleteSlot(slot.id)}
                                type="button"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredSlots.length === 0 && (
                    <tr>
                      <td className="muted-cell" colSpan={7}>Không có slot nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Create single slot */}
        {activeTab === "create" && isAdmin && (
          <form className="stack-form" onSubmit={createSlot}>
            <label>
              Mã slot (tự đặt)
              <input name="slotCode" placeholder="D-01, VIP-01..." required />
            </label>
            <label>
              Khu vực
              <select name="zoneId" required>
                <option value="">Chọn khu vực</option>
                {zoneList.map((z) => (
                  <option key={z.id} value={z.id}>Khu {z.name}</option>
                ))}
              </select>
            </label>
            <label>
              Loại slot
              <select name="slotType">
                {SLOT_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Tính năng (cách nhau bằng dấu phẩy)
              <input name="features" placeholder="charging, rain_cover, cctv" />
            </label>
            <label>
              Tầng (0 = trệt, -1 = hầm B1)
              <input defaultValue={0} name="floor" type="number" />
            </label>
            <label>
              Ghi chú
              <input name="notes" placeholder="Ghi chú vận hành..." />
            </label>
            <button className="full-button" type="submit">
              <ParkingSquare size={18} />
              Tạo slot
            </button>
          </form>
        )}

        {/* Bulk create */}
        {activeTab === "bulk" && isAdmin && (
          <form className="stack-form" onSubmit={bulkCreateSlots}>
            <label>
              Khu vực
              <select name="zoneId" required>
                <option value="">Chọn khu vực</option>
                {zoneList.map((z) => (
                  <option key={z.id} value={z.id}>Khu {z.name}</option>
                ))}
              </select>
            </label>
            <label>
              Số lượng slot cần tạo
              <input defaultValue={5} max={100} min={1} name="count" required type="number" />
            </label>
            <label>
              Loại slot
              <select name="slotType">
                {SLOT_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Tính năng (cách nhau bằng dấy phẩy)
              <input name="features" placeholder="charging, rain_cover" />
            </label>
            <label>
              Tầng
              <input defaultValue={0} name="floor" type="number" />
            </label>
            <button className="full-button" type="submit">
              <LayoutGrid size={18} />
              Tạo hàng loạt
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
