# LeaveApp Frontend

Next.js frontend for the LeaveApp leave request workflow.

## What It Does

- Shows backend health.
- Creates employees.
- Submits leave requests.
- Shows pending, approved, and rejected request counts.
- Lets manager/HR users approve or reject pending requests.
- Calls backend through a same-origin Next API proxy to avoid browser CORS issues.

## Environment

Create `.env.local` when the backend is not on the default URL:

```powershell
LEAVE_APP_API_BASE_URL=http://localhost:3000
```

If the variable is not set, the frontend uses `http://localhost:3000`.

## Run Locally

Start backend:

```powershell
cd D:\LeaveApp\backend
pnpm.cmd run start:dev
```

Start frontend on another port:

```powershell
cd D:\LeaveApp\frontend
pnpm.cmd exec next dev -p 3001
```

Open:

```text
http://localhost:3001
```

## Validate

```powershell
pnpm.cmd run lint
pnpm.cmd run build
```

Manual smoke checklist is in [docs/frontend-validation-checklist.md](docs/frontend-validation-checklist.md).

## MVP Limits

- No real authentication yet. The UI uses an approver selector.
- Backend storage is in-memory, so data resets when backend restarts.
- Backend mail is currently adapter/log based unless a provider is connected.
