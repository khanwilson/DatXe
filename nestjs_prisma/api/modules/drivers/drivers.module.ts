import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { DriversListener } from './dispatch.listener';

@Module({
  imports: [PrismaModule],
  controllers: [DriversController],
  providers: [DriversService, DriversListener],
  exports: [DriversService],
})
export class DriversModule {}
