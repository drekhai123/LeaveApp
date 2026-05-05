import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service';
import { MailService } from '../mail/mail.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ProcessLeaveRequestDto } from './dto/process-leave-request.dto';
import { LeaveRequest, LeaveRequestStatus } from './leave-request.model';

@Injectable()
export class LeaveRequestsService {
  private readonly leaveRequests = new Map<string, LeaveRequest>();

  constructor(
    private readonly employeesService: EmployeesService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const employee = this.employeesService.findById(dto.employeeId);
    const totalDays = this.calculateBusinessDays(dto.startDate, dto.endDate);

    if (!dto.reason?.trim()) {
      throw new BadRequestException('Leave reason is required');
    }

    const leaveRequest: LeaveRequest = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalDays,
      reason: dto.reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.leaveRequests.set(leaveRequest.id, leaveRequest);
    await this.mailService.send({
      to: employee.email,
      subject: 'Leave request submitted',
      text: `Your leave request ${leaveRequest.id} is pending review.`,
    });

    return leaveRequest;
  }

  findAll(status?: LeaveRequestStatus): LeaveRequest[] {
    const requests = [...this.leaveRequests.values()];
    return status
      ? requests.filter((request) => request.status === status)
      : requests;
  }

  findById(id: string): LeaveRequest {
    const leaveRequest = this.leaveRequests.get(id);
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    return leaveRequest;
  }

  async approve(
    id: string,
    dto: ProcessLeaveRequestDto,
  ): Promise<LeaveRequest> {
    return this.process(id, dto, 'approved');
  }

  async reject(id: string, dto: ProcessLeaveRequestDto): Promise<LeaveRequest> {
    return this.process(id, dto, 'rejected');
  }

  private async process(
    id: string,
    dto: ProcessLeaveRequestDto,
    status: LeaveRequestStatus,
  ): Promise<LeaveRequest> {
    const manager = this.employeesService.findById(dto.managerId);
    if (manager.role === 'employee') {
      throw new BadRequestException(
        'Only manager or HR can process leave requests',
      );
    }

    const leaveRequest = this.findById(id);
    if (leaveRequest.status !== 'pending') {
      throw new BadRequestException('Leave request is already processed');
    }

    const updatedRequest: LeaveRequest = {
      ...leaveRequest,
      status,
      managerNote: dto.note?.trim(),
      processedBy: manager.id,
      processedAt: new Date().toISOString(),
    };

    this.leaveRequests.set(id, updatedRequest);
    await this.mailService.send({
      to: updatedRequest.employeeEmail,
      subject: `Leave request ${status}`,
      text: `Your leave request ${updatedRequest.id} was ${status}.`,
    });

    return updatedRequest;
  }

  private calculateBusinessDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      throw new BadRequestException('Leave dates are invalid');
    }

    let businessDays = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) {
        businessDays += 1;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return businessDays;
  }
}
