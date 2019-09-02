import {
  Injectable,
  OnModuleDestroy,
  OnApplicationShutdown,
  BeforeApplicationShutdown,
  Logger,
} from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

@Injectable()
export class CatsService
  implements OnModuleDestroy, OnApplicationShutdown, BeforeApplicationShutdown {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('CatsService');
  }

  onModuleDestroy() {
    this.logger.log('onModuleDestroy called');
  }

  async beforeApplicationShutdown(): Promise<void> {
    this.logger.log('beforeApplicationShutdown called');
    return new Promise(resolve => {
      this.logger.log('starting shutdown...');
      setTimeout(() => {
        this.logger.log('shutdown complete...');
        resolve();
      }, 10000);
    });
  }

  onApplicationShutdown() {
    this.logger.log('onApplicationShutdown called');
  }

  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  async findAll(): Promise<Cat[]> {
    await sleep(10000);
    return this.cats;
  }
}
