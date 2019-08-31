import {
  Injectable,
  OnModuleDestroy,
  OnApplicationShutdown,
  BeforeApplicationShutdown,
} from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService
  implements OnModuleDestroy, OnApplicationShutdown, BeforeApplicationShutdown {
  onModuleDestroy() {
    console.log('catsService: onModuleDestroy called');
  }

  async beforeApplicationShutdown(): Promise<void> {
    console.log('catsService: beforeApplicationShutdown called');
    return new Promise(resolve => {
      console.log('starting catsService shutdown');
      setTimeout(() => {
        console.log('completing catsService shutdown');
        resolve();
      }, 7000);
    });
  }

  onApplicationShutdown() {
    console.log('catsService: onApplicationShutdown called');
  }

  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
