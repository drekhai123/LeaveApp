"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  clearAccessToken,
  readAccessToken,
  subscribeToAuthChanges,
} from "@/lib/session";

export function AppShell({ children }: { children: ReactNode }) {
  const hasToken = useSyncExternalStore(
    subscribeToAuthChanges,
    () => Boolean(readAccessToken()),
    () => false,
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    clearAccessToken();
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#172033]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Giao diện quản lý nghỉ phép
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
                LeaveManagement
              </h1>
            </div>
            {hasToken ? (
              <button
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={handleLogout}
                type="button"
              >
                Đăng xuất
              </button>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
