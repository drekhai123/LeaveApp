import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveRequest as DbLeaveRequest } from '../database/entities/leave-request.entity';
import { LeaveStatus } from '../database/enums/leave-status.enum';
import { MailService } from '../mail/mail.service';
import { StaffsService } from '../staffs/staffs.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ProcessLeaveRequestDto } from './dto/process-leave-request.dto';
import {
  CreateLeaveRequestResponse,
  LeaveRequest,
  LeaveRequestStatus,
} from './leave-request.model';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(DbLeaveRequest)
    private readonly leaveRequestRepository: EntityRepository<DbLeaveRequest>,
    private readonly staffsService: StaffsService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateLeaveRequestDto): Promise<CreateLeaveRequestResponse> {
    const staff = await this.staffsService.findEntityById(dto.staffId);

    if (!dto.reason?.trim()) {
      throw new BadRequestException('Leave reason is required');
    }
    if (!this.isValidDate(dto.startDate) || !this.isValidDate(dto.endDate)) {
      throw new BadRequestException('Start date or end date is invalid');
    }

    const leaveDates = this.getBusinessDates(dto.startDate, dto.endDate);
    if (leaveDates.length === 0) {
      throw new BadRequestException('Leave range must include at least one business day');
    }

    for (const leaveDate of leaveDates) {
      await this.ensureNoDuplicateRequest(staff.id, leaveDate);
    }

    const leaveRequests = leaveDates.map((leaveDate) =>
      this.leaveRequestRepository.create({
        createdAt: new Date(),
        leaveDate,
        reason: dto.reason.trim(),
        staff,
        status: LeaveStatus.PENDING,
        updatedAt: new Date(),
      }),
    );

    await this.leaveRequestRepository.getEntityManager().persistAndFlush(leaveRequests);
    await Promise.all(leaveRequests.map((request) => this.notifyHeads(request)));

    return {
      totalDays: leaveRequests.length,
      requests: leaveRequests.map((request) => this.toResponse(request)),
    };
  }

  async findAll(status?: LeaveRequestStatus): Promise<LeaveRequest[]> {
    const requests = await this.leaveRequestRepository.find(
      status ? { status: this.toDbStatus(status) } : {},
      {
        orderBy: { createdAt: 'DESC' },
        populate: ['resolvedByStaff', 'staff'],
      },
    );

    return requests.map((request) => this.toResponse(request));
  }

  async findById(id: number): Promise<LeaveRequest> {
    return this.toResponse(await this.findEntityById(id));
  }

  async approve(
    id: number,
    dto: ProcessLeaveRequestDto,
  ): Promise<LeaveRequest> {
    return this.process(id, dto, LeaveStatus.APPROVED);
  }

  async reject(id: number, dto: ProcessLeaveRequestDto): Promise<LeaveRequest> {
    return this.process(id, dto, LeaveStatus.REJECTED);
  }

  private async process(
    id: number,
    dto: ProcessLeaveRequestDto,
    status: LeaveStatus,
  ): Promise<LeaveRequest> {
    const resolverStaff = await this.staffsService.findEntityById(
      dto.resolvedByStaffId,
    );
    if (resolverStaff.role.name !== 'HEAD') {
      throw new BadRequestException('Only HEAD can process leave requests');
    }

    const leaveRequest = await this.findEntityById(id);
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is already processed');
    }

    leaveRequest.status = status;
    leaveRequest.resolvedByStaff = resolverStaff;
    leaveRequest.resolvedAt = new Date();
    leaveRequest.rejectReason =
      status === LeaveStatus.REJECTED ? dto.note?.trim() : undefined;

    await this.leaveRequestRepository.getEntityManager().flush();
    await this.mailService.send({
      to: leaveRequest.staff.email,
      subject: `Leave request ${status}`,
      text: `Your leave request ${leaveRequest.id} was ${status}.`,
    });

    return this.toResponse(leaveRequest);
  }

  private async findEntityById(id: number): Promise<DbLeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne(
      { id },
      { populate: ['resolvedByStaff', 'staff'] },
    );
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    return leaveRequest;
  }

  private async ensureNoDuplicateRequest(
    staffId: number,
    leaveDate: string,
  ): Promise<void> {
    const existingRequest = await this.leaveRequestRepository.findOne({
      leaveDate,
      staff: staffId,
    });
    if (existingRequest) {
      throw new BadRequestException(
        'Staff already has a leave request for this date',
      );
    }
  }

  private async notifyHeads(leaveRequest: DbLeaveRequest): Promise<void> {
    const heads = await this.staffsService.findByRoleName('HEAD');
    await Promise.all(
      heads.map((head) =>
        this.mailService.send({
          to: head.email,
          subject: 'New leave request pending approval',
          text: `${leaveRequest.staff.fullName} requested leave on ${leaveRequest.leaveDate}.`,
        }),
      ),
    );
  }

  private isValidDate(value: string): boolean {
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  }

  private getBusinessDates(startDate: string, endDate: string): string[] {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);
    if (start > end) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }

    const leaveDates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      const day = current.getUTCDay();
      if (day !== 0 && day !== 6) {
        leaveDates.push(current.toISOString().slice(0, 10));
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return leaveDates;
  }

  private toDbStatus(status: LeaveRequestStatus): LeaveStatus {
    switch (status) {
      case 'approved':
        return LeaveStatus.APPROVED;
      case 'rejected':
        return LeaveStatus.REJECTED;
      case 'pending':
      default:
        return LeaveStatus.PENDING;
    }
  }

  private toApiStatus(status: LeaveStatus): LeaveRequestStatus {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'approved';
      case LeaveStatus.REJECTED:
        return 'rejected';
      case LeaveStatus.PENDING:
      default:
        return 'pending';
    }
  }

  private toResponse(leaveRequest: DbLeaveRequest): LeaveRequest {
    return {
      id: leaveRequest.id,
      createdAt: leaveRequest.createdAt.toISOString(),
      leaveDate: leaveRequest.leaveDate,
      reason: leaveRequest.reason ?? '',
      rejectReason: leaveRequest.rejectReason,
      processedAt: leaveRequest.resolvedAt?.toISOString(),
      resolvedByStaffId: leaveRequest.resolvedByStaff?.id,
      staffEmail: leaveRequest.staff.email,
      staffId: leaveRequest.staff.id,
      staffName: leaveRequest.staff.fullName,
      employeeEmail: leaveRequest.staff.email,
      employeeName: leaveRequest.staff.fullName,
      status: this.toApiStatus(leaveRequest.status),
      staff: {
        id: leaveRequest.staff.id,
        fullName: leaveRequest.staff.fullName,
        email: leaveRequest.staff.email,
      },
      resolvedByStaff: leaveRequest.resolvedByStaff
        ? {
            id: leaveRequest.resolvedByStaff.id,
            fullName: leaveRequest.resolvedByStaff.fullName,
            email: leaveRequest.resolvedByStaff.email,
          }
        : undefined,
    };
  }
}
