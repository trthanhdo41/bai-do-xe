# iPARK - Hệ thống quản lý bãi đỗ xe local/demo

iPARK là đồ án quản lý bãi đỗ xe chạy local gồm 3 service:

- Frontend: Next.js, chạy tại `http://localhost:3000`
- Backend API: Express + MongoDB, chạy tại `http://localhost:4000/api`
- AI service: FastAPI + OCR/snapshot RTSP, chạy tại `http://127.0.0.1:5000`

Dự án hiện hỗ trợ các luồng demo chính: đăng nhập email/Google, OTP quên mật khẩu, 2FA TOTP cho admin, quản lý phiên đỗ xe, OCR biển số, duyệt checkout khi OCR không khớp, cấu hình bảng giá, VietQR xác nhận tay, thiết bị camera RTSP, feedback, notification, ca trực, sự cố và báo cáo Excel/PDF.

## 1. Yêu cầu môi trường

Khuyến nghị:

- Node.js `20.19+`
- npm `10+`
- Python `3.10+`
- MongoDB local hoặc MongoDB Atlas
- Tesseract OCR để AI service đọc biển số từ ảnh upload

Ubuntu/Debian có thể cần:

```bash
sudo apt update
sudo apt install -y python3-venv python3-pip tesseract-ocr
```

Nếu dùng camera RTSP, máy chạy AI service cần truy cập được RTSP URL trong cùng mạng LAN/VPN.

## 2. Cài đặt lần đầu

Clone hoặc mở repo, sau đó chạy ở thư mục gốc:

```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r ai-service/requirements.txt
```

Tạo file env từ example:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Điền các biến quan trọng trong `backend/.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/bai-do-xe
MONGODB_DB=bai-do-xe
JWT_SECRET=local-development-secret-for-bai-do-xe
AI_SERVICE_URL=http://127.0.0.1:5000
```

Điền `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Seed dữ liệu mẫu:

```bash
npm run seed
```

Seed sẽ tạo admin, nhân viên, xe mẫu, bảng giá mẫu, cấu hình thanh toán mẫu, camera mẫu và notification chào mừng.

## 3. Chạy local

Mở 3 terminal ở thư mục gốc:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

```bash
npm run ai:dev
```

Kiểm tra health:

```bash
curl http://localhost:4000/api/health
curl http://127.0.0.1:5000/health
```

Truy cập frontend tại:

```text
http://localhost:3000
```

Nếu AI báo `Address already in use`, kiểm tra process đang giữ port:

```bash
ss -ltnp | grep 5000
```

Sau đó dừng process cũ hoặc đổi `AI_SERVICE_URL`/script port cho đồng bộ.

## 4. Tài khoản seed

Sau khi chạy `npm run seed`, có các tài khoản mặc định:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@ipark.vn` | `admin` |
| Nhân viên cổng 1 | `nv.1@ipark.vn` | `123456` |
| Nhân viên cổng 2 | `nv.2@ipark.vn` | `123456` |
| Nhân viên cổng 3 | `nv.3@ipark.vn` | `123456` |

Có thể override bằng các biến trong `backend/.env`:

```env
ADMIN_EMAIL=admin@ipark.vn
ADMIN_PASSWORD=admin
STAFF_1_EMAIL=nv.1@ipark.vn
STAFF_1_PASSWORD=123456
```

Customer có thể tự đăng ký bằng email/mật khẩu hoặc đăng nhập bằng Google OAuth nếu đã cấu hình Google credentials.

## 5. Cấu hình Google OAuth

Trong Google Cloud Console, tạo OAuth Client loại Web Application và thêm redirect URI:

```text
http://localhost:4000/api/auth/google/callback
```

Điền vào `backend/.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

Restart backend. Nút "Đăng nhập với Google" trên frontend sẽ chuyển qua Google. Nếu email đã tồn tại, hệ thống đăng nhập vào user đó; nếu email mới, hệ thống tạo user role `customer`.

## 6. Cấu hình SMTP OTP

OTP quên mật khẩu dùng email thật nếu có SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=iPARK <your-email@gmail.com>
```

Với Gmail, nên dùng App Password. Nếu thiếu SMTP trong local demo, API vẫn tạo OTP và trả `devOtp` để test luồng quên mật khẩu.

## 7. Cấu hình 2FA admin

Admin đăng nhập, mở màn Bảo mật, bấm thiết lập 2FA. Hệ thống tạo QR TOTP để quét bằng Google Authenticator, Microsoft Authenticator hoặc app tương tự.

Biến issuer:

```env
TOTP_ISSUER=iPARK
```

Sau khi bật 2FA, lần đăng nhập tiếp theo admin cần nhập thêm mã 6 số từ app authenticator.

## 8. Cấu hình bảng giá

Seed mặc định:

- Miễn phí: `20` phút
- Giá theo giờ: `10.000 VND`
- Qua đêm: `80.000 VND`
- Vé tháng: `1.200.000 VND`
- Phạt quá hạn: `20.000 VND`

