# Tài liệu dev - Dự án iPARK

## 1. Mục đích dự án

iPARK là hệ thống web quản lý bãi đỗ xe ô tô tại Hòa Lạc, Thạch Thất, Hà Nội.

Thông tin hiện có:

- Tên bãi xe: iPARK.
- Địa chỉ: Hòa Lạc, Thạch Thất, Hà Nội.
- Email liên hệ: `support@ipark.vn`.
- Hotline: chưa cung cấp.
- Chỉ quản lý ô tô, không làm xe máy.
- Sức chứa: 30 ô tô.
- Chia khu: A/B/C, mỗi khu 10 chỗ.
- Miễn phí: 20 phút đầu.
- Sau 20 phút: tính phí theo giờ nếu khách không mua gói hoặc chưa trả tiền trước.
- Chạy local trước, chưa deploy production.

Luồng chính:

1. Nhân viên đăng nhập.
2. Xe vào: nhân viên upload ảnh xe vào.
3. Python AI service OCR biển số.
4. Hệ thống tạo phiên đỗ xe, lưu ảnh/biển số/slot vào MongoDB.
5. Xe ra: nhân viên upload ảnh xe ra.
6. AI OCR biển số ảnh ra.
7. Hệ thống match biển số vào/ra và tính điểm tương đồng ảnh xe.
8. Nếu khớp, hệ thống checkout và tính phí.
9. Nếu không khớp hoặc OCR lỗi, nhân viên xác minh thủ công.

## 2. Công nghệ

- Frontend + Backend API: Next.js, React, TypeScript.
- Database: MongoDB local.
- Auth: JWT cookie `httpOnly`.
- Password hash: `bcrypt`.
- ORM/ODM: Mongoose.
- AI/OCR: Python FastAPI + Tesseract OCR.
- UI icon: lucide-react.

## 3. Cách chạy local

Yêu cầu máy có:

- Node.js.
- Python 3.
- MongoDB local ở `localhost:27017`.
- Tesseract OCR.

Chạy web:

```bash
npm install
npm run seed
npm run dev
```

Chạy AI service ở terminal khác:

```bash
python3 -m venv .venv
.venv/bin/pip install -r ai-service/requirements.txt
npm run ai:dev
```

URL:

- Web: `http://localhost:3000`
- AI service: `http://127.0.0.1:8000`
- AI health check: `http://127.0.0.1:8000/health`

## 4. Biến môi trường

File `.env.local` không được push lên GitHub.

