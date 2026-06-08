# Tài liệu dev - Dự án Web Quản Lý Bãi Đỗ Xe

## 1. Mục đích dự án

Dự án này là hệ thống web quản lý bãi đỗ xe cho đồ án của Dũng Thiều.

Luồng chính theo yêu cầu ban đầu:

1. Nhân viên đăng nhập hệ thống.
2. Khi xe vào bãi, nhân viên upload ảnh xe vào.
3. Python AI service nhận diện biển số từ ảnh.
4. Hệ thống tạo phiên đỗ xe và lưu ảnh/biển số vào MongoDB.
5. Khi xe ra, nhân viên upload ảnh xe ra.
6. AI nhận diện biển số ảnh ra và đối chiếu với biển số ảnh vào.
7. Nếu khớp, hệ thống checkout, tính phí và lưu biên lai.
8. Nếu không khớp hoặc ảnh lỗi, nhân viên xác minh thủ công.

## 2. Công nghệ đang dùng

- Frontend + Backend API: Next.js, React, TypeScript.
- Database: MongoDB local.
- Auth: JWT cookie `httpOnly`, mật khẩu hash bằng `bcrypt`.
- AI nhận diện biển số: Python FastAPI + Tesseract OCR.
- ORM/ODM: Mongoose.
- UI icon: lucide-react.

## 3. Cách chạy local

Yêu cầu máy có:

- Node.js.
- Python 3.
- MongoDB local đang chạy ở `localhost:27017`.
- Tesseract OCR đã cài.

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

## 4. Biến môi trường local

File `.env.local` không được push lên GitHub.