Admin có thể chỉnh trực tiếp trên màn cấu hình giá. Checkout sau đó sẽ dùng giá mới từ MongoDB.

Có thể override seed bằng env:

```env
PRICING_FREE_MINUTES=20
PRICING_HOURLY_RATE=10000
PRICING_OVERNIGHT_RATE=80000
PRICING_MONTHLY_RATE=1200000
PRICING_OVERDUE_FINE_RATE=20000
```

## 9. Cấu hình VietQR/thanh toán

Thanh toán local/demo dùng QR + admin xác nhận tay, chưa tích hợp webhook ngân hàng.

Seed mặc định lấy từ env:

```env
PAYMENT_BANK_NAME=Ngân hàng test
PAYMENT_BANK_BIN=970436
PAYMENT_ACCOUNT_NUMBER=0000000000
PAYMENT_ACCOUNT_NAME=IPARK
PAYMENT_TRANSFER_PREFIX=IPARK
```

Luồng thanh toán:

1. Xe checkout thành công.
2. Backend tính phí và tạo transaction trạng thái `pending`.
3. Frontend hiển thị QR với nội dung chuyển khoản dạng `IPARK-{sessionId}`.
4. Admin kiểm tra tiền thực tế và bấm xác nhận.
5. Transaction chuyển `paid`, phiên đỗ xe chuyển `paymentStatus=paid`.

## 10. Cấu hình camera RTSP

Có 2 cách cấu hình camera:

### Cách 1: cấu hình qua env rồi seed

Điền `backend/.env`:

```env
RTSP_ENTRY_URL=rtsp://user:pass@192.168.1.10:554/stream1
RTSP_ENTRY_USERNAME=
RTSP_ENTRY_PASSWORD=
RTSP_EXIT_URL=rtsp://user:pass@192.168.1.11:554/stream1
RTSP_EXIT_USERNAME=
RTSP_EXIT_PASSWORD=
```

Sau đó chạy:

```bash
npm run seed
```

### Cách 2: cấu hình trực tiếp trên UI admin

1. Đăng nhập admin.
2. Mở màn Thiết bị/Camera.
3. Nhập tên camera, loại cổng `entry` hoặc `exit`, RTSP URL, username/password nếu camera yêu cầu.
4. Bấm lưu.
5. Bấm chụp snapshot để kiểm tra AI service có đọc được luồng RTSP không.

Lưu ý:

- Nếu RTSP URL đã chứa `user:pass@host`, có thể để trống username/password.
- Nếu RTSP URL không chứa thông tin đăng nhập, điền username/password riêng để backend ghép khi gọi AI.
- Camera cần cho phép máy local truy cập port RTSP, thường là `554`.
- Khi camera offline, vẫn có thể dùng upload ảnh thủ công ở màn Phiên đỗ xe.

## 11. Luồng demo đề xuất

### Kịch bản 1: Chuẩn bị hệ thống

1. Chạy MongoDB.
2. Chạy `npm run seed`.
3. Chạy backend, frontend, AI service.
4. Mở `http://localhost:3000`.
5. Đăng nhập admin `admin@ipark.vn` / `admin`.
6. Kiểm tra bảng giá, cấu hình thanh toán, camera, notification chào mừng.

### Kịch bản 2: Nhân viên nhận ca

1. Đăng xuất admin.
2. Đăng nhập nhân viên `nv.1@ipark.vn` / `123456`.
3. Mở màn Ca trực.
4. Bấm bắt đầu ca.
5. Kiểm tra ca trực được lưu, refresh trang không mất dữ liệu.

### Kịch bản 3: Xe vào bằng upload ảnh

1. Vào màn Phiên đỗ xe.
2. Chọn ảnh biển số tại khu vực xe vào.
3. Gửi ảnh cho AI OCR.
4. Backend tạo phiên đỗ xe trạng thái đang gửi.
5. Notification sự kiện xe vào được tạo.

### Kịch bản 4: Xe ra OCR khớp biển số

1. Ở màn Phiên đỗ xe, chọn ảnh xe ra có biển số khớp phiên đang gửi.
2. Hệ thống set checkout, tính phí bằng bảng giá DB.
3. Kiểm tra `feeBreakdown`: tổng phút, phút miễn phí, số giờ tính tiền, đơn giá, tổng tiền.
4. Hệ thống tạo transaction `pending` và QR thanh toán.
5. Admin vào màn Thanh toán, kiểm tra QR và bấm xác nhận thanh toán.

### Kịch bản 5: Xe ra OCR không khớp, admin duyệt

1. Tạo một phiên xe vào.
2. Checkout bằng ảnh biển số khác.
3. Hệ thống không hoàn tất checkout ngay, chuyển phiên sang trạng thái chờ duyệt.
4. Đăng nhập admin.
5. Mở Phiên đỗ xe, kiểm tra yêu cầu xác minh.
6. Nhập biển số thủ công/ghi chú nếu cần và bấm duyệt checkout.
7. Hệ thống mới tính phí, tạo transaction và ghi audit thông tin người duyệt.

### Kịch bản 6: Xe vào/ra bằng camera RTSP

