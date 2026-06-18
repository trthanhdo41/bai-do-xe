"use client";

import { useState } from "react";
import { BarChart3, Download, TrendingUp, Users, Clock } from "lucide-react";
import { useParkingApp } from "@/context/parking-app-context";
import { currency } from "@/lib/constants";
import { RevenueChart } from "./revenue-chart";
import { OccupancyChart } from "./occupancy-chart";
import { TopCustomersTable } from "./top-customers-table";
import { PeakHoursHeatmap } from "./peak-hours-heatmap";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthAgoStr() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export function ReportsView() {
  const {
    currentUser,
    reportSummary,
    reportFrom,
    setReportFrom,
    reportTo,
    setReportTo,
    loadReportSummary,
    downloadReport,
    revenueChart,
    occupancyData,
    topCustomers,
    peakHours,
    loadRevenueChart,
    loadOccupancyHourly,
    loadTopCustomers,
    loadPeakHours,
  } = useParkingApp();

  const [activeTab, setActiveTab] = useState<"summary" | "revenue" | "occupancy" | "customers" | "peak">("summary");
  const [chartFrom, setChartFrom] = useState(monthAgoStr());
  const [chartTo, setChartTo] = useState(todayStr());
  const [groupBy, setGroupBy] = useState("day");

  if (!currentUser || currentUser.role !== "admin") return null;

  function loadChartData() {
    if (activeTab === "revenue") loadRevenueChart(chartFrom, chartTo, groupBy);
    if (activeTab === "occupancy") loadOccupancyHourly(chartFrom, chartTo);
    if (activeTab === "customers") loadTopCustomers(chartFrom, chartTo, 10);
    if (activeTab === "peak") loadPeakHours(chartFrom, chartTo);
  }

  return (
    <section className="content-single">
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>Báo cáo</p>
            <h2>Thống kê & Phân tích</h2>
          </div>
          <BarChart3 size={22} />
        </div>

        <div className="tab-bar">
          {([
            ["summary", "Tổng quan"],
            ["revenue", "Doanh thu"],
            ["occupancy", "Lấp đầy"],
            ["customers", "Khách hàng"],
            ["peak", "Giờ cao điểm"],
          ] as const).map(([key, label]) => (
            <button
              className={`tab-item${activeTab === key ? " tab-active" : ""}`}
              key={key}
              onClick={() => setActiveTab(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Summary tab */}
        {activeTab === "summary" && (
          <div>
            <div className="filter-row">
              <input onChange={(e) => setReportFrom(e.target.value)} type="date" value={reportFrom} />
              <input onChange={(e) => setReportTo(e.target.value)} type="date" value={reportTo} />
              <button className="small-button" onClick={() => loadReportSummary(reportFrom, reportTo)} type="button">
                Tải báo cáo
              </button>
              <button className="small-button" onClick={() => downloadReport("sessions", "xlsx")} type="button">
                <Download size={14} /> Excel
              </button>
              <button className="small-button" onClick={() => downloadReport("revenue", "pdf")} type="button">
                <Download size={14} /> PDF
              </button>
            </div>
            {reportSummary && (
              <div className="metric-grid" style={{ marginTop: 16 }}>
                <div className="metric-card"><span>Xe vào</span><strong>{reportSummary.entryCount}</strong></div>
                <div className="metric-card"><span>Xe ra</span><strong>{reportSummary.exitCount}</strong></div>
                <div className="metric-card"><span>Đang gửi</span><strong>{reportSummary.activeCount}</strong></div>
                <div className="metric-card"><span>Doanh thu</span><strong>{currency.format(reportSummary.revenue)}</strong></div>
                <div className="metric-card"><span>Phiên miễn phí</span><strong>{reportSummary.freeSessionCount}</strong></div>
                <div className="metric-card"><span>Phiên có phí</span><strong>{reportSummary.paidSessionCount}</strong></div>
              </div>
            )}
          </div>
        )}

        {/* Chart tabs */}
        {activeTab !== "summary" && (
          <div>
            <div className="filter-row">
              <input onChange={(e) => setChartFrom(e.target.value)} type="date" value={chartFrom} />
              <input onChange={(e) => setChartTo(e.target.value)} type="date" value={chartTo} />
              {activeTab === "revenue" && (
                <select onChange={(e) => setGroupBy(e.target.value)} value={groupBy}>
                  <option value="day">Theo ngày</option>
                  <option value="week">Theo tuần</option>
                  <option value="month">Theo tháng</option>
                </select>
              )}
              <button className="small-button" onClick={loadChartData} type="button">
                Tải dữ liệu
              </button>
            </div>

            {activeTab === "revenue" && <RevenueChart data={revenueChart} />}
            {activeTab === "occupancy" && <OccupancyChart data={occupancyData} />}
            {activeTab === "customers" && <TopCustomersTable data={topCustomers} />}
            {activeTab === "peak" && <PeakHoursHeatmap data={peakHours} />}
          </div>
        )}
      </div>
    </section>
  );
}
