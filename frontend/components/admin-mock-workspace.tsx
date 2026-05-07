"use client";

import { useState } from "react";
import { findRoleName } from "@/lib/mock-leave-management-data";
import type {
  LeaveRequestRecord,
  StaffRecord,
  StaffRoleName,
} from "@/types/leave-app";
import { InlineAlert } from "./inline-alert";
import { MockRequestTable } from "./mock-request-table";
import { SectionHeader } from "./section-header";

export function AdminMockWorkspace({
  canCreateUser = false,
  onCreateStaff,
  requests,
  staffs,
  title = "Quan ly he thong",
}: {
  canCreateUser?: boolean;
  onCreateStaff?: (staff: {
    email: string;
    fullName: string;
    leaveCredit: number;
    roleName: StaffRoleName;
  }) => void;
  requests: LeaveRequestRecord[];
  staffs: StaffRecord[];
  title?: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(300px,430px)_1fr]">
      <section className="grid gap-4">
        {canCreateUser ? <CreateStaffPanel onCreateStaff={onCreateStaff} /> : null}
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <SectionHeader
            title={title}
            description={
              canCreateUser
                ? "ADMIN quan ly nhan su, tao user moi va cap role."
                : "MANAGER xem nhan su va tat ca don trong he thong."
            }
          />
          <div className="grid gap-3">
            {staffs.map((staff) => (
              <div className="rounded-md border border-slate-200 p-3 text-sm" key={staff.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{staff.fullName}</p>
                    <p className="text-slate-600">{staff.email}</p>
                  </div>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
                    {findRoleName(staff)}
                  </span>
                </div>
                <p className="mt-2 text-slate-700">Ngay phep: {staff.leaveCredit}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
      <MockRequestTable requests={requests} title="Tat ca don trong he thong" />
    </div>
  );
}

function CreateStaffPanel({
  onCreateStaff,
}: {
  onCreateStaff?: (staff: {
    email: string;
    fullName: string;
    leaveCredit: number;
    roleName: StaffRoleName;
  }) => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [leaveCredit, setLeaveCredit] = useState(12);
  const [message, setMessage] = useState<string>();
  const [roleName, setRoleName] = useState<StaffRoleName>("STAFF");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    if (!fullName.trim() || !email.trim()) {
      setMessage("Can nhap ho ten va email.");
      return;
    }

    onCreateStaff?.({
      email: email.trim(),
      fullName: fullName.trim(),
      leaveCredit,
      roleName,
    });
    setEmail("");
    setFullName("");
    setLeaveCredit(12);
    setRoleName("STAFF");
    setMessage("Da tao user moi va cap role.");
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <SectionHeader
        title="Tao user moi"
        description="Chi ADMIN co quyen tao tai khoan va cap role."
      />
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Ho ten
          <input
            className={inputClassName}
            onChange={(event) => setFullName(event.target.value)}
            value={fullName}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            className={inputClassName}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Role
            <select
              className={inputClassName}
              onChange={(event) => setRoleName(event.target.value as StaffRoleName)}
              value={roleName}
            >
              <option value="STAFF">STAFF</option>
              <option value="HEAD">HEAD</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Ngay phep
            <input
              className={inputClassName}
              min={1}
              onChange={(event) => setLeaveCredit(Number(event.target.value))}
              type="number"
              value={leaveCredit}
            />
          </label>
        </div>
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
          Tao user
        </button>
      </form>
      {message ? (
        <div className="mt-3">
          <InlineAlert
            message={message}
            tone={message.startsWith("Da") ? "success" : "error"}
          />
        </div>
      ) : null}
    </section>
  );
}

const inputClassName =
  "rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-sky-500";