Cần tạo local:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/bai-do-xe
MONGODB_DB=bai-do-xe
JWT_SECRET=local-development-secret-for-bai-do-xe-please-change-in-production
AI_SERVICE_URL=http://127.0.0.1:8000
```

## 5. Tài khoản seed

Sau khi chạy `npm run seed`:

- Admin: `admin@parking.local` / `123456`
- Staff: `staff@parking.local` / `123456`
- Customer: `customer@parking.local` / `123456`

Khi nhận thông tin thật từ Dũng, đổi seed theo admin/nhân viên thật.

## 6. Tình trạng tính năng

Tổng quan tiến độ ước tính: khoảng 60-65%.

Đã làm thật:

- Đăng ký bằng email/mật khẩu.
- Đăng nhập bằng email/mật khẩu.
- Đăng xuất.
- JWT cookie `httpOnly`.
- Hash mật khẩu bằng `bcrypt`.
- MongoDB local bằng Mongoose.
- Seed tài khoản admin/staff/customer.
- Phân quyền cơ bản admin/staff/customer.
- Quản lý user qua API admin.
- Quản lý phương tiện qua API.
- Tạo phiên đỗ xe bằng API.
- Hoàn thành phiên đỗ xe bằng API.
- Upload ảnh xe vào.
- Python OCR nhận diện biển số từ ảnh vào.
- Lưu ảnh xe vào trong `public/uploads/entry`.
- Upload ảnh xe ra.
- Python OCR nhận diện biển số từ ảnh ra.
- Match biển số vào/ra.
- Tính phí khi checkout khớp.
- Lưu ảnh xe ra trong `public/uploads/exit`.
- Lưu trạng thái match vào MongoDB.
- Tính điểm tương đồng ảnh xe bằng fingerprint ảnh cơ bản.
- UI dashboard, phiên đỗ xe, người dùng, phương tiện, ví, phản hồi, thông báo, ca làm, sự cố, AI, camera/thiết bị, cấu hình, báo cáo, bảo mật.

Đã có giao diện nhưng chưa làm backend thật đầy đủ:

- Ví và lịch sử giao dịch.
- VietQR.
- Phản hồi khách hàng.
- Thông báo.
- Ca làm việc.
- Báo cáo sự cố.
- Cấu hình giá/gói/phạt/sức chứa.
- Báo cáo doanh thu, thống kê, xuất PDF/Excel.
- Quản lý camera/thiết bị.
- OTP email.
- 2FA admin.
- Google login.

Chưa làm hoặc cần thông tin/thết bị thật:

- Google OAuth thật: cần Google Client ID/Secret.
- OTP/quên mật khẩu thật: cần SMTP host/user/app password.
- VietQR thật: cần ngân hàng, số tài khoản, chủ tài khoản, BIN ngân hàng.
- Camera thật: cần URL RTSP/HTTP của camera vào/ra.
- AI nhận diện loại xe/màu xe chính xác: hiện OCR chủ yếu nhận biển số; loại xe đang để `Không xác định`.
- AI so khớp toàn bộ xe chính xác bằng model deep learning: hiện mới có fingerprint ảnh cơ bản, đủ demo logic nhưng chưa phải model nhận dạng xe production.
- Báo cáo PDF/Excel thật theo mẫu trường.
- Deploy production.

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
5. Python OCR trả về:
   - `plate`
   - `confidence`
   - `rawText`
   - `imageHash`
6. Next.js lưu ảnh vào `public/uploads/entry`.
7. Next.js tạo `ParkingSession` trong MongoDB.

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
  - `fee=35000`

Chưa test:

- Ảnh biển số thật từ camera/bãi xe.
- Ảnh mờ, nghiêng, thiếu sáng.
- Nhiều format biển số xe máy/ô tô khác nhau.
- Trường hợp biển vào và biển ra khác nhau.
- Tải đồng thời nhiều xe.
- Quyền chi tiết cho từng role trên toàn bộ UI.
- Báo cáo PDF/Excel.
- Thanh toán thật.
- Email OTP thật.
- Google login thật.
- Deploy production.

## 10. Đánh giá đúng yêu cầu ban đầu

Đúng phần lõi Dũng hỏi trong tin nhắn:

- Upload ảnh lúc xe vào: đã có.
- Detect biển số lúc xe vào: đã có bằng Python OCR.
- Upload ảnh lúc checkout: đã có.
- Detect biển số lúc checkout: đã có.
- Match checkout với xe vào: đã có bằng biển số.
- Có thêm điểm match ảnh xe: đã có fingerprint ảnh cơ bản.

Chưa đúng 100% nếu hiểu là AI production:

- Chưa dùng model deep learning để nhận dạng loại xe/màu xe.
- Chưa nhận dạng xe bằng embedding/re-identification model.
- Chưa test bằng camera thật.
- Chưa xử lý hoàn chỉnh ảnh thực tế xấu.

Kết luận: đúng luồng đồ án và demo thật bằng OCR + MongoDB; chưa phải hệ thống production AI hoàn chỉnh.

## 11. Việc cần làm tiếp theo

Ưu tiên cao:

1. Lấy ảnh xe thật từ Dũng để test OCR.
2. Tinh chỉnh tiền xử lý ảnh trong `ai-service/main.py`.
3. Thêm nhập biển số thủ công khi OCR lỗi.
4. Hoàn thiện role guard trên UI và API.
5. Làm CRUD thật cho cấu hình giá.
6. Tính phí theo bảng giá thật.
7. Làm lịch sử giao dịch ví thật.
8. Làm báo cáo doanh thu thật.

Ưu tiên trung bình:

1. Làm SMTP OTP/quên mật khẩu.
2. Làm Google OAuth.
3. Làm VietQR thật.
4. Làm xuất Excel/PDF.
5. Làm cấu hình camera thật.

Ưu tiên AI nâng cao:

1. Thu thập dataset ảnh thực tế.
2. Dùng OpenCV crop vùng biển số.
3. Tích hợp model YOLO phát hiện biển số/xe.
4. Tích hợp OCR tốt hơn cho biển số Việt Nam.
5. Tính embedding ảnh xe để match xe vào/ra tốt hơn fingerprint hiện tại.

## 12. Thông tin cần hỏi Dũng

Tin nhắn gửi Dũng:

```text
Dũng ơi hiện hệ thống đã chạy được MongoDB local, đăng nhập thật, upload ảnh xe vào/ra và OCR biển số bằng Python.
Em gửi thêm giúp anh:

1. Ảnh xe vào/ra thực tế hoặc ảnh mẫu camera để test OCR.
2. Bảng giá thật: xe máy/ô tô theo lượt, theo giờ, qua đêm, theo tháng.
3. Quy tắc phạt quá hạn và miễn phí bao nhiêu phút đầu.
4. Sức chứa bãi xe, chia khu A/B/C ra sao.
5. Danh sách admin/nhân viên ban đầu: tên, email, mật khẩu tạm, ca làm.
6. Có cần VietQR thật không? Nếu có gửi ngân hàng, số tài khoản, chủ tài khoản.
7. Có cần OTP email/quên mật khẩu thật không? Nếu có gửi SMTP hoặc email/app password.
8. Có cần Google login thật không? Nếu có gửi Google Client ID/Secret.
9. Nếu có camera thật thì gửi URL RTSP/HTTP của camera cổng vào/cổng ra.
10. Có mẫu báo cáo PDF/Excel của trường không?
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
- Code đã push lên GitHub.
- File tài liệu này được phép push để nhân viên đọc và tiếp tục phát triển.
