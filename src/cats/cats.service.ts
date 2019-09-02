import {
  Injectable,
  OnApplicationShutdown,
  BeforeApplicationShutdown,
  Logger,
} from '@nestjs/common';

import { Cat } from './interfaces/cat.interface';
import { RequestsService } from '../requests/requests.service';

import * as moment from 'moment';

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const MAX_SHUTDOWN_ELAPSED = moment.duration(20000);

@Injectable()
export class CatsService
  implements OnApplicationShutdown, BeforeApplicationShutdown {
  private logger: Logger;

  private openRequests: number = 0;
  private shutdownStartTime;

  constructor(private readonly requestsService: RequestsService) {
    this.logger = new Logger('CatsService');
  }

  async serviceShutdown() {
    const now = moment(new Date());
    const elapsed = moment.duration(now.diff(this.shutdownStartTime));
    console.log(
      'catsService - requestsCount: ',
      this.requestsService.getRequestCount()
    );
    if (
      this.requestsService.getRequestCount() === 0 ||
      elapsed >= MAX_SHUTDOWN_ELAPSED
    ) {
      // if (this.openRequests === 0 || elapsed >= MAX_SHUTDOWN_ELAPSED) {
      this.logger.log('service quiesced.');
      return;
    } else {
      this.logger.log(
        `awaiting service quiescence. waited ${moment
          .utc(elapsed.asMilliseconds())
          .format('mm:ss')} so far...`
      );
      await sleep(2000);
      return await this.serviceShutdown();
    }
  }

  async beforeApplicationShutdown(): Promise<void> {
    this.shutdownStartTime = moment(new Date());
    this.logger.log('beforeApplicationShutdown called.');
    return new Promise(async resolve => {
      this.logger.log('starting shutdown...');
      await this.serviceShutdown();
      this.logger.log('shutdown complete');
      resolve();
      /*
      if (this.openRequests === 0) {
        resolve();
      } else {}
      setTimeout(() => {
        this.logger.log('shutdown complete...');
        resolve();
      }, 10000);
      */
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
    this.openRequests++;
    await sleep(15000);
    this.openRequests--;
    return this.cats;
  }
}
