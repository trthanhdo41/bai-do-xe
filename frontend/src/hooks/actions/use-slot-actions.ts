import type { FormEvent } from "react";
import { apiFetch } from "@/lib/client-api";
import type { ParkingSlot, SlotStatus } from "@/types";

type SlotActionsParams = {
  setSlotList: (slots: ParkingSlot[] | ((items: ParkingSlot[]) => ParkingSlot[])) => void;
  setActionLog: (log: string) => void;
};

export function createSlotActions({ setSlotList, setActionLog }: SlotActionsParams) {
  async function createSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      slotCode: String(form.get("slotCode") || "").toUpperCase(),
      zoneId: String(form.get("zoneId") || ""),
      slotType: String(form.get("slotType") || "regular"),
      features: String(form.get("features") || "")
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      floor: Number(form.get("floor") || 0),
      notes: String(form.get("notes") || "") || undefined,
    };
    const response = await apiFetch("/parking-slots", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không tạo được slot.");
      return;
    }
    setSlotList((items) => [...items, data.slot]);
    setActionLog(`Đã tạo slot "${data.slot.slotCode}".`);
    event.currentTarget.reset();
  }

  async function bulkCreateSlots(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      zoneId: String(form.get("zoneId") || ""),
      count: Number(form.get("count") || 1),
      slotType: String(form.get("slotType") || "regular"),
      features: String(form.get("features") || "")
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      floor: Number(form.get("floor") || 0),
    };
    const response = await apiFetch("/parking-slots/bulk", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không tạo được slots.");
      return;
    }
    setSlotList((items) => [...items, ...data.slots]);
    setActionLog(`Đã tạo ${data.created} slot mới.`);
    event.currentTarget.reset();
  }

  async function updateSlotStatus(id: string, status: SlotStatus, notes?: string) {
    const response = await apiFetch(`/parking-slots/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không đổi trạng thái được.");
      return;
    }
    setSlotList((items) => items.map((s) => (s.id === id ? data.slot : s)));
    setActionLog(`Slot ${data.slot.slotCode} → ${status}.`);
  }

  async function deleteSlot(id: string) {
    const response = await apiFetch(`/parking-slots/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không xóa được slot.");
      return;
    }
    setSlotList((items) => items.filter((s) => s.id !== id));
    setActionLog("Đã xóa slot.");
  }

  return { createSlot, bulkCreateSlots, updateSlotStatus, deleteSlot };
}
