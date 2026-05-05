import { Module } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { MailModule } from '../mail/mail.module';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';

@Module({
  imports: [EmployeesModule, MailModule],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
})
export class LeaveRequestsModule {}
