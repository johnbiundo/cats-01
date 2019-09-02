import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';
import { ConnectionService } from './connection/connection.service';
import { RequestsService } from './requests/requests.service';
import { RequestsModule } from './requests/requests.module';
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  OnModuleDestroy,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { RequestTrackingInterceptor } from './common/interceptors/request-tracking.interceptor';

@Module({
  imports: [CatsModule, RequestsModule],
  providers: [
    ConnectionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTrackingInterceptor,
    },
  ],
})
export class AppModule
  implements NestModule, OnModuleDestroy, OnApplicationShutdown {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('AppModule');
  }

  onModuleDestroy() {
    this.logger.log('onModuleDestroy called');
  }

  onApplicationShutdown() {
    this.logger.log('onApplicationShutdown called');
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CatsController);
  }
}
