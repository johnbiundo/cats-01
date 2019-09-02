import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { RequestsModule } from '../requests/requests.module';

@Module({
  imports: [RequestsModule],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
