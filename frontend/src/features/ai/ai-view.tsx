"use client";

import { useState } from "react";
import { Bot, ScanLine, Upload } from "lucide-react";

import { useParkingApp } from "@/context/parking-app-context";
import { apiFetch } from "@/lib/client-api";

type DetectionResult = {
  plate: string;
  confidence: number;
  vehicleType: string;
  rawText: string;
  imageHash: string;
};

export function AiView() {
  const { simulateAction } = useParkingApp();
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("image");
    if (!(file instanceof File) || !file.name) {
      simulateAction("Vui lòng chọn ảnh để nhận dạng.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/../ai-detect`, {
        method: "POST",
        body: payload,
      });

      // Fallback: call via backend proxy (upload to parking sessions for detection)
      const proxyPayload = new FormData();
      proxyPayload.append("action", "entry");
      proxyPayload.append("owner", "AI Test");
      proxyPayload.append("image", file);
      const proxyResponse = await apiFetch("/parking-sessions/upload", { method: "POST", body: proxyPayload });
      const data = await proxyResponse.json();

      if (proxyResponse.ok && data.detection) {
        setResults((prev) => [data.detection, ...prev].slice(0, 20));
        simulateAction(`Đã nhận diện: ${data.detection.plate} (${data.detection.confidence}%)`);
      } else if (data.message) {
        simulateAction(data.message);
      }
    } catch {
      simulateAction("Không kết nối được AI service.");
    } finally {
      setLoading(false);
      (event.target as HTMLFormElement).reset();
    }
  }

  return (
    <section className="content-grid">
      <div className="panel">
        <div className="panel-heading">
          <div>
            <p>AI nhận dạng</p>
            <h2>Tải ảnh xe lên</h2>
          </div>
          <Bot size={22} />
        </div>
        <form className="stack-form" onSubmit={handleUpload}>
          <label>
            Ảnh xe (biển số rõ)
            <input accept="image/*" name="image" required type="file" />
          </label>
          <button className="full-button" disabled={loading} type="submit">
            <Upload size={18} />
            {loading ? "Đang nhận dạng..." : "Chạy nhận dạng AI"}
          </button>
        </form>
        <p className="muted-cell" style={{ marginTop: 12 }}>
          Upload ảnh xe có biển số rõ ràng. AI sẽ nhận diện biển số, loại xe và trả kết quả.
        </p>
      </div>
      <div className="panel wide">
        <div className="panel-heading">
          <div>
            <p>Kết quả</p>
            <h2>Lịch sử nhận dạng AI</h2>
          </div>
          <ScanLine size={22} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Biển số</th>
                <th>Tin cậy</th>
                <th>Loại xe</th>
                <th>Raw text</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.plate || "Không nhận diện được"}</strong></td>
                  <td><span className={item.confidence > 60 ? "badge success" : "badge warning"}>{item.confidence}%</span></td>
                  <td>{item.vehicleType}</td>
                  <td className="muted-cell">{item.rawText?.slice(0, 30)}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td className="muted-cell" colSpan={4}>Chưa có kết quả. Upload ảnh để bắt đầu.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
