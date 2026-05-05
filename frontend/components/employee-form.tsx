"use client";

import { useState } from "react";
import { createEmployee } from "@/lib/leave-api";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/types/leave-app";
import { InlineAlert } from "./inline-alert";
import { SectionHeader } from "./section-header";

export function EmployeeForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EmployeeRole>("employee");
  const [annualLeaveDays, setAnnualLeaveDays] = useState("12");
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    if (!name.trim() || !email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    const leaveDays = Number(annualLeaveDays || 12);
    if (!Number.isInteger(leaveDays) || leaveDays < 1 || leaveDays > 365) {
      setMessage("Annual leave days must be a whole number from 1 to 365.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEmployee({
        annualLeaveDays: leaveDays,
        email: email.trim(),
        name: name.trim(),
        role,
      });
      setName("");
      setEmail("");
      setRole("employee");
      setAnnualLeaveDays("12");
      await onCreated();
      setMessage("Employee created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Create employee failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <SectionHeader title="Employees" description="Add employees and approvers." />
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Field label="Name">
          <input
            className={inputClassName}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            value={name}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputClassName}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@company.com"
            type="email"
            value={email}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Role">
            <select
              className={inputClassName}
              onChange={(event) => setRole(event.target.value as EmployeeRole)}
              value={role}
            >
              {EMPLOYEE_ROLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Leave days">
            <input
              className={inputClassName}
              max="365"
              min="1"
              onChange={(event) => setAnnualLeaveDays(event.target.value)}
              type="number"
              value={annualLeaveDays}
            />
          </Field>
        </div>
        <button
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-400"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create employee"}
        </button>
      </form>
      {message ? (
        <div className="mt-3">
          <InlineAlert message={message} />
        </div>
      ) : null}
    </section>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

const inputClassName =
  "rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-sky-500";
