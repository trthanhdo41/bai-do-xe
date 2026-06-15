import { FormEvent } from "react";

import { apiFetch } from "@/lib/client-api";
import type { PaymentConfig, PricingConfig, TransactionItem } from "@/types";

type PaymentActionsParams = {
  setPricingConfigState: (config: PricingConfig) => void;
  setPaymentConfigState: (config: PaymentConfig) => void;
  setTransactionList: (transactions: TransactionItem[] | ((items: TransactionItem[]) => TransactionItem[])) => void;
  setActionLog: (log: string) => void;
};

export function createPaymentActions({
  setPricingConfigState,
  setPaymentConfigState,
  setTransactionList,
  setActionLog,
}: PaymentActionsParams) {
  async function updatePricing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      freeMinutes: Number(form.get("freeMinutes") || 0),
      hourlyRate: Number(form.get("hourlyRate") || 0),
      overnightRate: Number(form.get("overnightRate") || 0),
      monthlyRate: Number(form.get("monthlyRate") || 0),
      overdueFineRate: Number(form.get("overdueFineRate") || 0),
    };

    try {
      const response = await apiFetch("/pricing-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionLog(data.message || "Không lưu được bảng giá.");
        return;
      }

      setPricingConfigState(data.pricingConfig);
      setActionLog("Đã cập nhật bảng giá trong MongoDB.");
    } catch {
      setActionLog("Không kết nối được API cấu hình giá.");
    }
  }

  async function updatePaymentConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      bankName: String(form.get("bankName") || ""),
      bankBin: String(form.get("bankBin") || ""),
      accountNumber: String(form.get("accountNumber") || ""),
      accountName: String(form.get("accountName") || ""),
      transferPrefix: String(form.get("transferPrefix") || ""),
    };

    try {
      const response = await apiFetch("/payment-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionLog(data.message || "Không lưu được cấu hình thanh toán.");
        return;
      }
      setPaymentConfigState(data.paymentConfig);
      setActionLog("Đã lưu cấu hình VietQR.");
    } catch {
      setActionLog("Không kết nối được API thanh toán.");
    }
  }

  async function confirmTransaction(id: string) {
    const response = await apiFetch(`/transactions/${id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "Admin xác nhận thủ công" }),
    });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không xác nhận được giao dịch.");
      return;
    }
    setTransactionList((items) => items.map((item) => (item.id === id ? data.transaction : item)));
    setActionLog("Đã xác nhận thanh toán.");
  }

  async function createPaymentForSession(id: string) {
    const response = await apiFetch(`/transactions/session/${id}`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setActionLog(data.message || "Không tạo được giao dịch.");
      return;
    }
    if (data.transaction) {
      setTransactionList((items) => [data.transaction, ...items.filter((item) => item.id !== data.transaction.id)]);
    }
    setActionLog(data.message || "Đã tạo giao dịch cho phiên.");
  }

  return {
    updatePricing,
    updatePaymentConfig,
    confirmTransaction,
    createPaymentForSession,
  };
}
