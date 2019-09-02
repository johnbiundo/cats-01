import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestsService } from '../../requests/requests.service';
import { map } from 'rxjs/operators';

@Injectable()
export class RequestTrackingInterceptor implements NestInterceptor {
  // @Inject(RequestsService) private readonly requestsService;
  constructor(private readonly requestsService: RequestsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.requestsService.incrRequestCount();
    return next.handle().pipe(
      map(value => {
        this.requestsService.decrRequestCount();
        return value;
      })
    );
  }
}