1. Đăng nhập admin hoặc staff.
2. Mở màn Thiết bị/Camera.
3. Bấm snapshot camera cổng vào để chắc luồng RTSP hoạt động.
4. Bấm tạo xe vào từ camera entry.
5. Bấm tạo xe ra từ camera exit.
6. Nếu OCR khớp, phiên checkout và tạo thanh toán; nếu không khớp, chuyển sang chờ admin duyệt.

### Kịch bản 7: Customer

1. Đăng ký tài khoản customer hoặc đăng nhập Google.
2. Customer chỉ xem dữ liệu của mình.
3. Gửi feedback.
4. Kiểm tra lịch sử phiên/transaction liên quan tới tài khoản.

### Kịch bản 8: Báo cáo

1. Đăng nhập admin.
2. Mở Báo cáo.
3. Chọn khoảng ngày.
4. Kiểm tra summary: xe vào, xe ra, xe đang gửi, doanh thu, phiên miễn phí, phiên có phí.
5. Xuất Excel `sessions` hoặc `revenue`.
6. Xuất PDF và mở file để kiểm tra mẫu iPARK.

### Kịch bản 9: Sự cố và feedback

1. Staff tạo sự cố gắn với biển số hoặc phiên đỗ xe.
2. Admin xử lý/đóng sự cố.
3. Customer gửi feedback.
4. Admin/staff cập nhật trạng thái feedback.
5. Refresh trang để xác nhận dữ liệu vẫn nằm trong MongoDB.

## 12. API chính

Các endpoint đều có prefix `/api`.

| Nhóm | Endpoint |
| --- | --- |
| Auth | `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/google`, `/auth/google/callback` |
| OTP/2FA | `/auth/forgot-password`, `/auth/reset-password`, `/auth/2fa/setup`, `/auth/2fa/verify`, `/auth/2fa/disable` |
| Pricing | `/pricing-config` |
| Parking | `/parking-sessions`, `/parking-sessions/camera-entry`, `/parking-sessions/camera-exit`, `/parking-sessions/:id/verification-request`, `/parking-sessions/:id/approve-checkout` |
| Payment | `/payment-config`, `/transactions`, `/transactions/session/:sessionId`, `/transactions/:id/confirm` |
| Devices | `/devices`, `/devices/:id/snapshot` |
| Operations | `/feedback`, `/notifications`, `/shifts`, `/incidents` |
| Reports | `/reports/summary`, `/reports/export` |

AI service:

| Endpoint | Mục đích |
| --- | --- |
| `GET /health` | Kiểm tra AI service |
| `POST /recognize` | OCR biển số từ ảnh upload |
| `POST /snapshot` | Chụp ảnh từ RTSP URL |

## 13. Kiểm tra trước khi demo

Chạy:

```bash
npm run build -w backend
npm run lint -w frontend
npm run build -w frontend
.venv/bin/python -m py_compile ai-service/main.py
npm run seed
```

Smoke test nhanh:

```bash
curl http://localhost:4000/api/health
curl http://127.0.0.1:5000/health
curl -I http://localhost:3000
```

## 14. Lỗi thường gặp

### Python venv lỗi `ensurepip is not available`

Cài package venv:

```bash
sudo apt install -y python3-venv
python3 -m venv .venv
```

### AI service báo `Address already in use`

Port `5000` đang bị process khác giữ:

```bash
ss -ltnp | grep 5000
```

Dừng process cũ rồi chạy lại:

```bash
npm run ai:dev
```

### OCR không nhận biển số

- Kiểm tra đã cài `tesseract-ocr`.
- Ảnh nên rõ, ít nghiêng, biển số không bị lóa.
- Với camera RTSP, thử snapshot trước để kiểm tra frame có biển số.
- Dùng luồng admin duyệt thủ công nếu OCR sai hoặc không khớp.

### Camera RTSP không snapshot được

- Kiểm tra máy local có truy cập được IP camera.
- Kiểm tra username/password.
- Kiểm tra RTSP path đúng theo hãng camera.
- Thử URL bằng VLC trước.
- Kiểm tra AI service đang chạy ở `http://127.0.0.1:5000`.

### Google login không hoạt động

- Kiểm tra `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Redirect URI trong Google Cloud phải đúng: `http://localhost:4000/api/auth/google/callback`.
- Restart backend sau khi đổi env.

### Không gửi được OTP email

- Kiểm tra SMTP host/port/user/pass.
- Gmail cần App Password, không dùng mật khẩu tài khoản thường.
- Local demo thiếu SMTP vẫn có thể dùng `devOtp` trả về từ API.

## 15. Ghi chú bảo mật local

- Không commit `backend/.env`, `frontend/.env`, mật khẩu SMTP, Google secret, tài khoản ngân hàng thật.
- Đổi mật khẩu seed trước khi bàn giao hoặc demo công khai.
- Local demo dùng VietQR xác nhận tay, chưa có webhook ngân hàng tự động.
- Camera RTSP có thể chứa credential, chỉ lưu trong `.env` hoặc cấu hình DB local tin cậy.
