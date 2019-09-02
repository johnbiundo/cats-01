import {
  Module,
  NestModule,
  MiddlewareConsumer,
  OnModuleDestroy,
  OnApplicationShutdown,
} from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';
import { ConnectionService } from './connection/connection.service';

@Module({
  imports: [CatsModule],
  providers: [ConnectionService],
})
export class AppModule
  implements NestModule, OnModuleDestroy, OnApplicationShutdown {
  onModuleDestroy() {
    console.log('AppModule: onModuleDestroy called');
  }

  onApplicationShutdown() {
    console.log('AppModule: onApplicationShutdown called');
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CatsController);
  }
}
