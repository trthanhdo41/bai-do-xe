"use client";

import { CreditCard, QrCode, Settings } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { useParkingApp } from "@/context/parking-app-context";
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

  if (!currentUser) {
    return null;
  }

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

  return (
    <section className="content-grid">
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
            <span>Số dư ví: {currency.format(currentUser.wallet || 0)}</span>
            <span>Nội dung chuyển khoản dùng theo từng phiên gửi xe.</span>
          </div>
        )}
      </div>
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
            item.id,
            item.method,
            currency.format(item.amount),
            item.status,
            item.content,
            item.qrUrl ? (
              <a className="small-button" href={item.qrUrl} key={`${item.id}-qr`} rel="noreferrer" target="_blank">
                QR
              </a>
            ) : (
              "Không có"
            ),
            item.status === "pending" && currentUser.role === "admin" ? (
              <button className="small-button" key={item.id} onClick={() => confirmTransaction(item.id)} type="button">
                Xác nhận
              </button>
            ) : (
              "OK"
            ),
          ])}
        />
      </div>
    </section>
  );
}
