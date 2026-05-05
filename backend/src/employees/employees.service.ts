import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './employee.model';

@Injectable()
export class EmployeesService {
  private readonly employees = new Map<string, Employee>();

  constructor() {
    this.create({
      name: 'Company Manager',
      email: 'manager@company.local',
      role: 'manager',
      annualLeaveDays: 12,
    });
  }

  create(dto: CreateEmployeeDto): Employee {
    if (!dto.name?.trim() || !dto.email?.trim()) {
      throw new BadRequestException('Employee name and email are required');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();
    const emailExists = this.findAll().some(
      (employee) => employee.email === normalizedEmail,
    );
    if (emailExists) {
      throw new BadRequestException('Employee email already exists');
    }

    const employee: Employee = {
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      email: normalizedEmail,
      role: dto.role ?? 'employee',
      annualLeaveDays: dto.annualLeaveDays ?? 12,
      active: true,
    };

    this.employees.set(employee.id, employee);
    return employee;
  }

  findAll(): Employee[] {
    return [...this.employees.values()];
  }

  findById(id: string): Employee {
    const employee = this.employees.get(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }
}
