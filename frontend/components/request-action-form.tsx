"use client";

import { useState } from "react";
import { approveLeaveRequest, rejectLeaveRequest } from "@/lib/leave-api";
import type { Employee, LeaveRequest } from "@/types/leave-app";
import { InlineAlert } from "./inline-alert";

export function RequestActionForm({
  approver,
  request,
  onProcessed,
}: {
  approver?: Employee;
  request: LeaveRequest;
  onProcessed: () => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);

  async function processRequest(action: "approve" | "reject") {
    if (!approver) {
      setMessage("Select a manager or HR approver first.");
      return;
    }

    setMessage(undefined);
    setIsProcessing(true);
    try {
      const payload = { managerId: approver.id, note: note.trim() || undefined };
      if (action === "approve") {
        await approveLeaveRequest(request.id, payload);
      } else {
        await rejectLeaveRequest(request.id, payload);
      }
      setNote("");
      await onProcessed();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Process request failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Decision note
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-sky-500"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note"
          value={note}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:bg-slate-400"
          disabled={isProcessing || !approver}
          onClick={() => void processRequest("approve")}
          type="button"
        >
          Approve
        </button>
        <button
          className="rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 disabled:text-slate-400"
          disabled={isProcessing || !approver}
          onClick={() => void processRequest("reject")}
          type="button"
        >
          Reject
        </button>
      </div>
      {message ? <InlineAlert message={message} tone="error" /> : null}
    </div>
  );
}
