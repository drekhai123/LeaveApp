import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { EMPLOYEE_ROLES, type EmployeeRole } from '../employee.model';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'a@company.local' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    enum: EMPLOYEE_ROLES,
    default: 'employee',
  })
  @IsIn(EMPLOYEE_ROLES)
  @IsOptional()
  role?: EmployeeRole;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  annualLeaveDays?: number;
}
