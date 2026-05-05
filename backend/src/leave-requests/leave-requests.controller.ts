import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequestResponseDto } from './dto/leave-request-response.dto';
import { ProcessLeaveRequestDto } from './dto/process-leave-request.dto';
import {
  LEAVE_REQUEST_STATUSES,
  type LeaveRequestStatus,
} from './leave-request.model';
import { LeaveRequestsService } from './leave-requests.service';

@ApiTags('leave-requests')
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @ApiQuery({
    name: 'status',
    enum: LEAVE_REQUEST_STATUSES,
    required: false,
  })
  @ApiOkResponse({
    description: 'Leave request list',
    isArray: true,
    type: LeaveRequestResponseDto,
  })
  @Get()
  findAll(@Query('status') status?: LeaveRequestStatus) {
    return this.leaveRequestsService.findAll(status);
  }

  @ApiNotFoundResponse({ description: 'Leave request not found' })
  @ApiOkResponse({
    description: 'Leave request detail',
    type: LeaveRequestResponseDto,
  })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.leaveRequestsService.findById(id);
  }

  @ApiBadRequestResponse({ description: 'Invalid leave request payload' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  @ApiCreatedResponse({
    description: 'Leave request created',
    type: LeaveRequestResponseDto,
  })
  @Post()
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveRequestsService.create(dto);
  }

  @ApiBadRequestResponse({
    description: 'Invalid approval payload or processed request',
  })
  @ApiNotFoundResponse({ description: 'Leave request or manager not found' })
  @ApiOkResponse({
    description: 'Leave request approved',
    type: LeaveRequestResponseDto,
  })
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ProcessLeaveRequestDto) {
    return this.leaveRequestsService.approve(id, dto);
  }

  @ApiBadRequestResponse({
    description: 'Invalid rejection payload or processed request',
  })
  @ApiNotFoundResponse({ description: 'Leave request or manager not found' })
  @ApiOkResponse({
    description: 'Leave request rejected',
    type: LeaveRequestResponseDto,
  })
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: ProcessLeaveRequestDto) {
    return this.leaveRequestsService.reject(id, dto);
  }
}
