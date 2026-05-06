import { EntityRepository } from '@mikro-orm/mysql';
import { BadRequestException } from '@nestjs/common';
import { LeaveRequest as DbLeaveRequest } from '../database/entities/leave-request.entity';
import { Role } from '../database/entities/role.entity';
import { Staff } from '../database/entities/staff.entity';
import { LeaveStatus } from '../database/enums/leave-status.enum';
import { MailService } from '../mail/mail.service';
import { StaffsService } from '../staffs/staffs.service';
import { LeaveRequestsService } from './leave-requests.service';

describe('LeaveRequestsService', () => {
  let dbRequests: DbLeaveRequest[];
  let leaveRequestsService: LeaveRequestsService;
  let nextId: number;
  let staffsService: Pick<StaffsService, 'findByRoleName' | 'findEntityById'>;

  beforeEach(() => {
    dbRequests = [];
    nextId = 1;

    const entityManager = {
      flush: jest.fn().mockResolvedValue(undefined),
      persistAndFlush: jest.fn().mockImplementation((payload: DbLeaveRequest | DbLeaveRequest[]) => {
        const requests = Array.isArray(payload) ? payload : [payload];
        for (const request of requests) {
          request.id = nextId;
          nextId += 1;
          dbRequests.push(request);
        }

        return Promise.resolve();
      }),
    };

    const leaveRequestRepository = {
      create: jest
        .fn()
        .mockImplementation((data: Partial<DbLeaveRequest>) =>
          Object.assign(new DbLeaveRequest(), data),
        ),
      find: jest
        .fn()
        .mockImplementation((filter?: { status?: LeaveStatus }) =>
          Promise.resolve(
            filter?.status
              ? dbRequests.filter((request) => request.status === filter.status)
              : dbRequests,
          ),
        ),
      findOne: jest
        .fn()
        .mockImplementation(
          (filter: { id?: number; leaveDate?: string; staff?: number }) => {
            const request = dbRequests.find((item) => {
              if (filter.id !== undefined) {
                return item.id === filter.id;
              }

              if (filter.leaveDate === undefined || filter.staff === undefined) {
                return false;
              }

              return (
                item.leaveDate === filter.leaveDate &&
                item.staff.id === filter.staff
              );
            });

            return Promise.resolve(request ?? null);
          },
        ),
      getEntityManager: jest.fn(() => entityManager),
    };

    staffsService = {
      findEntityById: jest.fn((id: number): Promise<Staff> => {
        const staff = mockStaffs.find((item) => item.id === id);
        if (!staff) {
          throw new Error('Staff not found');
        }

        return Promise.resolve(staff);
      }),
      findByRoleName: jest.fn(
        (roleName: string): Promise<Staff[]> =>
          Promise.resolve(
            mockStaffs.filter((staff) => staff.role.name === roleName),
          ),
      ),
    };

    leaveRequestsService = new LeaveRequestsService(
      leaveRequestRepository as EntityRepository<DbLeaveRequest>,
      staffsService as StaffsService,
      {
        send: jest.fn().mockResolvedValue(undefined),
      } as unknown as MailService,
    );
  });

  it('creates a pending leave request for one date', async () => {
    const created = await leaveRequestsService.create({
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      reason: 'Family trip',
      staffId: 1,
    });

    expect(created.totalDays).toBe(1);
    expect(created.requests[0].status).toBe('pending');
    expect(created.requests[0].leaveDate).toBe('2026-05-04');
    expect(created.requests[0].staffId).toBe(1);
  });

  it('creates one request row per business day', async () => {
    const created = await leaveRequestsService.create({
      startDate: '2026-05-04',
      endDate: '2026-05-06',
      reason: 'Family trip',
      staffId: 1,
    });

    expect(created.totalDays).toBe(3);
    expect(created.requests.map((item) => item.leaveDate)).toEqual([
      '2026-05-04',
      '2026-05-05',
      '2026-05-06',
    ]);
  });

  it('prevents duplicate leave requests on the same date', async () => {
    await leaveRequestsService.create({
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      reason: 'Family trip',
      staffId: 1,
    });

    await expect(
      leaveRequestsService.create({
        startDate: '2026-05-04',
        endDate: '2026-05-04',
        reason: 'Family trip',
        staffId: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows heads to approve pending requests', async () => {
    const created = await leaveRequestsService.create({
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      reason: 'Personal work',
      staffId: 1,
    });

    const approved = await leaveRequestsService.approve(created.requests[0].id, {
      resolvedByStaffId: 2,
      note: 'Approved',
    });

    expect(approved.status).toBe('approved');
    expect(approved.resolvedByStaffId).toBe(2);
  });

  it('allows heads to reject pending requests', async () => {
    const created = await leaveRequestsService.create({
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      reason: 'Personal work',
      staffId: 1,
    });

    const rejected = await leaveRequestsService.reject(created.requests[0].id, {
      resolvedByStaffId: 2,
      note: 'Trung lich hop',
    });

    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectReason).toBe('Trung lich hop');
  });

  it('rejects processing from regular staff', async () => {
    const created = await leaveRequestsService.create({
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      reason: 'Personal work',
      staffId: 1,
    });

    await expect(
      leaveRequestsService.approve(created.requests[0].id, { resolvedByStaffId: 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects processing requests already handled', async () => {
    const created = await leaveRequestsService.create({
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      reason: 'Personal work',
      staffId: 1,
    });

    await leaveRequestsService.approve(created.requests[0].id, {
      resolvedByStaffId: 2,
    });

    await expect(
      leaveRequestsService.reject(created.requests[0].id, {
        resolvedByStaffId: 2,
        note: 'Late update',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

const mockStaffs = [
  createMockStaff(1, 'Nguyen Van An', 'STAFF'),
  createMockStaff(2, 'Pham Thu Ha', 'HEAD'),
];

function createMockStaff(
  id: number,
  fullName: string,
  roleName: string,
): Staff {
  const role = new Role();
  role.id = id;
  role.name = roleName;

  const staff = new Staff();
  staff.id = id;
  staff.fullName = fullName;
  staff.email = `${id}@company.local`;
  staff.passwordHash = 'hashed-password';
  staff.role = role;
  staff.leaveCredit = 12;
  staff.createdAt = new Date();
  staff.updatedAt = new Date();

  return staff;
}
