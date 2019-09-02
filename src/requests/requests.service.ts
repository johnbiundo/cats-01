import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class RequestsService {
  private requestCount: number;

  constructor() {
    console.log('instantiating RequestsService');
    this.requestCount = 0;
  }

  incrRequestCount() {
    this.requestCount++;
    console.log('requestCount: ', this.requestCount);
  }

  decrRequestCount() {
    this.requestCount--;
    console.log('requestCount: ', this.requestCount);
  }

  getRequestCount() {
    return this.requestCount;
  }
}
