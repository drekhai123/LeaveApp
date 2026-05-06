import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffResponseDto } from './dto/staff-response.dto';
import { StaffsService } from './staffs.service';

@ApiTags('staffs')
@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @ApiOkResponse({ isArray: true, type: StaffResponseDto })
  @Get()
  async findAll() {
    const staffs = await this.staffsService.findAll();
    return staffs.map((staff) => this.staffsService.toResponse(staff));
  }

  @ApiCreatedResponse({ type: StaffResponseDto })
  @Post()
  async create(@Body() dto: CreateStaffDto) {
    const staff = await this.staffsService.create(dto);
    return this.staffsService.toResponse(staff);
  }
}
