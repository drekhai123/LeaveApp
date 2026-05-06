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
import { LeaveRequest, LeaveRequestStatus } from './leave-request.model';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(DbLeaveRequest)
    private readonly leaveRequestRepository: EntityRepository<DbLeaveRequest>,
    private readonly staffsService: StaffsService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const staff = await this.staffsService.findEntityById(dto.staffId);

    if (!dto.reason?.trim()) {
      throw new BadRequestException('Leave reason is required');
    }
    if (!this.isValidDate(dto.leaveDate)) {
      throw new BadRequestException('Leave date is invalid');
    }
    await this.ensureNoDuplicateRequest(staff.id, dto.leaveDate);

    const leaveRequest = this.leaveRequestRepository.create({
      createdAt: new Date(),
      leaveDate: dto.leaveDate,
      reason: dto.reason.trim(),
      staff,
      status: LeaveStatus.PENDING,
      updatedAt: new Date(),
    });

    await this.leaveRequestRepository
      .getEntityManager()
      .persistAndFlush(leaveRequest);
    await this.notifyHeads(leaveRequest);

    return this.toResponse(leaveRequest);
  }

  async findAll(status?: LeaveRequestStatus): Promise<LeaveRequest[]> {
    const requests = await this.leaveRequestRepository.find(
      status ? { status: status as LeaveStatus } : {},
      {
        orderBy: { createdAt: 'DESC' },
        populate: ['resolvedByStaff', 'staff'],
      },
    );

    return requests.map((request) => this.toResponse(request));
  }

  async findById(id: string): Promise<LeaveRequest> {
    return this.toResponse(await this.findEntityById(id));
  }

  async approve(
    id: string,
    dto: ProcessLeaveRequestDto,
  ): Promise<LeaveRequest> {
    return this.process(id, dto, LeaveStatus.APPROVED);
  }

  async reject(id: string, dto: ProcessLeaveRequestDto): Promise<LeaveRequest> {
    return this.process(id, dto, LeaveStatus.REJECTED);
  }

  private async process(
    id: string,
    dto: ProcessLeaveRequestDto,
    status: LeaveStatus,
  ): Promise<LeaveRequest> {
    const manager = await this.staffsService.findEntityById(dto.managerId);
    if (!['HEAD', 'MANAGER', 'ADMIN'].includes(manager.role.name)) {
      throw new BadRequestException(
        'Only HEAD, MANAGER, or ADMIN can process leave requests',
      );
    }

    const leaveRequest = await this.findEntityById(id);
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is already processed');
    }

    leaveRequest.status = status;
    leaveRequest.resolvedByStaff = manager;
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

  private async findEntityById(id: string): Promise<DbLeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne(
      { id: Number(id) },
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

  private toResponse(leaveRequest: DbLeaveRequest): LeaveRequest {
    return {
      id: leaveRequest.id,
      createdAt: leaveRequest.createdAt.toISOString(),
      leaveDate: leaveRequest.leaveDate,
      reason: leaveRequest.reason ?? '',
      rejectReason: leaveRequest.rejectReason,
      resolvedAt: leaveRequest.resolvedAt?.toISOString(),
      resolvedBy: leaveRequest.resolvedByStaff?.id,
      staffEmail: leaveRequest.staff.email,
      staffId: leaveRequest.staff.id,
      staffName: leaveRequest.staff.fullName,
      status: leaveRequest.status,
    };
  }
}
