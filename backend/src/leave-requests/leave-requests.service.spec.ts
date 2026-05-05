import { BadRequestException } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';
import { MailService } from '../mail/mail.service';
import { LeaveRequestsService } from './leave-requests.service';

describe('LeaveRequestsService', () => {
  let employeesService: EmployeesService;
  let leaveRequestsService: LeaveRequestsService;

  beforeEach(() => {
    employeesService = new EmployeesService();
    leaveRequestsService = new LeaveRequestsService(employeesService, {
      send: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService);
  });

  it('creates a pending leave request with business day count', async () => {
    const employee = employeesService.create({
      name: 'Nguyen Van A',
      email: 'a@company.local',
    });

    const request = await leaveRequestsService.create({
      employeeId: employee.id,
      startDate: '2026-05-04',
      endDate: '2026-05-08',
      reason: 'Family trip',
    });

    expect(request.status).toBe('pending');
    expect(request.totalDays).toBe(5);
  });

  it('allows managers to approve pending requests', async () => {
    const manager = employeesService.findAll()[0];
    const employee = employeesService.create({
      name: 'Tran Thi B',
      email: 'b@company.local',
    });
    const request = await leaveRequestsService.create({
      employeeId: employee.id,
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      reason: 'Personal work',
    });

    const approved = await leaveRequestsService.approve(request.id, {
      managerId: manager.id,
      note: 'Approved',
    });

    expect(approved.status).toBe('approved');
    expect(approved.managerNote).toBe('Approved');
  });

  it('rejects processing from regular employees', async () => {
    const employee = employeesService.create({
      name: 'Le Van C',
      email: 'c@company.local',
    });
    const request = await leaveRequestsService.create({
      employeeId: employee.id,
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      reason: 'Personal work',
    });

    await expect(
      leaveRequestsService.approve(request.id, { managerId: employee.id }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
