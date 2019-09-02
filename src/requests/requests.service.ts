import {
  Injectable,
  Scope,
  BeforeApplicationShutdown,
  Logger,
} from '@nestjs/common';

import * as moment from 'moment';

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const MAX_SHUTDOWN_ELAPSED = moment.duration(20000);

@Injectable()
export class RequestsService implements BeforeApplicationShutdown {
  // tslint:disable-next-line: variable-name
  private _inFlightCount: number = 0;
  private shutdownStartTime;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('RequestsService');
  }

  incrRequestCount() {
    this._inFlightCount++;
  }

  decrRequestCount() {
    this._inFlightCount--;
  }

  get requestCount(): number {
    return this._inFlightCount;
  }

  beforeApplicationShutdown(): void {
    this.shutdownStartTime = moment(new Date());
  }

  async requestsComplete() {
    const now = moment(new Date());
    const elapsed = moment.duration(now.diff(this.shutdownStartTime));
    if (this._inFlightCount === 0 || elapsed >= MAX_SHUTDOWN_ELAPSED) {
      this.logger.log('in flight requests complete.');
      return;
    } else {
      this.logger.log(
        `awaiting in flight request completion. waited ${moment
          .utc(elapsed.asMilliseconds())
          .format('mm:ss')} so far...`
      );
      await sleep(2000);
      return await this.requestsComplete();
    }
  }
}
