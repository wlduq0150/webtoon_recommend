import { Module } from '@nestjs/common';
import { WebtoonsModule } from 'src/webtoons/webtoons.module';
import { FineTuningService } from './fine-tuning.service';

@Module({
  imports: [WebtoonsModule],
  exports: [FineTuningService],
  providers: [FineTuningService]
})
export class FineTuningModule {}
