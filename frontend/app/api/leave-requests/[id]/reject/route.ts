import { NextResponse } from "next/server";

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const body = await request.json().catch(() => ({}));

  try {
    const response = await fetch(`${backendUrl}/leave-requests/${params.id}/reject`, {
      method: "PATCH",
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
