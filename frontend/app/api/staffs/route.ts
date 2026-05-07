import { NextResponse } from "next/server";

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.search ? url.search : "";
  return proxyRequest(request, `${backendUrl}/staffs${query}`, "GET");
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyRequest(request, `${backendUrl}/staffs`, "POST", body);
}

async function proxyRequest(
  request: Request,
  url: string,
  method: "GET" | "POST",
  body?: unknown,
) {
  try {
    const response = await fetch(url, {
      method,
      headers: buildHeaders(request),
      body: body ? JSON.stringify(body) : undefined,
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
