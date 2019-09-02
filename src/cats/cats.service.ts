import {
  Injectable,
  OnApplicationShutdown,
  BeforeApplicationShutdown,
  Logger,
} from '@nestjs/common';

import { Cat } from './interfaces/cat.interface';
import { RequestsService } from '../requests/requests.service';

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

@Injectable()
export class CatsService
  implements OnApplicationShutdown, BeforeApplicationShutdown {
  private logger: Logger;

  constructor(private readonly requestsService: RequestsService) {
    this.logger = new Logger('CatsService');
  }

  async beforeApplicationShutdown(): Promise<void> {
    this.logger.log('beforeApplicationShutdown called.');
    return new Promise(async resolve => {
      this.logger.log('starting shutdown...\nawaiting in flight request completion...');
      await this.requestsService.requestsComplete();
      this.logger.log('starting service quiescence...');
      /*
        service graceful shutdown here... simulate with sleep
      */
      await sleep(5000);
      this.logger.log('service quiesced');
      resolve();
    });
  }

  onApplicationShutdown() {
    this.logger.log('onApplicationShutdown called.');
  }

  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  async findAll(): Promise<Cat[]> {
    await sleep(15000);
    return this.cats;
  }
}