Tạo local:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/bai-do-xe
MONGODB_DB=bai-do-xe
JWT_SECRET=local-development-secret-for-bai-do-xe-please-change-in-production
AI_SERVICE_URL=http://127.0.0.1:8000
```

## 5. Tài khoản seed

Sau khi chạy `npm run seed`:

- Super Admin: `admin@ipark.vn` / `admin`
- Nhân viên cổng 1: `nv.1@ipark.vn` / `123456` - ca sáng `06:00-14:00`
- Nhân viên cổng 2: `nv.2@ipark.vn` / `123456` - ca chiều `14:00-22:00`
- Nhân viên cổng 3: `nv.3@ipark.vn` / `123456` - ca đêm `22:00-06:00`

## 6. Tiến độ

Ước tính hiện tại: khoảng 65-70%.

Đã làm thật:

- Đăng ký email/mật khẩu.
- Đăng nhập email/mật khẩu.
- Đăng xuất.
- JWT cookie `httpOnly`.
- Hash mật khẩu bằng `bcrypt`.
- MongoDB local bằng Mongoose.
- Seed Super Admin và 3 nhân viên iPARK.
- Phân quyền cơ bản admin/staff/customer.
- Quản lý user qua API admin.
- Quản lý phương tiện qua API.
- Chỉ nhận ô tô trong model/API chính.
- Tạo phiên đỗ xe bằng API.
- Hoàn thành phiên đỗ xe bằng API.
- Sức chứa 30 chỗ, chia khu A/B/C, mỗi khu 10 chỗ.
- Cấp slot tự động theo A/B/C.
- Miễn phí 20 phút đầu trong hàm tính phí.
- Upload ảnh xe vào.
- Python OCR nhận diện biển số ảnh vào.
- Lưu ảnh vào `public/uploads/entry`.
- Upload ảnh xe ra.
- Python OCR nhận diện biển số ảnh ra.
- Match biển số vào/ra.
- Tính điểm tương đồng ảnh xe bằng fingerprint cơ bản.
- Lưu trạng thái match vào MongoDB.
- Nếu match thì checkout.
- UI dashboard, phiên đỗ xe, người dùng, phương tiện, ví, phản hồi, thông báo, ca làm, sự cố, AI, camera/thiết bị, cấu hình, báo cáo, bảo mật.

Đã có giao diện nhưng backend thật chưa đầy đủ:

- Ví và lịch sử giao dịch.
- VietQR thật.
- Phản hồi khách hàng.
- Thông báo.
- Quản lý ca làm việc đầy đủ.
- Báo cáo sự cố đầy đủ.
- Cấu hình bảng giá/gói/phạt.
- Báo cáo doanh thu, thống kê, xuất PDF/Excel.
- Quản lý camera/thiết bị RTSP.
- OTP email.
- 2FA admin.
- Google login.

Chưa làm hoặc còn thiếu thông tin:

- Bảng giá ô tô thật theo giờ, qua đêm, theo tháng.
- Mức phạt quá hạn.
- VietQR thật: cần thông tin ngân hàng/số tài khoản/chủ tài khoản/BIN để test thật.
- SMTP OTP thật: cần SMTP host/user/app password.
- Google OAuth thật: cần Google Client ID/Secret.
- Camera RTSP thật: cần URL cổng vào và cổng ra.
- Báo cáo PDF/Excel theo mẫu trường.
- AI nhận diện loại xe/màu xe production.
- AI match xe bằng model re-identification production.

## 7. API chính

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Người dùng:

- `GET /api/users`
- `PATCH /api/users`

Phương tiện:

- `GET /api/vehicles`
- `POST /api/vehicles`
- `PATCH /api/vehicles`

Phiên đỗ xe:

- `GET /api/parking-sessions`
- `POST /api/parking-sessions`
- `PATCH /api/parking-sessions`
- `POST /api/parking-sessions/upload`

AI service:

- `GET /health`
- `POST /detect`

## 8. Luồng upload ảnh xe vào/ra

Xe vào:

1. UI gửi `FormData` tới `POST /api/parking-sessions/upload`.
2. `action=entry`.
3. Có file `image`.
4. Next.js API gọi Python service `/detect`.
5. Python OCR trả `plate`, `confidence`, `rawText`, `imageHash`.
6. Next.js lưu ảnh vào `public/uploads/entry`.
7. Next.js tạo `ParkingSession` trong MongoDB.
8. Slot được cấp theo A/B/C, tối đa 30 chỗ.

Xe ra:

1. UI chọn phiên đang gửi.
2. Upload ảnh xe ra.
3. UI gửi `FormData` tới `POST /api/parking-sessions/upload`.
4. `action=exit`.
5. Có `sessionId` và file `image`.
6. Python OCR nhận diện biển số ảnh ra.
7. API so biển số ảnh vào và ảnh ra.
8. API tính `vehicleMatchScore` từ image hash.
9. Nếu biển số khớp:
   - set `status=Đã hoàn thành`
   - set `checkOutAt`
   - tính `fee`
   - set `matchStatus=Khớp`
10. Nếu không khớp:
   - set `matchStatus=Không khớp`
   - không tự checkout
   - cần nhân viên xác minh thủ công.

## 9. Test đã chạy

Đã chạy:

```bash
npm run seed
npm run lint
npm run build
.venv/bin/python -m py_compile ai-service/main.py
curl http://127.0.0.1:8000/health
```

Đã test thủ công bằng ảnh biển số tự tạo:

- Python OCR đọc được `30H67890`.
- Confidence trả về `90`.
- Upload ảnh xe vào qua Next.js API tạo session MongoDB thành công.
- Upload ảnh xe ra cùng ảnh trả:
  - `matchStatus=Khớp`
  - `vehicleMatchScore=100`
  - `status=Đã hoàn thành`
  - `fee=0` nếu nằm trong 20 phút miễn phí hoặc chưa có bảng giá thật.

Chưa test:

- Ảnh biển số thật từ camera/bãi xe.
- Ảnh mờ, nghiêng, thiếu sáng.
- Camera RTSP thật.
- Trường hợp biển vào và biển ra khác nhau bằng ảnh thật.
- Tải đồng thời nhiều xe.
- Quyền chi tiết cho từng role trên toàn bộ UI.
- Báo cáo PDF/Excel.
- Thanh toán VietQR thật.
- Email OTP thật.
- Google login thật.
- Deploy production.

## 10. Đánh giá đúng yêu cầu Dũng

Đúng phần lõi:

- Upload ảnh lúc xe vào: đã có.
- Detect biển số lúc xe vào: đã có bằng Python OCR.
- Upload ảnh lúc checkout: đã có.
- Detect biển số lúc checkout: đã có.
- Match checkout với xe vào: đã có bằng biển số.
- Có thêm điểm match ảnh xe: đã có fingerprint ảnh cơ bản.
- Chỉ làm ô tô: đã cập nhật model/API/UI chính.
- Sức chứa 30 chỗ A/B/C: đã cập nhật config/slot.
- Miễn phí 20 phút đầu: đã cập nhật hàm tính phí.

Chưa đúng 100% production:

- Chưa có bảng giá thật nên chưa tính được phí thật sau 20 phút.
- Chưa có VietQR/SMTP/Google credentials thật.
- Chưa có URL RTSP camera thật.
- Chưa test ảnh thực tế.
- Chưa có model AI nhận dạng loại xe/màu xe production.

## 11. Việc cần làm tiếp

Ưu tiên cao:

1. Dũng gửi bảng giá ô tô thật theo giờ, qua đêm, theo tháng.
2. Dũng gửi mức phạt quá hạn.
3. Lấy ảnh xe thật để test OCR.
4. Thêm nhập biển số thủ công khi OCR lỗi.
5. Làm CRUD thật cho cấu hình giá.
6. Tính phí theo bảng giá thật.
7. Làm lịch sử giao dịch ví thật.
8. Làm báo cáo doanh thu thật.

Ưu tiên trung bình:

1. Làm SMTP OTP/quên mật khẩu.
2. Làm Google OAuth.
3. Làm VietQR thật.
4. Làm xuất Excel/PDF.
5. Làm cấu hình camera RTSP thật.

Ưu tiên AI nâng cao:

1. Thu thập dataset ảnh thực tế.
2. Dùng OpenCV crop vùng biển số.
3. Tích hợp model YOLO phát hiện biển số/xe.
4. Tích hợp OCR tốt hơn cho biển số Việt Nam.
5. Tính embedding ảnh xe để match xe vào/ra tốt hơn fingerprint hiện tại.

## 12. Thông tin cần hỏi tiếp Dũng

```text
Dũng ơi anh đã cập nhật iPARK: admin/3 nhân viên, chỉ ô tô, 30 chỗ khu A/B/C, miễn phí 20 phút đầu.
Em gửi tiếp giúp anh:

1. Bảng giá ô tô theo giờ, qua đêm, theo tháng.
2. Mức phạt quá hạn: quá bao lâu phạt, phạt bao nhiêu.
3. Ảnh xe vào/ra thực tế hoặc ảnh mẫu camera để test OCR.
4. VietQR test dùng ngân hàng/số tài khoản/chủ tài khoản/BIN nào?
5. SMTP test dùng email/app password nào?
6. Google Client ID/Secret test dùng project Google nào?
7. URL RTSP/HTTP của camera cổng vào và cổng ra.
8. Có mẫu báo cáo PDF/Excel của trường không?
```

## 13. Lưu ý bảo mật

- Không commit `.env.local`.
- Không commit ảnh upload runtime trong `public/uploads`.
- Không commit `.venv`, `node_modules`, `.next`.
- Đổi `JWT_SECRET` khi deploy.
- Đổi mật khẩu seed trước khi bàn giao thật.
- Không để tài khoản ngân hàng, SMTP password, Google secret trong code.

## 14. Repo

- Branch chính: `main`.
- File tài liệu này được phép push để nhân viên đọc và tiếp tục phát triển.
