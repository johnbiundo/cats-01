import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestsService } from '../../requests/requests.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestTrackingInterceptor implements NestInterceptor {
  constructor(private readonly requestsService: RequestsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.requestsService.incrRequestCount();
    return next
      .handle()
      .pipe(tap(() => this.requestsService.decrRequestCount()));
  }
}
