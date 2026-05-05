import { ApiProperty } from '@nestjs/swagger';
import { EMPLOYEE_ROLES, type EmployeeRole } from '../employee.model';

export class EmployeeResponseDto {
  @ApiProperty({ example: 'employee-id' })
  id!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  name!: string;

  @ApiProperty({ example: 'a@company.local' })
  email!: string;

  @ApiProperty({ enum: EMPLOYEE_ROLES, example: 'employee' })
  role!: EmployeeRole;

  @ApiProperty({ example: 12 })
  annualLeaveDays!: number;

  @ApiProperty({ example: true })
  active!: boolean;
}
