import { Global, Module } from '@nestjs/common';
import { RedlockService } from './redlock.service';

@Global()
@Module({
  providers: [RedlockService],
  exports: [RedlockService],
})
export class LockModule {}
