import { NextResponse } from "next/server";

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;

  try {
    const response = await fetch(`${backendUrl}/staffs/${params.id}`, {
      method: "GET",
      headers: buildHeaders(request),
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Không kết nối được backend." }, { status: 503 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;

  try {
    const response = await fetch(`${backendUrl}/staffs/${params.id}`, {
      method: "DELETE",
      headers: buildHeaders(request),
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
