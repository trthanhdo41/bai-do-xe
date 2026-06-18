import type { FormEvent } from "react";
import { apiFetch } from "@/lib/client-api";
import type { Reservation } from "@/types";

type ReservationActionsParams = {
  setReservationList: (items: Reservation[] | ((prev: Reservation[]) => Reservation[])) => void;
  setActionLog: (log: string) => void;
};

export function createReservationActions({ setReservationList, setActionLog }: ReservationActionsParams) {
  async function createReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      slotId: String(form.get("slotId") || ""),
      plate: String(form.get("plate") || ""),
      reservedFrom: String(form.get("reservedFrom") || ""),
      reservedUntil: String(form.get("reservedUntil") || ""),
    };
    const response = await apiFetch("/reservations", { method: "POST", body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không đặt chỗ được.");
      return;
    }
    setReservationList((items) => [data.reservation, ...items]);
    setActionLog(`Đã đặt chỗ ${data.reservation.slotCode} thành công.`);
    event.currentTarget.reset();
  }

  async function cancelReservation(id: string, reason?: string) {
    const response = await apiFetch(`/reservations/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không hủy được.");
      return;
    }
    setReservationList((items) => items.map((r) => (r.id === id ? data.reservation : r)));
    setActionLog("Đã hủy đặt chỗ.");
  }

  async function confirmReservation(id: string) {
    const response = await apiFetch(`/reservations/${id}/confirm`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không xác nhận được.");
      return;
    }
    setReservationList((items) => items.map((r) => (r.id === id ? data.reservation : r)));
    setActionLog(data.message || "Đã xác nhận xe tới.");
  }

  return { createReservation, cancelReservation, confirmReservation };
}
