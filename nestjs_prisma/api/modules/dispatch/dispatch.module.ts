import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { DispatchListener } from './dispatch.listener';

@Module({
  imports: [PrismaModule],
  controllers: [DispatchController],
  providers: [DispatchService, DispatchListener],
  exports: [DispatchService],
})
export class DispatchModule {}
