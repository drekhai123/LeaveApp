import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../database/entities/role.entity';
import { Staff } from '../database/entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: EntityRepository<Role>,
    @InjectRepository(Staff)
    private readonly staffRepository: EntityRepository<Staff>,
  ) {}

  async create(dto: CreateStaffDto): Promise<Staff> {
    const email = this.normalizeEmail(dto.email);
    const existingStaff = await this.staffRepository.findOne({ email });
    if (existingStaff) {
      throw new ConflictException('Email already exists');
    }

    const role = dto.roleId
      ? await this.findRoleById(dto.roleId)
      : await this.findRoleByName('STAFF');

    const staff = this.staffRepository.create({
      createdAt: new Date(),
      email,
      fullName: dto.fullName.trim(),
      leaveCredit: dto.leaveCredit ?? 12,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role,
      updatedAt: new Date(),
    });

    await this.staffRepository.getEntityManager().persistAndFlush(staff);
    return staff;
  }

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.findAll({ populate: ['role'] });
  }

  async findByEmailWithPassword(email: string): Promise<Staff | null> {
    return this.staffRepository.findOne(
      { email: this.normalizeEmail(email) },
      { populate: ['role'] },
    );
  }

  async findById(id: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne(
      { id },
      { populate: ['role'] },
    );
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async findByRoleName(roleName: string): Promise<Staff[]> {
    return this.staffRepository.find(
      { role: { name: roleName } },
      { populate: ['role'] },
    );
  }

  toResponse(staff: Staff) {
    return {
      id: staff.id,
      fullName: staff.fullName,
      email: staff.email,
      role: staff.role.name,
      leaveCredit: staff.leaveCredit,
      createdAt: staff.createdAt.toISOString(),
    };
  }

  private async findRoleById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ id });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  private async findRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ name });
    if (!role) {
      throw new NotFoundException(`Role ${name} not found`);
    }

    return role;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
