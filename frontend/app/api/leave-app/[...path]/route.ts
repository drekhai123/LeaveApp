import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = "http://localhost:3000";
const ALLOWED_METHODS = new Set(["GET", "POST", "PATCH"]);
const MAX_BODY_BYTES = 16 * 1024;
const PROXY_TIMEOUT_MS = 8000;

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyLeaveAppRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyLeaveAppRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyLeaveAppRequest(request, context);
}

async function proxyLeaveAppRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  if (!ALLOWED_METHODS.has(request.method) || !isAllowedPath(path)) {
    return NextResponse.json({ message: "Unsupported API path" }, { status: 404 });
  }

  const bodyCheck = validateRequestBodySize(request);
  if (bodyCheck) {
    return bodyCheck;
  }

  const backendUrl = buildBackendUrl(path, request.nextUrl.search);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const body = await readProxyBody(request);
    const response = await fetch(backendUrl, {
      body,
      cache: "no-store",
      headers: {
        "Content-Type": request.headers.get("Content-Type") ?? "application/json",
      },
      method: request.method,
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        { message: getSafeBackendErrorMessage(response.status) },
        { status: response.status },
      );
    }

    return new NextResponse(text, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
      status: response.status,
    });
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ message: "Request body too large" }, { status: 413 });
    }

    return NextResponse.json(
      { message: "LeaveApp backend is unavailable" },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

function buildBackendUrl(path: string[], search: string): string {
  const baseUrl = process.env.LEAVE_APP_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const url = new URL(encodedPath, `${baseUrl.replace(/\/$/, "")}/`);
  url.search = search;
  return url.toString();
}

function validateRequestBodySize(request: NextRequest): NextResponse | undefined {
  if (request.method === "GET") {
    return undefined;
  }

  const rawContentLength = request.headers.get("Content-Length");
  const contentLength = Number(rawContentLength);
  if (!rawContentLength || !Number.isInteger(contentLength) || contentLength < 0) {
    return NextResponse.json(
      { message: "Content-Length is required" },
      { status: 411 },
    );
  }
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ message: "Request body too large" }, { status: 413 });
  }

  return undefined;
}

async function readProxyBody(request: NextRequest): Promise<string | undefined> {
  if (request.method === "GET") {
    return undefined;
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    throw new BodyTooLargeError();
  }

  return body;
}

class BodyTooLargeError extends Error {}

function getSafeBackendErrorMessage(status: number): string {
  if (status === 400) {
    return "Request was rejected by backend validation";
  }
  if (status === 404) {
    return "Requested LeaveApp resource was not found";
  }
  if (status === 413) {
    return "Request body too large";
  }

  return "LeaveApp backend request failed";
}

function isAllowedPath(path: string[]): boolean {
  if (path.some((segment) => segment.includes("..") || segment.includes("/"))) {
    return false;
  }

  const joinedPath = path.join("/");
  if (joinedPath === "health" || joinedPath === "employees") {
    return true;
  }

  if (joinedPath === "leave-requests") {
    return true;
  }

  return /^leave-requests\/[^/]+\/(approve|reject)$/.test(joinedPath);
}
