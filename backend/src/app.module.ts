import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [EmployeesModule, MailModule, LeaveRequestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
