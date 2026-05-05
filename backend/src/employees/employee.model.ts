export const EMPLOYEE_ROLES = ['employee', 'manager', 'hr'] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  annualLeaveDays: number;
  active: boolean;
}
