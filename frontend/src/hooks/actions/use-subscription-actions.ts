import type { FormEvent } from "react";
import { apiFetch } from "@/lib/client-api";
import type { Subscription, SubscriptionPlan } from "@/types";

type SubscriptionActionsParams = {
  setPlanList: (items: SubscriptionPlan[] | ((prev: SubscriptionPlan[]) => SubscriptionPlan[])) => void;
  setSubscriptionList: (items: Subscription[] | ((prev: Subscription[]) => Subscription[])) => void;
  setActionLog: (log: string) => void;
};

export function createSubscriptionActions({ setPlanList, setSubscriptionList, setActionLog }: SubscriptionActionsParams) {
  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name") || ""),
      description: String(form.get("description") || ""),
      duration: String(form.get("duration") || "monthly"),
      durationDays: Number(form.get("durationDays") || 30),
      price: Number(form.get("price") || 0),
      discountPercent: Number(form.get("discountPercent") || 0),
      maxVehicles: Number(form.get("maxVehicles") || 1),
      features: String(form.get("features") || "").split(",").map((f) => f.trim()).filter(Boolean),
    };
    const response = await apiFetch("/subscriptions/plans", { method: "POST", body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không tạo được gói.");
      return;
    }
    setPlanList((items) => [...items, data.plan]);
    setActionLog(`Đã tạo gói "${data.plan.name}".`);
    event.currentTarget.reset();
  }

  async function purchaseSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      planId: String(form.get("planId") || ""),
      plates: String(form.get("plates") || "").split(",").map((p) => p.trim()).filter(Boolean),
    };
    const response = await apiFetch("/subscriptions", { method: "POST", body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không mua được gói.");
      return;
    }
    setSubscriptionList((items) => [data.subscription, ...items]);
    setActionLog(`Đã đăng ký gói "${data.subscription.planName}".`);
    event.currentTarget.reset();
  }

  async function renewSubscription(id: string) {
    const response = await apiFetch(`/subscriptions/${id}/renew`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không gia hạn được.");
      return;
    }
    setSubscriptionList((items) => items.map((s) => (s.id === id ? data.subscription : s)));
    setActionLog("Đã gia hạn gói thành công.");
  }

  async function cancelSubscription(id: string) {
    const response = await apiFetch(`/subscriptions/${id}/cancel`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không hủy được gói.");
      return;
    }
    setSubscriptionList((items) => items.map((s) => (s.id === id ? data.subscription : s)));
    setActionLog("Đã hủy gói.");
  }

  return { createPlan, purchaseSubscription, renewSubscription, cancelSubscription };
}
