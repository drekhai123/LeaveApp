# LeaveApp Frontend

Frontend Next.js cho quy trình xin nghỉ phép LeaveApp.

## Chức năng hiện tại

- Đăng nhập bằng API thật của backend: `POST /auth/login`.
- Điều hướng dashboard theo role thật backend trả về: `STAFF`, `HEAD`, `MANAGER`, hoặc `ADMIN`.
- Token được lưu ở `localStorage` với key `leave_app_access_token` để các API thật tiếp theo có thể dùng lại.
- Các màn dashboard sau đăng nhập vẫn đang dùng dữ liệu mock/local state. Lần này chỉ nối phần đăng nhập.

## Cấu hình API

Next route `/api/auth/login` proxy sang backend để tránh CORS khi chạy local.

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
