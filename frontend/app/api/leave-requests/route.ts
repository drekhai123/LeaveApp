import { NextResponse } from "next/server";

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const backendEndpoint = status
    ? `${backendUrl}/leave-requests?status=${encodeURIComponent(status)}`
    : `${backendUrl}/leave-requests`;

  try {
    const response = await fetch(backendEndpoint, {
      method: "GET",
      headers: buildHeaders(request),
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Không kết nối được backend." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const response = await fetch(`${backendUrl}/leave-requests`, {
      method: "POST",
      headers: buildHeaders(request),
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Không kết nối được backend." }, { status: 503 });
  }
}

function buildHeaders(request: Request): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  return headers;
}
