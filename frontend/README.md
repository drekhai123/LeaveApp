# LeaveApp Frontend

Frontend Next.js cho quy trình xin nghỉ phép LeaveApp.

## Chức năng hiện tại

- Đăng nhập bằng API thật của backend: `POST /auth/login`.
- Điều hướng dashboard theo role thật backend trả về: `STAFF`, `HEAD`, `MANAGER`, hoặc `ADMIN`.
- Token được lưu ở `localStorage` với key `leave_app_access_token` để các API thật tiếp theo có thể dùng lại.
- Dashboard đã tích hợp API thật cho các tác vụ chính:
  - Tạo/xóa nhân sự: `POST /staffs`, `DELETE /staffs/:id` (ADMIN)
  - Duyệt/từ chối đơn nghỉ phép: `PATCH /leave-requests/:id/approve`, `PATCH /leave-requests/:id/reject` (HEAD/MANAGER/ADMIN)
  - Đồng bộ danh sách nhân sự và đơn nghỉ từ backend: `GET /staffs`, `GET /leave-requests`

## Cấu hình API

Next route trong `frontend/app/api/**` proxy sang backend để tránh CORS khi chạy local:

- `/api/auth/login` -> `/auth/login`
- `/api/staffs` -> `/staffs`
- `/api/staffs/:id` -> `/staffs/:id`
- `/api/leave-requests` -> `/leave-requests`
- `/api/leave-requests/:id/approve` -> `/leave-requests/:id/approve`
- `/api/leave-requests/:id/reject` -> `/leave-requests/:id/reject`

Mặc định backend chạy ở:

```text
http://localhost:3000
```

Nếu backend chạy port khác, tạo `.env.local` trong `frontend`:

```text
BACKEND_URL=http://localhost:3000
```

## Chạy local

Chạy backend trước, sau đó chạy frontend:

```powershell
cd D:\LeaveApp\frontend
pnpm.cmd exec next dev -p 3001
```

Mở:

```text
http://localhost:3001
```

## Kiểm tra

```powershell
pnpm.cmd run lint
pnpm.cmd run build
```

Checklist role:

- ADMIN: đăng nhập, tạo staff mới, xóa staff không có lịch sử nghỉ phép.
- HEAD: duyệt và từ chối đơn nghỉ phép.
- MANAGER: duyệt/từ chối đơn nghỉ phép và xem bảng đơn được cập nhật.
