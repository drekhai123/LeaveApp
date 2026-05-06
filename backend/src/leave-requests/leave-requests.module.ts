import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { LeaveRequest } from '../database/entities/leave-request.entity';
import { MailModule } from '../mail/mail.module';
import { StaffsModule } from '../staffs/staffs.module';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([LeaveRequest]),
    StaffsModule,
    MailModule,
  ],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
})
export class LeaveRequestsModule {}
