# LeaveApp Backend

NestJS API init cho quan ly nghi phep cong ty nho khoang 2-30 nguoi.

## Scope hien tai

- Quan ly nhan vien: tao, xem danh sach.
- Tao request nghi phep.
- View danh sach request, loc theo trang thai.
- Duyet hoac tu choi request boi manager/HR.
- Gui mail qua `MailService` adapter. Hien log mail de API chay ngay; sau co the thay bang SMTP/provider.
- Luu tru in-memory cho ban init. Phu hop demo/dev, chua dung production DB.
- Swagger UI va OpenAPI JSON tai `/api/docs` va `/api/docs-json` khi `NODE_ENV` khac `production`.
- Global request validation bat buoc payload dung schema DTO va loai field ngoai whitelist.

## API nhanh

Swagger UI chay tai khi `NODE_ENV` khac `production`:

```http
GET /api/docs
```

OpenAPI JSON:

```http
GET /api/docs-json
```

```http
GET /health
GET /employees
POST /employees
GET /leave-requests
GET /leave-requests?status=pending
GET /leave-requests/:id
POST /leave-requests
PATCH /leave-requests/:id/approve
PATCH /leave-requests/:id/reject
```

Vi du tao nhan vien:

```json
{
  "name": "Nguyen Van A",
  "email": "a@company.local",
  "role": "employee",
  "annualLeaveDays": 12
}
```

Vi du tao request:

```json
{
  "employeeId": "employee-id",
  "startDate": "2026-05-04",
  "endDate": "2026-05-08",
  "reason": "Family trip"
}
```

Vi du duyet request:

```json
{
  "managerId": "manager-id",
  "note": "Approved"
}
```

## Project setup

```bash
pnpm install
```

## Compile and run the project

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production mode
pnpm run start:prod
```

## Run tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```
