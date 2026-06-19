"use client";

import { useState, type FormEvent } from "react";
import { CreditCard, PlusCircle, QrCode, Settings } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { useParkingApp } from "@/context/parking-app-context";
import { apiFetch } from "@/lib/client-api";
import { currency } from "@/lib/constants";
import { transactions } from "@/lib/mock-data";
import type { TransactionItem } from "@/types";

export function WalletView() {
  const {
    currentUser,
    paymentConfigState,
    transactionList,
    updatePaymentConfig,
    confirmTransaction,
  } = useParkingApp();

  const [topUpMsg, setTopUpMsg] = useState("");

  if (!currentUser) return null;

  const displayTransactions: TransactionItem[] = transactionList.length
    ? transactionList
    : transactions.map((item) => ({
        id: item.id,
        method: item.method,
        amount: item.amount,
        status: item.status === "Thành công" ? "paid" : "pending",
        content: item.id,
        createdAt: item.time,
      }));

  async function handleTopUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount") || 0);
    if (amount < 10000) {
      setTopUpMsg("Số tiền tối thiểu là 10,000 VND.");
      return;
    }
    const response = await apiFetch("/transactions/top-up", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    const data = await response.json();
    setTopUpMsg(data.message || (response.ok ? "Đã tạo yêu cầu nạp tiền." : "Lỗi."));
    if (response.ok) event.currentTarget.reset();
  }

  async function handleConfirmTopUp(id: string) {
    const response = await apiFetch(`/transactions/${id}/confirm-topup`, { method: "POST" });
    const data = await response.json();
    if (response.ok) {
      setTopUpMsg(data.message || "Đã xác nhận nạp tiền.");
      // Refresh would be ideal, but for now show message
    } else {
      setTopUpMsg(data.message || "Không xác nhận được.");
    }
  }

  return (
    <section className="content-grid">
      {/* Top-up form for customer */}
      {currentUser.role === "customer" && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p>Nạp tiền</p>
              <h2>Nạp tiền vào ví</h2>
            </div>
            <PlusCircle size={22} />
          </div>
          <div className="profile-lines" style={{ marginBottom: 12 }}>
            <span>Số dư hiện tại: <strong>{currency.format(currentUser.wallet || 0)}</strong></span>
          </div>
          <form className="stack-form" onSubmit={handleTopUp}>
            <label>
              Số tiền nạp (VND)
              <input min={10000} name="amount" placeholder="50000" required step={1000} type="number" />
            </label>
            <button className="full-button" type="submit">
              <PlusCircle size={18} />
              Tạo yêu cầu nạp tiền
            </button>
            {topUpMsg && <p className="muted-cell">{topUpMsg}</p>}
          </form>
          <p className="muted-cell" style={{ marginTop: 8, fontSize: "0.8rem" }}>
            Sau khi tạo yêu cầu, admin sẽ xác nhận khi nhận được tiền chuyển khoản.
          </p>
        </div>
      )}

      {/* VietQR config for admin */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>VietQR</p>
            <h2>{paymentConfigState.bankName}</h2>
          </div>
          <QrCode size={22} />
        </div>
        {currentUser.role === "admin" ? (
          <form className="stack-form" key={paymentConfigState.id} onSubmit={updatePaymentConfig}>
            <label>
              Ngân hàng
              <input defaultValue={paymentConfigState.bankName} name="bankName" required />
            </label>
            <label>
              BIN ngân hàng
              <input defaultValue={paymentConfigState.bankBin} name="bankBin" required />
            </label>
            <label>
              Số tài khoản
              <input defaultValue={paymentConfigState.accountNumber} name="accountNumber" required />
            </label>
            <label>
              Chủ tài khoản
              <input defaultValue={paymentConfigState.accountName} name="accountName" required />
            </label>
            <label>
              Tiền tố nội dung
              <input defaultValue={paymentConfigState.transferPrefix} name="transferPrefix" required />
            </label>
            <button className="full-button" type="submit">
              <Settings size={18} />
              Lưu VietQR
            </button>
          </form>
        ) : (
          <div className="profile-lines">
            <span>Ngân hàng: {paymentConfigState.bankName}</span>
            <span>STK: {paymentConfigState.accountNumber}</span>
            <span>Chủ TK: {paymentConfigState.accountName}</span>
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="panel wide">
        <div className="panel-heading">
          <div>
            <p>Giao dịch</p>
            <h2>Lịch sử thanh toán</h2>
          </div>
          <CreditCard size={22} />
        </div>
        <DataTable
          headers={["Mã", "Phương thức", "Số tiền", "Trạng thái", "Nội dung", "QR", "Thao tác"]}
          rows={displayTransactions.map((item) => [
            item.id.slice(0, 8) + "...",
            item.method,
            currency.format(item.amount),
            <span className={item.status === "paid" ? "badge success" : "badge warning"} key={`${item.id}-s`}>
              {item.status === "paid" ? "Đã TT" : item.status === "pending" ? "Chờ" : item.status}
            </span>,
            item.content.slice(0, 20),
            item.qrUrl ? (
              <a className="small-button" href={item.qrUrl} key={`${item.id}-qr`} rel="noreferrer" target="_blank">
                QR
              </a>
            ) : (
              "—"
            ),
            item.status === "pending" && currentUser.role === "admin" ? (
              <div className="inline-actions" key={item.id}>
                <button className="small-button" onClick={() => confirmTransaction(item.id)} type="button">
                  Xác nhận
                </button>
                {item.content.startsWith("TOPUP") && (
                  <button className="small-button" onClick={() => handleConfirmTopUp(item.id)} type="button">
                    Nạp ví
                  </button>
                )}
              </div>
            ) : item.status === "paid" ? (
              "✓"
            ) : (
              "—"
            ),
          ])}
        />
      </div>
    </section>
  );
}
