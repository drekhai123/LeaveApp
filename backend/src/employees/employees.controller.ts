import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @ApiOkResponse({
    description: 'Employee list',
    isArray: true,
    type: EmployeeResponseDto,
  })
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @ApiCreatedResponse({
    description: 'Employee created',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid employee payload or duplicate email',
  })
  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }
}
