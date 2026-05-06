import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { StaffsModule } from './staffs/staffs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DatabaseModule,
    LeaveRequestsModule,
    StaffsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
